import { useEffect, useState, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "./motion";
import type { Disease } from "../../types";

interface SearchPanelProps {
  diseases: Disease[];
  onSelectDisease: (disease: Disease) => void;
  selectedDisease: Disease | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: (term: string) => void | Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const SELECTED_CARD = {
  color: "#0891b2",
  accent: "#0e7490",
};

const SEARCHING_FRAMES = ["Searching.", "Searching..", "Searching..."];

export function SearchPanel({
  diseases,
  onSelectDisease,
  selectedDisease,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  isSubmitting = false,
  errorMessage = null,
}: SearchPanelProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchingFrameIndex, setSearchingFrameIndex] = useState(0);

  useEffect(() => {
    if (!isSubmitting) {
      setSearchingFrameIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setSearchingFrameIndex((currentIndex) =>
        (currentIndex + 1) % SEARCHING_FRAMES.length
      );
    }, 260);

    return () => window.clearInterval(intervalId);
  }, [isSubmitting]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredDiseases = [...diseases]
    .filter((disease) => {
      if (!normalizedSearchTerm) return true;

      return [disease.name, ...(disease.searchAliases ?? [])].some((value) =>
        value.toLowerCase().includes(normalizedSearchTerm)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    if (filteredDiseases.length === 1) {
      onSelectDisease(filteredDiseases[0]);
      return;
    }

    void onSearchSubmit(searchTerm);
  };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden border-r border-slate-200/80 bg-white">
      <div className="relative overflow-hidden bg-white px-5 pb-5 pt-6">
        <div className="relative mb-5 min-w-0">
          <p className="truncate text-sm tracking-widest text-slate-900">PathoQuery</p>
        </div>

        <motion.div
          className="relative"
          animate={{ scale: isFocused ? 1.01 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute -inset-px rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(8,145,178,0.4), rgba(139,92,246,0.2))",
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
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isSubmitting}
              className="relative z-10 w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-10 pr-9 text-sm text-slate-700 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: "rgba(255,255,255,0.9)" }}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900"
                >
                  <X size={10} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {errorMessage && (
        <div className="px-5 pb-2">
          <p className="text-xs text-rose-600">{errorMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between px-5 pb-2">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          {isSubmitting
            ? SEARCHING_FRAMES[searchingFrameIndex]
            : searchTerm
              ? `${filteredDiseases.length} found`
              : "Conditions"}
        </span>
        <span className="text-xs text-slate-500">{diseases.length} total</span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        <AnimatePresence>
          {filteredDiseases.map((disease, idx) => {
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
                className="group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:border-slate-500"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${SELECTED_CARD.color}20, ${SELECTED_CARD.accent}12)`
                    : "rgba(255,255,255,0.8)",
                  borderColor: isSelected
                    ? `${SELECTED_CARD.color}4d`
                    : "rgba(148,163,184,0.2)",
                  boxShadow: isSelected
                    ? `0 8px 22px ${SELECTED_CARD.color}24, inset 0 1px 0 ${SELECTED_CARD.color}1f`
                    : "none",
                }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{
                    background: isSelected
                      ? `linear-gradient(to right, transparent, ${SELECTED_CARD.color}, transparent)`
                      : "transparent",
                  }}
                />

                <div className="px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start gap-2">
                        <p
                          className="min-w-0 break-words text-sm leading-tight text-slate-600 transition-colors duration-200 group-hover:!text-black"
                          style={{ color: isSelected ? "#0f172a" : undefined }}
                        >
                          {disease.name}
                        </p>
                      </div>

                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1">
                        {disease.stages.map((_, i) => (
                          <div
                            key={i}
                            className="h-1 rounded-full transition-all duration-300"
                            style={{
                              width: isSelected && i === 0 ? "16px" : "8px",
                              background: isSelected
                                ? i === 0
                                  ? SELECTED_CARD.color
                                  : `${SELECTED_CARD.color}40`
                                : "rgba(148,163,184,0.3)",
                            }}
                          />
                        ))}
                        <span className="ml-1 text-xs text-slate-500">
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
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Search size={18} className="text-slate-500" />
            </div>
            <p className="text-sm text-slate-600">No conditions found</p>
            <p className="mt-1 text-xs text-slate-500">Try a different search term</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200/70 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500">Live Database</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>
      </div>
    </div>
  );
}
