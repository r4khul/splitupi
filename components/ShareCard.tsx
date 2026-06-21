"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Check, Copy, User, MessageSquare, Share, QrCode } from "lucide-react";
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

  async function performShare(method: "whatsapp" | "generic") {
    setSharing(true);
    if (method === "whatsapp") setSent(true);
    try {
      const blob = await generatePaymentPoster({
        upiLink,
        amountFormatted: formatINR(participant.amount),
        name: config.payeeName.trim(),
        note: config.note.trim(),
        payeeVpa: config.payeeVpa.trim(),
      });

      const file = new File(
        [blob],
        `splitupi-${participant.name.trim() || "payment"}.jpg`,
        { type: "image/jpeg" },
      );

      const canShareFile =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (method === "whatsapp") {
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
      } else {
        // generic share
        if (canShareFile) {
          await navigator.share({ files: [file], text: message });
        } else if (navigator.share) {
          await navigator.share({ text: message, url: upiLink });
        } else {
          copyLink();
        }
      }
    } catch {
      /* Share cancelled or failed */
      if (method === "whatsapp") {
        window.open(waLink, "_blank");
      }
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
          className={`inline-flex flex-1 min-w-[6.5rem] items-center justify-center gap-1.5 rounded-[8px] bg-brand px-3 py-2 font-mono text-[11px] font-semibold text-white transition hover:bg-brand-bright active:scale-[0.98] ${
            phoneValid ? "" : "pointer-events-none opacity-40"
          }`}
        >
          <MessageSquare className="h-3 w-3" /> SMS
        </a>

        {/* WhatsApp */}
        <button
          onClick={() => performShare("whatsapp")}
          disabled={sharing || !phoneValid}
          className={`inline-flex flex-1 min-w-[6.5rem] items-center justify-center gap-1.5 rounded-[8px] bg-[#25d366] px-3 py-2 font-mono text-[11px] font-semibold text-white transition hover:bg-[#20bd5a] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {sharing ? "..." : (
            <>
               <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
               </svg>
               WhatsApp
            </>
          )}
        </button>

        {/* Generic Share */}
        <button
          onClick={() => performShare("generic")}
          disabled={sharing}
          className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-white/[0.08] px-3 py-2 font-mono text-[11px] font-medium text-white transition hover:bg-white/[0.12] active:scale-[0.98] disabled:opacity-40"
        >
          <Share className="h-3 w-3" /> Share
        </button>

        {/* Copy UPI link */}
        <button
          onClick={copyLink}
          aria-label={copied ? "Copied" : "Copy UPI link"}
          className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-white/[0.08] px-3 py-2 font-mono text-[11px] font-medium text-white transition hover:bg-white/[0.12]"
        >
          {copied ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check className="h-3 w-3" /> Copied
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Copy className="h-3 w-3" /> Copy link
            </span>
          )}
        </button>

        {/* Toggle QR */}
        <button
          onClick={() => setShowQr((v) => !v)}
          aria-label="Show QR code"
          className={`inline-flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-2 font-mono text-[11px] font-medium transition ${
            showQr
              ? "bg-brand text-white"
              : "bg-white/[0.08] text-white hover:bg-white/[0.12]"
          }`}
        >
          <QrCode className="h-3 w-3" /> QR
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
            <div className="relative rounded-[12px] bg-white p-3 shadow-lg">
              <QRCodeSVG
                value={upiLink}
                size={160}
                level="H"
                fgColor="#336df7"
                bgColor="#ffffff"
                imageSettings={{
                  src: "/splitupi-logo.png",
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>
            <p className="font-mono text-[10px] text-muted">
              scan to pay {formatINR(participant.amount)} · any UPI app
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
