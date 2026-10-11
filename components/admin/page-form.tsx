"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Eye, Save, Wand2 } from "lucide-react";

import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";

export type PageFormValues = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
  showInMenu: boolean;
  menuOrder: number;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : label}
      {!pending && <Save className="size-4" />}
    </Button>
  );
}

export function PageForm({
  action,
  initial,
  submitLabel = "Salvar",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: PageFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    undefined,
  );

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? "",
  );
  const [published, setPublished] = useState(initial?.published ?? false);
  const [showInMenu, setShowInMenu] = useState(initial?.showInMenu ?? false);
  const [menuOrder, setMenuOrder] = useState(initial?.menuOrder ?? 0);

  const errors = state && !state.success ? state.errors : undefined;

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
              required
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
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
              >
                <Wand2 className="size-4" />
                Gerar
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Endereço: <code>/{slug || "…"}</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo *</Label>
            <TiptapEditor value={content} onChange={setContent} />
            <input type="hidden" name="content" value={content} />
            {errors?.content && (
              <p className="text-xs text-red-600">{errors.content[0]}</p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Label htmlFor="published">Publicada</Label>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <input
                type="hidden"
                name="published"
                value={published ? "true" : "false"}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showInMenu">Exibir no menu</Label>
              <Switch
                id="showInMenu"
                checked={showInMenu}
                onCheckedChange={setShowInMenu}
              />
              <input
                type="hidden"
                name="showInMenu"
                value={showInMenu ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menuOrder">Ordem no menu</Label>
              <Input
                id="menuOrder"
                name="menuOrder"
                type="number"
                min={0}
                max={999}
                value={menuOrder}
                onChange={(e) => setMenuOrder(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-brand-950">
              Otimização (SEO)
            </p>
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-xs text-slate-500">
                Título para buscadores
              </Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                value={metaTitle}
                maxLength={200}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="metaDescription"
                className="text-xs text-slate-500"
              >
                Descrição para buscadores
              </Label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                value={metaDescription}
                rows={3}
                maxLength={300}
                onChange={(e) => setMetaDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <SubmitButton label={submitLabel} />
            {initial?.id && published && slug && (
              <Button asChild variant="outline">
                <Link href={`/${slug}`} target="_blank">
                  <Eye className="size-4" />
                  Visualizar no site
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/admin/paginas">Cancelar</Link>
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
