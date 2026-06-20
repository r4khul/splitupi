"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  Delete,
  Trash2,
  Users,
  Wallet,
  Receipt,
  AtSign,
  Phone,
  ShieldCheck,
  Zap,
  BadgeIndianRupee,
  Sparkles,
  BookUser,
  UserPlus,
} from "lucide-react";
import {
  equalShares,
  formatINR,
  isValidVpa,
  type Participant,
  type SplitConfig,
  type SplitMode,
} from "@/lib/upi";
import { evaluateExpression } from "@/lib/calc";
import {
  isContactPickerSupported,
  pickContacts,
} from "@/lib/contacts";
import { ShareCard } from "./ShareCard";

let idCounter = 0;
const newId = () => `p${++idCounter}-${Date.now().toString(36)}`;

function emptyParticipant(): Participant {
  return { id: newId(), name: "", phone: "", amount: 0 };
}

const FEATURES = [
  { icon: ShieldCheck, label: "No app, no signup" },
  { icon: Zap, label: "One-tap UPI pay" },
  { icon: BadgeIndianRupee, label: "Exact paise split" },
  { icon: Sparkles, label: "Free forever" },
];

export function SplitBuilder() {
  const [step, setStep] = useState<"build" | "share">("build");

  const [total, setTotal] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [payeeVpa, setPayeeVpa] = useState<string>("");
  const [payeeName, setPayeeName] = useState<string>("");
  const [mode, setMode] = useState<SplitMode>("equal");
  const [participants, setParticipants] = useState<Participant[]>([
    emptyParticipant(),
    emptyParticipant(),
  ]);

  const [contactsSupported, setContactsSupported] = useState(false);
  const [contactsMsg, setContactsMsg] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContactsSupported(isContactPickerSupported());
  }, []);

  // Live calculator: the amount field accepts math like "1200/4" or "500+250".
  const calc = evaluateExpression(total);
  const totalNum = calc.valid ? calc.value : 0;

  // Live computed shares for display + the final split.
  const computed = useMemo<Participant[]>(() => {
    if (mode === "equal") {
      const shares = equalShares(totalNum, participants.length);
      return participants.map((p, i) => ({ ...p, amount: shares[i] ?? 0 }));
    }
    return participants;
  }, [mode, totalNum, participants]);

  const customSum = participants.reduce(
    (s, p) => s + (mode === "custom" ? p.amount : 0),
    0,
  );

  const vpaValid = isValidVpa(payeeVpa);
  const hasNames = participants.some((p) => p.phone.trim());
  const customBalanced =
    mode === "equal" || Math.abs(customSum - totalNum) < 0.01;

  const canProceed =
    totalNum > 0 && vpaValid && hasNames && participants.length > 0 && customBalanced;

  function updateParticipant(id: string, patch: Partial<Participant>) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  function addParticipant() {
    setParticipants((prev) => [...prev, emptyParticipant()]);
  }

  // ----- Calculator pad helpers -----
  function appendToAmount(sym: string) {
    setTotal((prev) => {
      const last = prev.trim().slice(-1);
      // Avoid stacking operators (e.g. "5++").
      if ("+-*/".includes(sym) && "+-*/".includes(last)) {
        return prev.trim().slice(0, -1) + sym;
      }
      return prev + sym;
    });
    amountRef.current?.focus();
  }

  function backspaceAmount() {
    setTotal((prev) => prev.slice(0, -1));
    amountRef.current?.focus();
  }

  function clearAmount() {
    setTotal("");
    amountRef.current?.focus();
  }

  // ----- Contacts import -----
  async function importFromContacts() {
    if (!contactsSupported) {
      setContactsMsg(
        "Contact import works in Chrome on Android over HTTPS. Add people manually below.",
      );
      return;
    }
    setImporting(true);
    setContactsMsg("");
    try {
      const picked = await pickContacts();
      if (picked.length === 0) return;
      const imported: Participant[] = picked.map((c) => ({
        id: newId(),
        name: c.name,
        phone: c.phone,
        amount: 0,
      }));
      setParticipants((prev) => {
        const kept = prev.filter((p) => p.name.trim() || p.phone.trim());
        return [...kept, ...imported];
      });
    } finally {
      setImporting(false);
    }
  }

  function removeParticipant(id: string) {
    setParticipants((prev) =>
      prev.length > 1 ? prev.filter((p) => p.id !== id) : prev,
    );
  }

  const config: SplitConfig = {
    payeeVpa,
    payeeName,
    note,
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "build" ? (
          <motion.div
            key="build"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="card-glass rounded-[var(--radius-card)] p-5 sm:p-7"
          >
            {/* Amount hero — doubles as a live calculator */}
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <Receipt className="h-3.5 w-3.5" /> Total amount
                </span>
                {calc.isExpression && (
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold tabular-nums ${
                      calc.valid ? "text-brand-bright" : "text-amber-400"
                    }`}
                  >
                    <Equal className="h-3 w-3" />
                    {calc.valid ? formatINR(totalNum) : "…"}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-light text-faint sm:text-4xl">
                  ₹
                </span>
                <input
                  ref={amountRef}
                  type="text"
                  inputMode="decimal"
                  value={total}
                  onChange={(e) =>
                    setTotal(e.target.value.replace(/[^0-9+\-*/().\s]/g, ""))
                  }
                  placeholder="0"
                  aria-label="Total amount — supports math like 1200/4"
                  autoComplete="off"
                  className="no-spinner w-full bg-transparent text-4xl font-bold tracking-tight text-ink outline-none placeholder:text-faint sm:text-5xl"
                />
              </div>

              {/* Operator keypad — type math, or tap to build it */}
              <div className="mt-3 flex items-center gap-1.5">
                {(
                  [
                    { sym: "+", icon: Plus },
                    { sym: "-", icon: Minus },
                    { sym: "*", icon: X },
                    { sym: "/", icon: Divide },
                  ] as const
                ).map((op) => (
                  <button
                    key={op.sym}
                    type="button"
                    onClick={() => appendToAmount(op.sym)}
                    aria-label={`operator ${op.sym}`}
                    className="grid h-9 flex-1 place-items-center rounded-lg border border-border bg-white/[0.03] text-ink-soft transition hover:border-brand/50 hover:bg-brand/10 hover:text-brand-bright active:scale-95"
                  >
                    <op.icon className="h-4 w-4" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={backspaceAmount}
                  aria-label="backspace"
                  className="grid h-9 flex-1 place-items-center rounded-lg border border-border bg-white/[0.03] text-ink-soft transition hover:border-border-strong hover:bg-white/[0.06] active:scale-95"
                >
                  <Delete className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={clearAmount}
                  aria-label="clear"
                  className="grid h-9 flex-1 place-items-center rounded-lg border border-border bg-white/[0.03] text-[11px] font-bold text-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
                >
                  AC
                </button>
              </div>
              <p className="mt-2 text-[11px] text-faint">
                Tip: type a calculation like{" "}
                <span className="font-medium text-muted">1200 / 4</span> or{" "}
                <span className="font-medium text-muted">500+250+100</span> — it
                solves instantly.
              </p>
            </div>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for? (Dinner, trip, rent…)"
              className="mt-3 w-full border-b border-border bg-transparent pb-2 text-sm text-ink-soft outline-none transition focus:border-brand/60 placeholder:text-faint"
            />

            {/* Payee details */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="field flex items-center gap-2.5 rounded-xl px-3.5 py-3">
                <AtSign className="h-4 w-4 shrink-0 text-muted" />
                <input
                  type="text"
                  value={payeeVpa}
                  onChange={(e) => setPayeeVpa(e.target.value)}
                  placeholder="your-upi@bank"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                />
                {payeeVpa.length > 2 && (
                  <span
                    className={`text-[10px] font-semibold ${
                      vpaValid ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {vpaValid ? "valid" : "check"}
                  </span>
                )}
              </label>
              <label className="field flex items-center gap-2.5 rounded-xl px-3.5 py-3">
                <Wallet className="h-4 w-4 shrink-0 text-muted" />
                <input
                  type="text"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="Your name (payee)"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                />
              </label>
            </div>

            {/* Split mode toggle */}
            <div className="mt-6 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                <Users className="h-3.5 w-3.5" /> Split with{" "}
                <span className="text-ink-soft">{participants.length}</span>
              </span>
              <div className="flex rounded-lg border border-border bg-white/[0.02] p-0.5 text-xs font-medium">
                {(["equal", "custom"] as SplitMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative rounded-md px-3 py-1.5 capitalize transition ${
                      mode === m ? "text-white" : "text-muted hover:text-ink-soft"
                    }`}
                  >
                    {mode === m && (
                      <motion.span
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-md bg-brand"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="mt-3 space-y-2">
              {computed.map((p, i) => (
                <div
                  key={p.id}
                  className="group rounded-xl border border-border bg-white/[0.015] p-2.5 transition hover:border-border-strong"
                >
                  {/* Row 1: index + name + amount + delete */}
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.04] text-[11px] font-semibold text-muted">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={participants[i].name}
                      onChange={(e) =>
                        updateParticipant(p.id, { name: e.target.value })
                      }
                      placeholder="Name"
                      className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                    />
                    {mode === "equal" ? (
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                        {formatINR(p.amount)}
                      </span>
                    ) : (
                      <div className="flex w-24 shrink-0 items-center gap-1 rounded-lg bg-white/[0.03] px-2 py-1.5">
                        <span className="text-xs text-faint">₹</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={participants[i].amount || ""}
                          onChange={(e) =>
                            updateParticipant(p.id, {
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="no-spinner w-full bg-transparent text-right text-sm font-semibold text-ink outline-none placeholder:text-faint"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => removeParticipant(p.id)}
                      aria-label="Remove person"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Row 2: phone (full width) */}
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted" />
                    <input
                      type="tel"
                      inputMode="tel"
                      value={participants[i].phone}
                      onChange={(e) =>
                        updateParticipant(p.id, { phone: e.target.value })
                      }
                      placeholder="Phone number (98765 43210)"
                      className="min-w-0 flex-1 bg-transparent text-sm text-ink-soft outline-none placeholder:text-faint"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add people: from contacts or manually */}
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={importFromContacts}
                disabled={importing}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand/40 bg-brand/10 py-2.5 text-sm font-semibold text-brand-bright transition hover:bg-brand/15 disabled:opacity-60"
              >
                <BookUser className="h-4 w-4" />
                {importing ? "Opening contacts…" : "Add from contacts"}
              </button>
              <button
                onClick={addParticipant}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong py-2.5 text-sm font-medium text-muted transition hover:border-brand/50 hover:text-brand-bright"
              >
                <UserPlus className="h-4 w-4" /> Add manually
              </button>
            </div>
            {contactsMsg && (
              <p className="mt-2 text-center text-xs text-amber-400/90">
                {contactsMsg}
              </p>
            )}
            {!contactsMsg && !contactsSupported && (
              <p className="mt-2 text-center text-[11px] text-faint">
                Contact import opens your phone&apos;s address book on Chrome for
                Android (HTTPS).
              </p>
            )}

            {/* Custom split balance hint */}
            {mode === "custom" && totalNum > 0 && (
              <p
                className={`mt-3 text-center text-xs ${
                  customBalanced ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {customBalanced
                  ? "Splits add up perfectly."
                  : `${formatINR(customSum)} of ${formatINR(totalNum)} assigned — ${formatINR(
                      totalNum - customSum,
                    )} left.`}
              </p>
            )}

            {/* Feature pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <span
                  key={f.label}
                  className="pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-ink-soft"
                >
                  <f.icon className="h-3.5 w-3.5 text-brand-bright" />
                  {f.label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => canProceed && setStep("share")}
              disabled={!canProceed}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                canProceed
                  ? "bg-brand text-white brand-glow hover:bg-brand-bright"
                  : "cursor-not-allowed bg-white/[0.04] text-faint"
              }`}
            >
              Create split & get pay links
              <ArrowRight className="h-4 w-4" />
            </button>
            {!canProceed && (
              <p className="mt-2.5 text-center text-xs text-faint">
                {totalNum <= 0
                  ? "Enter the total amount to begin."
                  : !vpaValid
                    ? "Add a valid UPI ID to receive money."
                    : !hasNames
                      ? "Add at least one phone number."
                      : "Balance the custom splits to continue."}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="card-glass rounded-[var(--radius-card)] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("build")}
                  className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" /> Edit
                </button>
                <span className="pill rounded-full px-3 py-1 text-xs text-ink-soft">
                  {participants.length} requests ready
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">
                    {note.trim() || "Split total"}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-ink">
                    {formatINR(totalNum)}
                  </p>
                </div>
                <div className="text-right text-xs text-muted">
                  <p>to</p>
                  <p className="font-medium text-brand-bright">{payeeVpa}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Tap{" "}
                <span className="font-medium text-ink-soft">Send SMS</span> or{" "}
                <span className="font-medium text-ink-soft">WhatsApp</span> on
                each card to fire off a prefilled payment request. The link opens
                their UPI app with your details and the exact amount.
              </p>
            </div>

            <div className="space-y-3">
              {computed.map((p, i) => (
                <ShareCard
                  key={p.id}
                  config={config}
                  participant={p}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
