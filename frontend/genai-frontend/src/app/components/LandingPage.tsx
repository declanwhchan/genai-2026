import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Search } from "lucide-react";

interface LandingPageProps {
  onEnter: (prompt: string) => void;
  onSkip: () => void;
}

export function LandingPage({ onEnter, onSkip }: LandingPageProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onEnter(prompt.trim());
  };

  return (
    <div
      className="relative flex h-full w-full select-none flex-col items-center justify-center overflow-hidden bg-transparent p-4"
      style={{ fontFamily: "var(--font-landing-body)" }}
    >

      <div className="relative w-full max-w-3xl rounded-[20px] border border-white/70 bg-white/72 px-6 py-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(to_right,rgba(8,145,178,0),rgba(8,145,178,0.9),rgba(8,145,178,0))]" />
        <div className="mx-auto max-w-2xl">
          <h1
            className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-slate-900 sm:text-6xl"
            style={{ fontFamily: "var(--font-landing-display)" }}
          >
            PathoQuery
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Enter a prompt to explore how a disease affects the human body and organs, stage-by-stage.
          </p>

          <form onSubmit={handleSubmit} className="mt-10">
            <div className="relative rounded-[28px] border border-cyan-100/80 bg-white/90 p-2 shadow-[0_18px_40px_rgba(8,145,178,0.08)]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-cyan-700">
                <Search size={20} />
              </div>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. COVID-19, Type-2 Diabetes, Pneumonia..."
                className="h-16 w-full rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fcff_100%)] py-3 pl-14 pr-36 text-lg text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
              <button
                type="submit"
                className="absolute inset-y-2 right-2 flex items-center gap-2 rounded-[20px] border border-cyan-600 bg-cyan-600 px-6 text-lg font-semibold text-white transition-all hover:bg-cyan-700 hover:border-cyan-700"
              >
                Enter <ArrowRight size={20} />
              </button>
            </div>
          </form>

          <div className="mt-8">
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center rounded-full border border-cyan-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-cyan-300 hover:text-cyan-700"
            >
              Go To Main Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}