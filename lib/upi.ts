export type SplitMode = "equal" | "custom";

export interface Participant {
  id: string;
  name: string;
  phone: string;
  /** Amount this participant owes, in rupees. */
  amount: number;
}

export interface SplitConfig {
  payeeVpa: string;
  payeeName: string;
  note: string;
}

/** Round to 2 decimals and strip trailing zeros for clean amounts. */
export function formatAmount(value: number): string {
  if (!isFinite(value) || isNaN(value)) return "0";
  return (Math.round(value * 100) / 100).toFixed(2).replace(/\.00$/, "");
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(isFinite(value) ? value : 0);
}

/**
 * Split a total equally across `count` people, distributing the rounding
 * remainder (paise) so the parts always sum exactly to the total.
 */
export function equalShares(total: number, count: number): number[] {
  if (count <= 0) return [];
  const totalPaise = Math.round(total * 100);
  const base = Math.floor(totalPaise / count);
  let remainder = totalPaise - base * count;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const paise = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    out.push(paise / 100);
  }
  return out;
}

/**
 * Build a UPI deep link per the NPCI UPI URL spec.
 * Opens any UPI app (GPay, PhonePe, Paytm, BHIM…) prefilled.
 */
export function buildUpiLink(config: SplitConfig, amount: number): string {
  const params = new URLSearchParams();
  params.set("pa", config.payeeVpa.trim());
  if (config.payeeName.trim()) params.set("pn", config.payeeName.trim());
  params.set("am", formatAmount(amount));
  params.set("cu", "INR");
  if (config.note.trim()) params.set("tn", config.note.trim());
  return `upi://pay?${params.toString()}`;
}

/** The human-readable request message that wraps the UPI link. */
export function buildMessage(
  config: SplitConfig,
  participant: Participant,
  upiLink: string,
): string {
  const who = config.payeeName.trim() || "Someone";
  const reason = config.note.trim() ? ` for ${config.note.trim()}` : "";
  const greeting = participant.name.trim() ? `Hi ${participant.name.trim()},\n` : "";
  const amount = formatINR(participant.amount);
  return (
    `Payment Request\n\n` +
    `${greeting}${who} is requesting ${amount}${reason}.\n\n` +
    `Pay Now\n${upiLink}\n\n` +
    `— splitupi`
  );
}

/** Normalize a phone number to digits, defaulting to +91 (India). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** sms: link with prefilled body — opens the native Messages app. */
export function buildSmsLink(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  const to = normalized ? `+${normalized}` : "";
  // `?&body=` is the most cross-platform form (iOS + Android).
  return `sms:${to}?&body=${encodeURIComponent(message)}`;
}

/** wa.me link with prefilled text. */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** Basic UPI VPA validation: name@handle */
export function isValidVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(vpa.trim());
}

export function isValidPhone(phone: string): boolean {
  const n = normalizePhone(phone);
  return n.length >= 10 && n.length <= 13;
}
