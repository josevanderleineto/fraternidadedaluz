import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/public/logo";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/public/social-icons";
import type { SiteSettingsData } from "@/lib/services/settings";

export function SiteFooter({
  settings,
  menuPages,
}: {
  settings: SiteSettingsData;
  menuPages: { title: string; slug: string }[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-brand-900/10 bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Logo
              logoUrl={settings.logoUrl}
              siteName={settings.siteName}
              className="ring-gold-500/50"
            />
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold text-white">
                {settings.lodgeName}
                {settings.lodgeNumber ? ` nº ${settings.lodgeNumber}` : ""}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-gold-400">
                {settings.jurisdictionName}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-brand-200">
            {settings.shortAbout || settings.description}
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Institucional
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-gold-300">
                Início
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-gold-300">
                Sobre a Loja
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gold-300">
                Notícias
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-gold-300">
                Contato
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:text-gold-300">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/termos" className="hover:text-gold-300">
                Termos de Uso
              </Link>
            </li>
            {menuPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="hover:text-gold-300">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Contato
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <a href={`mailto:${settings.email}`} className="hover:text-gold-300">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.phone && (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <span>{settings.phone}</span>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <span>{settings.address}</span>
              </li>
            )}
            {!settings.email && !settings.phone && !settings.address && (
              <li className="text-brand-300">
                Os canais oficiais de contato serão publicados em breve.
              </li>
            )}
          </ul>

          <div className="mt-5 flex gap-3">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full border border-brand-700 p-2 text-brand-100 hover:border-gold-400 hover:text-gold-300"
              >
                <FacebookIcon className="size-4" />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-brand-700 p-2 text-brand-100 hover:border-gold-400 hover:text-gold-300"
              >
                <InstagramIcon className="size-4" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rounded-full border border-brand-700 p-2 text-brand-100 hover:border-gold-400 hover:text-gold-300"
              >
                <YoutubeIcon className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-brand-300 sm:flex-row">
          <p>
            {settings.footerText ||
              `${settings.siteName} — ${settings.jurisdictionName}`}
          </p>
          <p>
            © {year} {settings.siteName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
