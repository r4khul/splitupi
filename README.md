# Split UPI

![Split UPI banner](/docs/splitupi-banner.png)

**Split bills in India without installing another app.**

Split UPI is a fast, browser-first tool for splitting expenses and collecting money over UPI. Enter the total, add the people who owe you, and each person gets a one-tap UPI payment link over SMS or WhatsApp. No signup, no storage, no friction.

**Live:** [splitupi.rakhul.me](https://splitupi.rakhul.me)

---

## How it works

1. **Enter the total** — type the amount or a quick expression like `1200/4`.
2. **Add people** — add names and phone numbers manually, or pick from your contacts on supported devices.
3. **Share payment links** — send pre-filled UPI links via SMS or WhatsApp. Each person taps once and pays from their own UPI app.

Need a quick group-share option? Generate a QR poster for the full amount and let anyone scan and pay.

## Why it works

- **No app required** — works in any browser. Recipients pay from Google Pay, PhonePe, Paytm, BHIM, or any UPI-enabled bank app.
- **Equal or custom splits** — divide equally or adjust amounts per person. Rounding is distributed so the parts always add up to the total.
- **Nothing stored** — all logic runs in the browser. Phone numbers and UPI IDs never leave the device.
- **Built for India** — UPI IDs, Indian phone numbers, INR formatting, and NPCI-compliant `upi://` deep links.

## Tech stack

- [Next.js](https://nextjs.org) 16 + React 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [Framer Motion](https://www.framer.com/motion/) for transitions
- [QRCode](https://github.com/soldair/node-qrcode) for QR generation
- [takumi-js](https://github.com/takumi-js/takumi) for dynamic Open Graph images

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use it.

## License

Open source under the MIT License. Built by [r4khul](https://github.com/r4khul).
