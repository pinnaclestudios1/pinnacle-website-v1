import type { ReactNode } from "react";

/**
 * Visible marker for content the studio must supply. Search the codebase for
 * "<Todo" and "TODO" — phase 7 produces the full list. Launch checklist: none may remain.
 */
export function Todo({ children }: { children: ReactNode }) {
  return <span className="todo">TODO: {children}</span>;
}
