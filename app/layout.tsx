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

const SITE_URL = "https://splitupi.rakhul.me";
const SITE_NAME = "Split UPI";
const TITLE = "Split UPI — Split Bills & Get Paid via UPI Instantly";
const DESCRIPTION =
  "The fastest way to split bills in India. Enter the total, add phone numbers — everyone gets a one-tap UPI payment link over SMS or WhatsApp. No app, no signup, no friction.";
const OG_IMAGE = `${SITE_URL}/og`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "UPI split",
    "split bill India",
    "UPI payment link",
    "split expenses India",
    "UPI request money",
    "bill splitting app India",
    "send UPI link SMS WhatsApp",
    "Google Pay split",
    "PhonePe split",
    "NPCI UPI deep link",
    "no app split bill",
    "expense splitting India",
    "split UPI",
    "splitupi",
  ],
  authors: [{ name: "r4khul", url: "https://github.com/r4khul" }],
  creator: "r4khul",
  publisher: SITE_NAME,
  category: "Finance",
  classification: "Finance / Payments",
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Split UPI — Split bills and get paid via UPI instantly. No app needed.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@r4khul",
    creator: "@r4khul",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        alt: "Split UPI — Split bills and get paid via UPI instantly.",
      },
    ],
  },
  other: {
    "google-site-verification": "",
  },
};

export const viewport: Viewport = {
  themeColor: "#060607",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      featureList: [
        "Split bills equally or custom",
        "One-tap UPI payment links",
        "Share via SMS or WhatsApp",
        "No app or signup required",
        "Works with Google Pay, PhonePe, Paytm, BHIM",
      ],
      inLanguage: "en-IN",
      author: {
        "@type": "Person",
        name: "r4khul",
        url: "https://github.com/r4khul",
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/splitupi-logo.png`,
        },
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I split a bill using Split UPI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Enter the total amount, add the phone numbers of people who owe you, and Split UPI generates individual UPI payment links for each person. Share via SMS or WhatsApp in one tap.",
          },
        },
        {
          "@type": "Question",
          name: "Does Split UPI require an app or signup?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No app or signup is required. Split UPI works entirely in your browser and generates standard UPI deep links that open any UPI app — Google Pay, PhonePe, Paytm, BHIM, etc.",
          },
        },
        {
          "@type": "Question",
          name: "Which UPI apps work with Split UPI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Split UPI generates standard NPCI UPI deep links. They work with all UPI-enabled apps including Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, and any bank's UPI app.",
          },
        },
        {
          "@type": "Question",
          name: "Is Split UPI free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Split UPI is completely free and open source. It stores nothing and runs on your bank's UPI rails.",
          },
        },
      ],
    },
  ],
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
