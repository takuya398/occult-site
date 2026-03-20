import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-gothic",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Occult Encyclopedia | オカルト図鑑",
  description: "心霊スポット・怪談・都市伝説・UMAを集めた禁断の図鑑",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-[#07000a] dark:text-[#e8ddd0]`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="pt-[109px] sm:pt-[61px]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
