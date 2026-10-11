"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/lib/actions/contact";
import type { ActionState } from "@/lib/validation/schemas";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Enviando…" : "Enviar mensagem"}
      {!pending && <Send className="size-4" />}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    submitContact,
    undefined,
  );

  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state && (
        <div
          role="status"
          className={
            state.success
              ? "flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              : "flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          }
        >
          {state.success ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
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
            required
            maxLength={160}
            aria-invalid={Boolean(errors?.email)}
          />
          {errors?.email && (
            <p className="text-xs text-red-600">{errors.email[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Assunto *</Label>
        <Input
          id="subject"
          name="subject"
          required
          maxLength={160}
          aria-invalid={Boolean(errors?.subject)}
        />
        {errors?.subject && (
          <p className="text-xs text-red-600">{errors.subject[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Mensagem *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          aria-invalid={Boolean(errors?.message)}
        />
        {errors?.message && (
          <p className="text-xs text-red-600">{errors.message[0]}</p>
        )}
      </div>

      {/* Campo-armadilha anti-spam: invisível para pessoas. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton />
    </form>
  );
}
