"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/analytics";

/** Saves first-touch UTM parameters for the session so forms can attribute leads. */
export function UtmCapture() {
  useEffect(() => captureUtm(), []);
  return null;
}
