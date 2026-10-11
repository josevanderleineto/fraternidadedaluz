/**
 * Script de criação segura do primeiro administrador.
 *
 * Uso:
 *   npm run admin:create
 *   (lê INITIAL_ADMIN_NAME / INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD do .env)
 *
 * Ou passando argumentos:
 *   npx tsx scripts/create-admin.ts --email=admin@org --password=SenhaForte123 --name=Administrador
 *
 * Este script é independente do runtime do Next (não importa módulos
 * marcados como "server-only"). NÃO existe cadastro público de administradores.
 */
import "dotenv/config";

import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[a-zA-Z]/.test(password)) return "A senha deve conter ao menos uma letra.";
  if (!/[0-9]/.test(password)) return "A senha deve conter ao menos um número.";
  return null;
}

async function main() {
  const connectionString =
    process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(
      "✖ Defina DATABASE_URL (e, de preferência, DIRECT_URL) no arquivo .env.",
    );
    process.exit(1);
  }

  const email = (
    getArg("email") ||
    process.env.INITIAL_ADMIN_EMAIL ||
    ""
  )
    .trim()
    .toLowerCase();
  const password =
    getArg("password") || process.env.INITIAL_ADMIN_PASSWORD || "";
  const name =
    getArg("name") || process.env.INITIAL_ADMIN_NAME || "Administrador";

  if (!email || !password) {
    console.error(
      "✖ Informe e-mail e senha (via .env ou argumentos --email/--password).",
    );
    process.exit(1);
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`✖ ${passwordError}`);
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await hash(password, 12);
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: { passwordHash, name, role: "ADMIN", active: true },
      });
      console.log(`✔ Administrador atualizado: ${email}`);
    } else {
      await prisma.user.create({
        data: { name, email, passwordHash, role: "ADMIN", active: true },
      });
      console.log(`✔ Administrador criado: ${email}`);
    }

    console.log("  Acesse /admin e faça login com as credenciais definidas.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "✖ Falha ao criar o administrador:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
