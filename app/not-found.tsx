import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-950 px-6 text-center text-white">
      <Compass className="size-12 text-gold-400" />
      <p className="mt-6 font-display text-6xl font-semibold text-gold-400">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-semibold">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-brand-100">
        O conteúdo que você procura pode ter sido movido, removido ou nunca
        existiu.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="gold">
          <Link href="/">Voltar ao início</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/blog">Ver notícias</Link>
        </Button>
      </div>
    </div>
  );
}
