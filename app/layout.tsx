import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Editorial display serif with strong light/bold weight contrast.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

// Elegant display serif — the hero/brand display font.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument",
  display: "swap",
});

// Technical monospace for labels, chrome and microcopy.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jb-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://splitupi.rakhul.me"),
  title: "splitupi - split bills, paid in seconds",
  description:
    "Create a split, add a few numbers, and everyone gets a one-tap UPI payment link over SMS or WhatsApp. No app, no signup.",
  keywords: ["UPI", "split bills", "payments", "India", "expense splitting"],
  openGraph: {
    title: "splitupi - split bills, paid in seconds",
    description:
      "Create a split, add a few numbers, and everyone pays you instantly over UPI.",
    type: "website",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "splitupi - split bills, paid in seconds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "splitupi - split bills, paid in seconds",
    description:
      "Create a split, add a few numbers, and everyone pays you instantly over UPI.",
    images: ["/og"],
  },
};

export const viewport: Viewport = {
  themeColor: "#060607",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
