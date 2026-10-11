import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HandHeart,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";

import { PostCard } from "@/components/public/post-card";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { listPublishedPosts } from "@/lib/services/posts";
import { getSiteSettings } from "@/lib/services/settings";
import { listMedia } from "@/lib/services/media";

export const dynamic = "force-dynamic";

const values = [
  {
    icon: Users,
    title: "Fraternidade",
    text: "União entre os irmãos em torno do respeito, da amizade e do apoio mútuo.",
  },
  {
    icon: ScrollText,
    title: "Aperfeiçoamento",
    text: "Busca constante do conhecimento, da virtude e do crescimento moral.",
  },
  {
    icon: HandHeart,
    title: "Serviço à sociedade",
    text: "Incentivo à caridade, à solidariedade e a ações de utilidade pública.",
  },
];

export default async function HomePage() {
  const [settings, recentPosts, gallery] = await Promise.all([
    getSiteSettings(),
    listPublishedPosts({ perPage: 3 }).catch(() => ({ items: [] })),
    listMedia({ perPage: 6 }).catch(() => ({ items: [] })),
  ]);

  const lodgeTitle = `${settings.lodgeName}${
    settings.lodgeNumber ? ` nº ${settings.lodgeNumber}` : ""
  }`;

  return (
    <>
      {/* Hero institucional */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
        />
        <div className="container-page relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-300">
              <Sparkles className="size-3.5" />
              {settings.jurisdictionName}
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {lodgeTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100">
              {settings.shortAbout || settings.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gold">
                <Link href="/sobre">
                  Conheça a instituição
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/blog">Notícias e publicações</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Fraternidade" },
                { icon: BookOpen, label: "Conhecimento" },
                { icon: HandHeart, label: "Caridade" },
                { icon: ScrollText, label: "Tradição" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:border-gold-500/40"
                >
                  <Icon className="size-7 text-gold-400" />
                  <p className="mt-4 font-display text-lg">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Apresentação */}
      <section className="container-page py-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Quem somos"
            title="Uma instituição dedicada à fraternidade e ao bem"
            description={settings.shortAbout || settings.description || ""}
          />
          <div className="space-y-4 text-slate-600">
            <p>
              A Loja Fraternidade da Luz nº 181 integra a{" "}
              {settings.jurisdictionName}, dedicando-se ao aperfeiçoamento
              moral, intelectual e social dos seus membros e à prática da
              fraternidade.
            </p>
            <p className="rounded-md border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900">
              <strong>Aviso:</strong> os textos institucionais exibidos neste
              site são provisórios de exemplo e devem ser substituídos pelos
              conteúdos oficiais no painel administrativo.
            </p>
            <Button asChild variant="outline">
              <Link href="/sobre">
                Ler mais sobre a Loja
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="container-page py-20">
          <SectionHeading
            align="center"
            eyebrow="Nossos princípios"
            title="Valores que orientam nossa trajetória"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-900">
                  <Icon className="size-6 text-gold-400" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-brand-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notícias recentes */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Blog"
            title="Notícias e publicações recentes"
          />
          <Button asChild variant="ghost" className="text-brand-900">
            <Link href="/blog">
              Ver todas
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {recentPosts.items.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Ainda não há publicações. As notícias aparecerão aqui assim que
            forem publicadas no painel administrativo.
          </p>
        )}
      </section>

      {/* Galeria */}
      {gallery.items.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="container-page py-20">
            <SectionHeading
              align="center"
              eyebrow="Galeria"
              title="Registros da nossa Loja"
            />
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {gallery.items.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <Image
                    src={item.secureUrl}
                    alt={item.alt || "Imagem institucional"}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-2xl bg-brand-900 px-8 py-14 text-center text-white sm:px-16">
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl"
          />
          <h2 className="relative font-display text-3xl font-semibold sm:text-4xl">
            Deseja conhecer a nossa instituição?
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-brand-100">
            Entre em contato para saber mais sobre a Loja Fraternidade da Luz nº
            181 e suas atividades.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button asChild size="lg" variant="gold">
              <Link href="/contato">
                Fale conosco
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
