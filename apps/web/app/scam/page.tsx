"use client";

import { useEffect } from "react";
import { fireCornerConfetti } from "@/components/confetti.utils";

const SCAM_COLORS = ["#ef4444", "#000000", "#ffffff", "#dc2626", "#fca5a5"];

export default function ScamPage() {
  useEffect(() => {
    fireCornerConfetti(300, SCAM_COLORS);

    const interval = setInterval(() => {
      fireCornerConfetti(150, SCAM_COLORS);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden">
      <div className="relative z-20 text-center space-y-6 px-6">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white">
          You are <span className="text-red-500">scammed!</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          This was an educational phishing demonstration.<br />
          In a real attack, your data would already be compromised.
        </p>
        <div className="pt-4">
          <span className="inline-block px-4 py-2 rounded-full border border-neutral-800 text-xs text-neutral-500 tracking-wide uppercase">
            CECS1031 — VinUniversity
          </span>
        </div>
      </div>
    </div>
  );
}
