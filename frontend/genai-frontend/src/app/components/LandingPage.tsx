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
    <div className="flex h-full w-full flex-col items-center justify-center bg-transparent p-4" style={{ fontFamily: "var(--font-landing-body)" }}>
      <div className="w-full max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">PathoQuery</p>
        <h1
          className="mt-4 text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl"
          style={{ fontFamily: "var(--font-landing-display)", letterSpacing: "-0.02em" }}
        >
          Disease Progression Explorer
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Enter a prompt to explore how a disease affects the human body, stage-by-stage.
        </p>

        <form onSubmit={handleSubmit} className="mt-10">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search size={20} />
            </div>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. COVID-19, Type-2 Diabetes, Pneumonia..."
              className="h-14 w-full rounded-full border border-slate-300 bg-white py-3 pl-12 pr-32 text-lg text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center gap-2 rounded-full bg-cyan-600 px-6 text-lg font-semibold text-white transition-all hover:bg-cyan-700"
            >
              Enter <ArrowRight size={20} />
            </button>
          </div>
        </form>

        <div className="mt-8">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-slate-600 transition-all hover:text-cyan-600"
          >
            Go To Main Page
          </button>
        </div>
      </div>
    </div>
  );
}
