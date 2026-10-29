import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Footer, Header } from "@/components/chrome";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:2700";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Crazy Fans",
    template: "%s · Crazy Fans",
  },
  description: "Your fandom. Your rules. Your wars. A community for Indian cinema fans to debate, vote, and be heard.",
  openGraph: {
    title: "Crazy Fans",
    description: "Your fandom. Your rules. Your wars.",
    siteName: "Crazy Fans",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crazy Fans",
    description: "Your fandom. Your rules. Your wars.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <Header />
        <main id="content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
