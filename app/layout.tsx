import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "splitupi — split bills, paid in seconds",
  description:
    "Create a split, add a few numbers, and everyone gets a one-tap UPI payment link over SMS or WhatsApp. No app, no signup.",
  keywords: ["UPI", "split bills", "payments", "India", "expense splitting"],
  openGraph: {
    title: "splitupi — split bills, paid in seconds",
    description:
      "Create a split, add a few numbers, and everyone pays you instantly over UPI.",
    type: "website",
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
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
