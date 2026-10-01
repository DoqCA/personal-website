import { PlaceholderTechIcon } from "@/components/ui/icons";
import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { stack } from "@/data/site";

export default function Stack() {
  return (
    <Section id="stack">
      <Reveal>
        <SectionHeading id="stack">{stack.heading}</SectionHeading>
        <div className="mt-12 flex flex-col gap-y-10">
          {stack.groups.map((group) => (
            <div
              key={group.name}
              className="grid gap-4 md:grid-cols-[15rem_1fr] md:items-start md:gap-x-8"
            >
              <h3 className="text-2xl font-medium text-white md:pt-1.5">{group.name}</h3>
              <ul className="flex flex-wrap gap-3">
                {group.items.map((item, i) => {
                  const Icon = item.icon ?? PlaceholderTechIcon;
                  return (
                    <li
                      key={i}
                      className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-sm text-body backdrop-blur-md"
                    >
                      <Icon aria-hidden strokeWidth={1.5} className="size-5 text-muted" />
                      {item.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
