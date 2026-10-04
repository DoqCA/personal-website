// All site copy lives here. Replace the [Placeholders] to fill in the site.
import {
  ClaudeIcon,
  ColabIcon,
  CppIcon,
  DocumentIcon,
  FfmpegIcon,
  FirebaseIcon,
  GitIcon,
  GithubBrandIcon,
  GithubIcon,
  GradioIcon,
  HtmlIcon,
  JavaIcon,
  JavascriptIcon,
  LinkedinIcon,
  MatplotlibIcon,
  NextjsIcon,
  NodejsIcon,
  NumpyIcon,
  OllamaIcon,
  OpencvIcon,
  PandasIcon,
  PythonIcon,
  PytorchIcon,
  ReactIcon,
  RustIcon,
  ScikitlearnIcon,
  ScipyIcon,
  ShellIcon,
  SqliteIcon,
  StreamlitIcon,
  TailwindIcon,
  TensorflowIcon,
  TypescriptIcon,
  VercelIcon,
  VmwareIcon,
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

export type SocialLink = { label: string; href?: string; icon: Icon };

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
  /** Marks a project as in progress: the card gets a corner mark and accent border. */
  current?: boolean;
  description: string;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
};

export type EducationItem = {
  degree: string;
  school: string;
  location: string;
  dateRange: string;
  /** Optional one-liner, e.g. GPA, honors, or a minor. */
  detail?: string;
  coursework: string[];
};

export type StackItem = {
  name: string;
  /** Optional logo, e.g. a react-icons/si icon re-exported from icons.tsx. Falls back to a neutral glyph. */
  icon?: Icon;
};

export type StackGroup = { name: string; items: StackItem[] };

export const site = {
  name: "O'Mario",
  role1: "Coder",
  role2: "Tinkerer",
  role3: "People Person",
  metadata: {
    title: "O'Mario Dev",
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
  subtitle: `${site.role1}. ${site.role2}. ${site.role3}`,
};

export const about = {
  heading: "About Me",
  paragraphs: [
    `I'm a Computer Science student at the University of Alberta with 
    a passion for automation and technology that helps people focus on 
    the things they find most important (which you can see in some of my projects below).`,
    `Fun fact: My path into software actually started with Minecraft redstone 
    and command blocks (and the Minecraft Redstone Handbook, which I still have on my bookshelf), and that curiosity for making systems do the work 
    hasn't gone away.`, 
    `I'm a people person who enjoys researching, building and innovating in teams, 
    and am actively looking for opportunities to learn new technologies and 
    build things that make a real difference.`,
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/DoqCA", icon: GithubIcon },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/dqobrown/", icon: LinkedinIcon },
    { label: "Resume", href: "", icon: DocumentIcon },
  ] satisfies SocialLink[],
};

/** Rendered as a short block inside the About section; intentionally not in the nav. */
export const education = {
  heading: "Education",
  courseworkLabel: "Relevant coursework",
  items: [
    {
      degree: "BSc Computer Science",
      school: "University of Alberta",
      location: "Edmonton, AB",
      dateRange: "Expected: 04/2028",
      detail: "Major GPA (CMPUT): 3.6 | GPA: 3.3",
      coursework: [
        "Intro to Reinforcement Learning",
        "Machine Learning I",
        "Practical Programming Methodology",
        "Software Development I",
        "Game AI",
      ],
    },
  ] satisfies EducationItem[],
};

export const experience = {
  heading: "Experience",
  items: [
    {
      id: "riipen-level-up",
      title: "Software Engineering Placement (Incoming)",
      company: "Undetermined",
      location: "Remote",
      dateRange: "10/2026 – 12/2026",
      bullets: [
        "Accepted into Riipen Level Up's employer-matched placement program; currently being matched with a software project.",
      ],
      tech: [],
    },
    {
      id: "blackboyscode",
      title: "Team Lead & Curriculum Development",
      company: "BlackBoysCode",
      location: "Remote",
      dateRange: "02/2026 – Present",
      bullets: [
        "Direct teams across Canada delivering technical literacy programs in Math, CS, and AI to students in grades 4–9.",
        "Appointed to the national Curriculum Development Team, contributing to Python, Math, and ML instructional modules delivered to over 18,000 youth across North America.",
      ],
      tech: ["Python", "Machine Learning", "Curriculum Design", "Leadership"],
    },
    {
      id: "marketyze",
      title: "Web Development Team Lead",
      company: "Marketyze",
      location: "Remote",
      dateRange: "09/2022 – 09/2023",
      bullets: [
        "Led a team of 3 to design, build, and maintain the company website in plain HTML, CSS, and JavaScript with a mobile-first approach, deployed on Glitch.",
        "Cut load times across platforms (LCP under 2.5s) and raised Lighthouse performance scores by optimizing images (WebP/AVIF, srcset, compression), preloading the hero image, and lazy-loading below-the-fold content.",
        "Began migration to a no-code platform ahead of a company restructuring and transferred ownership to a non-technical team so it could be maintained without engineering support.",
      ],
      tech: ["HTML", "CSS", "JavaScript", "Glitch", "Lighthouse"],
    },
  ] satisfies ExperienceItem[],
};

export const projects = {
  heading: "Projects",
  filterLabel: "Filter projects by category",
  githubLabel: "GitHub",
  demoLabel: "Demo",
  currentLabel: "Currently building",
  items: [
    {
      id: "nte-theorycrafting-engine",
      title: "Neverness to Everness Theorycrafting Engine",
      category: "Games",
      current: true,
      description:
        "A data-driven combat simulator in Rust that models characters, skills, buffs, and encounters as structured data, built for high-throughput Monte Carlo runs and validated against hand-calculated rotations.",
      tags: ["Rust", "Monte Carlo", "Simulation", "Search", "Games"],
    },
    {
      id: "personal-website",
      title: "This Website",
      category: "Web",
      description:
        "My personal portfolio showcasing my projects, experience, and skills. Built with Next.js, React, TypeScript, and Tailwind CSS, featuring a custom WebGL animated background (as you can see), and deployed on Vercel with a focus on performance across devices.",
      githubUrl: "https://github.com/DoqCA/personal-website",
      tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    },
    {
      id: "audio-deidentification",
      title: "Audio Deidentification Application",
      category: "AI/ML",
      description:
        "A CLI tool for audio FOIP compliance that removes names and student voices from lecture audio using NLP and on-device transcription, with a supervised lecturer/student classifier reaching ~0.90 F1. Migrated from Python to C++ for a large runtime cut.",
      githubUrl: "https://github.com/DoqCA/Audio-Deidentification-Project-Reconstruction",
      tags: ["Python", "C++", "Supervised Learning", "NLP", "Audio", "CLI"],
    },
    {
      id: "android-event-manager",
      title: "AndroidOS Event Management Application",
      category: "Misc",
      badge: "Full Stack",
      description:
        "A full-stack Android event management app built by a team of 6 with Java, XML, and Firestore across the full SDLC, using Agile/Scrum, TDD, and automated CI/CD, documented with UML and CRC cards.",
      githubUrl: "https://github.com/CMPUT301W26tigers/tigers-events",
      tags: ["Java", "Android", "Firestore", "Agile", "CI/CD"],
    },
    {
      id: "ur2phd-nlp-reproduction",
      title: "UR2PHD NLP Research Reproduction",
      category: "AI/ML",
      badge: "Research",
      description:
        "Reproduced a peer-reviewed Google NLP paper on perturbation sensitivity using open-source HuggingFace toxicity and sentiment models, with a Python data pipeline replicating the paper's filtering methodology and analysis of the results.",
      tags: ["Python", "NLP", "HuggingFace", "Research", "Data Analysis"],
    },
  ] satisfies Project[],
};

export const stack = {
  heading: "My Stack",
  groups: [
    {
      name: "Languages & Frameworks",
      items: [
        { name: "Python", icon: PythonIcon },
        { name: "C++", icon: CppIcon },
        { name: "Java", icon: JavaIcon },
        { name: "Rust", icon: RustIcon },
        { name: "TypeScript", icon: TypescriptIcon },
        { name: "JavaScript", icon: JavascriptIcon },
        { name: "HTML/CSS", icon: HtmlIcon },
        { name: "React", icon: ReactIcon },
        { name: "Next.js", icon: NextjsIcon },
        { name: "Tailwind CSS", icon: TailwindIcon },
      ],
    },
    {
      name: "Data Science",
      items: [
        { name: "Pandas", icon: PandasIcon },
        { name: "NumPy", icon: NumpyIcon },
        { name: "SciPy", icon: ScipyIcon },
        { name: "Matplotlib", icon: MatplotlibIcon },
        { name: "Scikit-learn", icon: ScikitlearnIcon },
        { name: "PyTorch", icon: PytorchIcon },
        { name: "TensorFlow", icon: TensorflowIcon },
        { name: "OpenCV", icon: OpencvIcon },
      ],
    },
    {
      name: "Database & Backend",
      items: [
        { name: "Node.js", icon: NodejsIcon },
        { name: "Firestore", icon: FirebaseIcon },
        { name: "SQLite", icon: SqliteIcon },
      ],
    },
    {
      name: "Tools",
      items: [
        { name: "Git", icon: GitIcon },
        { name: "GitHub", icon: GithubBrandIcon },
        { name: "Shell", icon: ShellIcon },
        { name: "Vercel", icon: VercelIcon },
        { name: "Colab", icon: ColabIcon },
        {name: "Firebase", icon: FirebaseIcon},
        { name: "FFmpeg", icon: FfmpegIcon },
        { name: "VMware", icon: VmwareIcon },
        { name: "Claude Code", icon: ClaudeIcon },
        { name: "Ollama", icon: OllamaIcon },
        { name: "Streamlit", icon: StreamlitIcon },
        { name: "Gradio", icon: GradioIcon },
      ],
    },
  ] satisfies StackGroup[],
};

export const contact = {
  eyebrow: "Contact",
  heading: "Get In Touch",
  intro: "I'm always looking for opportunities to work on cool stuff. Let's get in touch!",
  locationLabel: "Location",
  location: "Canada",
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

export const footer = {
  name: site.name,
};
