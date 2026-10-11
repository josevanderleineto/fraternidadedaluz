import "server-only";

import sanitizeHtml from "sanitize-html";
import { hash, compare } from "bcryptjs";

/* =============================================================================
 * Senhas — nunca armazenadas em texto puro.
 * Usamos bcrypt (função de hash adaptativa e resistente a força bruta).
 * ========================================================================== */

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  try {
    return await compare(plain, passwordHash);
  } catch {
    return false;
  }
}

/* =============================================================================
 * Sanitização de HTML — editor visual (Tiptap) e conteúdo do banco.
 * Evita XSS armazenado. Aplicada na escrita E na leitura (defesa em profundidade).
 * ========================================================================== */

const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "code",
  "pre",
  "span",
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  transformTags: {
    // Garante segurança em links externos.
    a: (tagName, attribs) => {
      const attrs: Record<string, string> = { ...attribs };
      if (attrs.href && /^https?:\/\//i.test(attrs.href)) {
        attrs.target = "_blank";
        attrs.rel = "noopener noreferrer nofollow";
      }
      return { tagName, attribs: attrs };
    },
  },
  // Remove tags desconhecidas e comentários.
  disallowedTagsMode: "discard",
  allowedIframeHostnames: [],
};

/** Sanitiza um fragmento de HTML proveniente do editor/conteúdo. */
export function sanitizeContent(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/** Sanitiza texto simples (sem HTML). */
export function sanitizeText(value: string): string {
  return sanitizeHtml(value ?? "", { allowedTags: [], allowedAttributes: {} }).trim();
}
