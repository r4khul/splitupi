"use client";

import { ArrowRight, Github } from "lucide-react";
import { Logo } from "./Logo";

const FEATURES = [
  { label: "No app needed", detail: "Pay from any UPI app" },
  { label: "One tap to pay", detail: "Deep link, pre-filled" },
  { label: "Stores nothing", detail: "Runs on your bank" },
];

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[700px] flex-col border-x border-dashed border-white/[0.06] select-none">

      {/* ── Centered column ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-6 sm:px-10">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center justify-between py-5">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={onEnter}
              className="hidden items-center gap-1.5 rounded-[8px] border border-border bg-white/[0.02] px-3.5 py-1.5 font-mono text-[11px] text-ink-soft transition hover:border-border-strong hover:text-ink sm:inline-flex"
            >
              Split now <ArrowRight className="h-3 w-3" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="View on GitHub"
              className="grid h-8 w-8 place-items-center rounded-[8px] border border-border text-ink-soft transition hover:border-border-strong hover:text-ink"
            >
              <Github className="h-[15px] w-[15px]" />
            </a>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center pb-8 pt-2">

          {/* Badge */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="group mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-white/[0.02] py-0.5 pl-0.5 pr-3.5 transition hover:border-border-strong"
          >
            <span className="rounded-full bg-white/[0.05] px-2.5 py-[3px] font-mono text-[10px] font-semibold text-ink">
              open source
            </span>
            <span className="font-mono text-[10px] text-muted transition group-hover:text-ink-soft">
              free forever
            </span>
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
              href="https://github.com"
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
        <div className="grid grid-cols-3 divide-x divide-dashed divide-white/[0.06] px-6 sm:px-10">
            {FEATURES.map((f) => (
              <div key={f.label} className="py-6 px-5 first:pl-0 last:pr-0">
                <p className="font-instrument text-[13.5px] font-semibold text-ink">{f.label}</p>
                <p className="mt-1 font-mono text-[10.5px] text-faint">{f.detail}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
