import { AdminShell } from "@/components/admin/admin-shell";
import { logoutAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth/dal";
import { countUnreadMessages } from "@/lib/services/contact";
import { getSiteSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

/**
 * Layout de todas as rotas administrativas protegidas.
 * A verificação de sessão ocorre no servidor, antes de renderizar qualquer
 * conteúdo — esconder botões na interface não é suficiente.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [settings, unreadMessages] = await Promise.all([
    getSiteSettings(),
    countUnreadMessages(),
  ]);

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
      logoUrl={settings.logoUrl}
      siteName={settings.siteName}
      unreadMessages={unreadMessages}
      logout={logoutAction}
    >
      {children}
    </AdminShell>
  );
}
