import { education } from "@/data/site";

/**
 * Compact education ledger shown at the end of About. Styled as a ruled list with an ember
 * spine rather than a card, so it reads as an addendum to About instead of its own section.
 */
export default function Education() {
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
        <span aria-hidden="true" className="h-px w-6 bg-ember" />
        {education.heading}
      </h3>

      <ol className="mt-6 space-y-8 md:mt-0">
        {education.items.map((item) => (
          <li
            key={`${item.school}-${item.degree}`}
            className="relative border-l border-ember/40 pl-6"
          >
            <span
              aria-hidden="true"
              className="absolute top-2 -left-[5px] size-[9px] rotate-45 bg-ember shadow-[0_0_12px_var(--color-ember)]"
            />
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
              <p className="text-lg font-medium text-white md:text-xl">{item.degree}</p>
              <p className="text-sm tracking-wide text-muted tabular-nums">{item.dateRange}</p>
            </div>
            <p className="mt-1 text-body">
              {item.school}
              <span aria-hidden="true" className="mx-2 text-ember/70">
                /
              </span>
              {item.location}
            </p>
            {item.detail && <p className="mt-2 text-sm text-muted italic">{item.detail}</p>}
            {item.coursework.length > 0 && (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                <span className="mr-2 font-medium text-body">{education.courseworkLabel}:</span>
                {item.coursework.map((course, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span aria-hidden="true" className="mx-2 text-ember/60">
                        ·
                      </span>
                    )}
                    {course}
                  </span>
                ))}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
