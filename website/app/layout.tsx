import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import cx from "@/utils/cx";
import React from "react";
import colors from "tailwindcss/colors";

const defaultFont = Inter({
  variable: "--font-inter",
  display: "swap",
  style: "normal",
  subsets: ["latin"],
});

const title = "Upsy";
const description = "Your new mate on Slack. Powered by AI";
const url = "https://upsy.vercel.app";
const locale = "en_US";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: "@upstash",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: colors.emerald["50"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={cx("scroll-smooth", defaultFont.variable)}>
      <body
        className={cx(
          "min-h-lvh text-emerald-50 antialiased",
          "bg-gradient-to-b from-emerald-50 to-emerald-100 text-emerald-900",
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
