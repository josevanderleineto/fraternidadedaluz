import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Cliente Prisma (singleton).
 *
 * Prisma ORM v7 usa "Query Compiler" + driver adapter: a conexão é feita pelo
 * driver `pg` através de `@prisma/adapter-pg`, e não mais por um engine nativo.
 * Em ambientes serverless (Vercel) o pool é gerenciado pelo próprio provedor
 * quando se usa a URL pooled (Neon "-pooler").
 *
 * O singleton evita abrir múltiplas conexões durante o hot-reload em dev.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function secureConnectionString(connectionString: string) {
  const url = new URL(connectionString);

  // pg is changing the meaning of `sslmode=require`. `verify-full` preserves
  // the current strict certificate verification and avoids the deprecation
  // warning emitted by pg-connection-string.
  if (url.searchParams.get("sslmode") === "require") {
    url.searchParams.set("sslmode", "verify-full");
  }

  return url.toString();
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está definida. Configure o arquivo .env (veja .env.example).",
    );
  }

  const adapter = new PrismaPg({
    connectionString: secureConnectionString(connectionString),
    // Tempo máximo de espera por uma conexão do pool (ms).
    connectionTimeoutMillis: 10_000,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
