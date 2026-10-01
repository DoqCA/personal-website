// All site copy lives here. Replace the [Placeholders] to fill in the site.
import {
  DocumentIcon,
  GithubIcon,
  LinkedinIcon,
  type Icon,
} from "@/components/ui/icons";

export type SectionId =
  | "hero"
  | "about"
  | "experience"
  | "projects"
  | "stack"
  | "contact";

export type NavItem = { id: SectionId; label: string };

export type SocialLink = { label: string; href: string; icon: Icon };

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  dateRange: string;
  bullets: string[];
  tech: string[];
};

export const projectCategories = [
  "All",
  "Finance",
  "AI/ML",
  "Games",
  "Web",
  "Misc",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export type Project = {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, "All">;
  badge?: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  tags: string[];
};

export type StackItem = {
  name: string;
  /** Optional logo, e.g. a react-icons/si icon re-exported from icons.tsx. Falls back to a neutral glyph. */
  icon?: Icon;
};

export type StackGroup = { name: string; items: StackItem[] };

export type QuoteItem = { text: string; author: string };

const repeat = <T,>(count: number, make: (i: number) => T): T[] =>
  Array.from({ length: count }, (_, i) => make(i));

export const site = {
  name: "[Your_name]",
  role: "[Role]",
  specialty: "[Specialty]",
  metadata: {
    title: "[Your_name] | [Role]",
    description: "[Site_description]",
  },
};

export const navItems: NavItem[] = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

export const ui = {
  skipLink: "Skip to content",
  openMenu: "Open menu",
  closeMenu: "Close menu",
};

export const hero = {
  greeting: `Hi, I'm ${site.name}`,
  subtitle: `${site.role}. ${site.specialty}`,
};

export const about = {
  heading: "About Me",
  paragraph:
    "[About_paragraph: 2 to 4 sentences about who you are, what you have been building, where you have worked, and what you are looking for next. This text is intentionally long enough to wrap across a few lines so the layout is visible.]",
  socials: [
    { label: "GitHub", href: "#", icon: GithubIcon },
    { label: "LinkedIn", href: "#", icon: LinkedinIcon },
    { label: "Resume", href: "#", icon: DocumentIcon },
  ] satisfies SocialLink[],
};

export const experience = {
  heading: "Experience",
  items: repeat<ExperienceItem>(3, (i) => ({
    id: `job-${i + 1}`,
    title: "[Job_title]",
    company: "[Company]",
    location: "[Location]",
    dateRange: "[Date_range]",
    bullets: repeat(3, () => "[Responsibility_or_achievement]"),
    tech: repeat(4, () => "[Tech]"),
  })),
};

const projectCategoryOrder: Project["category"][] = [
  "Finance",
  "AI/ML",
  "Games",
  "Web",
  "Misc",
  "Finance",
];

export const projects = {
  heading: "Personal Projects",
  filterLabel: "Filter projects by category",
  githubLabel: "GitHub",
  demoLabel: "Demo",
  items: projectCategoryOrder.map<Project>((category, i) => ({
    id: `project-${i + 1}`,
    title: "[Project_name]",
    category,
    badge: i % 2 === 0 ? "[Badge]" : undefined,
    description:
      "[Project_description: 2 to 3 lines describing what the project does, how it works, and what it is built with.]",
    githubUrl: "#",
    demoUrl: i % 3 === 1 ? "#" : undefined,
    tags: repeat(4 + (i % 3), () => "[Tag]"),
  })),
};

const techItems = (count: number): StackItem[] =>
  repeat(count, () => ({ name: "[Technology]" }));

export const stack = {
  heading: "My Stack",
  groups: [
    { name: "Frontend", items: techItems(10) },
    { name: "Backend", items: techItems(5) },
    { name: "Database", items: techItems(3) },
    { name: "Tools", items: techItems(8) },
  ] satisfies StackGroup[],
};

export const contact = {
  eyebrow: "Contact",
  heading: "Get In Touch",
  intro: "[Contact_intro_sentence]",
  locationLabel: "Location",
  location: "[Location]",
  form: {
    nameLabel: "Name",
    emailLabel: "Email",
    messageLabel: "Your message...",
    submit: "Send message",
    sending: "Sending...",
    success: "[Success_message: Thanks, I'll get back to you soon.]",
    error: "[Error_message: Something went wrong. Please try again.]",
  },
};

export const quotes = {
  label: "Quote of the day",
  nextLabel: "Show another quote",
  items: repeat<QuoteItem>(3, (i) => ({
    text: `[Quote_text_${i + 1}]`,
    author: "[Quote_author]",
  })),
};

export const footer = {
  name: site.name,
};
