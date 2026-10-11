import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileEdit,
  FileText,
  Image as ImageIcon,
  Mail,
  Tags,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDashboardStats,
  getRecentActivity,
  getRecentMessages,
  getRecentPosts,
} from "@/lib/services/dashboard";
import { requireUser } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  SCHEDULED: "Agendado",
};

const actionLabels: Record<string, string> = {
  LOGIN: "entrou no painel",
  LOGOUT: "saiu do painel",
  LOGIN_FALHA: "tentativa de login falhou",
  CREATE: "criou",
  UPDATE: "atualizou",
  DELETE: "excluiu",
  UPLOAD: "enviou mídia",
  SETTINGS_UPDATE: "atualizou configurações",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const [user, params, stats, activity, recentPosts, recentMessages] =
    await Promise.all([
      requireUser(),
      searchParams,
      getDashboardStats(),
      getRecentActivity(6),
      getRecentPosts(5),
      getRecentMessages(5),
    ]);

  const cards = [
    {
      label: "Publicações",
      value: stats.totalPosts,
      href: "/admin/posts",
      icon: FileText,
      tone: "brand",
    },
    {
      label: "Publicadas",
      value: stats.publishedPosts,
      href: "/admin/posts?status=PUBLISHED",
      icon: CheckCircle2,
      tone: "emerald",
    },
    {
      label: "Rascunhos",
      value: stats.draftPosts,
      href: "/admin/posts?status=DRAFT",
      icon: FileEdit,
      tone: "amber",
    },
    {
      label: "Categorias",
      value: stats.totalCategories,
      href: "/admin/categorias",
      icon: Tags,
      tone: "brand",
    },
    {
      label: "Mensagens não lidas",
      value: stats.unreadMessages,
      href: "/admin/mensagens?filter=unread",
      icon: Mail,
      tone: "gold",
    },
    {
      label: "Arquivos de mídia",
      value: stats.totalMedia,
      href: "/admin/midia",
      icon: ImageIcon,
      tone: "brand",
    },
  ] as const;

  return (
    <div className="space-y-8">
      {params.erro === "sem-permissao" && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <AlertTriangle className="size-4 shrink-0" />
          Você não tem permissão para acessar essa área.
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-950">
            Olá, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-slate-500">
            Visão geral do conteúdo e das mensagens do site.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/posts/novo">Nova publicação</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/paginas">Editar páginas</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, href, icon: Icon, tone }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  tone === "gold"
                    ? "flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-700"
                    : tone === "emerald"
                      ? "flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
                      : tone === "amber"
                        ? "flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700"
                        : "flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-800"
                }
              >
                <Icon className="size-5" />
              </span>
              <span className="font-display text-3xl font-semibold text-brand-950">
                {value}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600 group-hover:text-brand-800">
              {label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Publicações recentes
            </h2>
            <Link
              href="/admin/posts"
              className="text-sm text-brand-700 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPosts.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                Nenhuma publicação cadastrada ainda.
              </p>
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-brand-950">
                      {post.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      Atualizada em {formatDateTime(post.updatedAt)}
                    </span>
                  </span>
                  <Badge
                    variant={
                      post.status === "PUBLISHED"
                        ? "success"
                        : post.status === "SCHEDULED"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {statusLabels[post.status]}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Mensagens recebidas
            </h2>
            <Link
              href="/admin/mensagens"
              className="text-sm text-brand-700 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentMessages.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                Nenhuma mensagem recebida.
              </p>
            ) : (
              recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href={`/admin/mensagens/${msg.id}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-brand-950">
                      {msg.subject}
                    </span>
                    <span className="text-xs text-slate-500">{msg.name}</span>
                  </span>
                  {!msg.isRead && <Badge variant="gold">Nova</Badge>}
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-display text-lg font-semibold text-brand-950">
            Atividade recente
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {activity.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              Nenhuma atividade registrada ainda.
            </p>
          ) : (
            activity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-brand-950">
                    {log.userName ?? "Sistema"}
                  </span>{" "}
                  {actionLabels[log.action] ?? log.action}{" "}
                  {log.entity.toLowerCase()}
                  {log.entityId ? ` (${log.entityId.slice(0, 8)}…)` : ""}
                </p>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
