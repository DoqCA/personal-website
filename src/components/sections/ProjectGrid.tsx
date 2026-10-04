"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/Section";
import {
  projectCategories,
  projects,
  type Project,
  type ProjectCategory,
} from "@/data/site";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export default function ProjectGrid() {
  const [category, setCategory] = useState<ProjectCategory>("All");
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
        {projectCategories.map((name) => {
          const selected = name === category;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={selected}
              onClick={() => setCategory(name)}
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

      <motion.ul layout className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project) => (
            <motion.li
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ProjectCard project={project} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border bg-surface p-6 backdrop-blur-md md:p-7 ${
        project.current
          ? "border-ember/35 shadow-[inset_0_1px_0_0_rgb(224_69_63/0.25)]"
          : "border-line"
      }`}
    >
      {project.current && <CurrentMark />}
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
            {projects.githubLabel}
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
            {projects.demoLabel}
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
function CurrentMark() {
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
        {projects.currentLabel}
      </span>
    </>
  );
}
