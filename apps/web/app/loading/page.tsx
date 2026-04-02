"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, Database, Server, Brain, Mail } from "lucide-react";

const BACKEND_URL = "http://127.0.0.1:8000";

const steps = [
  { id: "scraping", label: "Scraping profile data", icon: Database },
  { id: "analyzing", label: "Analyzing tone & connections", icon: Server },
  { id: "generating", label: "Generating phishing payload", icon: Brain },
  { id: "formatting", label: "Formatting email", icon: Mail },
];

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) {
      router.push("/");
      return;
    }

    let progressInterval: NodeJS.Timeout;

    const generateAttack = async () => {
      try {
        progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 1, 90));
        }, 200);

        const payload: Record<string, unknown> = { profile_url: url };
        const liveCookies = sessionStorage.getItem("liveCookies");
        if (liveCookies) {
          try { payload.cookies = JSON.parse(liveCookies); } catch { /* ignore */ }
        }

        const response = await fetch(`${BACKEND_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const detail = await response.text();
          throw new Error(detail);
        }

        const data = await response.json();

        clearInterval(progressInterval);
        setProgress(100);

        for (let i = 1; i <= steps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setCurrentStep(i);
        }

        sessionStorage.setItem("phishingData", JSON.stringify(data));

        setTimeout(() => router.push("/demo"), 600);
      } catch (err: any) {
        clearInterval(progressInterval);
        setError(err.message || "An unexpected error occurred");
      }
    };

    generateAttack();
    return () => clearInterval(progressInterval);
  }, [url, router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-tight">Constructing attack vector</h2>
          <p className="text-xs text-neutral-600 font-mono truncate">{decodeURIComponent(url)}</p>
        </div>

        {/* Progress bar */}
        <div className="h-px w-full bg-neutral-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan to-purple shadow-[0_0_8px_rgba(0,250,252,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const status = index < currentStep ? "complete" : index === currentStep ? "active" : "pending";
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center gap-3">
                {status === "complete" ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  </motion.div>
                ) : status === "active" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <CircleDashed className="w-4 h-4 text-cyan" />
                  </motion.div>
                ) : (
                  <StepIcon className="w-4 h-4 text-neutral-700" />
                )}
                <span className={`text-sm ${
                  status === "complete" ? "text-neutral-700"
                  : status === "active" ? "text-white font-medium"
                  : "text-neutral-800"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-purple/10 border border-purple/20 text-purple text-sm font-mono">
            ERR: {error}
          </div>
        )}
      </div>
    </div>
  );
}
