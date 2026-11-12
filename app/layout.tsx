import type { Metadata } from "next";
import Link from "next/link";
import { getRegistry } from "@/lib/registry";
import "./globals.css";

const registry = getRegistry();

export const metadata: Metadata = {
  title: registry.name,
  description: `Components for ${registry.name}. See them here, install them with one command.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="docs-body">
        <header className="docs-header">
          <Link href="/" className="docs-brand">
            {registry.name}
          </Link>
        </header>
        <main className="docs-main">{children}</main>
      </body>
    </html>
  );
}
