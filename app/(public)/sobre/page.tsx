import type { Metadata } from "next";
import { Building2, Compass, HeartHandshake, ShieldCheck } from "lucide-react";

import { RichContent } from "@/components/public/rich-content";
import { SectionHeading } from "@/components/public/section-heading";
import { getPublishedPageBySlug } from "@/lib/services/pages";
import { getSiteSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre a Loja",
  description:
    "Conheça a história, a missão e os valores da Loja Fraternidade da Luz nº 181.",
};

const principles = [
  {
    icon: Compass,
    title: "Missão",
    text: "Promover o aperfeiçoamento moral, intelectual e social dos seus membros e o serviço à comunidade.",
  },
  {
    icon: ShieldCheck,
    title: "Princípios",
    text: "Respeito à tradição, à liberdade de consciência e aos valores fraternais e éticos.",
  },
  {
    icon: HeartHandshake,
    title: "Atuação",
    text: "Incentivo à caridade, à cultura e a ações de interesse social, dentro dos limites institucionais.",
  },
  {
    icon: Building2,
    title: "Vinculação",
    text: "Jurisdicionada à Grande Loja do Estado da Bahia (GLEB), integrando sua estrutura institucional.",
  },
];

export default async function SobrePage() {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getPublishedPageBySlug("sobre").catch(() => null),
  ]);

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="Institucional"
            title={page?.title || "Sobre a Loja"}
            description={`${settings.lodgeName}${
              settings.lodgeNumber ? ` nº ${settings.lodgeNumber}` : ""
            } — ${settings.jurisdictionName}`}
          />
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {page ? (
            <RichContent html={page.content} />
          ) : (
            <div className="space-y-4 text-slate-600">
              <h2 className="font-display text-2xl font-semibold text-brand-950">
                Nossa história
              </h2>
              <p>
                O conteúdo histórico desta página ainda não foi cadastrado no
                painel administrativo.
              </p>
              <p className="rounded-md border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900">
                <strong>Conteúdo provisório:</strong> este texto é apenas um
                exemplo. A data de fundação, os dirigentes e os acontecimentos
                oficiais devem ser informados pela administração e publicados
                aqui sem que seja necessário alterar o código do site.
              </p>
              <p>
                Enquanto isso, esta página apresenta os princípios
                institucionais e a vinculação da Loja à sua potência
                jurisdicional.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {principles.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Icon className="size-6 text-gold-600" />
              <h3 className="mt-3 font-display text-lg font-semibold text-brand-950">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {text}
              </p>
            </div>
          ))}
        </aside>
      </section>
    </>
  );
}
