// Font setup lives here only. The CSS variable is mapped to Tailwind's font-sans in globals.css.
import { Inter } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
