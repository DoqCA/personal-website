import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { experience } from "@/data/site";
import ExperienceAccordion from "./ExperienceAccordion";

export default function Experience() {
  return (
    <Section id="experience">
      <Reveal>
        <SectionHeading id="experience">{experience.heading}</SectionHeading>
        <ExperienceAccordion items={experience.items} />
      </Reveal>
    </Section>
  );
}
