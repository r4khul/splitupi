"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Check, Copy, User, QrCode, Share2 } from "lucide-react";
import {
  buildMessage,
  buildSmsLink,
  buildUpiLink,
  formatINR,
  isValidPhone,
  normalizePhone,
  type Participant,
  type SplitConfig,
} from "@/lib/upi";
import { generatePaymentPoster } from "@/lib/poster";

interface ShareCardProps {
  config: SplitConfig;
  participant: Participant;
  index: number;
}

/* ── WhatsApp icon (brand SVG, no external dependency) ────────────── */
function WaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/* ── SMS icon ──────────────────────────────────────────────────────── */
function SmsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="9" y1="10" x2="9" y2="10" strokeWidth={3} />
      <line x1="12" y1="10" x2="12" y2="10" strokeWidth={3} />
      <line x1="15" y1="10" x2="15" y2="10" strokeWidth={3} />
    </svg>
  );
}

export function ShareCard({ config, participant, index }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [sent, setSent] = useState(false);
  const [sharing, setSharing] = useState(false);

  const upiLink = buildUpiLink(config, participant.amount);
  const message = buildMessage(config, participant, upiLink);
  const smsLink = buildSmsLink(participant.phone, message);
  const phoneValid = isValidPhone(participant.phone);

  /* ── Direct WhatsApp deeplink → opens that person's chat ───────── */
  const phone = normalizePhone(participant.phone);
  const waDirectLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

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

  /* ─────────────────────────────────────────────────────────────────
   * shareToWhatsApp
   * Strategy:
   *   1. Generate the branded poster image (JPEG blob).
   *   2. On mobile - use navigator.share({ files }) so the native
   *      share sheet pops up. User taps WhatsApp → image + caption
   *      land in the chat. This is the ONLY way to send a file to WA.
   *   3. On desktop / API unavailable - download the image AND open
   *      the wa.me direct-chat link (user can attach the saved image
   *      manually). This is the best possible desktop fallback.
   * ───────────────────────────────────────────────────────────────── */
  async function shareToWhatsApp() {
    if (!phoneValid) return;
    setSharing(true);
    setSent(true);
    const phone = normalizePhone(participant.phone);
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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
        `splitupi-${config.payeeName.trim() || "payment"}.jpg`,
        { type: "image/jpeg" },
      );

      const canShareFile =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        /* Mobile path - native share sheet, user picks WhatsApp */
        await navigator.share({ files: [file], text: message });
      } else {
        /* Desktop / non-supporting browser:
           Download the image so the user has it,
           then open their WA direct chat so they can attach it. */
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(objectUrl);
        /* Small delay so the download starts before navigation */
        setTimeout(() => window.open(waLink, "_blank"), 400);
      }
    } catch {
      /* User cancelled share - silently fall through */
    } finally {
      setSharing(false);
    }
  }

  async function shareGeneric() {
    setSharing(true);
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

      if (canShareFile) {
        await navigator.share({ files: [file], text: message });
      } else if (navigator.share) {
        await navigator.share({ text: message, url: upiLink });
      } else {
        await copyLink();
      }
    } catch {
      /* share cancelled */
    } finally {
      setSharing(false);
    }
  }

  /* ── Tooltip wrapper ────────────────────────────────────────────── */
  function IconBtn({
    label,
    onClick,
    href,
    disabled,
    color,
    active,
    children,
  }: {
    label: string;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
    color?: string;     // solid bg class e.g. "bg-brand"
    active?: boolean;
    children: React.ReactNode;
  }) {
    const base =
      "group relative inline-flex h-9 w-9 items-center justify-center rounded-[9px] transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";
    const colorCls = active
      ? "bg-brand text-white"
      : color
        ? `${color} text-white hover:brightness-110`
        : "bg-white/[0.08] text-white hover:bg-white/[0.14]";

    const inner = (
      <>
        {children}
        {/* Tooltip */}
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[5px] bg-surface-2 px-2 py-0.5 font-mono text-[9px] text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </span>
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          onClick={onClick}
          aria-label={label}
          className={`${base} ${colorCls} ${disabled ? "pointer-events-none opacity-40" : ""}`}
        >
          {inner}
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`${base} ${colorCls}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-glass rounded-[12px] p-4 sm:p-5"
    >
      {/* ── Participant row ──────────────────────────────────────── */}
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
              sent ✓
            </span>
          )}
        </div>
      </div>

      {/* ── Icon-only action row ─────────────────────────────────── */}
      <div className="mt-3.5 flex items-center gap-1.5">

        {/* SMS - native SMS deeplink to that phone number */}
        <IconBtn
          label="Send SMS"
          href={smsLink}
          onClick={() => setSent(true)}
          disabled={!phoneValid}
          color="bg-brand"
        >
          <SmsIcon className="h-4 w-4" />
        </IconBtn>

        {/* WhatsApp - generates poster → native share sheet → user picks WA */}
        <IconBtn
          label={sharing ? "Generating…" : "WhatsApp (with image)"}
          onClick={shareToWhatsApp}
          disabled={sharing || !phoneValid}
          color="bg-[#25d366]"
        >
          {sharing ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3}/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <WaIcon className="h-4 w-4" />
          )}
        </IconBtn>

        {/* Generic share (poster image) */}
        <IconBtn
          label="Share poster"
          onClick={shareGeneric}
          disabled={sharing}
          color="bg-brand-deep"
        >
          <Share2 className="h-4 w-4" />
        </IconBtn>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Copy UPI link */}
        <IconBtn
          label={copied ? "Copied!" : "Copy UPI link"}
          onClick={copyLink}
          active={copied}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </IconBtn>

        {/* Toggle QR */}
        <IconBtn
          label={showQr ? "Hide QR" : "Show QR"}
          onClick={() => setShowQr((v) => !v)}
          active={showQr}
        >
          <QrCode className="h-3.5 w-3.5" />
        </IconBtn>
      </div>

      {/* ── Inline QR ───────────────────────────────────────────── */}
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
