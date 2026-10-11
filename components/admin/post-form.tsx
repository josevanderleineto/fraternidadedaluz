"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Eye, Save, Wand2 } from "lucide-react";

import { ImageUploader } from "@/components/admin/image-uploader";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";

export type PostFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  keywords: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt: string; // ISO or ""
  categoryIds: string[];
};

function toDateTimeLocal(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : label}
      {!pending && <Save className="size-4" />}
    </Button>
  );
}

export function PostForm({
  action,
  categories,
  initial,
  submitLabel = "Salvar",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  categories: { id: string; name: string }[];
  initial?: PostFormData;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    undefined,
  );

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.coverImageUrl ?? "",
  );
  const [coverImageAlt, setCoverImageAlt] = useState(
    initial?.coverImageAlt ?? "",
  );
  const [keywords, setKeywords] = useState(initial?.keywords ?? "");
  const [status, setStatus] = useState<PostFormData["status"]>(
    initial?.status ?? "DRAFT",
  );
  const [publishedAt, setPublishedAt] = useState(
    toDateTimeLocal(initial?.publishedAt ?? ""),
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categoryIds ?? [],
  );

  const errors = state && !state.success ? state.errors : undefined;

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              aria-invalid={Boolean(errors?.title)}
            />
            {errors?.title && (
              <p className="text-xs text-red-600">{errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="gerado-automaticamente"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setSlug(slugify(title))}
                title="Gerar a partir do título"
              >
                <Wand2 className="size-4" />
                Gerar
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Endereço: <code>/blog/{slug || "…"}</code>
            </p>
            {errors?.slug && (
              <p className="text-xs text-red-600">{errors.slug[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={400}
              rows={3}
              placeholder="Breve resumo exibido nas listagens e na busca."
            />
          </div>

          <div className="space-y-2">
            <Label>Conteúdo *</Label>
            <TiptapEditor
              value={content}
              onChange={setContent}
              placeholder="Escreva o conteúdo da publicação…"
            />
            <input type="hidden" name="content" value={content} />
            {errors?.content && (
              <p className="text-xs text-red-600">{errors.content[0]}</p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as PostFormData["status"])
                  }
                  className="h-10 w-full rounded-md border border-brand-200 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="DRAFT">Rascunho</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="SCHEDULED">Agendado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedAt">Data de publicação</Label>
                <input
                  id="publishedAt"
                  name="publishedAt"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="h-10 w-full rounded-md border border-brand-200 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
                />
                <p className="text-xs text-slate-500">
                  Para conteúdo agendado, informe uma data futura.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Palavras-chave</Label>
                <Input
                  id="keywords"
                  name="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="separadas, por, vírgula"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <Label className="mb-3 block">Categorias</Label>
            {categories.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhuma categoria cadastrada.{" "}
                <Link href="/admin/categorias" className="underline">
                  Cadastrar agora
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={cat.id}
                      checked={categoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="size-4 rounded border-slate-300"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <ImageUploader
              url={coverImageUrl}
              onUrlChange={setCoverImageUrl}
              urlName="coverImageUrl"
              alt={coverImageAlt}
              onAltChange={setCoverImageAlt}
              altName="coverImageAlt"
            />
          </div>

          <div className="flex flex-col gap-2">
            <SubmitButton label={submitLabel} />
            {initial?.id && status === "PUBLISHED" && slug && (
              <Button asChild variant="outline">
                <Link href={`/blog/${slug}`} target="_blank">
                  <Eye className="size-4" />
                  Visualizar no site
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/admin/posts">Cancelar</Link>
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
