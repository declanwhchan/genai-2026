import { ChevronLeft, ChevronRight, Dot } from "lucide-react";
import type { DiseaseStage } from "../../types";

interface DiseaseStagePanelProps {
  stages: DiseaseStage[];
  currentStageIndex: number;
  onStageSelect: (index: number) => void;
  diseaseName: string;
}

export function DiseaseStagePanel({
  stages,
  currentStageIndex,
  onStageSelect,
  diseaseName,
}: DiseaseStagePanelProps) {
  return (
    <div className="h-full flex flex-col bg-[#0a0e1a] border-l border-white/[0.07]">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/10">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Disease Profile</p>
        <h2 className="text-white text-xl font-semibold tracking-wide">{diseaseName}</h2>
        <p className="text-sm text-slate-400 mt-1">
          Viewing Stage {currentStageIndex + 1} of {stages.length}
        </p>
      </div>

      {/* Stages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex;

          return (
            <button
              key={stage.id}
              onClick={() => onStageSelect(index)}
              className="w-full text-left rounded-2xl border p-5 transition-all duration-200 group relative"
              style={{
                borderColor: isActive ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.07)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.05))"
                  : "rgba(255,255,255,0.03)",
                boxShadow: isActive ? "0 0 20px rgba(6,182,212,0.1)" : "none",
              }}
            >
              {isActive && (
                <div className="absolute -top-px -left-px -right-px h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              )}

              <div className="flex items-start justify-between gap-3 mb-2">
                <span className={`text-base font-medium ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                  {stage.name}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${isActive ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' : 'text-slate-500 bg-white/5 border-white/10'}`}>
                  Stage {index + 1}
                </span>
              </div>

              <p className="text-xs text-cyan-500 mb-4">Timeline: {stage.timeline}</p>

              <div className="space-y-4">
                {stage.affectedOrgans.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Affected Organs</p>
                    <div className="flex flex-wrap gap-2">
                      {stage.affectedOrgans.map((organ) => (
                        <span
                          key={organ}
                          className="px-2.5 py-1 rounded-full text-xs capitalize border bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                        >
                          {organ}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stage.symptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Key Symptoms</p>
                    <ul className="space-y-1.5">
                      {stage.symptoms.map((symptom, symptomIndex) => (
                        <li key={symptomIndex} className="flex items-start gap-2 text-sm text-slate-300">
                          <Dot size={16} className="shrink-0 text-cyan-600 mt-0.5" />
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Biological Process</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{stage.biologicalProcess}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <button
          onClick={() => onStageSelect(Math.max(0, currentStageIndex - 1))}
          disabled={currentStageIndex === 0}
          className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
        >
          <ChevronLeft size={16} /> Prev Stage
        </button>
        <button
          onClick={() => onStageSelect(Math.min(stages.length - 1, currentStageIndex + 1))}
          disabled={currentStageIndex === stages.length - 1}
          className="flex-1 h-11 rounded-xl bg-cyan-600 border border-cyan-500 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
        >
          Next Stage <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
