"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Moon, PanelLeft, Sun, X } from "lucide-react";
import { Button } from "#/components/ds/ui/button";
import { cn } from "#/components/ds/lib/classnames";

export type NavEntry = { name: string; label: string; kind: "component" | "pattern" };

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Watches <html data-theme>, which the pre-paint script and the toggle both set. */
function subscribeTheme(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

function NavLink({ href, active, children, onNavigate }: { href: string; active: boolean; children: ReactNode; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-md px-2.5 py-1.5 text-body transition-colors duration-100",
        // DESIGN.md: hover and selected share one shade. Same token as Spaceship's ghost Button.
        "hover:bg-(--bg-interactive-secondary-ghost-hover) focus-visible:bg-(--bg-interactive-secondary-ghost-hover)",
        active ? "bg-(--bg-interactive-secondary-ghost-hover) text-content" : "text-content-secondary",
      )}
    >
      {children}
    </Link>
  );
}

function SidebarNav({ nav, onNavigate }: { nav: NavEntry[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = [
    { label: "Components", items: nav.filter((n) => n.kind === "component") },
    { label: "Patterns", items: nav.filter((n) => n.kind === "pattern") },
  ];
  return (
    <nav aria-label="Site" className="flex flex-col gap-6 px-3 pb-10">
      <div className="flex flex-col gap-0.5">
        <NavLink href="/" active={pathname === "/"} onNavigate={onNavigate}>
          Overview
        </NavLink>
        <NavLink href="/frontend" active={pathname === "/frontend"} onNavigate={onNavigate}>
          Use in Spaceship Frontend
        </NavLink>
      </div>
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-0.5">
          <p className="px-2.5 pb-1 text-caption text-content-tertiary">
            {g.label} <span className="tabular-nums">{g.items.length}</span>
          </p>
          {g.items.map((n) => (
            <NavLink key={n.name} href={`/components/${n.name}`} active={pathname === `/components/${n.name}`} onNavigate={onNavigate}>
              {n.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function SiteShell({ nav, children }: { nav: NavEntry[]; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as Theme);

  // "[" tucks the sidebar away, like Fluid Functionalism. Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "[" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      setOpen((o) => !o);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("spaceship-ui-theme", next);
    } catch {
      // Private windows can block storage. The toggle still works for this visit.
    }
  };

  const brand = (
    <Link href="/" className="font-serif text-subtitle text-content">
      Spaceship UI
    </Link>
  );

  return (
    <div className="min-h-dvh bg-(--bg-surface-base) font-sans text-content">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-(--border-subtle) bg-(--bg-surface-subtle) transition-transform duration-200 lg:flex",
          !open && "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between bg-(--bg-surface-subtle) px-5">{brand}</div>
        <SidebarNav nav={nav} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-(--bg-surface-subtle)">
            <div className="flex h-14 shrink-0 items-center justify-between px-5">
              {brand}
              <Button variant="secondary" surface="ghost" size="icon-sm" aria-label="Close menu" onClick={() => setMobileOpen(false)} leadingIcon={<X />} />
            </div>
            <SidebarNav nav={nav} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-200", open && "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-(--bg-surface-base)/90 px-4 backdrop-blur">
          <Button
            variant="secondary"
            surface="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            leadingIcon={<PanelLeft />}
          />
          <Button
            variant="secondary"
            surface="ghost"
            size="icon-sm"
            className="hidden lg:inline-flex"
            aria-label={open ? "Hide sidebar ([)" : "Show sidebar ([)"}
            title={open ? "Hide sidebar ([)" : "Show sidebar ([)"}
            onClick={() => setOpen((o) => !o)}
            leadingIcon={<PanelLeft />}
          />
          {!open && <span className="hidden lg:block">{brand}</span>}
          <div className="ml-auto">
            <Button
              variant="secondary"
              surface="ghost"
              size="icon-sm"
              aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}
              title={theme === "dark" ? "Use light theme" : "Use dark theme"}
              onClick={toggleTheme}
              leadingIcon={theme === "dark" ? <Sun /> : <Moon />}
            />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
