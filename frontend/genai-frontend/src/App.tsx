import { useEffect, useRef, useState } from "react";
import { SearchPanel } from "./app/components/SearchPanel";
import { HumanBody3D } from "./app/components/HumanBody3D";
import { DiseaseStagePanel } from "./app/components/DiseaseStagePanel";
import { LandingPage } from "./app/components/LandingPage";
import { DISEASES } from "./types";
import type { Disease } from "./types";
import AnatomyViewer from "./app/components/AnatomyViewer";

export default function App() {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(DISEASES[0]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    let visible = false;
    let hoverState = false;
    let textState = false;

    const setCursorPosition = (x: number, y: number) => {
      cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
      document.body.classList.remove("cursor-visible", "cursor-hover", "cursor-pressed", "cursor-text");
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
    window.addEventListener("pointerrawupdate", onPointerRawUpdate, { capture: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("blur", onWindowLeave);
    document.addEventListener("mouseleave", onWindowLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove, { capture: true });
      window.removeEventListener("mousemove", onMouseMove, { capture: true });
      window.removeEventListener("pointerrawupdate", onPointerRawUpdate, { capture: true });
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", onWindowLeave);
      document.removeEventListener("mouseleave", onWindowLeave);
      document.body.classList.remove("cursor-visible", "cursor-hover", "cursor-pressed", "cursor-text");
    };
  }, []);

  const handleSelectDisease = (disease: Disease) => {
    setSelectedDisease(disease);
    setCurrentStageIndex(0);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);

    const exactMatch = DISEASES.find((disease) => {
      return disease.name.toLowerCase() === term.toLowerCase();
    });

    if (exactMatch) {
      handleSelectDisease(exactMatch);
    }
  };

  const currentStage = selectedDisease?.stages[currentStageIndex] ?? null;

  const handleEnterFromLanding = (prompt: string) => {
    if (prompt) {
      handleSearchChange(prompt);
    }
    setShowLanding(false);
  };

  const handleSkipLanding = () => {
    setShowLanding(false);
  };

  return (
    <div className="app-grid-surface h-screen w-screen overflow-hidden p-1.5 text-slate-900 sm:p-2 lg:p-3">
      {showLanding ? (
        <LandingPage onEnter={handleEnterFromLanding} onSkip={handleSkipLanding} />
      ) : (
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.9fr)_minmax(320px,1.8fr)_minmax(0,1fr)] gap-1.5 sm:gap-2 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.7fr)_minmax(0,1.02fr)] lg:gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.6fr)_minmax(0,1.05fr)]">
          <aside className="min-w-0 overflow-hidden rounded-[9px] border border-slate-200/90 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:rounded-[11px]">
            <SearchPanel
              diseases={DISEASES}
              onSelectDisease={handleSelectDisease}
              selectedDisease={selectedDisease}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </aside>

          <main className="min-w-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 shadow-[0_18px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
          {selectedDisease && currentStage ? (
            <AnatomyViewer 
                affectedOrgans={currentStage.affectedOrgans}
                currentStageIndex={currentStageIndex}
                totalStages={selectedDisease.stages.length}
                diseaseName={selectedDisease.name}
            />
            // <HumanBody3D
            //   affectedOrgans={currentStage.affectedOrgans}
            //   currentStageIndex={currentStageIndex}
            //   totalStages={selectedDisease.stages.length}
            //   diseaseName={selectedDisease.name}
            //   currentStage={currentStage}
            // />
          ) : (
            <div className="grid h-full place-items-center px-8 text-center text-slate-300">
              Select a disease to view progression.
            </div>
          )}
        </main>

          <aside className="min-w-0 overflow-hidden rounded-[9px] border border-slate-200/90 bg-slate-50 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:rounded-[11px]">
            {selectedDisease ? (
              <DiseaseStagePanel
                stages={selectedDisease.stages}
                currentStageIndex={currentStageIndex}
                onStageSelect={setCurrentStageIndex}
                diseaseName={selectedDisease.name}
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

