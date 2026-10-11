"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileStack,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";

import { Logo } from "@/components/public/logo";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/enums";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Publicações", icon: FileText },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/paginas", label: "Páginas", icon: FileStack },
  { href: "/admin/midia", label: "Mídia", icon: ImageIcon },
  { href: "/admin/mensagens", label: "Mensagens", icon: Mail },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, adminOnly: true },
];

export function AdminShell({
  user,
  logoUrl,
  siteName,
  unreadMessages,
  logout,
  children,
}: {
  user: { name: string; email: string; role: Role };
  logoUrl: string | null;
  siteName: string;
  unreadMessages: number;
  logout: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV.filter(
    (item) => !item.adminOnly || user.role === "ADMIN",
  );

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Logo
          logoUrl={logoUrl}
          siteName={siteName}
          className="h-9 w-9 ring-gold-500/50"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-white">{siteName}</p>
          <p className="text-[11px] uppercase tracking-wider text-gold-400">
            Administração
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-white/10 text-white"
                : "text-brand-200 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {label === "Mensagens" && unreadMessages > 0 && (
              <span className="rounded-full bg-gold-500 px-2 text-xs font-semibold text-brand-950">
                {unreadMessages}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-brand-200 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-4" />
          Ver o site
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-brand-950 lg:block">
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-brand-950/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-brand-950 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-brand-900 lg:hidden"
            aria-label="Abrir menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">Painel administrativo</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-brand-950">{user.name}</p>
              <p className="text-xs text-slate-500">
                {user.role === "ADMIN" ? "Administrador" : "Editor"}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-gold-300">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
