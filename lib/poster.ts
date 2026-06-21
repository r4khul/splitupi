import QRCode from "qrcode";

export interface PosterParams {
  upiLink: string;
  amountFormatted: string;
  name: string;
  note: string;
  payeeVpa: string;
}

/* ─────────────────────────────────────────────────────────────────
   Canvas layout (logical pixels — rendered at 3× for crispness)
   Portrait: 540 × 800 — WhatsApp-share friendly
   ───────────────────────────────────────────────────────────────── */
const W   = 540;
const H   = 820;
const DPR = 3;   // device-pixel-ratio multiplier

/* ── Design tokens ───────────────────────────────────────────── */
const BRAND       = "#336df7"; // Split UPI blue — full background
const BRAND_LIGHT = "#4d84ff"; // slightly lighter for subtle gradients
const WHITE       = "#ffffff";
const WHITE_90    = "rgba(255,255,255,0.90)";
const WHITE_60    = "rgba(255,255,255,0.60)";
const WHITE_30    = "rgba(255,255,255,0.30)";
const WHITE_12    = "rgba(255,255,255,0.12)";

/* ─────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────── */

/** Draw a rounded rectangle path (browser-safe, no roundRect API needed). */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  const maxR = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + maxR, y);
  ctx.lineTo(x + w - maxR, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + maxR);
  ctx.lineTo(x + w, y + h - maxR);
  ctx.quadraticCurveTo(x + w, y + h, x + w - maxR, y + h);
  ctx.lineTo(x + maxR, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - maxR);
  ctx.lineTo(x, y + maxR);
  ctx.quadraticCurveTo(x, y, x + maxR, y);
  ctx.closePath();
}

/** Shrink font until text fits within maxWidth. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  basePx: number,
  fontSpec: (sz: number) => string,
  minPx = 18,
) {
  let size = basePx;
  ctx.font = fontSpec(size);
  while (ctx.measureText(text).width > maxWidth && size > minPx) {
    size -= 2;
    ctx.font = fontSpec(size);
  }
  return size;
}

/** Load an image from a URL / data-URI and return an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Fetch the logo PNG from /splitupi-logo.png and return a data-URI. */
async function fetchLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/splitupi-logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Dynamically resolve the Instrument Serif font family from CSS variables */
function getInstrumentSerifFont(): string {
  if (typeof document !== "undefined") {
    const computed = getComputedStyle(document.documentElement).getPropertyValue("--font-instrument").trim();
    if (computed) return `${computed}, "Instrument Serif", Georgia, serif`;
  }
  return `"Instrument Serif", Georgia, serif`;
}

/* ─────────────────────────────────────────────────────────────────
   Main generator
   ───────────────────────────────────────────────────────────────── */
export async function generatePaymentPoster(params: PosterParams): Promise<Blob> {
  const { upiLink, amountFormatted, name, note, payeeVpa } = params;
  const displayName = name.trim() || "Payment";

  /* 1 ── Canvas at 3× resolution ──────────────────────────────── */
  const canvas = document.createElement("canvas");
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR); // all drawing in logical pixels from here

  /* ─ 2 ── Background: solid brand blue + very subtle vignette ── */
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, W, H);

  // Top-center radial highlight for depth
  const topGlow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.85);
  topGlow.addColorStop(0, "rgba(255,255,255,0.10)");
  topGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  // Bottom darkening for perceived depth
  const bottomFade = ctx.createLinearGradient(0, H * 0.55, 0, H);
  bottomFade.addColorStop(0, "rgba(0,0,0,0)");
  bottomFade.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = bottomFade;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  /* ─ 3 ── Very subtle concentric circle decoration ────────────── */
  ctx.save();
  ctx.strokeStyle = WHITE_12;
  ctx.lineWidth = 1;
  for (const r of [340, 420, 500]) {
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.22, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  /* ─ 4 ── Header: logo + wordmark ────────────────────────────── */
  const HEADER_TOP = 44;
  const LOGO_SIZE  = 40;

  // Fetch and draw the logo PNG
  const logoDataUrl = await fetchLogoDataUrl();
  let logoImg: HTMLImageElement | null = null;
  if (logoDataUrl) {
    logoImg = await loadImage(logoDataUrl).catch(() => null);
  }

  const instrumentFont = getInstrumentSerifFont();

  // Measure wordmark to center the whole lockup
  ctx.font = `700 28px ${instrumentFont}`;
  const splitW = ctx.measureText("split").width;
  const upiW   = ctx.measureText("UPI").width;
  const wordmarkW = splitW + upiW;
  const LOGO_GAP  = 10;
  const lockupW   = (logoImg ? LOGO_SIZE + LOGO_GAP : 0) + wordmarkW;
  const lockupX   = (W - lockupW) / 2;

  if (logoImg) {
    // White pill behind logo for cleanliness on blue bg
    ctx.save();
    ctx.fillStyle = WHITE_12;
    roundRect(ctx, lockupX - 4, HEADER_TOP - 4, LOGO_SIZE + 8, LOGO_SIZE + 8, 10);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(logoImg, lockupX, HEADER_TOP, LOGO_SIZE, LOGO_SIZE);
  }

  const textX = logoImg ? lockupX + LOGO_SIZE + LOGO_GAP : lockupX;
  const textY = HEADER_TOP + LOGO_SIZE / 2 + 10; // vertically centered with logo

  // "split" in white, "UPI" in slightly transparent white
  ctx.font = `700 28px ${instrumentFont}`;
  ctx.textAlign = "left";
  ctx.fillStyle = WHITE;
  ctx.fillText("split", textX, textY);
  ctx.fillStyle = WHITE_90;
  ctx.fillText("UPI", textX + splitW, textY);

  /* ─ 5 ── Subtitle ────────────────────────────────────────────── */
  ctx.font = `400 13px -apple-system, "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = WHITE_60;
  ctx.fillText("Scan and pay using any UPI app", W / 2, HEADER_TOP + LOGO_SIZE + 20);

  /* ─ 6 ── QR section ──────────────────────────────────────────── */
  const QR_LOGICAL   = 300; // QR image drawn at this size
  const QR_PADDING   = 24;  // inner padding inside white card
  const CARD_W       = QR_LOGICAL + QR_PADDING * 2;
  const CARD_H       = QR_LOGICAL + QR_PADDING * 2;
  const CARD_X       = (W - CARD_W) / 2;
  const CARD_Y       = HEADER_TOP + LOGO_SIZE + 48;
  const CARD_RADIUS  = 28;

  // QR at 4× for maximum sharpness; errorCorrectionLevel H for logo overlay
  const qrDataUrl = await QRCode.toDataURL(upiLink, {
    width: QR_LOGICAL * 4,
    margin: 1,
    color: { dark: BRAND, light: WHITE },
    errorCorrectionLevel: "H",
  });
  const qrImg = await loadImage(qrDataUrl);

  // White card shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur  = 48;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = WHITE;
  roundRect(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, CARD_RADIUS);
  ctx.fill();
  ctx.restore();

  // White card (solid, over shadow)
  ctx.fillStyle = WHITE;
  roundRect(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, CARD_RADIUS);
  ctx.fill();

  // Draw QR
  ctx.drawImage(qrImg, CARD_X + QR_PADDING, CARD_Y + QR_PADDING, QR_LOGICAL, QR_LOGICAL);

  // ── Logo overlay in center of QR ─────────────────────────────
  if (logoImg) {
    const OVERLAY_SIZE   = 52;
    const OVERLAY_PAD    = 8;
    const PILL_SIZE      = OVERLAY_SIZE + OVERLAY_PAD * 2;
    const qrCenterX      = CARD_X + QR_PADDING + QR_LOGICAL / 2;
    const qrCenterY      = CARD_Y + QR_PADDING + QR_LOGICAL / 2;
    const pillX          = qrCenterX - PILL_SIZE / 2;
    const pillY          = qrCenterY - PILL_SIZE / 2;

    // White rounded square background
    ctx.save();
    ctx.shadowColor   = "rgba(0,0,0,0.12)";
    ctx.shadowBlur    = 12;
    ctx.fillStyle     = WHITE;
    roundRect(ctx, pillX, pillY, PILL_SIZE, PILL_SIZE, 14);
    ctx.fill();
    ctx.restore();

    // Logo on top
    ctx.drawImage(logoImg, pillX + OVERLAY_PAD, pillY + OVERLAY_PAD, OVERLAY_SIZE, OVERLAY_SIZE);
  }

  /* ─ 7 ── Payment details section ─────────────────────────────── */
  const DETAILS_TOP = CARD_Y + CARD_H + 40;
  const SIDE_PAD    = 40;
  const MAX_TXT_W   = W - SIDE_PAD * 2;

  // "Pay ₹{amount} to" label
  ctx.font = `400 15px -apple-system, "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = WHITE_60;
  ctx.textAlign = "center";
  ctx.fillText(`Pay ${amountFormatted} to`, W / 2, DETAILS_TOP);

  // Recipient name — large bold
  const nameFontSz = fitText(
    ctx,
    displayName,
    MAX_TXT_W,
    38,
    (sz) => `700 ${sz}px -apple-system, "Helvetica Neue", Arial, sans-serif`,
    20,
  );
  ctx.font = `700 ${nameFontSz}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.fillText(displayName, W / 2, DETAILS_TOP + 42);

  // Thin separator
  let nextY = DETAILS_TOP + 60;
  if (note.trim()) {
    ctx.font = `400 13px -apple-system, "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = WHITE_60;
    ctx.textAlign = "center";
    ctx.fillText(`for ${note.trim()}`, W / 2, nextY);
    nextY += 24;
  }

  const sepY = nextY;
  ctx.save();
  const sep = ctx.createLinearGradient(SIDE_PAD + 40, 0, W - SIDE_PAD - 40, 0);
  sep.addColorStop(0, "rgba(255,255,255,0)");
  sep.addColorStop(0.5, WHITE_30);
  sep.addColorStop(1, "rgba(255,255,255,0)");
  ctx.strokeStyle = sep;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SIDE_PAD + 40, sepY);
  ctx.lineTo(W - SIDE_PAD - 40, sepY);
  ctx.stroke();
  ctx.restore();

  // UPI ID
  const upiIdLabel = `UPI ID: ${payeeVpa.trim()}`;
  const upiIdFontSz = fitText(
    ctx,
    upiIdLabel,
    MAX_TXT_W,
    14,
    (sz) => `400 ${sz}px "SF Mono", "Courier New", ui-monospace, monospace`,
    10,
  );
  ctx.font = `400 ${upiIdFontSz}px "SF Mono", "Courier New", ui-monospace, monospace`;
  ctx.fillStyle = WHITE_60;
  ctx.textAlign = "center";
  ctx.fillText(upiIdLabel, W / 2, sepY + 24);

  /* ─ 8 ── Bottom branding pill ────────────────────────────────── */
  const PILL_Y = H - 36;

  // Subtle frosted pill
  ctx.save();
  ctx.fillStyle = WHITE_12;
  roundRect(ctx, W / 2 - 74, PILL_Y - 16, 148, 26, 13);
  ctx.fill();
  ctx.restore();

  // Brand text inside pill: "split" white + "UPI" semi-transparent
  ctx.font = `600 12px ${instrumentFont}`;
  const s1 = ctx.measureText("split").width;
  const s2 = ctx.measureText("UPI").width;
  const pillTextW = s1 + s2 + 3; // 3px gap
  const pillTextX = W / 2 - pillTextW / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = WHITE;
  ctx.fillText("split", pillTextX, PILL_Y + 2);
  ctx.fillStyle = WHITE_60;
  ctx.fillText("UPI", pillTextX + s1 + 3, PILL_Y + 2);

  /* ─ 9 ── Export JPEG ──────────────────────────────────────────── */
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob failed"));
      },
      "image/jpeg",
      0.85
    );
  });
}
