"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSettingsAction } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/validation/schemas";
import type { SiteSettingsData } from "@/lib/services/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Salvando…" : "Salvar configurações"}
      {!pending && <Save className="size-4" />}
    </Button>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  name: keyof SiteSettingsData;
  defaultValue: string;
  error?: string;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettingsData }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateSettingsAction,
    undefined,
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");

  const errors = state && !state.success ? state.errors : undefined;
  const s = (key: keyof SiteSettingsData) => String(settings[key] ?? "");

  return (
    <form action={formAction} className="space-y-8">
      {state && (
        <div
          role="status"
          className={
            state.success
              ? "flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              : "flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          }
        >
          {state.success ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-950">
          Identificação institucional
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Estes dados aparecem no topo, no rodapé e nas páginas do site.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="Nome do site *"
            name="siteName"
            defaultValue={s("siteName")}
            error={errors?.siteName?.[0]}
          />
          <Field
            label="Nome da Loja *"
            name="lodgeName"
            defaultValue={s("lodgeName")}
            error={errors?.lodgeName?.[0]}
          />
          <Field
            label="Número da Loja"
            name="lodgeNumber"
            defaultValue={s("lodgeNumber")}
            error={errors?.lodgeNumber?.[0]}
          />
          <Field
            label="Potência jurisdicional"
            name="jurisdictionName"
            defaultValue={s("jurisdictionName")}
            placeholder="Ex.: Grande Loja do Estado da Bahia"
            error={errors?.jurisdictionName?.[0]}
          />
        </div>

        <div className="mt-6 max-w-sm">
          <ImageUploader
            url={logoUrl}
            onUrlChange={setLogoUrl}
            urlName="logoUrl"
            label="Logotipo institucional"
            previewStyle="contain-dark"
          />
          <p className="mt-2 text-xs text-slate-500">
            Envie o logotipo oficial autorizado. Enquanto não houver imagem, o
            site exibe um símbolo genérico.
          </p>
          <input
            type="hidden"
            name="logoPublicId"
            value={settings.logoPublicId ?? ""}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-950">
          Textos institucionais
        </h2>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (SEO e apresentação)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={s("description")}
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortAbout">
              Resumo (usado na página inicial e no rodapé)
            </Label>
            <Textarea
              id="shortAbout"
              name="shortAbout"
              defaultValue={s("shortAbout")}
              rows={3}
              maxLength={1000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footerText">Texto do rodapé</Label>
            <Input
              id="footerText"
              name="footerText"
              defaultValue={s("footerText")}
              maxLength={500}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-950">
          Contato e redes sociais
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Preencha apenas os dados oficiais autorizados. Campos vazios não são
          exibidos no site.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="E-mail institucional"
            name="email"
            type="email"
            defaultValue={s("email")}
            error={errors?.email?.[0]}
          />
          <Field
            label="Telefone"
            name="phone"
            defaultValue={s("phone")}
            error={errors?.phone?.[0]}
          />
          <Field
            label="WhatsApp"
            name="whatsapp"
            defaultValue={s("whatsapp")}
            error={errors?.whatsapp?.[0]}
          />
          <Field
            label="Endereço"
            name="address"
            defaultValue={s("address")}
            error={errors?.address?.[0]}
          />
          <Field
            label="Facebook (URL)"
            name="facebookUrl"
            type="url"
            defaultValue={s("facebookUrl")}
            error={errors?.facebookUrl?.[0]}
          />
          <Field
            label="Instagram (URL)"
            name="instagramUrl"
            type="url"
            defaultValue={s("instagramUrl")}
            error={errors?.instagramUrl?.[0]}
          />
          <Field
            label="YouTube (URL)"
            name="youtubeUrl"
            type="url"
            defaultValue={s("youtubeUrl")}
            error={errors?.youtubeUrl?.[0]}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-brand-950">
          Otimização para buscadores (SEO)
        </h2>
        <div className="mt-6 grid gap-5">
          <Field
            label="Título padrão do site"
            name="metaTitle"
            defaultValue={s("metaTitle")}
            error={errors?.metaTitle?.[0]}
          />
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Descrição padrão do site</Label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              defaultValue={s("metaDescription")}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>
      </section>

      <SubmitButton />
    </form>
  );
}
