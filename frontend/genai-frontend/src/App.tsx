<<<<<<< Updated upstream
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import AnatomyViewer from './AnatomyViewer.tsx'
=======
import { useState } from "react";
import { SearchPanel } from "./app/components/SearchPanel";
import { HumanBody3D } from "./app/components/HumanBody3D";
import { DiseaseStagePanel } from "./app/components/DiseaseStagePanel";
import { DISEASES } from "./types";
import type { Disease } from "./types";
import AnatomyViewer from "./app/components/AnatomyViewer";
>>>>>>> Stashed changes

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div style={{ width: "100vw", height: "100vh" }}>
            <AnatomyViewer />
        </div>
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

<<<<<<< Updated upstream
      <div className="ticks"></div>
=======
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
>>>>>>> Stashed changes

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
