import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { about } from "@/data/site";
import Education from "./Education";

export default function About() {
  return (
    <Section id="about">
      <Reveal>
        <SectionHeading id="about">{about.heading}</SectionHeading>
        <div className="mt-8 max-w-5xl space-y-4 text-lg leading-relaxed font-light text-body md:text-xl md:leading-relaxed">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <ul className="mt-10 flex items-center gap-6">
          {about.socials
          .filter(({ href }) => href)
          .map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                className="block rounded-md text-muted transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                <Icon aria-hidden strokeWidth={1.5} className="size-7" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal>
        <Education />
      </Reveal>
    </Section>
  );
}
