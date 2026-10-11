"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { DeleteForm } from "@/components/admin/delete-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/lib/actions/users";
import type { ActionState } from "@/lib/validation/schemas";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
  lastLogin: string | null;
  isSelf: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : label}
    </Button>
  );
}

function UserForm({
  editing,
  onDone,
}: {
  editing: AdminUserRow | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const action = editing
    ? updateUserAction.bind(null, editing.id)
    : createUserAction;

  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    undefined,
  );
  const [role, setRole] = useState<"ADMIN" | "EDITOR">(
    editing?.role ?? "EDITOR",
  );
  const [active, setActive] = useState(editing?.active ?? true);

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
          defaultValue={editing?.name ?? ""}
          required
          maxLength={120}
          aria-invalid={Boolean(errors?.name)}
        />
        {errors?.name && (
          <p className="text-xs text-red-600">{errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={editing?.email ?? ""}
          required
          aria-invalid={Boolean(errors?.email)}
        />
        {errors?.email && (
          <p className="text-xs text-red-600">{errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {editing ? "Nova senha (deixe em branco para manter)" : "Senha *"}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required={!editing}
          aria-invalid={Boolean(errors?.password)}
        />
        <p className="text-xs text-slate-500">
          Mínimo de 8 caracteres, com ao menos uma letra e um número.
        </p>
        {errors?.password && (
          <p className="text-xs text-red-600">{errors.password[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função</Label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "EDITOR")}
          className="h-10 w-full rounded-md border border-brand-200 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="EDITOR">Editor (conteúdo)</option>
          <option value="ADMIN">Administrador (acesso total)</option>
        </select>
      </div>

      <div className="flex items-center justify-between rounded-md border border-slate-200 p-3">
        <Label htmlFor="active">Conta ativa</Label>
        <Switch id="active" checked={active} onCheckedChange={setActive} />
        <input
          type="hidden"
          name="active"
          value={active ? "true" : "false"}
        />
      </div>

      <SubmitButton label={editing ? "Salvar" : "Criar usuário"} />
    </form>
  );
}

export function UserManager({
  users,
  errorMessage,
}: {
  users: AdminUserRow[];
  errorMessage?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (user: AdminUserRow) => {
    setEditing(user);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-950">
            Usuários
          </h1>
          <p className="text-sm text-slate-500">
            {users.length} usuário(s) com acesso ao painel.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Novo usuário
        </Button>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Não existe cadastro público. Crie contas apenas para pessoas
        autorizadas e use senhas fortes.
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-brand-950">{user.name}</p>
                  <Badge variant={user.role === "ADMIN" ? "gold" : "secondary"}>
                    {user.role === "ADMIN" ? "Administrador" : "Editor"}
                  </Badge>
                  {!user.active && <Badge variant="danger">Inativo</Badge>}
                  {user.isSelf && <Badge variant="outline">Você</Badge>}
                </div>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400">
                  Último acesso: {user.lastLogin ?? "nunca"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar"
                  onClick={() => openEdit(user)}
                >
                  <Pencil className="size-4" />
                </Button>
                {!user.isSelf && (
                  <DeleteForm
                    action={deleteUserAction}
                    id={user.id}
                    iconOnly
                    confirmMessage={`Excluir o usuário “${user.name}”?`}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar usuário" : "Novo usuário"}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <UserForm
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
