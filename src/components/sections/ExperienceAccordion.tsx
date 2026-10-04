"use client";

import { useState } from "react";
import Collapse from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/Section";
import type { ExperienceItem } from "@/data/site";

export default function ExperienceAccordion({ items }: { items: ExperienceItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="mt-10 flex flex-col gap-4">
      {items.map((item) => {
        const open = openId === item.id;
        const buttonId = `${item.id}-header`;
        const panelId = `${item.id}-panel`;

        return (
          <li
            key={item.id}
            className="frosted rounded-xl border border-line"
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-6 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span className="block min-w-0">
                  <span className="block text-lg font-medium text-white">
                    {item.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center text-muted">
                    <span>{item.company}</span>
                    <span aria-hidden="true" className="mx-3 h-4 w-px bg-white/30" />
                    <span>{item.location}</span>
                  </span>
                  <span className="mt-1 block text-muted md:hidden">
                    {item.dateRange}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="hidden text-muted md:inline">{item.dateRange}</span>
                  <ChevronDownIcon
                    aria-hidden
                    className={`size-4 text-body transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
            </h3>

            <Collapse id={panelId} role="region" aria-labelledby={buttonId} open={open}>
              <div className="px-6 pt-1 pb-5">
                <ul className="list-disc space-y-2 pl-5 text-body marker:text-muted">
                  {item.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
                {item.tech.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {item.tech.map((tech, i) => (
                      <li key={i}>
                        <Chip>{tech}</Chip>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Collapse>
          </li>
        );
      })}
    </ul>
  );
}
