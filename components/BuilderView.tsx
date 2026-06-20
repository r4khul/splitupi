"use client";

import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { SplitBuilderClient } from "./SplitBuilderClient";

export function BuilderView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      {/* ── Sticky header ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 border-b border-border"
        style={{
          background: "rgba(8,8,10,0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex max-w-[700px] items-center justify-between px-6 py-3.5 sm:px-10">
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
      </header>

      {/* ── Builder content ───────────────────────────────── */}
      <div className="mx-auto w-full max-w-[700px] flex-1 px-6 py-8 sm:px-10">
        <SplitBuilderClient />
      </div>

      {/* ── Minimal footer ────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-[700px] px-6 py-5 sm:px-10">
          <p className="font-mono text-[10.5px] text-faint">
            Runs on your bank&apos;s UPI rails · splitupi stores nothing
          </p>
        </div>
      </footer>
    </div>
  );
}
