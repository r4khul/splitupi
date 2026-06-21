"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Github, Star, Smartphone, Zap, Shield, ReceiptIndianRupee } from "lucide-react";
import { Logo } from "./Logo";
import { preloadSplitBuilder } from "./SplitBuilderClient";

const FEATURES = [
  { label: "No app needed", detail: "Pay from any UPI app", icon: Smartphone },
  { label: "One tap to pay", detail: "Deep link, pre-filled", icon: Zap },
  { label: "Stores nothing", detail: "Runs on your bank", icon: Shield },
];

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    preloadSplitBuilder();
    fetch("https://api.github.com/repos/r4khul/splitupi")
      .then((r) => r.json())
      .then((d) => { if (typeof d.stargazers_count === "number") setStars(d.stargazers_count); })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto flex h-full w-full max-w-[700px] flex-col border-x border-dashed border-white/[0.06] select-none">

      {/* ── Centered column ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-6 sm:px-10">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center justify-between py-5">
          <Logo />
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-white/[0.02] px-3.5 py-1.5 font-mono text-[11px] text-ink-soft transition hover:border-border-strong hover:text-ink"
          >
            Split now <ReceiptIndianRupee className="h-3 w-3" />
          </button>
        </header>

        {/* ── Hero ───────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center pb-8 pt-2">

          {/* Badge */}
          <a
            href="https://github.com/r4khul/splitupi"
            target="_blank"
            rel="noreferrer"
            className="group mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 transition hover:border-white/[0.14] hover:bg-white/[0.05] active:scale-[0.98]"
          >
            <Github className="h-3 w-3 text-muted transition group-hover:text-ink-soft" />
            <span className="font-mono text-[10.5px] font-medium tracking-wide text-muted transition group-hover:text-ink-soft">
              open source &amp; free
            </span>
            {stars !== null && (
              <>
                <span className="h-3 w-px bg-white/[0.1]" />
                <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-muted/70 transition group-hover:text-muted">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
                </span>
              </>
            )}
            <ArrowRight className="h-3 w-3 text-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-muted" />
          </a>

          {/*
            Instrument Serif headline — pure color contrast.
            Key words: bright white. Filler: very dark gray (#45464d = color-faint).
            Tracking (-0.01em from .font-instrument) + leading 0.88.
          */}
          <h1 className="font-instrument font-bold leading-[0.88] text-[clamp(2.8rem,8vw,5.5rem)]">
            <span style={{ color: "var(--color-faint)" }}>Split&nbsp;the&nbsp;</span>
            <span className="text-ink">bill</span>
            <span style={{ color: "var(--color-faint)" }}>,</span>
            <br />
            <span style={{ color: "var(--color-faint)" }}>without&nbsp;</span>
            <span className="text-ink">hassle</span>
            <span style={{ color: "var(--color-faint)" }}>.</span>
          </h1>

          {/* Sub-copy */}
          <p className="mt-6 max-w-[340px] font-mono text-[12px] leading-[1.75] text-muted">
            Enter the total, add phone numbers — each person
            gets a one-tap UPI link over SMS or WhatsApp.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onEnter}
              className="font-instrument inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-[15px] font-semibold text-white transition hover:bg-brand-bright active:scale-[0.98]"
            >
              Create a split
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/r4khul/splitupi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border-strong bg-white/[0.02] px-6 font-mono text-[12px] font-medium text-ink-soft transition hover:bg-white/[0.05]"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* ── Feature strip — centered dashed border ── */}
      <div className="shrink-0 border-t border-dashed border-white/[0.06]">
        <div className="flex flex-col divide-y divide-dashed divide-white/[0.06] px-6 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-10">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-3 py-4 sm:flex-col sm:items-start sm:py-6 sm:px-5 sm:first:pl-0 sm:last:pr-0">
              <f.icon className="h-4 w-4 shrink-0 text-ink-soft/65" />
              <div>
                <p className="font-instrument text-[13.5px] font-semibold text-ink">{f.label}</p>
                <p className="mt-0.5 font-mono text-[10.5px] text-faint sm:mt-1.5">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-dashed border-white/[0.06]">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-3.5 sm:justify-between sm:px-10">
          <p className="font-mono text-[10.5px] text-faint">Runs on your bank&apos;s UPI rails. Stores nothing.</p>
          <a
            href="https://github.com/r4khul"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 transition"
          >
            <img
              src="https://github.com/r4khul.png?size=32"
              alt="r4khul"
              width={20}
              height={20}
              className="h-5 w-5 rounded-full opacity-50 transition group-hover:opacity-90"
            />
            <span className="font-mono text-[10.5px] text-faint transition group-hover:text-ink-soft">
              built by{" "}<span className="text-muted group-hover:text-ink-soft">@r4khul</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
