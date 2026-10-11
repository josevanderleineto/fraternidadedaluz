/**
 * Seed idempotente: cria as configurações, categorias e páginas institucionais
 * básicas. NÃO cria fatos históricos — apenas conteúdo provisório claramente
 * identificado e editável no painel.
 *
 * Executar com: npm run db:seed
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("✖ Defina DATABASE_URL no arquivo .env antes de executar o seed.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const provisionalNote =
  '<p class="text-sm italic text-slate-500">(Conteúdo provisório de exemplo — edite no painel administrativo.)</p>';

const pages = [
  {
    slug: "sobre",
    title: "Sobre a Loja",
    menuOrder: 1,
    showInMenu: true,
    content: `<h2>Nossa história</h2>
<p>Esta é uma página institucional editável. Substitua o texto abaixo pela história oficial da Loja Fraternidade da Luz nº 181, pela data de fundação e pelos nomes dos dirigentes, quando autorizado.</p>
<h2>Missão e valores</h2>
<p>A Loja dedica-se ao aperfeiçoamento moral e intelectual de seus membros e à prática da fraternidade e da caridade.</p>
<h2>Vinculação</h2>
<p>A Loja Fraternidade da Luz nº 181 é jurisdicionada à Grande Loja do Estado da Bahia (GLEB).</p>
${provisionalNote}`,
  },
  {
    slug: "privacidade",
    title: "Política de Privacidade",
    menuOrder: 0,
    showInMenu: false,
    content: `<p>Este texto descreve como tratamos os dados enviados pelo formulário de contato, em conformidade com a LGPD.</p>
<h2>Dados coletados</h2>
<p>Coletamos nome, e-mail, assunto e mensagem, usados exclusivamente para responder à solicitação.</p>
<h2>Seus direitos</h2>
<p>Você pode solicitar acesso, correção ou exclusão dos seus dados pelos canais oficiais de contato.</p>
${provisionalNote}`,
  },
  {
    slug: "termos",
    title: "Termos de Uso",
    menuOrder: 0,
    showInMenu: false,
    content: `<p>Ao utilizar este site, você concorda com os termos descritos abaixo.</p>
<h2>Finalidade</h2>
<p>Site de caráter institucional e informativo.</p>
<h2>Conteúdo</h2>
<p>É vedada a reprodução de textos e imagens sem autorização.</p>
${provisionalNote}`,
  },
];

const categories = [
  { name: "Notícias", slug: "noticias", description: "Notícias e novidades da Loja." },
  { name: "Comunicados", slug: "comunicados", description: "Comunicados oficiais." },
  { name: "Eventos", slug: "eventos", description: "Eventos e encontros." },
];

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
  console.log("✔ Configurações institucionais garantidas.");

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        published: true,
        publishedAt: new Date(),
        showInMenu: page.showInMenu,
        menuOrder: page.menuOrder,
      },
      update: {},
    });
  }
  console.log(`✔ ${pages.length} páginas institucionais garantidas.`);

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: {},
    });
  }
  console.log(`✔ ${categories.length} categorias garantidas.`);
}

main()
  .catch((error) => {
    console.error("✖ Falha no seed:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
