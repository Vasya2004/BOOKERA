import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BrowserNoiseGuard } from "@/components/debug/browser-noise-guard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Podcastera",
  description: "Personal knowledge base for YouTube podcasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full w-full overflow-x-hidden antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full w-full overflow-x-hidden bg-background text-foreground">
        <BrowserNoiseGuard />
        {children}
      </body>
    </html>
  );
}
