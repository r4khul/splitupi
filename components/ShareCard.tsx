"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Check, Copy, User } from "lucide-react";
import {
  buildMessage,
  buildSmsLink,
  buildUpiLink,
  buildWhatsAppLink,
  formatINR,
  isValidPhone,
  type Participant,
  type SplitConfig,
} from "@/lib/upi";
import { generatePaymentPoster } from "@/lib/poster";

interface ShareCardProps {
  config: SplitConfig;
  participant: Participant;
  index: number;
}

export function ShareCard({ config, participant, index }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [sent, setSent] = useState(false);
  const [sharing, setSharing] = useState(false);

  const upiLink = buildUpiLink(config, participant.amount);
  const message = buildMessage(config, participant, upiLink);
  const smsLink = buildSmsLink(participant.phone, message);
  const waLink = buildWhatsAppLink(participant.phone, message);
  const phoneValid = isValidPhone(participant.phone);

  const initials = (participant.name.trim() || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(upiLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  async function shareWhatsApp() {
    setSharing(true);
    setSent(true);
    try {
      const blob = await generatePaymentPoster({
        upiLink,
        amountFormatted: formatINR(participant.amount),
        name: participant.name.trim(),
        note: config.note.trim(),
        payeeVpa: config.payeeVpa.trim(),
      });

      const file = new File(
        [blob],
        `splitupi-${participant.name.trim() || "payment"}.png`,
        { type: "image/png" },
      );

      const canShareFile =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({ files: [file], text: message });
      } else {
        /* Desktop / unsupported: download poster + open WhatsApp */
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        window.open(waLink, "_blank");
      }
    } catch {
      /* Share cancelled or failed — fall back to plain WhatsApp link */
      window.open(waLink, "_blank");
    } finally {
      setSharing(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-glass rounded-[12px] p-4 sm:p-5"
    >
      {/* ── Participant row ────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-brand/15 font-mono text-[12px] font-semibold text-brand-bright ring-1 ring-brand/20">
            {participant.name.trim() ? initials : <User className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-instrument text-[14px] font-semibold text-ink">
              {participant.name.trim() || `Person ${index + 1}`}
            </p>
            <p className="truncate font-mono text-[10px] text-muted">
              {participant.phone.trim() || "no number"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display-xl text-[1.35rem] font-semibold tracking-tight text-ink">
            {formatINR(participant.amount)}
          </p>
          {sent && (
            <span className="font-mono text-[10px] font-medium text-emerald-400">
              sent
            </span>
          )}
        </div>
      </div>

      {/* ── Action buttons ─────────────────────────────────── */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {/* SMS */}
        <a
          href={smsLink}
          onClick={() => setSent(true)}
          className={`inline-flex flex-1 min-w-[6.5rem] items-center justify-center rounded-[8px] bg-brand px-3 py-2 font-mono text-[11px] font-semibold text-white transition hover:bg-brand-bright active:scale-[0.98] ${
            phoneValid ? "" : "pointer-events-none opacity-40"
          }`}
        >
          SMS
        </a>

        {/* WhatsApp — generates branded poster */}
        <button
          onClick={shareWhatsApp}
          disabled={sharing || !phoneValid}
          className={`inline-flex flex-1 min-w-[6.5rem] items-center justify-center rounded-[8px] border border-[#25d366]/30 bg-[#25d366]/8 px-3 py-2 font-mono text-[11px] font-semibold text-[#25d366] transition hover:bg-[#25d366]/15 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {sharing ? "..." : "WhatsApp"}
        </button>

        {/* Copy UPI link */}
        <button
          onClick={copyLink}
          aria-label={copied ? "Copied" : "Copy UPI link"}
          className="inline-flex items-center justify-center rounded-[8px] border border-border-strong bg-white/[0.02] px-3 py-2 font-mono text-[11px] font-medium text-ink-soft transition hover:bg-white/[0.06]"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="h-3 w-3" /> Copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy className="h-3 w-3" /> Copy link
            </span>
          )}
        </button>

        {/* Toggle QR */}
        <button
          onClick={() => setShowQr((v) => !v)}
          aria-label="Show QR code"
          className={`inline-flex items-center justify-center rounded-[8px] border px-3 py-2 font-mono text-[11px] font-medium transition ${
            showQr
              ? "border-brand/40 bg-brand/10 text-brand-bright"
              : "border-border-strong bg-white/[0.02] text-ink-soft hover:bg-white/[0.06]"
          }`}
        >
          QR
        </button>
      </div>

      {/* ── Inline QR ──────────────────────────────────────── */}
      {showQr && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 overflow-hidden"
        >
          <div className="flex flex-col items-center gap-3 rounded-[10px] border border-border bg-bg-soft/60 py-5">
            <div className="rounded-[8px] bg-white p-3">
              <QRCodeSVG value={upiLink} size={140} level="M" />
            </div>
            <p className="font-mono text-[10px] text-muted">
              scan with any UPI app to pay {formatINR(participant.amount)}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
