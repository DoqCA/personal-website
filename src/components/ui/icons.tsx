// The single place the site imports icons from. Swap libraries here only.
import type { ComponentType } from "react";
import {
  Box,
  ChevronDown,
  ExternalLink,
  FileText,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { FaJava } from "react-icons/fa6";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import {
  SiClaude,
  SiCplusplus,
  SiFfmpeg,
  SiFirebase,
  SiFramer,
  SiGit,
  SiGithub,
  SiGnubash,
  SiGooglecolab,
  SiGradio,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiOllama,
  SiOpencv,
  SiPandas,
  SiPython,
  SiPytorch,
  SiReact,
  SiRust,
  SiScikitlearn,
  SiScipy,
  SiSqlite,
  SiStreamlit,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiVercel,
  SiVmware,
} from "react-icons/si";
import { TbChartLine } from "react-icons/tb";

export type Icon = ComponentType<{
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

// UI icons (lucide-react)
export const MenuIcon: Icon = Menu;
export const CloseIcon: Icon = X;
export const ChevronDownIcon: Icon = ChevronDown;
export const ExternalLinkIcon: Icon = ExternalLink;
export const MapPinIcon: Icon = MapPin;
export const DocumentIcon: Icon = FileText;
/** Neutral glyph shown on stack chips that have no specific logo yet. */
export const PlaceholderTechIcon: Icon = Box;

// Brand icons (react-icons). Add technology logos from "react-icons/si" here.
export const GithubIcon: Icon = FiGithub;
export const LinkedinIcon: Icon = FiLinkedin;

// Technology logos (react-icons/si, with fallbacks where Simple Icons has no logo)
export const PythonIcon: Icon = SiPython;
export const CppIcon: Icon = SiCplusplus;
export const JavaIcon: Icon = FaJava;
export const RustIcon: Icon = SiRust;
export const TypescriptIcon: Icon = SiTypescript;
export const JavascriptIcon: Icon = SiJavascript;
export const HtmlIcon: Icon = SiHtml5;
export const ReactIcon: Icon = SiReact;
export const NextjsIcon: Icon = SiNextdotjs;
export const TailwindIcon: Icon = SiTailwindcss;
export const MotionIcon: Icon = SiFramer;
export const PandasIcon: Icon = SiPandas;
export const NumpyIcon: Icon = SiNumpy;
export const ScipyIcon: Icon = SiScipy;
export const MatplotlibIcon: Icon = TbChartLine;
export const ScikitlearnIcon: Icon = SiScikitlearn;
export const PytorchIcon: Icon = SiPytorch;
export const TensorflowIcon: Icon = SiTensorflow;
export const OpencvIcon: Icon = SiOpencv;
export const NodejsIcon: Icon = SiNodedotjs;
export const FirebaseIcon: Icon = SiFirebase;
export const SqliteIcon: Icon = SiSqlite;
export const GitIcon: Icon = SiGit;
export const GithubBrandIcon: Icon = SiGithub;
export const ShellIcon: Icon = SiGnubash;
export const VercelIcon: Icon = SiVercel;
export const ColabIcon: Icon = SiGooglecolab;
export const FfmpegIcon: Icon = SiFfmpeg;
export const VmwareIcon: Icon = SiVmware;
export const ClaudeIcon: Icon = SiClaude;
export const OllamaIcon: Icon = SiOllama;
export const StreamlitIcon: Icon = SiStreamlit;
export const GradioIcon: Icon = SiGradio;
