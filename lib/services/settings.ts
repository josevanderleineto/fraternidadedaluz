import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import type { SettingsInput } from "@/lib/validation/schemas";

/**
 * Configurações institucionais (registro único).
 *
 * Conteúdo provisório é usado APENAS como exemplo, claramente identificado,
 * até que os dados oficiais sejam informados pelo administrador no painel.
 */

export const DEFAULT_SETTINGS = {
  siteName: "Loja Fraternidade da Luz nº 181",
  lodgeName: "Loja Fraternidade da Luz",
  lodgeNumber: "181",
  jurisdictionName: "Grande Loja do Estado da Bahia",
  logoUrl: "",
  logoPublicId: "",
  description:
    "Site institucional da Loja Fraternidade da Luz nº 181, jurisdicionada à Grande Loja do Estado da Bahia. Conteúdo provisório de exemplo — substitua pelo texto oficial no painel administrativo.",
  shortAbout:
    "A Loja Fraternidade da Luz nº 181 reúne irmãos em torno dos princípios da fraternidade, do aperfeiçoamento moral e do serviço à sociedade. Este texto é provisório de exemplo.",
  address: "",
  email: "",
  phone: "",
  whatsapp: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  footerText:
    "Loja Fraternidade da Luz nº 181 — Grande Loja do Estado da Bahia. Conteúdo provisório de exemplo.",
  metaTitle: "Loja Fraternidade da Luz nº 181 — Grande Loja do Estado da Bahia",
  metaDescription:
    "Site institucional da Loja Fraternidade da Luz nº 181, jurisdicionada à Grande Loja do Estado da Bahia.",
} as const;

export type SiteSettingsData = {
  siteName: string;
  lodgeName: string;
  lodgeNumber: string;
  jurisdictionName: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  description: string | null;
  shortAbout: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  footerText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

/** Busca as configurações, com fallback para os valores padrão. */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (!settings) {
      return { ...DEFAULT_SETTINGS } as SiteSettingsData;
    }
    return settings as SiteSettingsData;
  } catch {
    // Banco indisponível (ex.: durante o build): usa os padrões.
    return { ...DEFAULT_SETTINGS } as SiteSettingsData;
  }
});

/** Cria ou atualiza as configurações (upsert no registro único). */
export async function updateSiteSettings(
  input: SettingsInput,
): Promise<SiteSettingsData> {
  const data = {
    siteName: input.siteName,
    lodgeName: input.lodgeName,
    lodgeNumber: input.lodgeNumber || "181",
    jurisdictionName: input.jurisdictionName || "",
    logoUrl: input.logoUrl || null,
    logoPublicId: input.logoPublicId || null,
    description: input.description || null,
    shortAbout: input.shortAbout || null,
    address: input.address || null,
    email: input.email || null,
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    facebookUrl: input.facebookUrl || null,
    instagramUrl: input.instagramUrl || null,
    youtubeUrl: input.youtubeUrl || null,
    footerText: input.footerText || null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  return settings as SiteSettingsData;
}
