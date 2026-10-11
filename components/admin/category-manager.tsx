"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { DeleteForm } from "@/components/admin/delete-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/actions/categories";
import type { ActionState } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : label}
    </Button>
  );
}

function CategoryForm({
  editing,
  onDone,
}: {
  editing: Category | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const action = editing
    ? updateCategoryAction.bind(null, editing.id)
    : createCategoryAction;

  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    undefined,
  );
  const [name, setName] = useState(editing?.name ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Salvo com sucesso.");
      router.refresh();
      onDone();
    }
  }, [state, router, onDone]);

  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.success && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          value={name}
          required
          maxLength={80}
          onChange={(e) => {
            setName(e.target.value);
            if (!editing) setSlug(slugify(e.target.value));
          }}
          aria-invalid={Boolean(errors?.name)}
        />
        {errors?.name && (
          <p className="text-xs text-red-600">{errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="gerado-automaticamente"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          rows={2}
          maxLength={300}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <SubmitButton label={editing ? "Salvar" : "Criar categoria"} />
    </form>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditing(category);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-950">
            Categorias
          </h1>
          <p className="text-sm text-slate-500">
            {categories.length} categoria(s) cadastrada(s).
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {categories.length === 0 ? (
            <li className="p-8 text-center text-sm text-slate-500">
              Nenhuma categoria cadastrada.
            </li>
          ) : (
            categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand-950">{category.name}</p>
                  <p className="text-xs text-slate-500">
                    /blog?categoria={category.slug} · {category.postCount}{" "}
                    publicação(ões)
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <DeleteForm
                    action={deleteCategoryAction}
                    id={category.id}
                    iconOnly
                    confirmMessage={`Excluir a categoria “${category.name}”? As publicações não serão excluídas, apenas desvinculadas.`}
                  />
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar categoria" : "Nova categoria"}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <CategoryForm
              key={editing?.id ?? "new"}
              editing={editing}
              onDone={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
