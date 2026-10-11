import "server-only";
import { z } from "zod";

/**
 * Validação centralizada das variáveis de ambiente.
 *
 * A validação é feita de forma preguiçosa (lazy), na primeira leitura, para que
 * o `next build` não falhe por variáveis ausentes que só são necessárias em
 * tempo de execução (ex.: SESSION_SECRET). Segredos NUNCA são expostos ao
 * navegador — este módulo é marcado como `server-only`.
 */

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Banco de dados — obrigatório em tempo de execução.
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória."),
  // Conexão direta usada pelo Prisma CLI (migrações). Opcional em runtime.
  DIRECT_URL: z.string().optional().or(z.literal("")),

  // Aplicação
  APP_URL: z.string().url().default("http://localhost:3000"),

  // Sessão (iron-session exige no mínimo 32 caracteres).
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET deve ter pelo menos 32 caracteres."),

  // Armazenamento de imagens (Cloudinary) — opcional, habilita uploads.
  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal("")),
  CLOUDINARY_FOLDER: z.string().default("fraternidade-da-luz"),

  // Administrador inicial (apenas para o script de bootstrap).
  INITIAL_ADMIN_EMAIL: z.string().optional().or(z.literal("")),
  INITIAL_ADMIN_PASSWORD: z.string().optional().or(z.literal("")),
  INITIAL_ADMIN_NAME: z.string().optional().or(z.literal("")),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/**
 * Retorna as variáveis de ambiente validadas. Lança erro descritivo (sem
 * expor valores) caso alguma variável obrigatória esteja ausente/inválida.
 */
export function getEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(
      `Variáveis de ambiente inválidas ou ausentes: ${missing}. Consulte o .env.example.`,
    );
  }

  cached = parsed.data;
  return cached;
}

/**
 * Verifica se o armazenamento de imagens (Cloudinary) está configurado.
 */
export function isStorageConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
  );
}
