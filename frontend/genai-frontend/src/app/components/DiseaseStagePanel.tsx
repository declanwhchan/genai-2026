import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "./motion";
import type { DiseaseStage } from "../../types";

interface DiseaseStagePanelProps {
  stages: DiseaseStage[];
  currentStageIndex: number;
  onStageSelect: (index: number) => void;
  diseaseName: string;
  onAffectedOrganHover?: (organ: string | null) => void;
}

interface StageAccent {
  main: string;
  text: string;
  border: string;
  soft: string;
  softHover: string;
}

const STAGE_ACCENTS: StageAccent[] = [
  {
    main: "#d97706",
    text: "#92400e",
    border: "#fcd34d",
    soft: "#fef3c7",
    softHover: "#fde68a",
  },
  {
    main: "#ea580c",
    text: "#9a3412",
    border: "#fdba74",
    soft: "#ffedd5",
    softHover: "#fed7aa",
  },
  {
    main: "#dc2626",
    text: "#991b1b",
    border: "#fca5a5",
    soft: "#fee2e2",
    softHover: "#fecaca",
  },
];

function getStageAccent(
  currentStageIndex: number,
  totalStages: number
): StageAccent {
  const intensity = totalStages <= 1 ? 1 : currentStageIndex / (totalStages - 1);
  if (intensity < 0.4) return STAGE_ACCENTS[0];
  if (intensity < 0.75) return STAGE_ACCENTS[1];
  return STAGE_ACCENTS[2];
}

export function DiseaseStagePanel({
  stages,
  currentStageIndex,
  onStageSelect,
  diseaseName,
  onAffectedOrganHover,
}: DiseaseStagePanelProps) {
  const currentStage = stages[currentStageIndex];
  const accent = getStageAccent(currentStageIndex, stages.length);

  return (
    <div className="flex h-full min-w-0 flex-col border-l border-slate-200/80 bg-white">
      <div className="relative min-w-0 overflow-hidden border-b border-slate-200 bg-white px-4 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6 lg:px-6">
        <div className="relative">
          <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
            Disease Profile
          </p>
          <h2 className="break-words text-xl font-semibold tracking-wide text-slate-900">
            {diseaseName}
          </h2>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        <div className="rounded-2xl border border-slate-200 bg-white/82 p-3 sm:p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Stage Selector
          </p>
          <div
            className="relative grid rounded-full border border-slate-200 bg-white p-1"
            style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
          >
            {stages.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const btnAccent = getStageAccent(index, stages.length);
              return (
                <button
                  key={stage.id}
                  onClick={() => onStageSelect(index)}
                  className="group/stage relative z-10 rounded-full px-2 py-1.5 text-xs font-medium transition-colors"
                  style={{ color: isActive ? accent.main : "#475569" }}
                >
                  {!isActive && (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full border opacity-0 transition-all duration-200 group-hover/stage:opacity-100"
                      style={{
                        borderColor: btnAccent.border,
                        background: btnAccent.soft,
                      }}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="stage-selector-pill"
                      className="absolute inset-0 rounded-full border"
                      style={{
                        borderColor: accent.border,
                        background: accent.soft,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">Stage {index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/86 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">
              {currentStage.name}
            </h3>
            <span
              className="rounded-full border px-2.5 py-1 text-xs"
              style={{
                borderColor: accent.border,
                background: accent.soft,
                color: accent.text,
              }}
            >
              {currentStage.timeline}
            </span>
          </div>

          {currentStage.symptoms.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Key Symptoms
              </p>
              <p className="text-sm text-slate-700">
                {currentStage.symptoms.slice(0, 4).join(" • ")}
              </p>
            </div>
          )}

          {currentStage.affectedOrgans.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Affected Organs
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentStage.affectedOrgans.map((organ) => (
                  <span
                    key={organ}
                    className="rounded-full border px-2.5 py-1 text-xs capitalize transition-colors"
                    style={{
                      borderColor: accent.border,
                      background: accent.soft,
                      color: accent.text,
                    }}
                    onMouseEnter={() => onAffectedOrganHover?.(organ)}
                    onMouseLeave={() => onAffectedOrganHover?.(null)}
                  >
                    {organ}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stage Summary
            </p>
            <p className="break-words text-sm leading-relaxed text-slate-600">
              {currentStage.biologicalProcess}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
        <button
          onClick={() => onStageSelect(Math.max(0, currentStageIndex - 1))}
          disabled={currentStageIndex === 0}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white/80 text-slate-700 transition-all hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Prev Stage
        </button>
        <button
          onClick={() => onStageSelect(Math.min(stages.length - 1, currentStageIndex + 1))}
          disabled={currentStageIndex === stages.length - 1}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-600 bg-cyan-600 text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:bg-cyan-700 hover:border-cyan-700"
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-600 bg-cyan-600 text-white transition-all hover:border-cyan-700 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-cyan-600 disabled:hover:bg-cyan-600"
        >
          Next Stage <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}