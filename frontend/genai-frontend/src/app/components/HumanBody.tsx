import { useState } from "react";
import { ORGAN_POSITIONS } from "../../types";

interface HumanBodyProps {
  affectedOrgans: string[];
  currentStageIndex: number;
  totalStages: number;
  onOrganClick?: (organ: string) => void;
  diseaseName: string;
}

export function HumanBody({
  affectedOrgans,
  currentStageIndex,
  totalStages,
  onOrganClick,
  diseaseName,
}: HumanBodyProps) {
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  const getOrganColor = (organ: string) => {
    if (!affectedOrgans.includes(organ)) {
      return "#475569";
    }

    const intensity = ((currentStageIndex + 1) / totalStages) * 100;
    if (intensity < 33) return "#fbbf24";
    if (intensity < 66) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="h-full flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#0f172a_0%,#080c14_45%,#060a12_100%)] p-8 overflow-hidden">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <div className="mb-5 text-center">
          <h2 className="text-xl text-slate-100">Human Body Disease Progression</h2>
          <p className="text-sm text-slate-400 mt-1">
            Stage {currentStageIndex + 1} of {totalStages}
          </p>
        </div>

        <svg viewBox="0 0 100 110" className="w-full h-auto">
          <g stroke="#94a3b8" strokeWidth="0.35" fill="none" opacity="0.9">
            <ellipse cx="50" cy="11" rx="6.5" ry="8.5" />
            <line x1="50" y1="19.5" x2="50" y2="23" />
            <path d="M 43.5 23 Q 35 25 31.5 29" />
            <path d="M 56.5 23 Q 65 25 68.5 29" />
            <path d="M 43.5 23 L 41.5 48 L 43.5 69 L 45.5 84" />
            <path d="M 56.5 23 L 58.5 48 L 56.5 69 L 54.5 84" />
            <path d="M 43.5 23 L 56.5 23" />
            <path d="M 41.5 42 Q 50 44 58.5 42" />
            <path d="M 43.5 69 L 56.5 69" />
            <path d="M 31.5 29 L 27.5 46 L 25.5 63" />
            <path d="M 68.5 29 L 72.5 46 L 74.5 63" />
            <path d="M 45.5 84 L 44.5 103" />
            <path d="M 54.5 84 L 55.5 103" />
          </g>

          {Object.entries(ORGAN_POSITIONS).map(([organ, pos]) => {
            const isAffected = affectedOrgans.includes(organ);
            const color = getOrganColor(organ);

            return (
              <g
                key={organ}
                onMouseMove={(e) => {
                  const isAffected = affectedOrgans.includes(organ);
                  const status = isAffected
                    ? `Affected by ${diseaseName}`
                    : "Not affected";
                  setTooltip({
                    content: `${organ.charAt(0).toUpperCase() + organ.slice(1)}: ${status}`,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {isAffected && (
                  <circle cx={pos.x} cy={pos.y} r="4.3" fill={color} opacity="0.22" />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="2.2"
                  fill={isAffected ? color : "#334155"}
                  stroke={isAffected ? "#f8fafc" : "#64748b"}
                  strokeWidth="0.35"
                  style={{ cursor: "pointer" }}
                  onClick={() => onOrganClick?.(organ)}
                />
                {isAffected && (
                  <>
                    <line
                      x1={pos.x}
                      y1={pos.y - 2.2}
                      x2={pos.x}
                      y2={pos.y - 6.4}
                      stroke={color}
                      strokeWidth="0.4"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 7.4}
                      fontSize="2.3"
                      fill="#e2e8f0"
                      textAnchor="middle"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {organ}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-5 flex items-center justify-center gap-5 text-xs text-slate-300">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />Early</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />Progressive</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />Severe</span>
        </div>

        {tooltip && (
          <div
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-[calc(100%+10px)] px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-slate-200 whitespace-nowrap shadow-2xl z-50"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}
