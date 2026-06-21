import QRCode from "qrcode";

export interface PosterParams {
  upiLink: string;
  amountFormatted: string;
  name: string;
  note: string;
  payeeVpa: string;
}

/* ── Canvas dimensions (portrait, WhatsApp-friendly) ─── */
const W = 540;
const H = 760;

/* ── Design tokens — mirror globals.css exactly ───────── */
const BG      = "#08080a";
const SURFACE = "#0e0e12";
const BRAND   = "#336df7";
const INK     = "#f3f3f5";
const INK_SOFT = "#aeb0b8";
const MUTED   = "#74757d";
const FAINT   = "#45464d";

/* ── Helpers ─────────────────────────────────────────── */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  basePx: number,
  fontSpec: (sz: number) => string,
  minPx = 24,
) {
  let size = basePx;
  ctx.font = fontSpec(size);
  while (ctx.measureText(text).width > maxWidth && size > minPx) {
    size -= 2;
    ctx.font = fontSpec(size);
  }
  return size;
}

export async function generatePaymentPoster(params: PosterParams): Promise<Blob> {
  const { upiLink, amountFormatted, name, note } = params;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  /* ── Background ──────────────────────────────────────── */
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  /* ── Subtle brand aurora glow at top ─────────────────── */
  const aurora = ctx.createRadialGradient(W / 2, -20, 0, W / 2, -20, 340);
  aurora.addColorStop(0, "rgba(51,109,247,0.13)");
  aurora.addColorStop(1, "rgba(51,109,247,0)");
  ctx.fillStyle = aurora;
  ctx.fillRect(0, 0, W, 220);

  /* ── Top accent line ─────────────────────────────────── */
  const topLine = ctx.createLinearGradient(0, 0, W, 0);
  topLine.addColorStop(0, "rgba(51,109,247,0)");
  topLine.addColorStop(0.5, BRAND);
  topLine.addColorStop(1, "rgba(51,109,247,0)");
  ctx.fillStyle = topLine;
  ctx.fillRect(0, 0, W, 2);

  /* ── QR code (dominant — fills most of the card) ──────── */
  const QR_SIZE = 380;
  const QR_PAD  = 18;
  const BOX     = QR_SIZE + QR_PAD * 2;

  const qrDataUrl = await QRCode.toDataURL(upiLink, {
    width: QR_SIZE * 2,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  const qrBoxX = (W - BOX) / 2;
  const qrBoxY = 56;

  /* White rounded QR container */
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrBoxX, qrBoxY, BOX, BOX, 16);
  ctx.fill();

  /* Subtle shadow under QR box */
  ctx.save();
  ctx.shadowColor = "rgba(51,109,247,0.18)";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "rgba(51,109,247,0.04)";
  roundRect(ctx, qrBoxX, qrBoxY, BOX, BOX, 16);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(qrImg, qrBoxX + QR_PAD, qrBoxY + QR_PAD, QR_SIZE, QR_SIZE);

  /* ── Amount — bold, prominent, below QR ─────────────── */
  const amtY   = qrBoxY + BOX + 52;
  const PAD    = 48;
  const amtSz  = fitText(
    ctx,
    amountFormatted,
    W - PAD * 2,
    56,
    (sz) => `700 ${sz}px Georgia, "Times New Roman", serif`,
    28,
  );
  ctx.fillStyle = INK;
  ctx.font = `700 ${amtSz}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.fillText(amountFormatted, W / 2, amtY);

  /* ── Requester name — understated label above amount ── */
  const displayName = name.trim() || "Payment Request";
  ctx.fillStyle = INK_SOFT;
  ctx.font = `400 15px -apple-system, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(displayName, W / 2, amtY + 26);

  /* ── Note — tiny muted line if present ───────────────── */
  if (note.trim()) {
    ctx.fillStyle = MUTED;
    ctx.font = `400 12px "Courier New", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`for ${note.trim()}`, W / 2, amtY + 48);
  }

  /* ── Scan hint — mono label ──────────────────────────── */
  const hintY = amtY + (note.trim() ? 72 : 62);
  ctx.fillStyle = FAINT;
  ctx.font = `500 11px "Courier New", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.fillText("SCAN WITH ANY UPI APP", W / 2, hintY);

  /* ── Footer surface ──────────────────────────────────── */
  const footerH = 52;
  const footerY = H - footerH;

  /* Footer bg */
  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, footerY, W, footerH);

  /* Footer hairline */
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(W, footerY);
  ctx.stroke();

  /* Brand wordmark: "split" in brand blue, "UPI" in ink-soft */
  ctx.textAlign = "center";
  ctx.font = `600 14px Georgia, "Times New Roman", serif`;
  const splitLabel = "split";
  const upiLabel   = "UPI";
  const labelTotalW =
    (() => { ctx.font = `600 14px Georgia, serif`; return ctx.measureText(splitLabel + upiLabel).width; })();
  const startX = W / 2 - labelTotalW / 2;

  ctx.font = `600 14px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = BRAND;
  ctx.textAlign = "left";
  ctx.fillText(splitLabel, startX, footerY + 22);
  const splitLabelW = ctx.measureText(splitLabel).width;
  ctx.fillStyle = INK_SOFT;
  ctx.fillText(upiLabel, startX + splitLabelW, footerY + 22);

  /* Tagline */
  ctx.fillStyle = FAINT;
  ctx.font = `400 10px "Courier New", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.fillText("split bills · share UPI links", W / 2, footerY + 38);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob failed"));
      },
      "image/png",
    );
  });
}
