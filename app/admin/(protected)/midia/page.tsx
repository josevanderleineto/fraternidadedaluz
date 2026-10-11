import type { Metadata } from "next";
import Image from "next/image";

import { DeleteForm } from "@/components/admin/delete-form";
import { CopyUrlButton, MediaUploader } from "@/components/admin/media-uploader";
import { Pagination } from "@/components/public/pagination";
import { requireUser } from "@/lib/auth/dal";
import { isStorageConfigured } from "@/lib/env";
import { deleteMediaAction } from "@/lib/actions/media";
import { listMedia } from "@/lib/services/media";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mídia",
  robots: { index: false, follow: false },
};

function storageReady(): boolean {
  try {
    return isStorageConfigured();
  } catch {
    return false;
  }
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; ok?: string; erro?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [media, ready] = await Promise.all([
    listMedia({ page, perPage: 24 }),
    Promise.resolve(storageReady()),
  ]);

  const buildHref = (target: number) =>
    target > 1 ? `/admin/midia?page=${target}` : "/admin/midia";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-950">
          Mídia
        </h1>
        <p className="text-sm text-slate-500">
          {media.total} arquivo(s) armazenado(s) no serviço externo.
        </p>
      </div>

      {params.ok && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Operação realizada com sucesso.
        </div>
      )}
      {params.erro && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Não foi possível concluir a operação.
        </div>
      )}

      <MediaUploader disabled={!ready} />

      {media.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-500">
          Nenhuma imagem enviada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-square bg-slate-100">
                <Image
                  src={item.secureUrl}
                  alt={item.alt || item.originalName || "Imagem"}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 p-3">
                <p className="truncate text-xs text-slate-500" title={item.originalName ?? ""}>
                  {item.originalName ?? item.publicId}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatDateTime(item.createdAt)}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <CopyUrlButton url={item.secureUrl} />
                  <DeleteForm
                    action={deleteMediaAction}
                    id={item.id}
                    iconOnly
                    confirmMessage="Excluir esta imagem? Ela será removida do armazenamento e dos locais onde estiver em uso."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={media.page}
        totalPages={media.totalPages}
        buildHref={buildHref}
      />
    </div>
  );
}
