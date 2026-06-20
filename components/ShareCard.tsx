"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Check,
  Copy,
  QrCode,
  Send,
  User,
} from "lucide-react";
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

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.518 5.26l-.999 3.648 3.97-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

interface ShareCardProps {
  config: SplitConfig;
  participant: Participant;
  index: number;
}

export function ShareCard({ config, participant, index }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [sent, setSent] = useState(false);

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

  function markSent() {
    setSent(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-glass rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-semibold text-brand-bright ring-1 ring-brand/25">
            {participant.name.trim() ? initials : <User className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {participant.name.trim() || `Person ${index + 1}`}
            </p>
            <p className="truncate text-xs text-muted">
              {participant.phone.trim() || "no number"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold tracking-tight text-ink">
            {formatINR(participant.amount)}
          </p>
          {sent && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <Check className="h-3 w-3" /> sent
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={smsLink}
          onClick={markSent}
          className={`inline-flex flex-1 min-w-[7rem] items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-bright ${
            phoneValid ? "" : "pointer-events-none opacity-40"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Send SMS
        </a>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          onClick={markSent}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-white/[0.06] ${
            phoneValid ? "" : "pointer-events-none opacity-40"
          }`}
        >
          <WhatsAppIcon className="h-4 w-4 text-emerald-400" />
          WhatsApp
        </a>
        <button
          onClick={copyLink}
          aria-label="Copy UPI link"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-white/[0.06]"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => setShowQr((v) => !v)}
          aria-label="Show QR code"
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
            showQr
              ? "border-brand/50 bg-brand/10 text-brand-bright"
              : "border-border-strong bg-white/[0.03] text-ink-soft hover:bg-white/[0.06]"
          }`}
        >
          <QrCode className="h-4 w-4" />
        </button>
      </div>

      {showQr && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 overflow-hidden"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-soft/60 p-4">
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={upiLink} size={148} level="M" />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Send className="h-3 w-3" />
              Scan with any UPI app to pay {formatINR(participant.amount)}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
