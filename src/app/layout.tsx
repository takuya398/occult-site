import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  metadataBase: new URL("https://occultpedia.jp"),
  title: {
    default: "Occult Encyclopedia | オカルト図鑑",
    template: "%s | オカルト図鑑",
  },
  description: "心霊スポット・怪談・都市伝説・UMAを集めた禁断の図鑑",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://occultpedia.jp",
    siteName: "Occult Encyclopedia | オカルト図鑑",
    title: "Occult Encyclopedia | オカルト図鑑",
    description: "心霊スポット・怪談・都市伝説・UMAを集めた禁断の図鑑",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Occult Encyclopedia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Occult Encyclopedia | オカルト図鑑",
    description: "心霊スポット・怪談・都市伝説・UMAを集めた禁断の図鑑",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  verification: {
    google: "FqmaP0dzaO3Ognty0-1hOKDGpfgF-5If6LKkNTt2KC8",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://occultpedia.jp/#website",
      name: "Occult Encyclopedia | オカルト図鑑",
      url: "https://occultpedia.jp",
      description: "心霊スポット・怪談・都市伝説・UMAを集めた禁断の図鑑",
      inLanguage: "ja",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://occultpedia.jp/spots?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "ItemList",
      name: "カテゴリ一覧",
      itemListElement: [
        { "@type": "SiteLinksSearchBox", position: 1, url: "https://occultpedia.jp/spots", name: "心霊スポット" },
        { "@type": "SiteLinksSearchBox", position: 2, url: "https://occultpedia.jp/legends", name: "怪談・都市伝説" },
        { "@type": "SiteLinksSearchBox", position: 3, url: "https://occultpedia.jp/entities", name: "UMA・異形" },
        { "@type": "SiteLinksSearchBox", position: 4, url: "https://occultpedia.jp/mysteries", name: "怪事件・ミステリー" },
        { "@type": "SiteLinksSearchBox", position: 5, url: "https://occultpedia.jp/ranking", name: "ランキング" },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V3Q11XNP3L"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V3Q11XNP3L');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-[#07000a] dark:text-[#e8ddd0]`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="pt-[145px] sm:pt-[61px]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
