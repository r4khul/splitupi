import QRCode from "qrcode";

export interface PosterParams {
  upiLink: string;
  amountFormatted: string;
  name: string;
  note: string;
  payeeVpa: string;
}

const W = 540;
const H = 760;

const BRAND = "#336df7";
const BG = "#09090b";
const SURFACE = "#111115";
const INK = "#f3f3f5";
const INK_SOFT = "#aeb0b8";
const MUTED = "#74757d";
const FAINT = "#45464d";
const BORDER = "rgba(255,255,255,0.07)";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
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

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, basePx: number, minPx = 28) {
  let size = basePx;
  ctx.font = `700 ${size}px system-ui, -apple-system, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > minPx) {
    size -= 2;
    ctx.font = `700 ${size}px system-ui, -apple-system, sans-serif`;
  }
  return size;
}

export async function generatePaymentPoster(params: PosterParams): Promise<Blob> {
  const { upiLink, amountFormatted, name, note, payeeVpa } = params;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  /* ── Background ─────────────────────────────────────── */
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  /* ── Top brand bar ───────────────────────────────────── */
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, W, 3);

  /* ── Brand wordmark row ──────────────────────────────── */
  const PAD = 44;
  ctx.fillStyle = BRAND;
  ctx.font = `700 16px system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("split", PAD, 56);
  const splitW = ctx.measureText("split").width;
  ctx.fillStyle = INK_SOFT;
  ctx.fillText("upi", PAD + splitW, 56);

  ctx.fillStyle = FAINT;
  ctx.font = `400 11px "Courier New", monospace`;
  ctx.textAlign = "right";
  ctx.fillText("PAYMENT REQUEST", W - PAD, 56);

  /* ── Hairline divider ────────────────────────────────── */
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  line(ctx, PAD, 72, W - PAD, 72);

  /* ── Recipient name ──────────────────────────────────── */
  const displayName = name.trim() || "Payment";
  ctx.fillStyle = INK_SOFT;
  ctx.font = `500 15px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(displayName.toUpperCase(), W / 2, 116);

  /* ── Amount — auto-sized to fit ──────────────────────── */
  const amtSize = fitText(ctx, amountFormatted, W - PAD * 2, 72, 36);
  ctx.fillStyle = INK;
  ctx.font = `700 ${amtSize}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(amountFormatted, W / 2, 116 + amtSize + 4);

  /* ── Note ────────────────────────────────────────────── */
  if (note.trim()) {
    ctx.fillStyle = MUTED;
    ctx.font = `400 13px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`for ${note.trim()}`, W / 2, 116 + amtSize + 32);
  }

  /* ── Hairline divider ────────────────────────────────── */
  const divY = 116 + amtSize + 56;
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  line(ctx, PAD, divY, W - PAD, divY);

  /* ── QR code ─────────────────────────────────────────── */
  const QR_SIZE = 216;
  const qrDataUrl = await QRCode.toDataURL(upiLink, {
    width: QR_SIZE,
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

  const QR_PAD = 14;
  const BOX = QR_SIZE + QR_PAD * 2;
  const qrBoxX = (W - BOX) / 2;
  const qrBoxY = divY + 32;

  /* White QR container */
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrBoxX, qrBoxY, BOX, BOX, 12);
  ctx.fill();

  ctx.drawImage(qrImg, qrBoxX + QR_PAD, qrBoxY + QR_PAD, QR_SIZE, QR_SIZE);

  /* ── Caption ─────────────────────────────────────────── */
  const capY = qrBoxY + BOX + 28;
  ctx.fillStyle = MUTED;
  ctx.font = `400 11px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO PAY VIA UPI", W / 2, capY);

  ctx.fillStyle = FAINT;
  ctx.font = `400 11px system-ui, sans-serif`;
  ctx.fillText(`to ${payeeVpa}`, W / 2, capY + 20);

  /* ── Bottom surface ──────────────────────────────────── */
  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, H - 52, W, 52);

  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  line(ctx, 0, H - 52, W, H - 52);

  ctx.fillStyle = BRAND;
  ctx.font = `600 13px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("splitupi", W / 2, H - 27);

  ctx.fillStyle = FAINT;
  ctx.font = `400 10px system-ui, sans-serif`;
  ctx.fillText("split bills · share UPI links", W / 2, H - 12);

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
