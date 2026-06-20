import { Github, ArrowDownRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SplitBuilderClient } from "@/components/SplitBuilderClient";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-aurora">
      <div className="pointer-events-none absolute inset-0 grid-overlay" />

      <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col px-5 sm:px-6">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <Logo />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-soft transition hover:border-border-strong hover:text-ink"
          >
            <Github className="h-4 w-4" />
          </a>
        </header>

        {/* Hero */}
        <section className="pb-7 pt-4 text-center sm:pt-8">
          <span className="pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            UPI-native bill splitting
          </span>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Split the bill.
            <br />
            Get paid in{" "}
            <span className="relative whitespace-nowrap text-brand-bright">
              seconds
              <svg
                className="absolute -bottom-1 left-0 w-full text-brand/50"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M1 5.5C20 2.5 50 2 99 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted sm:text-base">
            You paid. Now enter the amount, drop in a few numbers, and everyone
            gets a one-tap UPI link over SMS or WhatsApp. No app. No chasing.
          </p>
        </section>

        {/* Builder */}
        <section className="pb-6">
          <SplitBuilderClient />
        </section>

        {/* How it works */}
        <section className="grid gap-3 pb-10 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Enter & split",
              d: "Add the total and how many ways to split it.",
            },
            {
              n: "02",
              t: "Add numbers",
              d: "Drop in each person's name and phone.",
            },
            {
              n: "03",
              t: "They tap & pay",
              d: "A UPI link opens their app, prefilled.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-border bg-white/[0.012] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-bright">
                  {s.n}
                </span>
                <ArrowDownRight className="h-3.5 w-3.5 text-faint" />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-border py-7 text-center">
          <Logo className="justify-center opacity-80" />
          <p className="mt-3 text-xs text-faint">
            Payments run on your bank&apos;s UPI rails. splitupi never touches your
            money or data.
          </p>
        </footer>
      </div>
    </main>
  );
}
