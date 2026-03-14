import { useState, type ReactNode } from "react";
import { Search, X, Zap, Wind, Droplets, Activity, Dna } from "lucide-react";
import { motion, AnimatePresence } from "./motion";
import type { Disease } from "../../types";

interface SearchPanelProps {
  diseases: Disease[];
  onSelectDisease: (disease: Disease) => void;
  selectedDisease: Disease | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const DISEASE_META: Record<string, { color: string; accent: string; icon: ReactNode }> = {
  "COVID-19": {
    color: "#06b6d4",
    accent: "#0e7490",
    icon: <Wind size={15} />,
  },
  "Type 2 Diabetes": {
    color: "#f59e0b",
    accent: "#b45309",
    icon: <Droplets size={15} />,
  },
  "Influenza (Flu)": {
    color: "#a78bfa",
    accent: "#7c3aed",
    icon: <Zap size={15} />,
  },
  Pneumonia: {
    color: "#34d399",
    accent: "#059669",
    icon: <Activity size={15} />,
  },
};

export function SearchPanel({
  diseases,
  onSelectDisease,
  selectedDisease,
  searchTerm,
  onSearchChange,
}: SearchPanelProps) {
  const [isFocused, setIsFocused] = useState(false);

  const filteredDiseases = [...diseases]
    .filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="h-full min-w-0 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-sky-50/50 border-r border-slate-200/80">

      {/* ── BRAND HEADER ── */}
      <div className="relative px-5 pt-6 pb-5 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full bg-cyan-200/55 blur-3xl" />
          <div className="absolute -top-4 right-0 w-24 h-24 rounded-full bg-sky-300/35 blur-2xl" />
        </div>

        {/* Logo row */}
        <div className="relative mb-5 flex min-w-0 items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 border border-cyan-300/70 flex items-center justify-center backdrop-blur-sm">
              <Dna size={17} className="text-cyan-700" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-50" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm tracking-widest text-slate-900">PathoQuery</p>
            <p className="truncate text-xs text-slate-500">Disease Atlas v2.1</p>
          </div>
        </div>

        {/* Search bar */}
        <motion.div
          className="relative"
          animate={{ scale: isFocused ? 1.01 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* Glow ring on focus */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-px rounded-2xl pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(6,182,212,0.4), rgba(139,92,246,0.2))",
                  filter: "blur(1px)",
                }}
              />
            )}
          </AnimatePresence>

          <div className="relative flex items-center">
            <Search
              size={15}
              className={`absolute left-3.5 transition-colors duration-200 ${isFocused ? "text-cyan-800" : "text-slate-600"}`}
            />
            <input
              type="text"
              placeholder="Enter Prompt..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="relative z-10 w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-10 pr-9 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.9)" }}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 z-10 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
                >
                  <X size={10} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── SECTION LABEL ── */}
      <div className="px-5 pb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-widest">
          {searchTerm ? `${filteredDiseases.length} found` : "Conditions"}
        </span>
        <span className="text-xs text-slate-500">{diseases.length} total</span>
      </div>

      {/* ── DISEASE CARDS ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        <AnimatePresence>
          {filteredDiseases.map((disease, idx) => {
            const meta = DISEASE_META[disease.name] ?? {
              color: "#94a3b8",
              accent: "#475569",
              icon: <Activity size={15} />,
            };
            const isSelected = selectedDisease?.id === disease.id;

            return (
              <motion.button
                key={disease.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectDisease(disease)}
                className="w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden group relative hover:border-slate-500"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${meta.color}18, ${meta.accent}10)`
                    : "rgba(255,255,255,0.8)",
                  borderColor: isSelected
                    ? `${meta.color}40`
                    : "rgba(148,163,184,0.2)",
                  boxShadow: isSelected
                    ? `0 8px 22px ${meta.color}1f, inset 0 1px 0 ${meta.color}1a`
                    : "none",
                }}
              >
                {/* Top gradient strip */}
                <div
                  className="h-0.5 w-full"
                  style={{
                    background: isSelected
                      ? `linear-gradient(to right, transparent, ${meta.color}, transparent)`
                      : "transparent",
                  }}
                />

                <div className="px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    {/* Icon bubble */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300"
                      style={{
                        background: isSelected
                          ? `${meta.color}25`
                          : "rgba(148,163,184,0.14)",
                        color: isSelected ? meta.color : "#475569",
                        border: `1px solid ${isSelected ? meta.color + "40" : "rgba(148,163,184,0.25)"}`,
                      }}
                    >
                      {meta.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex min-w-0 items-start gap-2">
                        <p
                          className="min-w-0 break-words text-sm leading-tight transition-colors duration-200 text-slate-600 group-hover:!text-black"
                          style={{ color: isSelected ? "#0f172a" : undefined }}
                        >
                          {disease.name}
                        </p>
                      </div>

                      {/* Stage dots */}
                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1">
                        {disease.stages.map((_, i) => (
                          <div
                            key={i}
                            className="h-1 rounded-full transition-all duration-300"
                            style={{
                              width: isSelected && i === 0 ? "16px" : "8px",
                              background:
                                isSelected
                                  ? i === 0
                                    ? meta.color
                                    : `${meta.color}40`
                                  : "rgba(148,163,184,0.3)",
                            }}
                          />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">
                          {disease.stages.length} stages
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.button>
            );
          })}
        </AnimatePresence>

        {filteredDiseases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Search size={18} className="text-slate-500" />
            </div>
            <p className="text-slate-600 text-sm">No conditions found</p>
            <p className="text-slate-500 text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-5 py-3.5 border-t border-slate-200/70">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">Live Database</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>
      </div>
    </div>
  );
}

