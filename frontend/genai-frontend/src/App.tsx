import { useEffect, useRef, useState } from "react";
import { SearchPanel } from "./app/components/SearchPanel";
import { DiseaseStagePanel } from "./app/components/DiseaseStagePanel";
import { LandingPage } from "./app/components/LandingPage";
import AnatomyViewer from "./app/components/AnatomyViewer";
import { DISEASES, ORGAN_POSITIONS_3D } from "./types";
import type { Disease } from "./types";

const API_BASE_URL =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "");

const DISEASE_GENERATION_PROMPT = `You generate medical disease progression data for a visualization app.
Return only valid JSON with this exact shape:
{
  "name": "Disease name",
  "sourceSummary": {
    "documentName": "Reference document name or null",
    "primarySourceType": "document | mixed | llm",
    "note": "Short explanation of whether the document or the model supplied the information"
  },
  "stages": [
    {
      "name": "Stage name",
      "timeline": "Short timeline label",
      "affectedOrgans": ["organ_key"],
      "symptoms": ["symptom"],
      "biologicalProcess": "1-3 sentence summary",
      "sourceBasis": "document | llm",
      "sourceNote": "Short note saying whether this stage came from the reference document or model reasoning"
    }
  ]
}

Rules:
- Return 3 to 5 stages when possible.
- If a reference document is supplied by the system, use it as the primary source.
- Mark document-backed content with sourceBasis="document".
- Only mark sourceBasis="llm" when you are filling in information not directly supported by the document.
- affectedOrgans must only use keys from this list:
["brain","spinal_cord","eyes","ears","nose","tonsils","throat","trachea","esophagus","thyroid","lymph_nodes","lungs","heart","diaphragm","liver","gallbladder","stomach","spleen","pancreas","adrenal_glands","kidneys","appendix","small_intestine","intestines","colon","large_intestine","rectum","bladder","urethra","uterus","ovaries","testes","prostate","skin","blood","immune","muscles","nerves","feet"]
- Use concise, medically plausible content.
- Do not include markdown fences or extra commentary.`;

const RELATED_DISEASES_PROMPT = `You expand a user's disease search into specific related disease names for a medical search UI.
Return only valid JSON with this exact shape:
{
  "results": ["Disease Name 1", "Disease Name 2"]
}

Rules:
- Return 3 to 6 unique disease names when the input is broad, ambiguous, or misspelled.
- Prefer medically relevant named variants, subtypes, or closely related specific diseases.
- If the user input is already specific, include it as the main result and only add closely related variants when appropriate.
- Keep each result concise.
- Do not include explanations or markdown.`;

type AiResponse = {
  status?: string;
  raw?: string;
  parsed?: unknown;
  message?: string;
  documentContext?: {
    loaded?: boolean;
    name?: string | null;
    source?: string | null;
  };
};

const VALID_ORGANS = new Set(Object.keys(ORGAN_POSITIONS_3D));
const ORGAN_ALIASES: Record<string, string> = {
  eye: "eyes",
  ear: "ears",
  lung: "lungs",
  kidney: "kidneys",
  ovary: "ovaries",
  intestine: "intestines",
  lymph_node: "lymph_nodes",
  lymphnodes: "lymph_nodes",
  adrenal_gland: "adrenal_glands",
};

const SEARCH_VARIANTS: Record<string, string[]> = {
  hepatitis: [
    "Hepatitis A",
    "Hepatitis B",
    "Hepatitis C",
    "Hepatitis D",
    "Hepatitis E",
  ],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeOrganName(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]+/g, "")
    .replace(/[\s-]+/g, "_");

  const candidate = ORGAN_ALIASES[normalized] ?? normalized;
  return VALID_ORGANS.has(candidate) ? candidate : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];
}

function dedupeDiseases(diseases: Disease[]): Disease[] {
  const mergedDiseases = new Map<string, Disease>();

  diseases.forEach((disease) => {
    const key = disease.id || slugify(disease.name);
    const existingDisease = mergedDiseases.get(key);

    if (!existingDisease) {
      mergedDiseases.set(key, disease);
      return;
    }

    mergedDiseases.set(key, {
      ...existingDisease,
      ...disease,
      stages: disease.stages.length > 0 ? disease.stages : existingDisease.stages,
      sourceSummary: disease.sourceSummary ?? existingDisease.sourceSummary,
      searchAliases: Array.from(
        new Set([
          existingDisease.name,
          ...(existingDisease.searchAliases ?? []),
          disease.name,
          ...(disease.searchAliases ?? []),
        ])
      ),
    });
  });

  return Array.from(mergedDiseases.values());
}

function getRelatedPrompts(prompt: string): string[] {
  return SEARCH_VARIANTS[prompt.trim().toLowerCase()] ?? [prompt];
}

function dedupePromptTerms(prompts: string[]): string[] {
  const seenTerms = new Set<string>();

  return prompts
    .map((prompt) => prompt.trim())
    .filter(Boolean)
    .filter((prompt) => {
      const key = slugify(prompt) || prompt.toLowerCase();

      if (seenTerms.has(key)) {
        return false;
      }

      seenTerms.add(key);
      return true;
    });
}

function matchesDiseaseTermExactly(disease: Disease, term: string): boolean {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return false;
  }

  return [disease.name, ...(disease.searchAliases ?? [])].some(
    (value) => value.trim().toLowerCase() === normalizedTerm
  );
}

function normalizeRelatedDiseasePrompts(
  value: unknown,
  fallbackPrompt: string,
  fallbackPrompts: string[]
): string[] {
  let prompts = fallbackPrompts;

  if (Array.isArray(value)) {
    const relatedPrompts = toStringArray(value);
    if (relatedPrompts.length > 0) {
      prompts = relatedPrompts;
    }
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const relatedPrompts = [
      ...toStringArray(record.results),
      ...toStringArray(record.relatedDiseases),
      ...toStringArray(record.diseases),
    ];

    if (relatedPrompts.length > 0) {
      prompts = relatedPrompts;
    }
  }

  return dedupePromptTerms([fallbackPrompt.trim(), ...fallbackPrompts, ...prompts]).slice(
    0,
    6
  );
}

function mergeSearchAliases(disease: Disease, aliases: string[]): Disease {
  return {
    ...disease,
    searchAliases: Array.from(
      new Set([disease.name, ...(disease.searchAliases ?? []), ...aliases].filter(Boolean))
    ),
  };
}
function normalizeDiseaseSourceType(value: unknown): "document" | "mixed" | "llm" {
  return value === "document" || value === "mixed" || value === "llm"
    ? value
    : "llm";
}

function normalizeStageSourceBasis(value: unknown): "document" | "llm" {
  return value === "document" || value === "llm" ? value : "llm";
}

function normalizeDiseaseResponse(
  value: unknown,
  fallbackPrompt: string
): Disease | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const stagesValue = Array.isArray(record.stages) ? record.stages : [];
  const stages = stagesValue
    .map((stage, index) => {
      if (!stage || typeof stage !== "object") return null;

      const stageRecord = stage as Record<string, unknown>;
      const affectedOrgans = toStringArray(stageRecord.affectedOrgans)
        .map(normalizeOrganName)
        .filter((organ): organ is string => Boolean(organ));

      return {
        id: `${slugify(String(stageRecord.name ?? `stage-${index + 1}`)) || `stage-${index + 1}`}-${index + 1}`,
        name:
          typeof stageRecord.name === "string" && stageRecord.name.trim()
            ? stageRecord.name.trim()
            : `Stage ${index + 1}`,
        timeline:
          typeof stageRecord.timeline === "string" && stageRecord.timeline.trim()
            ? stageRecord.timeline.trim()
            : `Stage ${index + 1}`,
        affectedOrgans,
        symptoms: toStringArray(stageRecord.symptoms),
        biologicalProcess:
          typeof stageRecord.biologicalProcess === "string" &&
          stageRecord.biologicalProcess.trim()
            ? stageRecord.biologicalProcess.trim()
            : "No stage summary was provided.",
        sourceBasis: normalizeStageSourceBasis(stageRecord.sourceBasis),
        sourceNote:
          typeof stageRecord.sourceNote === "string" && stageRecord.sourceNote.trim()
            ? stageRecord.sourceNote.trim()
            : undefined,
      };
    })
    .filter((stage): stage is Disease["stages"][number] => Boolean(stage));

  if (stages.length === 0) return null;

  const name =
    typeof record.name === "string" && record.name.trim()
      ? record.name.trim()
      : fallbackPrompt.trim() || "Generated Disease";

  const sourceSummaryValue =
    record.sourceSummary && typeof record.sourceSummary === "object"
      ? (record.sourceSummary as Record<string, unknown>)
      : null;

  return {
    id: slugify(name) || "generated-disease",
    name,
    stages,
    searchAliases: [name],
    sourceSummary: sourceSummaryValue
      ? {
          documentName:
            typeof sourceSummaryValue.documentName === "string"
              ? sourceSummaryValue.documentName.trim()
              : null,
          primarySourceType: normalizeDiseaseSourceType(
            sourceSummaryValue.primarySourceType
          ),
          note:
            typeof sourceSummaryValue.note === "string" &&
            sourceSummaryValue.note.trim()
              ? sourceSummaryValue.note.trim()
              : undefined,
        }
      : undefined,
  };
}

export default function App() {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(
    DISEASES[0] ?? null
  );
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const [isGeneratingDisease, setIsGeneratingDisease] = useState(false);
  const [landingError, setLandingError] = useState<string | null>(null);
  const [generatedDiseases, setGeneratedDiseases] = useState<Disease[]>([]);
  const [hoveredAffectedOrgan, setHoveredAffectedOrgan] = useState<
    string | null
  >(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  const availableDiseases = dedupeDiseases([
    ...(selectedDisease ? [selectedDisease] : []),
    ...generatedDiseases,
    ...DISEASES,
  ]);

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    let visible = false;
    let hoverState = false;
    let textState = false;

    const cursorOffsetX = 3;
    const cursorOffsetY = 3;

    const setCursorPosition = (x: number, y: number) => {
      cursorEl.style.transform = `translate3d(${x + cursorOffsetX}px, ${
        y + cursorOffsetY
      }px, 0)`;
      if (!visible) {
        visible = true;
        document.body.classList.add("cursor-visible");
      }
    };

    const isInteractive = (el: Element | null) => {
      return Boolean(el?.closest("button, a[href], [role='button']"));
    };

    const isTextInput = (el: Element | null) => {
      return Boolean(el?.closest("input, textarea"));
    };

    const onPointerDown = () => {
      document.body.classList.add("cursor-pressed");
    };

    const onPointerUp = () => {
      document.body.classList.remove("cursor-pressed");
    };

    const onWindowLeave = () => {
      visible = false;
      document.body.classList.remove(
        "cursor-visible",
        "cursor-hover",
        "cursor-pressed",
        "cursor-text"
      );
      hoverState = false;
      textState = false;
    };

    const onPointerMoveWithState = (targetEl: Element | null) => {
      const nextHover = isInteractive(targetEl);
      const nextText = isTextInput(targetEl);

      if (nextHover !== hoverState) {
        hoverState = nextHover;
        document.body.classList.toggle("cursor-hover", hoverState);
      }

      if (nextText !== textState) {
        textState = nextText;
        document.body.classList.toggle("cursor-text", textState);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      setCursorPosition(e.clientX, e.clientY);
      const targetEl = e.target instanceof Element ? e.target : null;
      onPointerMoveWithState(targetEl);
    };

    const onMouseMove = (e: MouseEvent) => {
      setCursorPosition(e.clientX, e.clientY);
      const targetEl = e.target instanceof Element ? e.target : null;
      onPointerMoveWithState(targetEl);
    };

    const onPointerRawUpdate = (e: Event) => {
      if (e instanceof PointerEvent) {
        setCursorPosition(e.clientX, e.clientY);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { capture: true });
    window.addEventListener("mousemove", onMouseMove, { capture: true });
    window.addEventListener("pointerrawupdate", onPointerRawUpdate, {
      capture: true,
    });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("blur", onWindowLeave);
    document.addEventListener("mouseleave", onWindowLeave);

  
  return () => {
      window.removeEventListener("pointermove", onPointerMove, {
        capture: true,
      });
      window.removeEventListener("mousemove", onMouseMove, { capture: true });
      window.removeEventListener("pointerrawupdate", onPointerRawUpdate, {
        capture: true,
      });
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", onWindowLeave);
      document.removeEventListener("mouseleave", onWindowLeave);
      document.body.classList.remove(
        "cursor-visible",
        "cursor-hover",
        "cursor-pressed",
        "cursor-text"
      );
    };
  }, []);

  const handleSelectDisease = (disease: Disease) => {
    setSelectedDisease(disease);
    setCurrentStageIndex(0);
    setHoveredAffectedOrgan(null);
  };

  const findExactDisease = (term: string) => {
    return availableDiseases.find((disease) => matchesDiseaseTermExactly(disease, term));
  };

  const applyDisease = (
    disease: Disease,
    options?: { searchTerm?: string }
  ) => {
    handleSelectDisease(disease);
    setSearchTerm(options?.searchTerm ?? disease.name);
    setShowLanding(false);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setLandingError(null);

    const exactMatch = findExactDisease(term);

    if (exactMatch) {
      handleSelectDisease(exactMatch);
    }
  };


  const currentStage = selectedDisease?.stages[currentStageIndex] ?? null;
  const displayedAffectedOrgans = hoveredAffectedOrgan
    ? [hoveredAffectedOrgan]
    : currentStage?.affectedOrgans ?? [];

  const requestAiPayload = async (
    systemPrompt: string,
    input: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/api/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: systemPrompt,
        input,
      }),
    });

    const data = (await response.json()) as AiResponse;

    if (!response.ok || data.status === "error") {
      throw new Error(
        data.message || "The backend could not generate a disease profile."
      );
    }

    return data;
  };

  const requestRelatedDiseasePrompts = async (prompt: string) => {
    const fallbackPrompts = getRelatedPrompts(prompt);

    try {
      const data = await requestAiPayload(RELATED_DISEASES_PROMPT, prompt);
      return normalizeRelatedDiseasePrompts(data.parsed, prompt, fallbackPrompts);
    } catch {
      return fallbackPrompts;
    }
  };

  const requestDiseaseProfile = async (prompt: string) => {
    const data = await requestAiPayload(DISEASE_GENERATION_PROMPT, prompt);

    const generatedDisease = normalizeDiseaseResponse(data.parsed, prompt);

    if (!generatedDisease) {
      throw new Error(
        "The backend response did not match the disease format the UI expects."
      );
    }

    if (
      data.documentContext?.loaded &&
      data.documentContext.name &&
      !generatedDisease.sourceSummary?.documentName
    ) {
      generatedDisease.sourceSummary = generatedDisease.sourceSummary
        ? {
            ...generatedDisease.sourceSummary,
            documentName: data.documentContext.name,
          }
        : {
            documentName: data.documentContext.name,
          };
    }

    return generatedDisease;
  };

  const requestDiseaseProfiles = async (prompts: string[]) => {
    const loadedDiseases: Disease[] = [];
    const rejectedPrompts: string[] = [];
    let firstError: unknown = null;

    for (const relatedPrompt of prompts) {
      let loadedDisease: Disease | null = null;
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          loadedDisease = await requestDiseaseProfile(relatedPrompt);
          break;
        } catch (error) {
          lastError = error;

          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 220));
          }
        }
      }

      if (loadedDisease) {
        loadedDiseases.push(loadedDisease);
        continue;
      }

      rejectedPrompts.push(relatedPrompt);

      if (firstError == null) {
        firstError = lastError;
      }
    }

    return { loadedDiseases, rejectedPrompts, firstError };
  };

  const submitPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    setLandingError(null);

    if (!trimmedPrompt) {
      setLandingError("Enter a disease or medical prompt to continue.");
      return;
    }

    setIsGeneratingDisease(true);

    try {
      const prompts = dedupePromptTerms(await requestRelatedDiseasePrompts(trimmedPrompt));
      const exactMatch = findExactDisease(trimmedPrompt);

      if (exactMatch && prompts.length === 1) {
        applyDisease(mergeSearchAliases(exactMatch, [trimmedPrompt]), {
          searchTerm: trimmedPrompt,
        });
        return;
      }

      const promptAliases = dedupePromptTerms([trimmedPrompt, ...prompts]);
      const existingDiseasesForPrompt = dedupeDiseases(
        prompts
          .map((relatedPrompt) => findExactDisease(relatedPrompt))
          .filter((disease): disease is Disease => Boolean(disease))
          .map((disease) => mergeSearchAliases(disease, promptAliases))
      );
      const promptsToGenerate = dedupePromptTerms(
        prompts.filter((relatedPrompt) => !findExactDisease(relatedPrompt))
      );
      const { loadedDiseases, rejectedPrompts, firstError } =
        await requestDiseaseProfiles(promptsToGenerate);

      const generatedDiseasesForPrompt = loadedDiseases.map((disease) =>
        mergeSearchAliases(disease, promptAliases)
      );

      const matchedDiseases = dedupeDiseases([
        ...existingDiseasesForPrompt,
        ...generatedDiseasesForPrompt,
      ]);

      if (matchedDiseases.length === 0) {
        throw firstError ?? new Error("No disease profiles were generated.");
      }

      if (generatedDiseasesForPrompt.length > 0) {
        setGeneratedDiseases((previousDiseases) =>
          dedupeDiseases([...generatedDiseasesForPrompt, ...previousDiseases])
        );
      }

      const selectedMatchedDisease = matchedDiseases[0];
      const preserveSearchTerm = prompts.length > 1 ? trimmedPrompt : undefined;

      applyDisease(selectedMatchedDisease, {
        searchTerm: preserveSearchTerm,
      });

      if (rejectedPrompts.length > 0) {
        console.warn("Some related disease searches failed.", rejectedPrompts);
      }
    } catch (error) {
      setLandingError(
        error instanceof Error
          ? error.message
          : "Unable to connect the prompt form to the backend."
      );
    } finally {
      setIsGeneratingDisease(false);
    }
  };
  const handleEnterFromLanding = async (prompt: string) => {
    await submitPrompt(prompt);
  };

  const handleSearchSubmit = async (prompt: string) => {
    await submitPrompt(prompt);
  };

  const handleSkipLanding = () => {
    setShowLanding(false);
  };

  const handleStageSelect = (index: number) => {
    setCurrentStageIndex(index);
    setHoveredAffectedOrgan(null);
  };

  return (
    <div className="app-grid-surface h-screen w-screen overflow-hidden p-1.5 text-slate-900 sm:p-2 lg:p-3">
      {showLanding ? (
        <LandingPage
          onEnter={handleEnterFromLanding}
          onSkip={handleSkipLanding}
          isSubmitting={isGeneratingDisease}
          errorMessage={landingError}
        />
      ) : (
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.9fr)_minmax(320px,1.8fr)_minmax(0,1fr)] gap-1.5 sm:gap-2 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.7fr)_minmax(0,1.02fr)] lg:gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.6fr)_minmax(0,1.05fr)]">
          <aside className="min-w-0 overflow-hidden rounded-[9px] border border-slate-200/90 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:rounded-[11px]">
            <SearchPanel
              diseases={availableDiseases}
              onSelectDisease={handleSelectDisease}
              selectedDisease={selectedDisease}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              isSubmitting={isGeneratingDisease}
              errorMessage={landingError}
            />
          </aside>

          <main className="min-w-0 flex-1 overflow-hidden rounded-[28px]">
            {selectedDisease && currentStage ? (
              <AnatomyViewer
                affectedOrgans={displayedAffectedOrgans}
                allUsedOrgans={[
                  ...new Set(
                    selectedDisease.stages.flatMap((stage) => stage.affectedOrgans)
                  ),
                ]}
                currentStageIndex={currentStageIndex}
                totalStages={selectedDisease.stages.length}
                diseaseName={selectedDisease.name}
                currentStage={currentStage}
              />
            ) : (
              <div className="grid h-full place-items-center px-8 text-center text-slate-300">
                Select a disease to view progression.
              </div>
            )}
          </main>

          <aside className="min-w-0 overflow-hidden rounded-[9px] border border-slate-200/90 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:rounded-[11px]">
            {selectedDisease ? (
              <DiseaseStagePanel
                stages={selectedDisease.stages}
                currentStageIndex={currentStageIndex}
                onStageSelect={handleStageSelect}
                diseaseName={selectedDisease.name}
                sourceSummary={selectedDisease.sourceSummary}
                onAffectedOrganHover={setHoveredAffectedOrgan}
              />
            ) : (
              <div className="grid h-full place-items-center px-8 text-center text-slate-500">
                Stage timeline details appear here once a disease is selected.
              </div>
            )}
          </aside>
        </div>
      )}

      <div ref={cursorRef} className="app-cursor" aria-hidden="true" />
    </div>
  );
}










