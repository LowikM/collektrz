import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Navbar } from "@/components/Navbar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "The modern marketplace and community where collectors connect, trade and discover collectibles.";

export const metadata: Metadata = {
  title: {
    default: "Collektrz",
    template: "%s | Collektrz",
  },
  description: siteDescription,
  applicationName: "Collektrz",
  openGraph: {
    title: "Collektrz",
    description: siteDescription,
    siteName: "Collektrz",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Collektrz",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
