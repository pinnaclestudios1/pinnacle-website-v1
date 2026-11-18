"use client";

import { useSyncExternalStore } from "react";
import { dot, SERVER_SNAPSHOT } from "./controller";

/** Live read of the Dot's state for React UI (e.g. the Dot Lab readout). */
export function useDotSnapshot() {
  return useSyncExternalStore(dot.subscribe, dot.getSnapshot, () => SERVER_SNAPSHOT);
}
