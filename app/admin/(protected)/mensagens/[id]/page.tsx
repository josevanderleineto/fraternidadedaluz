import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MailCheck, MailOpen } from "lucide-react";

import { DeleteForm } from "@/components/admin/delete-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteMessageAction,
  toggleMessageReadAction,
  toggleMessageRepliedAction,
} from "@/lib/actions/messages";
import { requireUser } from "@/lib/auth/dal";
import { getMessage, setMessageRead } from "@/lib/services/contact";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mensagem",
  robots: { index: false, follow: false },
};

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  let message = await getMessage(id);
  if (!message) notFound();

  // Ao abrir, marca automaticamente como lida.
  if (!message.isRead) {
    await setMessageRead(id, true);
    message = { ...message, isRead: true, readAt: new Date() };
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/mensagens"
        className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Voltar para mensagens
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-950">
            {message.subject}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Recebida em {formatDateTime(message.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {message.isReplied ? (
            <Badge variant="success">Respondida</Badge>
          ) : (
            <Badge variant="warning">Aguardando resposta</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
            {message.message}
          </p>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Remetente
            </p>
            <p className="mt-1 font-medium text-brand-950">{message.name}</p>
            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(
                `Re: ${message.subject}`,
              )}`}
              className="text-sm text-brand-700 hover:underline"
            >
              {message.email}
            </a>

            <div className="mt-4 flex flex-col gap-2">
              <Button asChild>
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${message.subject}`,
                  )}`}
                >
                  <Mail className="size-4" />
                  Responder por e-mail
                </a>
              </Button>

              <form action={toggleMessageRepliedAction}>
                <input type="hidden" name="id" value={message.id} />
                <input
                  type="hidden"
                  name="isReplied"
                  value={message.isReplied ? "false" : "true"}
                />
                <Button type="submit" variant="outline" className="w-full">
                  {message.isReplied ? (
                    <>
                      <MailOpen className="size-4" />
                      Desmarcar resposta
                    </>
                  ) : (
                    <>
                      <MailCheck className="size-4" />
                      Marcar como respondida
                    </>
                  )}
                </Button>
              </form>

              <form action={toggleMessageReadAction}>
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="isRead" value="false" />
                <Button type="submit" variant="ghost" className="w-full">
                  Marcar como não lida
                </Button>
              </form>

              <DeleteForm
                action={deleteMessageAction}
                id={message.id}
                label="Excluir mensagem"
                confirmMessage="Excluir esta mensagem definitivamente?"
              />
            </div>
          </div>

          {message.userAgent && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-medium text-slate-600">Origem</p>
              <p className="mt-1 break-all">{message.userAgent}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
