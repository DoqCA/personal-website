import type { ReactNode } from "react";
import type { SectionId } from "@/data/site";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id: SectionId;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 py-16 md:py-28 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  id,
  children,
}: {
  id: SectionId;
  children: ReactNode;
}) {
  return (
    <h2
      id={`${id}-heading`}
      className="text-4xl font-medium tracking-tight text-white md:text-5xl"
    >
      {children}
    </h2>
  );
}

/** Small outlined pill used for tech tags and badges. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-surface px-3 py-1 text-xs text-body">
      {children}
    </span>
  );
}
