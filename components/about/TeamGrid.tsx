"use client";

import { Img } from "@/components/cms/Img";
import { useState } from "react";
import { Todo } from "@/components/ui/Todo";
import type { TeamMember } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

/**
 * Team grid (brief §6): each person is a cream node; the Dot nudges it (curious on
 * hover) and their photo, role and fun fact pop up. Works on touch and keyboard:
 * each node is a button that toggles its card.
 */
export function TeamGrid({ team }: { team: TeamMember[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
      {team.map((m, i) => {
        const isOpen = open === m.id;
        const name = m.name ?? `Team member ${i + 1}`;
        return (
          <li key={m.id} className="group relative" data-dot-curious="">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`member-${m.id}`}
              onClick={() => setOpen(isOpen ? null : m.id)}
              className="flex w-full flex-col items-center rounded-md text-center"
            >
              <span className="relative grid size-28 place-items-center overflow-hidden rounded-full border border-node-stroke bg-node transition-transform duration-500 ease-dot group-hover:scale-105 motion-reduce:transition-none sm:size-32">
                {m.photo?.kind === "image" ? (
                  <Img src={m.photo.url} alt="" fill sizes="128px" />
                ) : (
                  <span className="text-xs text-ink-soft">photo</span>
                )}
              </span>
              <span className="mt-4 font-display text-xl">{m.name ?? <Todo>name</Todo>}</span>
              <span className="mt-1 text-sm text-ink-soft">{m.role ?? <Todo>role</Todo>}</span>
            </button>
            <div
              id={`member-${m.id}`}
              role="region"
              aria-label={`About ${name}`}
              className={cn(
                "mt-3 rounded-md border border-line/40 bg-surface p-4 text-center text-sm transition-[opacity,translate] duration-300 ease-out-expo motion-reduce:transition-none",
                isOpen
                  ? "opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100",
              )}
            >
              <span className="label text-ink-soft">Fun fact</span>
              <p className="mt-1.5">{m.funFact ?? <Todo>fun fact</Todo>}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
