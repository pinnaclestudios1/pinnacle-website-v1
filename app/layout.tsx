import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Grain } from "@/components/brand/Grain";
import { DotStage } from "@/components/dot/DotStage";
import { ExtrasRoot } from "@/components/extras/ExtrasRoot";
import { UtmCapture } from "@/components/forms/UtmCapture";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { DemoBadge } from "@/components/layout/DemoBadge";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { StickyCta } from "@/components/layout/StickyCta";
import { TransitionProvider } from "@/components/motion/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { demoMode } from "@/lib/demo";
import { HEAD_SCRIPT } from "@/lib/motion/head-script";
import { ogImageUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import { organization, website } from "@/lib/structured-data";
import { fontVariables } from "./fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.headline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    type: "website",
    url: "/",
    title: `${site.name} — ${site.headline}`,
    description: site.description,
    images: [{ url: ogImageUrl(site.headline), width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: [ogImageUrl(site.headline)] },
  formatDetection: { telephone: false, email: false, address: false },
  // Sample content must never be indexed (lib/demo.ts).
  ...(demoMode ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#f6f1e7", // TODO: confirm (matches --pn-cream)
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Before first paint: mark JS available (progressive reveals) and decide on the first-visit preloader. */}
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
        <JsonLd data={[organization(), website()]} />
      </head>
      <body>
        <TransitionProvider>
          {/* /studio (the CMS) gets the full screen; everything else gets the site chrome. */}
          <ChromeGate
            before={
              <>
                <SkipLink />
                <SmoothScroll />
                <Header />
              </>
            }
            after={
              <>
                <Footer />
                <StickyCta />
                <DotStage />
                <UtmCapture />
                <ExtrasRoot />
                <Grain />
                <DemoBadge />
              </>
            }
          >
            {children}
          </ChromeGate>
        </TransitionProvider>
      </body>
    </html>
  );
}
