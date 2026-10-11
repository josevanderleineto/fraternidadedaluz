"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/validation/schemas";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
      {!pending && <LogIn className="size-4" />}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state && !state.success && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      <SubmitButton />

      <p className="text-center text-xs text-slate-500">
        Não há cadastro público. O acesso é restrito a administradores
        autorizados.
      </p>
    </form>
  );
}
