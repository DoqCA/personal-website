// The single place the site imports icons from. Swap libraries here only.
import type { ComponentType } from "react";
import {
  Box,
  ChevronDown,
  ExternalLink,
  FileText,
  MapPin,
  Menu,
  Quote,
  RefreshCw,
  X,
} from "lucide-react";
import { FiGithub, FiLinkedin } from "react-icons/fi";

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
export const QuoteIcon: Icon = Quote;
export const RefreshIcon: Icon = RefreshCw;
export const DocumentIcon: Icon = FileText;
/** Neutral glyph shown on stack chips that have no specific logo yet. */
export const PlaceholderTechIcon: Icon = Box;

// Brand icons (react-icons). Add technology logos from "react-icons/si" here.
export const GithubIcon: Icon = FiGithub;
export const LinkedinIcon: Icon = FiLinkedin;
