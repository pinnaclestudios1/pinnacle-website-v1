"use client";

import { useEffect } from "react";

/**
 * Pins document.title on the client. Needed on the 404 page: when a dynamic route
 * calls notFound(), Next renders the right <title> on the server but the client
 * falls back to the root default after hydration.
 */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
