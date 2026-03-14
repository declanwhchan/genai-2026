import { FormEvent, useState } from "react";
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
    <div className="grid h-full place-items-center px-4">
        <div className="w-full max-w-2xl rounded-[10px] border border-slate-200/90 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-700">PathoQuery</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Disease Progression Explorer
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          Hover the search box to enter a prompt and jump right in, or continue directly to the main page.
        </p>

        <form onSubmit={handleSubmit} className="group mt-6 rounded-2xl border border-slate-200 bg-white/95 p-2 transition-all duration-200 hover:border-cyan-300 hover:shadow-[0_10px_30px_rgba(8,145,178,0.16)] focus-within:border-cyan-400 focus-within:shadow-[0_10px_30px_rgba(8,145,178,0.2)]">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 transition-all duration-200 group-hover:bg-cyan-100">
              <Search size={16} />
            </div>

            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter Prompt..."
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all duration-200 group-hover:border-cyan-200 focus:border-cyan-400"
            />

            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-cyan-600 bg-cyan-600 px-3 text-sm font-medium text-white transition-all hover:bg-cyan-500"
            >
              Enter <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-xl border border-cyan-300 bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-800 transition-all hover:bg-cyan-200"
          >
            Go To Main Page
          </button>
        </div>
      </div>
    </div>
  );
}
