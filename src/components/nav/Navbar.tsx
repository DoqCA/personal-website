"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { navItems, ui } from "@/data/site";
import { useActiveSection, useScrolled } from "@/hooks/useScrollSpy";

const sectionIds = navItems.map((item) => item.id);
const panelId = "mobile-nav-panel";

const glass =
  "border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export default function Navbar() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(sentinelRef);
  const active = useActiveSection(sectionIds);

  return (
    <header>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-px w-px"
      />

      {/* Desktop */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 hidden justify-center md:flex">
        <nav
          aria-label="Primary"
          className={`pointer-events-auto rounded-full border px-8 py-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out lg:px-10 ${
            scrolled
              ? glass
              : "border-transparent bg-transparent shadow-none backdrop-blur-[0px]"
          }`}
        >
          <ul className="flex items-center gap-8 lg:gap-12">
            {navItems.map((item) => {
              const isActive = item.id === active;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`rounded-full px-1 py-1 text-sm font-medium transition-colors duration-200 hover:text-white lg:text-base ${focusRing} ${
                      isActive ? "text-white" : "text-white/70"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <MobileNav active={active} />
    </header>
  );
}

function MobileNav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;

    // Move focus to the first link when the panel opens.
    containerRef.current
      ?.querySelector<HTMLAnchorElement>(`#${panelId} a`)
      ?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-50 md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? ui.closeMenu : ui.openMenu}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`flex size-12 items-center justify-center rounded-full text-white ${glass} ${focusRing}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "menu"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {open ? (
              <CloseIcon aria-hidden className="size-5" />
            ) : (
              <MenuIcon aria-hidden className="size-5" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id={panelId}
            aria-label="Primary"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute top-full right-0 mt-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl ${glass}`}
          >
            <ul className="flex flex-col p-2">
              {navItems.map((item) => {
                const isActive = item.id === active;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => close(true)}
                      className={`flex min-h-12 items-center rounded-xl px-4 text-lg font-medium transition-colors hover:bg-white/5 hover:text-white ${focusRing} ${
                        isActive ? "text-white" : "text-white/70"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
