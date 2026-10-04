import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { projectCategories, projects } from "@/data/site";
import ProjectGrid from "./ProjectGrid";

export default function Projects() {
  return (
    <Section id="projects">
      <Reveal>
        <SectionHeading id="projects">{projects.heading}</SectionHeading>
      </Reveal>
      <ProjectGrid categories={projectCategories} projects={projects} />
    </Section>
  );
}
