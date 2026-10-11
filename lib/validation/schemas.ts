import { z } from "zod";

/**
 * Esquemas de validação (Zod) compartilhados entre formulários do cliente e
 * Server Actions. Este módulo é puro (sem dependências de servidor) para poder
 * ser importado em ambos os lados.
 */

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slug opcional: se vazio, é gerado a partir do título no servidor. */
export const slugField = z
  .string()
  .trim()
  .max(200, { error: "O slug deve ter no máximo 200 caracteres." })
  .refine((value) => value === "" || slugRegex.test(value), {
    error: "Use apenas letras minúsculas, números e hífens.",
  });

/** E-mail: normaliza espaços e maiúsculas ANTES de validar o formato. */
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Informe um e-mail válido." }));

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, { error: "A senha deve ter pelo menos 8 caracteres." })
    .max(200, { error: "Senha muito longa." }),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const postStatusEnum = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]);

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { error: "O título deve ter pelo menos 3 caracteres." })
    .max(200, { error: "Título muito longo." }),
  slug: slugField,
  excerpt: z
    .string()
    .trim()
    .max(400, { error: "O resumo deve ter no máximo 400 caracteres." })
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(1, { error: "O conteúdo é obrigatório." })
    .max(200_000, { error: "Conteúdo muito longo." }),
  coverImageUrl: z
    .string()
    .trim()
    .url({ error: "URL de imagem inválida." })
    .optional()
    .or(z.literal("")),
  coverImageAlt: z
    .string()
    .trim()
    .max(200, { error: "Texto alternativo muito longo." })
    .optional()
    .or(z.literal("")),
  keywords: z
    .string()
    .trim()
    .max(300, { error: "Palavras-chave muito longas." })
    .optional()
    .or(z.literal("")),
  status: postStatusEnum,
  publishedAt: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), {
      error: "Data de publicação inválida.",
    }),
  categoryIds: z.array(z.string().min(1)).default([]),
});
export type PostInput = z.infer<typeof postSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "O nome deve ter pelo menos 2 caracteres." })
    .max(80, { error: "Nome muito longo." }),
  slug: slugField,
  description: z
    .string()
    .trim()
    .max(300, { error: "A descrição deve ter no máximo 300 caracteres." })
    .optional()
    .or(z.literal("")),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const pageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "O título deve ter pelo menos 2 caracteres." })
    .max(200, { error: "Título muito longo." }),
  slug: slugField,
  content: z
    .string()
    .min(1, { error: "O conteúdo é obrigatório." })
    .max(200_000, { error: "Conteúdo muito longo." }),
  metaTitle: z
    .string()
    .trim()
    .max(200, { error: "Título de SEO muito longo." })
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .trim()
    .max(300, { error: "Descrição de SEO muito longa." })
    .optional()
    .or(z.literal("")),
  published: z.boolean().default(false),
  showInMenu: z.boolean().default(false),
  menuOrder: z.coerce.number().int().min(0).max(999).default(0),
});
export type PageInput = z.infer<typeof pageSchema>;

export const settingsSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(2, { error: "Informe o nome do site." })
    .max(200),
  lodgeName: z.string().trim().min(2, { error: "Informe o nome da Loja." }).max(200),
  lodgeNumber: z.string().trim().max(20).optional().or(z.literal("")),
  jurisdictionName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  logoPublicId: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  shortAbout: z.string().trim().max(1000).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.email().safeParse(v).success, {
      error: "E-mail institucional inválido.",
    }),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  youtubeUrl: z.string().trim().url().optional().or(z.literal("")),
  footerText: z.string().trim().max(500).optional().or(z.literal("")),
  metaTitle: z.string().trim().max(200).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(300).optional().or(z.literal("")),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

/** Formulário público de contato, com campo-armadilha anti-spam. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Informe seu nome." })
    .max(120, { error: "Nome muito longo." }),
  email: emailField,
  subject: z
    .string()
    .trim()
    .min(3, { error: "Informe um assunto." })
    .max(160, { error: "Assunto muito longo." }),
  message: z
    .string()
    .trim()
    .min(10, { error: "A mensagem deve ter pelo menos 10 caracteres." })
    .max(4000, { error: "Mensagem muito longa." }),
  // Campo invisível: se preenchido, é um robô. Não deve chegar preenchido.
  website: z.string().max(0, { error: "Preenchimento inválido." }).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, { error: "Informe o nome." }).max(120),
  email: emailField,
  password: z
    .string()
    .min(8, { error: "A senha deve ter pelo menos 8 caracteres." })
    .max(200)
    .regex(/[a-zA-Z]/, { error: "A senha deve conter ao menos uma letra." })
    .regex(/[0-9]/, { error: "A senha deve conter ao menos um número." }),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
  active: z.boolean().default(true),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2, { error: "Informe o nome." }).max(120),
  email: emailField,
  role: z.enum(["ADMIN", "EDITOR"]),
  active: z.boolean(),
  password: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) =>
        !v ||
        (v.length >= 8 &&
          /[a-zA-Z]/.test(v) &&
          /[0-9]/.test(v)),
      { error: "A nova senha deve ter 8+ caracteres, com letra e número." },
    ),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/** Resumo dos erros por campo, para exibir em formulários. */
export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState<T = unknown> =
  | {
      success: true;
      data?: T;
      message?: string;
    }
  | {
      success: false;
      message: string;
      errors?: FieldErrors;
    }
  | undefined;

/** Converte um ZodError em um mapa de erros por campo. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!result[key]) result[key] = [];
    result[key]!.push(issue.message);
  }
  return result;
}
