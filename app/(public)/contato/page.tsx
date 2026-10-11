import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/public/contact-form";
import { SectionHeading } from "@/components/public/section-heading";
import { getSiteSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com a Loja Fraternidade da Luz nº 181. Envie sua mensagem pelo formulário.",
};

export default async function ContatoPage() {
  const settings = await getSiteSettings();

  const contacts = [
    settings.email && {
      icon: Mail,
      label: "E-mail",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings.phone && {
      icon: Phone,
      label: "Telefone",
      value: settings.phone,
    },
    settings.address && {
      icon: MapPin,
      label: "Endereço",
      value: settings.address,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    href?: string;
  }[];

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="Fale conosco"
            title="Contato"
            description="Envie sua mensagem, dúvida ou sugestão. Teremos prazer em responder."
          />
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-950">
            Envie uma mensagem
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Os campos marcados com * são obrigatórios.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Canais oficiais
            </h2>
            {contacts.length > 0 ? (
              <ul className="mt-4 space-y-4 text-sm">
                {contacts.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 size-4 shrink-0 text-gold-600" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-brand-800 hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-brand-800">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Os canais oficiais de contato serão publicados em breve. Você
                pode utilizar o formulário ao lado.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-6">
            <Clock className="size-5 text-brand-700" />
            <h2 className="mt-3 font-display text-lg font-semibold text-brand-950">
              Atendimento
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              O prazo de resposta pode variar conforme o volume de mensagens.
              Todas as solicitações são registradas e tratadas de forma
              confidencial.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Ao enviar a mensagem, você concorda com o tratamento dos seus dados
            conforme a nossa{" "}
            <Link href="/privacidade" className="underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </aside>
      </section>
    </>
  );
}
