"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Formulário de exclusão com confirmação.
 * A autorização é verificada no servidor na própria Server Action.
 */
export function DeleteForm({
  action,
  id,
  confirmMessage = "Tem certeza que deseja excluir? Esta ação não pode ser desfeita.",
  label = "Excluir",
  iconOnly = false,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size={iconOnly ? "icon" : "sm"}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        aria-label={label}
        title={label}
      >
        <Trash2 className="size-4" />
        {!iconOnly && label}
      </Button>
    </form>
  );
}
