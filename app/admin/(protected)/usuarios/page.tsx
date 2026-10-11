import type { Metadata } from "next";

import { UserManager, type AdminUserRow } from "@/components/admin/user-manager";
import { requireRole } from "@/lib/auth/dal";
import { listUsers } from "@/lib/services/users";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Usuários",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const acting = await requireRole("ADMIN");
  const [params, users] = await Promise.all([searchParams, listUsers()]);

  const rows: AdminUserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    lastLogin: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : null,
    isSelf: user.id === acting.id,
  }));

  return (
    <UserManager
      users={rows}
      errorMessage={params.erro ? decodeURIComponent(params.erro) : null}
    />
  );
}
