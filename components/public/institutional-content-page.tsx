import { RichContent } from "@/components/public/rich-content";
import { SectionHeading } from "@/components/public/section-heading";
import { getPublishedPageBySlug } from "@/lib/services/pages";

/**
 * Página institucional genérica: usa o conteúdo cadastrado no painel (por slug)
 * e, na ausência dele, exibe um conteúdo alternativo fornecido.
 */
export async function InstitutionalContentPage({
  slug,
  eyebrow,
  title,
  fallback,
}: {
  slug: string;
  eyebrow: string;
  title: string;
  fallback: React.ReactNode;
}) {
  const page = await getPublishedPageBySlug(slug).catch(() => null);

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-page py-16">
          <SectionHeading eyebrow={eyebrow} title={page?.title || title} />
        </div>
      </section>
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          {page ? <RichContent html={page.content} /> : fallback}
        </div>
      </section>
    </>
  );
}
