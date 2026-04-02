"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";


export default function Home() {
  const [url, setUrl] = useState("");
  const [cookies, setCookies] = useState("");
  const [showCookies, setShowCookies] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes("facebook.com/")) {
      alert("Please enter a valid Facebook profile URL");
      return;
    }

    if (cookies.trim()) {
      try {
        JSON.parse(cookies.trim());
      } catch {
        alert("Invalid JSON in cookies field");
        return;
      }
      sessionStorage.setItem("liveCookies", cookies.trim());
    } else {
      sessionStorage.removeItem("liveCookies");
    }

    router.push(`/loading?url=${encodeURIComponent(url)}`);
  };

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden selection:bg-cyan/30"
      style={{ background: "radial-gradient(ellipse 70% 60% at 5% 5%, rgba(0,250,252,0.25) 0%, transparent 65%), radial-gradient(ellipse 60% 60% at 95% 95%, rgba(185,80,255,0.25) 0%, transparent 65%), #000000" }}
    >
      {/* ── thu: center-left ── */}
      <img
        src="/thu.svg"
        alt=""
        className="pointer-events-none select-none absolute left-20 top-1/2 -translate-y-1/2 rotate-16 h-[45vh] w-auto opacity-90 drop-shadow-[0_0_30px_rgba(0,250,252,0.2)]"
      />

      {/* ── hacker: bottom-right ── */}
      <img
        src="/hacker.svg"
        alt=""
        className="pointer-events-none select-none absolute bottom-[-1vh] right-[-6vw] rotate-10 h-[60vh] w-auto opacity-95 drop-shadow-[0_0_40px_rgba(185,80,255,0.15)]"
      />

      {/* ── Content: center ── */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-12">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-purple p-[1px] shadow-[0_0_20px_rgba(0,250,252,0.3)]">
              <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00FAFC" />
                      <stop offset="100%" stopColor="#B950FF" />
                    </linearGradient>
                  </defs>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight leading-[1.1]">
                AI-powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple">
                  Hyper-personalized Phishing
                </span>
              </h1>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-md font-light">
                Weaponizing public social media data through LLMs to construct hyper-personalized social engineering attacks.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Target Facebook Profile</label>
              <div className="flex gap-3">
                <Input
                  className="flex-1 h-14 bg-neutral-900 border-neutral-800 text-base text-white placeholder:text-neutral-600 focus-visible:ring-cyan/20 focus-visible:border-cyan/50 transition-all"
                  placeholder="https://facebook.com/username"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="h-14 px-8 bg-white text-black cursor-pointer hover:bg-cyan hover:shadow-[0_0_20px_rgba(0,250,252,0.5)] font-bold transition-all duration-300"
                >
                  Launch
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowCookies(!showCookies)}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-cyan transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showCookies ? "rotate-180" : ""}`} />
                Injection Cookies {cookies.trim() ? "(active)" : "(optional)"}
              </button>

              {showCookies && (
                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[11px] text-neutral-600 leading-relaxed font-mono">
                    &gt; bypass_handshake: true<br />
                    &gt; load_session_identity: user_provided
                  </p>
                  <textarea
                    value={cookies}
                    onChange={(e) => setCookies(e.target.value)}
                    placeholder='[{"name":"c_user","value":"...","domain":".facebook.com",...}]'
                    rows={4}
                    spellCheck={false}
                    className="w-full rounded-lg bg-neutral-900/50 border border-neutral-800 px-3 py-2.5 text-xs font-mono text-cyan/70 placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan/30 transition-all resize-none"
                  />
                </div>
              )}
            </div>
          </form>

          <div className="flex gap-12 pt-8 border-t border-neutral-900">
            {[
              { label: "Extraction", value: "~15s", color: "text-cyan" },
              { label: "Internal Model", value: "GPT-4o", color: "text-purple" },
              { label: "Escalation", value: "Level 4", color: "text-white" },
            ].map((stat, i) => (
              <div key={i}>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

