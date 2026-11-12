import type { Metadata } from "next";
import Script from "next/script";
import { getNavOrder } from "@/lib/catalog";
import { SiteShell, type NavEntry } from "./_site/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Spaceship UI", template: "%s · Spaceship UI" },
  description: "The components behind Spaceship. See each one live, and install it into Spaceship Frontend with one command.",
};

// Set the theme before first paint so dark mode never flashes light.
const themeScript = `try{var t=localStorage.getItem("spaceship-ui-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav: NavEntry[] = getNavOrder().map(({ name, label, kind }) => ({ name, label, kind }));
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SiteShell nav={nav}>{children}</SiteShell>
      </body>
    </html>
  );
}
