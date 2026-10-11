"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Registra no console do servidor/cliente sem expor dados sensíveis na UI.
    console.error("Erro na aplicação:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <AlertTriangle className="size-12 text-gold-500" />
      <h1 className="mt-6 font-display text-2xl font-semibold text-brand-950">
        Algo deu errado
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        Não foi possível carregar esta página. Tente novamente em instantes.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Ir para o início
        </Button>
      </div>
    </div>
  );
}
