import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/public/logo";
import { getCurrentUser } from "@/lib/auth/dal";
import { getSiteSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo logoUrl={settings.logoUrl} siteName={settings.siteName} />
          <h1 className="mt-5 font-display text-2xl font-semibold text-white">
            Painel administrativo
          </h1>
          <p className="mt-1 text-sm text-brand-200">{settings.siteName}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white p-8 shadow-2xl">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-brand-300">
          Acesso monitorado. Tentativas de login são registradas.
        </p>
      </div>
    </div>
  );
}
