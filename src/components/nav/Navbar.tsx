"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import type { NavItem, ui as UiLabels } from "@/data/site";
import { useActiveSection, useScrolled } from "@/hooks/useScrollSpy";

const panelId = "mobile-nav-panel";

const glass =
  "border border-white/10 bg-black/40 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-white/40";

type Labels = Pick<typeof UiLabels, "openMenu" | "closeMenu">;

/** Data comes in as props so this client component doesn't bundle all of site.ts (and its icons). */
export default function Navbar({ items, labels }: { items: NavItem[]; labels: Labels }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(sentinelRef);
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);
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
            {items.map((item) => {
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

      <MobileNav items={items} labels={labels} active={active} />
    </header>
  );
}

function MobileNav({
  items,
  labels,
  active,
}: {
  items: NavItem[];
  labels: Labels;
  active: string;
}) {
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
        aria-label={open ? labels.closeMenu : labels.openMenu}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`flex size-12 items-center justify-center rounded-full text-white ${glass} ${focusRing}`}
      >
        <span className="relative size-5">
          <MenuIcon
            aria-hidden
            className={`absolute inset-0 size-5 transition duration-150 motion-reduce:transition-none ${
              open ? "rotate-90 opacity-0" : ""
            }`}
          />
          <CloseIcon
            aria-hidden
            className={`absolute inset-0 size-5 transition duration-150 motion-reduce:transition-none ${
              open ? "" : "-rotate-90 opacity-0"
            }`}
          />
        </span>
      </button>

      {/*
        Always mounted so it can transition both ways. Visibility is only transitioned when
        closing (hidden after the fade); opening flips it instantly so focus can move in.
      */}
      <nav
        id={panelId}
        aria-label="Primary"
        className={`absolute top-full right-0 mt-3 grid w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl duration-200 ease-out motion-reduce:transition-none ${glass} ${
          open
            ? "visible grid-rows-[1fr] translate-y-0 opacity-100 transition-[grid-template-rows,opacity,translate]"
            : "invisible grid-rows-[0fr] -translate-y-2 opacity-0 transition-[grid-template-rows,opacity,translate,visibility]"
        }`}
      >
        <div className="min-h-0">
          <ul className="flex flex-col p-2">
            {items.map((item) => {
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
        </div>
      </nav>
    </div>
  );
}
