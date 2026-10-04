"use client";

import { useState } from "react";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/Section";
import type {
  Project,
  ProjectCategory,
  projectCategories as ProjectCategories,
  projects as ProjectsData,
} from "@/data/site";

type Labels = Omit<typeof ProjectsData, "heading" | "items">;

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-white/40";

/** Data comes in as props so this client component doesn't bundle all of site.ts (and its icons). */
export default function ProjectGrid({
  categories,
  projects,
}: {
  categories: typeof ProjectCategories;
  projects: typeof ProjectsData;
}) {
  const [category, setCategory] = useState<ProjectCategory>("All");
  // Cards only animate in after a filter change, not on first load.
  const [filtered, setFiltered] = useState(false);
  const visible =
    category === "All"
      ? projects.items
      : projects.items.filter((project) => project.category === category);

  return (
    <>
      <div
        role="group"
        aria-label={projects.filterLabel}
        className="mt-10 flex flex-wrap gap-3"
      >
        {categories.map((name) => {
          const selected = name === category;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setCategory(name);
                setFiltered(true);
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors md:text-base ${focusRing} ${
                selected
                  ? "border-white/15 bg-white/15 text-white"
                  : "border-white/20 bg-transparent text-white/70 hover:text-white"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Keyed by category so the filtered set remounts and pops in together. */}
      <ul key={category} className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <li
            key={project.id}
            className={filtered ? "animate-pop-in motion-reduce:animate-none" : undefined}
          >
            <ProjectCard project={project} labels={projects} />
          </li>
        ))}
      </ul>
    </>
  );
}

function ProjectCard({ project, labels }: { project: Project; labels: Labels }) {
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden frosted rounded-xl border p-6 md:p-7 ${
        project.current
          ? "border-ember/35 shadow-[inset_0_1px_0_0_rgb(224_69_63/0.25)]"
          : "border-line"
      }`}
    >
      {project.current && <CurrentMark label={labels.currentLabel} />}
      <h3 className={`text-xl font-bold text-white md:text-2xl ${project.current ? "mt-9" : ""}`}>
        {project.title}
      </h3>
      {project.badge && (
        <span className="mt-3 inline-flex w-fit items-center rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-body">
          {project.badge}
        </span>
      )}
      <p className="mt-4 leading-relaxed font-light text-body md:text-lg">
        {project.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        { project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-lg border border-black bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-900 ${focusRing}`}
          >
            <ExternalLinkIcon aria-hidden className="size-4" />
            {labels.githubLabel}
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 ${focusRing}`}
          >
            <ExternalLinkIcon aria-hidden className="size-4" />
            {labels.demoLabel}
          </a>
        )}
      </div>

      <ul className="mt-auto flex flex-wrap gap-2 pt-6">
        {project.tags.map((tag, i) => (
          <li key={i}>
            <Chip>{tag}</Chip>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Top-right corner mark for in-progress projects: a folded ember corner plus a live label. */
function CurrentMark({ label }: { label: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 size-16 bg-[linear-gradient(225deg,rgb(224_69_63/0.35)_0%,rgb(224_69_63/0.08)_45%,transparent_50%)]"
      />
      <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ocean/70 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white/90 uppercase">
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-ember" />
        </span>
        {label}
      </span>
    </>
  );
}
