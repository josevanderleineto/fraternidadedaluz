import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RichContent } from "@/components/public/rich-content";
import { SectionHeading } from "@/components/public/section-heading";
import { getPublishedPageBySlug } from "@/lib/services/pages";
import { absoluteUrl, truncate, stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug).catch(() => null);
  if (!page) return { title: "Página não encontrada" };

  return {
    title: page.metaTitle || page.title,
    description:
      page.metaDescription || truncate(stripHtml(page.content), 160),
    alternates: { canonical: absoluteUrl(`/${page.slug}`) },
  };
}

export default async function InstitutionalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug).catch(() => null);

  if (!page) notFound();

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-page py-16">
          <SectionHeading eyebrow="Institucional" title={page.title} />
        </div>
      </section>
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <RichContent html={page.content} />
        </div>
      </section>
    </>
  );
}
