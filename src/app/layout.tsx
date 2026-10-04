import type { Metadata } from "next";
import Navbar from "@/components/nav/Navbar";
import PolygonOcean from "@/components/background/PolygonOcean";
import { navItems, site, ui } from "@/data/site";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: site.metadata.title,
  description: site.metadata.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-ocean font-sans text-white">
        <PolygonOcean />
        <a
          href="#main"
          className="sr-only rounded-lg bg-black px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:ring-2 focus:ring-white/40 focus:outline-none"
        >
          {ui.skipLink}
        </a>
        <Navbar items={navItems} labels={ui} />
        {children}
      </body>
    </html>
  );
}
