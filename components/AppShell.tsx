"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "./LandingPage";
import { BuilderView } from "./BuilderView";

type View = "landing" | "builder";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.55, 0, 1, 0.45] as const;

export function AppShell() {
  const [view, setView] = useState<View>("landing");

  return (
    <main className={`relative h-dvh overflow-hidden ${view === "landing" ? "bg-aurora" : ""}`}>
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <AnimatePresence mode="wait" initial={false}>
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.98 }}
            transition={{ duration: 0.38, ease: EASE_OUT }}
            className="absolute inset-0"
          >
            <LandingPage onEnter={() => setView("builder")} />
          </motion.div>
        ) : (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 56 }}
            transition={{ duration: 0.38, ease: EASE_OUT }}
            className="absolute inset-0 overflow-y-auto"
          >
            <BuilderView onBack={() => setView("landing")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
