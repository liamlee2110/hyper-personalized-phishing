"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Globe, Users, Calendar, MessageSquareText, User, BookOpen,
  Link as LinkIcon, SendHorizonal, Loader2, CheckCircle2, ChevronRight,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function DemoPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [sendTo, setSendTo] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("phishingData");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!data) return null;

  const { scraped_data, phishing_email } = data;

  const handleSendEmail = async () => {
    if (!sendTo) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: sendTo, email_data: phishing_email }),
      });
      if (res.ok) {
        setSendResult({ ok: true, msg: `Delivered` });
      } else {
        setSendResult({ ok: false, msg: "Failed to send" });
      }
    } catch {
      setSendResult({ ok: false, msg: "Network error" });
    } finally {
      setSending(false);
    }
  };

  const toneLabels = scraped_data.tone_analysis
    ? scraped_data.tone_analysis.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  const hasIntro = scraped_data.intro && scraped_data.intro.length > 0;
  const hasAbout = scraped_data.about && Object.keys(scraped_data.about).length > 0;
  const hasConnections = scraped_data.connections && scraped_data.connections.length > 0;
  const hasEvents = scraped_data.events && scraped_data.events.length > 0;
  const hasTone = toneLabels.length > 0;

  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      {/* ── Left: Scraped Data ────────────────────────────────────── */}
      <div className="w-1/2 border-r border-neutral-900 flex flex-col min-h-0">
        <div className="h-14 px-6 flex items-center justify-between border-b border-neutral-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_6px_rgba(0,250,252,0.6)]" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
              Reconnaissance Data
            </span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-xs cursor-pointer text-neutral-600 hover:text-cyan transition-colors font-medium"
          >
            New Target
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-4">
            {/* ── Profile summary bar ── */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-900">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-cyan shrink-0">
                {(scraped_data.profile_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{scraped_data.profile_name || "Unknown"}</p>
                <Link
                  href={scraped_data.profile_url}
                  target="_blank"
                  className="text-[11px] text-neutral-500 hover:text-cyan transition-colors truncate block"
                >
                  {scraped_data.profile_url}
                </Link>
              </div>
            </div>

            {/* ── Info accordion ── */}
            <div className="rounded-lg border border-neutral-900 bg-neutral-950 overflow-hidden divide-y divide-neutral-900">
              {hasIntro && (
                <Accordion
                  icon={<User className="w-3.5 h-3.5" />}
                  title="Profile Intro"
                  badge={scraped_data.intro.length}
                >
                  <div className="space-y-1">
                    {scraped_data.intro.map((item: string, i: number) => (
                      <p key={i} className="text-[13px] text-neutral-300 py-1">{item}</p>
                    ))}
                  </div>
                </Accordion>
              )}

              {hasAbout && (
                <Accordion
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                  title="About"
                  badge={Object.values(scraped_data.about).flat().length}
                >
                  <div className="space-y-3">
                    {Object.entries(scraped_data.about).map(([key, items]: [string, any]) => (
                      <div key={key}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 mb-1">
                          {key.replace(/_/g, " ")}
                        </p>
                        {items.slice(0, 6).map((item: string, i: number) => (
                          <p key={i} className="text-[13px] text-neutral-300 py-0.5">{item}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {hasConnections && (
                <Accordion
                  icon={<Users className="w-3.5 h-3.5" />}
                  title="Connections"
                  badge={scraped_data.connections.length}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {scraped_data.connections.map((conn: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded text-[11px] bg-neutral-900 text-neutral-400"
                      >
                        {conn.name}
                      </span>
                    ))}
                  </div>
                </Accordion>
              )}

              {hasEvents && (
                <Accordion
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  title="Events"
                  badge={scraped_data.events.length}
                >
                  <div className="space-y-1.5">
                    {scraped_data.events.map((event: any, i: number) => (
                      <div key={i}>
                        <p className="text-[13px] text-neutral-200">{event.name}</p>
                        <p className="text-[11px] text-neutral-600">{event.role}</p>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {hasTone && (
                <Accordion
                  icon={<Globe className="w-3.5 h-3.5" />}
                  title="Tone"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {toneLabels.map((tone: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] rounded-full border border-cyan/20 text-cyan/70 bg-cyan/5"
                      >
                        {tone}
                      </span>
                    ))}
                  </div>
                </Accordion>
              )}
            </div>

            {/* ── Posts (main content) ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquareText className="w-3.5 h-3.5 text-neutral-600" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-600">
                  Extracted Posts
                </h3>
                <span className="text-[10px] font-bold text-neutral-700">{scraped_data.recent_posts.length}</span>
              </div>
              <div className="space-y-2.5">
                {scraped_data.recent_posts.map((post: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-neutral-950 border border-neutral-900 hover:border-neutral-800 transition-colors"
                  >
                    {post.author && (
                      <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">{post.author}</p>
                    )}
                    <p className="text-[13px] leading-[1.7] text-neutral-300 whitespace-pre-wrap">
                      {post.text}
                    </p>
                    <div className="flex gap-4 mt-2.5 text-[11px] text-neutral-600">
                      {post.date && post.date !== "Recent" && <span>{post.date}</span>}
                      {post.likes > 0 && <span>{post.likes} reactions</span>}
                      {post.comments > 0 && <span>{post.comments} comments</span>}
                      {post.shares > 0 && <span>{post.shares} shares</span>}
                    </div>
                  </div>
                ))}
                {scraped_data.recent_posts.length === 0 && (
                  <p className="text-xs text-neutral-700 py-4 text-center">No posts extracted</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ── Right: Email Preview ──────────────────────────────────── */}
      <div className="w-1/2 flex flex-col">
        <div className="h-14 px-8 flex items-center justify-between border-b border-neutral-900 shrink-0">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
            Generated Email
          </span>
          <div className="flex items-center gap-2">
            {!showSend ? (
              <button
                onClick={() => setShowSend(true)}
                className="flex items-center gap-1.5 text-xs font-medium cursor-pointer text-neutral-600 hover:text-cyan transition-colors"
              >
                <SendHorizonal className="w-3.5 h-3.5" />
                Send to real inbox
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="email@gmail.com"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="w-52 h-7 text-xs bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-700 focus-visible:ring-cyan/20 focus-visible:border-cyan/40"
                />
                <Button
                  size="sm"
                  onClick={handleSendEmail}
                  disabled={sending || !sendTo}
                  className="h-7 px-3 bg-cyan text-black hover:bg-cyan/80 text-xs font-bold"
                >
                  {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send"}
                </Button>
                {sendResult && (
                  <span className={`text-xs ${sendResult.ok ? "text-neutral-500" : "text-destructive"}`}>
                    {sendResult.ok && <CheckCircle2 className="w-3 h-3 inline mr-0.5 text-cyan" />}
                    {sendResult.msg}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8">
            <div className="rounded-xl bg-white text-neutral-900 overflow-hidden shadow-[0_0_40px_rgba(0,250,252,0.05)]">
              <div className="px-8 pt-8 pb-5">
                <h1 className="text-xl font-semibold leading-tight tracking-tight">
                  {phishing_email.subject}
                </h1>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500">
                    {phishing_email.sender_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-neutral-900">{phishing_email.sender_name}</span>
                      <span className="text-neutral-400 ml-1.5 text-xs">&lt;{phishing_email.sender_email}&gt;</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      to me &middot; {format(new Date(), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mx-8 border-t border-neutral-100" />
              <div className="px-8 py-6">
                <div className="text-[15px] leading-[1.8] text-neutral-700 whitespace-pre-wrap">
                  {phishing_email.body}
                </div>
              </div>
              <div className="px-8 pb-8">
                <div className="flex flex-col items-start gap-2 pt-4 border-t border-neutral-100">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
                    <LinkIcon className="w-3.5 h-3.5" />
                    {phishing_email.cta_text}
                  </button>
                  {phishing_email.link_description && (
                    <p className="text-[11px] text-neutral-400">{phishing_email.link_description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function Accordion({
  icon,
  title,
  badge,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left cursor-pointer hover:bg-neutral-900/50 transition-colors"
      >
        <ChevronRight
          className={`w-3 h-3 text-neutral-600 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
        {icon && <span className="text-neutral-600 shrink-0">{icon}</span>}
        <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 flex-1">
          {title}
        </span>
        {badge != null && (
          <span className="text-[10px] tabular-nums text-neutral-700">{badge}</span>
        )}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}
