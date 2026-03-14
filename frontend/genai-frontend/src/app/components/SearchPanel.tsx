import { useState, type ReactNode } from "react";
import { Search, X, Clock, Zap, Wind, Droplets, Activity, ChevronRight, Dna } from "lucide-react";
import { motion, AnimatePresence } from "./motion";
import type { Disease } from "../../types";

interface SearchPanelProps {
  diseases: Disease[];
  onSelectDisease: (disease: Disease) => void;
  selectedDisease: Disease | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  recentSearches: string[];
}

const DISEASE_META: Record<string, { color: string; accent: string; icon: ReactNode; tag: string }> = {
  "COVID-19": {
    color: "#06b6d4",
    accent: "#0e7490",
    icon: <Wind size={15} />,
    tag: "Viral",
  },
  "Type 2 Diabetes": {
    color: "#f59e0b",
    accent: "#b45309",
    icon: <Droplets size={15} />,
    tag: "Metabolic",
  },
  "Influenza (Flu)": {
    color: "#a78bfa",
    accent: "#7c3aed",
    icon: <Zap size={15} />,
    tag: "Infectious",
  },
  Pneumonia: {
    color: "#34d399",
    accent: "#059669",
    icon: <Activity size={15} />,
    tag: "Respiratory",
  },
};

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Viral", value: "Viral" },
  { label: "Metabolic", value: "Metabolic" },
  { label: "Infectious", value: "Infectious" },
  { label: "Respiratory", value: "Respiratory" },
];

export function SearchPanel({
  diseases,
  onSelectDisease,
  selectedDisease,
  searchTerm,
  onSearchChange,
  recentSearches,
}: SearchPanelProps) {
  const [activeCategory, setActiveCategory] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredDiseases = diseases.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !activeCategory || DISEASE_META[d.name]?.tag === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-[#0a0e1a] border-r border-white/[0.07] overflow-hidden">

      {/* ── BRAND HEADER ── */}
      <div className="relative px-5 pt-6 pb-5 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -top-4 right-0 w-24 h-24 rounded-full bg-violet-500/8 blur-2xl" />
        </div>

        {/* Logo row */}
        <div className="flex items-center gap-3 mb-5 relative">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-sm">
              <Dna size={17} className="text-cyan-400" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0e1a]" />
          </div>
          <div>
            <p className="text-white/90 tracking-widest text-sm">PathoDB</p>
            <p className="text-slate-600 text-xs">Disease Atlas v2.1</p>
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
              className={`absolute left-3.5 transition-colors duration-200 ${isFocused ? "text-cyan-400" : "text-slate-600"}`}
            />
            <input
              type="text"
              placeholder="Search conditions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-10 pr-9 py-3 bg-white/[0.06] border border-white/[0.09] rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none text-sm relative z-10"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 z-10 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X size={10} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="px-5 pb-3">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="relative px-3 py-1 rounded-full text-xs transition-all duration-200"
              style={{
                background:
                  activeCategory === cat.value
                    ? "rgba(6,182,212,0.15)"
                    : "rgba(255,255,255,0.04)",
                color:
                  activeCategory === cat.value ? "#06b6d4" : "#475569",
                border:
                  activeCategory === cat.value
                    ? "1px solid rgba(6,182,212,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── RECENT SEARCHES ── */}
      <AnimatePresence>
        {!searchTerm && recentSearches.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-3 overflow-hidden"
          >
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={11} className="text-slate-600" />
                <span className="text-xs text-slate-600 uppercase tracking-widest">Recent</span>
              </div>
              <div className="space-y-0.5">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => onSearchChange(search)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-all group"
                  >
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                      {search}
                    </span>
                    <ChevronRight size={11} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION LABEL ── */}
      <div className="px-5 pb-2 flex items-center justify-between">
        <span className="text-xs text-slate-600 uppercase tracking-widest">
          {searchTerm ? `${filteredDiseases.length} found` : "Conditions"}
        </span>
        <span className="text-xs text-slate-700">{diseases.length} total</span>
      </div>

      {/* ── DISEASE CARDS ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        <AnimatePresence mode="popLayout">
          {filteredDiseases.map((disease, idx) => {
            const meta = DISEASE_META[disease.name] ?? {
              color: "#94a3b8",
              accent: "#475569",
              icon: <Activity size={15} />,
              tag: "Other",
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
                className="w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden group relative"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${meta.color}18, ${meta.accent}10)`
                    : "rgba(255,255,255,0.025)",
                  borderColor: isSelected
                    ? `${meta.color}40`
                    : "rgba(255,255,255,0.07)",
                  boxShadow: isSelected
                    ? `0 0 24px ${meta.color}15, inset 0 1px 0 ${meta.color}20`
                    : "none",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
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
                          : "rgba(255,255,255,0.05)",
                        color: isSelected ? meta.color : "#475569",
                        border: `1px solid ${isSelected ? meta.color + "40" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      {meta.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm leading-tight transition-colors duration-200"
                          style={{ color: isSelected ? "#fff" : "#94a3b8" }}
                        >
                          {disease.name}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                          style={{
                            background: `${meta.color}15`,
                            color: meta.color,
                            border: `1px solid ${meta.color}25`,
                          }}
                        >
                          {meta.tag}
                        </span>
                      </div>

                      {/* Stage dots */}
                      <div className="flex items-center gap-1 mt-2">
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
                                  : "rgba(255,255,255,0.1)",
                            }}
                          />
                        ))}
                        <span className="text-xs text-slate-600 ml-1">
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
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3">
              <Search size={18} className="text-slate-700" />
            </div>
            <p className="text-slate-600 text-sm">No conditions found</p>
            <p className="text-slate-700 text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-5 py-3.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-700">Live Database</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}
