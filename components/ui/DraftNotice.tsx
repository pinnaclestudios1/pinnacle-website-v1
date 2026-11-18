import { Todo } from "./Todo";

/** Marks a page whose copy is a draft that still needs the studio's sign-off. */
export function DraftNotice({ what = "copy on this page" }: { what?: string }) {
  return (
    <p className="mt-6 text-sm text-ink-soft">
      <Todo>confirm the draft {what}</Todo>
    </p>
  );
}
