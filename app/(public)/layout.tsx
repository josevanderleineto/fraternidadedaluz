import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getSiteSettings } from "@/lib/services/settings";
import { listMenuPages } from "@/lib/services/pages";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, menuPages] = await Promise.all([
    getSiteSettings(),
    listMenuPages(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        siteName={settings.siteName}
        jurisdictionName={settings.jurisdictionName}
        lodgeName={settings.lodgeName}
        lodgeNumber={settings.lodgeNumber}
        logoUrl={settings.logoUrl}
        menuPages={menuPages}
      />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} menuPages={menuPages} />
    </div>
  );
}
