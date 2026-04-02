"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Globe, Users, Calendar, MessageSquareText,
  Link as LinkIcon, SendHorizonal, Loader2, CheckCircle2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import Link from "next/link";

const BACKEND_URL = "http://127.0.0.1:8000";

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

  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      {/* ── Left: Scraped Data ────────────────────────────────────── */}
      <div className="w-1/2 border-r border-neutral-900 flex flex-col">
        {/* Left header */}
        <div className="h-14 px-8 flex items-center justify-between border-b border-neutral-900 shrink-0">
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

        <ScrollArea className="flex-1">
          <div className="px-8 py-8 space-y-10">
            {/* Target */}
            <section>
              <Label icon={<Globe className="w-3.5 h-3.5" />}>Target Profile</Label>
              <div className="mt-4 p-4 rounded-lg bg-neutral-950 border border-neutral-900 hover:border-cyan/20 transition-colors">
                <p className="text-sm font-medium text-neutral-200 break-all leading-relaxed">
                  <Link href={scraped_data.profile_url} target="_blank" className="hover:text-cyan transition-colors">{scraped_data.profile_url}</Link>
                </p>
                <p className="text-xs text-neutral-600 mt-1">Facebook &middot; Public profile</p>
              </div>
            </section>

            {/* Posts */}
            <section>
              <Label icon={<MessageSquareText className="w-3.5 h-3.5" />}>
                Extracted Posts
                <span className="ml-2 text-neutral-700">{scraped_data.recent_posts.length}</span>
              </Label>
              <div className="mt-4 space-y-3">
                {scraped_data.recent_posts.map((post: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-neutral-950 border border-neutral-900 hover:border-neutral-800 transition-colors"
                  >
                    <p className="text-[13px] leading-[1.7] text-neutral-300">
                      {post.text}
                    </p>
                    {(post.likes > 0 || post.comments > 0) && (
                      <div className="flex gap-4 mt-3 text-xs text-neutral-600">
                        {post.likes > 0 && <span>{post.likes} reactions</span>}
                        {post.comments > 0 && <span>{post.comments} comments</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Connections */}
            {scraped_data.connections.length > 0 && (
              <section>
                <Label icon={<Users className="w-3.5 h-3.5" />}>Connections</Label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {scraped_data.connections.map((conn: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-950 border border-neutral-900 text-neutral-400 hover:border-purple/30 hover:text-neutral-300 transition-colors"
                    >
                      {conn.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Events */}
            {scraped_data.events.length > 0 && (
              <section>
                <Label icon={<Calendar className="w-3.5 h-3.5" />}>Events</Label>
                <div className="mt-4 space-y-2">
                  {scraped_data.events.map((event: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-neutral-950 border border-neutral-900">
                      <p className="text-sm font-medium text-neutral-200">{event.name}</p>
                      <p className="text-xs text-neutral-600 mt-1">{event.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tone */}
            {toneLabels.length > 0 && (
              <section>
                <Label>Detected Tone</Label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {toneLabels.map((tone: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs rounded-full border border-cyan/20 text-cyan/70 bg-cyan/5"
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── Right: Email Preview ──────────────────────────────────── */}
      <div className="w-1/2 flex flex-col">
        {/* Right header */}
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
            {/* Email card */}
            <div className="rounded-xl bg-white text-neutral-900 overflow-hidden shadow-[0_0_40px_rgba(0,250,252,0.05)]">
              {/* Subject + Sender */}
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

              {/* Divider */}
              <div className="mx-8 border-t border-neutral-100" />

              {/* Body */}
              <div className="px-8 py-6">
                <div className="text-[15px] leading-[1.8] text-neutral-700 whitespace-pre-wrap">
                  {phishing_email.body}
                </div>
              </div>

              {/* CTA */}
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

function Label({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-600">
      {icon}
      {children}
    </h3>
  );
}
