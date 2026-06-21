"use client";

import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { SplitBuilderClient } from "./SplitBuilderClient";

export function BuilderView({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[700px] flex-col border-x border-dashed border-white/[0.06]">
      {/* ── Sticky header ─────────────────────────────────── */}
      <header className="sticky top-0 z-10">
        <div
          className="border-b border-dashed border-white/[0.06]"
          style={{
            background: "rgba(8,8,10,0.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center justify-between px-6 py-3.5 sm:px-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" />
            back
          </button>

          <Logo />

          {/* Spacer mirrors back button to keep logo visually centered */}
          <div className="w-14" aria-hidden />
          </div>
        </div>
      </header>

      {/* ── Builder content ───────────────────────────────── */}
      <div className="w-full flex-1 px-6 py-8 sm:px-10">
        <SplitBuilderClient />
      </div>

      {/* ── Minimal footer ────────────────────────────────── */}
      <footer className="border-t border-dashed border-white/[0.06]">
        <div className="px-6 py-6 sm:px-10">
          <p className="font-mono text-[11px] text-faint flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Runs on your bank&apos;s UPI rails.</span>
            <span>splitupi stores nothing.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
