import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings-form";
import { requireRole } from "@/lib/auth/dal";
import { getSiteSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configurações",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-950">
          Configurações do site
        </h1>
        <p className="text-sm text-slate-500">
          Conteúdo e dados institucionais salvos no banco de dados. As
          alterações passam a valer imediatamente, sem novo deploy.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
