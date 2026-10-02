"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/Section";
import { education } from "@/data/site";

/**
 * Compact education ledger shown at the end of About. Styled as a ruled list with an ember
 * spine rather than a card, so it reads as an addendum to About instead of its own section.
 * Each entry expands to reveal relevant coursework.
 */
export default function Education() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      aria-labelledby="education-heading"
      role="group"
      className="mt-14 border-t border-line pt-10 md:grid md:grid-cols-[12rem_1fr] md:gap-10"
    >
      <h3
        id="education-heading"
        className="flex items-center gap-3 self-start text-xs font-semibold md:mt-2 tracking-[0.25em] text-muted uppercase"
      >
        <span aria-hidden="true" className="h-px w-6 bg-white/60" />
        {education.heading}
      </h3>

      <ol className="mt-6 space-y-8 md:mt-0">
        {education.items.map((item, index) => {
          const open = openIndex === index;
          const buttonId = `education-${index}-header`;
          const panelId = `education-${index}-panel`;
          const expandable = item.coursework.length > 0;

          return (
            <li
              key={`${item.school}-${item.degree}`}
              className="relative border-l border-ember/40 pl-6"
            >
              <span
                aria-hidden="true"
                className="absolute top-2 -left-[5px] size-[9px] rotate-45 bg-ember shadow-[0_0_12px_var(--color-ember)]"
              />
              <button
                id={buttonId}
                type="button"
                aria-expanded={expandable ? open : undefined}
                aria-controls={expandable ? panelId : undefined}
                disabled={!expandable}
                onClick={() => setOpenIndex(open ? null : index)}
                className="group flex w-full items-start gap-4 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-default"
              >
                <span className="block min-w-0">
                  <span className="block text-lg font-medium text-white md:text-xl">
                    {item.degree}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center text-body">
                    <span>{item.school}</span>
                    <span aria-hidden="true" className="mx-3 h-4 w-px bg-white/30" />
                    <span>{item.location}</span>
                    <span aria-hidden="true" className="mx-3 h-4 w-px bg-white/30" />
                    <span className="text-muted tabular-nums">{item.dateRange}</span>
                  </span>
                  {item.detail && (
                    <span className="mt-2 block text-sm text-muted italic">{item.detail}</span>
                  )}
                </span>
                {expandable && (
                  <ChevronDownIcon
                    aria-hidden
                    className={`mt-2 size-4 shrink-0 text-body transition-transform duration-300 group-hover:text-white ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {expandable && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!open}
                  initial={false}
                  animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-4">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
                      {education.courseworkLabel}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {item.coursework.map((course, i) => (
                        <li key={i}>
                          <Chip>{course}</Chip>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
