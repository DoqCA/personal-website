import type { Metadata } from "next";
import MotionProvider from "@/components/MotionProvider";
import Navbar from "@/components/nav/Navbar";
import PolygonOcean from "@/components/background/PolygonOcean";
import { site, ui } from "@/data/site";
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
        <MotionProvider>
          <PolygonOcean />
          <a
            href="#main"
            className="sr-only rounded-lg bg-black px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:ring-2 focus:ring-white/40 focus:outline-none"
          >
            {ui.skipLink}
          </a>
          <Navbar />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
