import { useState } from "react";
import { SearchPanel } from "./app/components/SearchPanel";
import { HumanBody3D } from "./app/components/HumanBody3D";
import { DiseaseStagePanel } from "./app/components/DiseaseStagePanel";
import { DISEASES } from "./types";
import type { Disease } from "./types";

export default function App() {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(DISEASES[0]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSelectDisease = (disease: Disease) => {
    setSelectedDisease(disease);
    setCurrentStageIndex(0);

    if (!recentSearches.includes(disease.name)) {
      setRecentSearches((prev) => [disease.name, ...prev].slice(0, 5));
    }
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,#14304a_0%,#0b1422_50%,#08101b_100%)] p-3 text-slate-50 lg:p-4">
      <div className="flex h-full min-h-0 gap-3 lg:gap-4">
        <aside className="h-full w-[clamp(270px,22vw,310px)] shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 shadow-[0_18px_60px_rgba(2,6,23,0.4)] backdrop-blur-xl">
          <SearchPanel
            diseases={DISEASES}
            onSelectDisease={handleSelectDisease}
            selectedDisease={selectedDisease}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            recentSearches={recentSearches}
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 shadow-[0_18px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
          {selectedDisease && currentStage ? (
            <HumanBody3D
              affectedOrgans={currentStage.affectedOrgans}
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

        <aside className="h-full w-[clamp(330px,28vw,400px)] shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 shadow-[0_18px_60px_rgba(2,6,23,0.4)] backdrop-blur-xl">
          {selectedDisease ? (
            <DiseaseStagePanel
              stages={selectedDisease.stages}
              currentStageIndex={currentStageIndex}
              onStageSelect={setCurrentStageIndex}
              diseaseName={selectedDisease.name}
            />
          ) : (
            <div className="grid h-full place-items-center px-8 text-center text-slate-300">
              Stage timeline details appear here once a disease is selected.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
