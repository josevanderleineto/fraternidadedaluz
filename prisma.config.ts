// Configuração do Prisma CLI (Prisma ORM v7).
// As URLs de conexão NÃO ficam mais no schema.prisma — ficam aqui.
// O CLI (migrate/db) usa a conexão direta; a aplicação em runtime usa o
// driver adapter com a conexão pooled (ver lib/db.ts).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // CLI usa conexão direta quando disponível (Neon: host sem "-pooler").
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
