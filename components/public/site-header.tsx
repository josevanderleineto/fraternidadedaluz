"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/public/logo";
import { cn } from "@/lib/utils";

export type HeaderProps = {
  siteName: string;
  jurisdictionName: string;
  lodgeName: string;
  lodgeNumber: string;
  logoUrl: string | null;
  menuPages: { title: string; slug: string }[];
};

export function SiteHeader({
  siteName,
  jurisdictionName,
  lodgeName,
  lodgeNumber,
  logoUrl,
  menuPages,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Início" },
    { href: "/sobre", label: "Sobre" },
    { href: "/blog", label: "Notícias" },
    { href: "/contato", label: "Contato" },
    ...menuPages.map((p) => ({ href: `/${p.slug}`, label: p.title })),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-brand-800 bg-[#0E1A31]/95 text-white backdrop-blur transition-shadow",
        scrolled && "shadow-sm",
      )}
    >
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`Página inicial — ${siteName}`}
        >
          <Logo logoUrl={logoUrl} siteName={siteName} />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-white sm:text-xl">
              {lodgeName}
              {lodgeNumber ? ` nº ${lodgeNumber}` : ""}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-gold-300">
              {jurisdictionName}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-1 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-gold-300"
                  : "text-brand-100 hover:text-gold-300",
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="mx-auto mt-1 block h-0.5 w-5 rounded bg-gold-500" />
              )}
            </Link>
          ))}
          <Link
            href="/contato"
            className="ml-2 rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 transition-colors hover:bg-gold-300"
          >
            Fale conosco
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-brand-700 text-gold-300 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Navegação móvel"
          className="border-t border-brand-800 bg-[#0E1A31] lg:hidden"
        >
          <div className="container-page flex flex-col py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-sm font-medium",
                  isActive(link.href)
                    ? "bg-white/10 text-gold-300"
                    : "text-brand-100 hover:bg-white/10",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
