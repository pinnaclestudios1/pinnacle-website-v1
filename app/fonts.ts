import { Fraunces, Geist, Geist_Mono } from "next/font/google";

/**
 * Fonts are downloaded at build time and self-hosted by next/font:
 * subset, preloaded and using font-display: swap (brief §11).
 *
 * TODO: confirm — these are free (OFL) defaults chosen to match the brief:
 *   Display: Fraunces  — editorial high-contrast serif with character
 *   Body/UI: Geist     — clean grotesk for paragraphs, nav and forms
 *   Mono:    Geist Mono — labels, code, altitude meter
 * If a licensed face is chosen (e.g. PP Editorial New), swap to next/font/local here.
 */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

export const fontSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  // Mono is only used for small labels — don't compete with the hero for bandwidth.
  preload: false,
});

export const fontVariables = [fontDisplay.variable, fontSans.variable, fontMono.variable].join(" ");
