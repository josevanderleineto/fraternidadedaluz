import { describe, expect, it } from "vitest";

import {
  categorySchema,
  contactSchema,
  loginSchema,
  pageSchema,
  postSchema,
  userCreateSchema,
} from "@/lib/validation/schemas";

describe("loginSchema", () => {
  it("aceita credenciais válidas e normaliza o e-mail", () => {
    const result = loginSchema.safeParse({
      email: "  Admin@Example.COM ",
      password: "senhaSegura123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("admin@example.com");
    }
  });

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({
      email: "nao-e-email",
      password: "senhaSegura123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha curta", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("postSchema", () => {
  const valid = {
    title: "Notícia institucional",
    slug: "",
    excerpt: "",
    content: "<p>Conteúdo</p>",
    coverImageUrl: "",
    coverImageAlt: "",
    keywords: "",
    status: "PUBLISHED" as const,
    publishedAt: "",
    categoryIds: [],
  };

  it("aceita uma publicação completa", () => {
    expect(postSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita título muito curto", () => {
    expect(postSchema.safeParse({ ...valid, title: "ab" }).success).toBe(false);
  });

  it("rejeita conteúdo vazio", () => {
    expect(postSchema.safeParse({ ...valid, content: "" }).success).toBe(false);
  });

  it("rejeita slug com caracteres inválidos", () => {
    expect(
      postSchema.safeParse({ ...valid, slug: "Slug Inválido!" }).success,
    ).toBe(false);
  });

  it("rejeita URL de capa inválida", () => {
    expect(
      postSchema.safeParse({ ...valid, coverImageUrl: "não-é-url" }).success,
    ).toBe(false);
  });

  it("rejeita data de publicação inválida", () => {
    expect(
      postSchema.safeParse({ ...valid, publishedAt: "31/13/2026" }).success,
    ).toBe(false);
  });
});

describe("pageSchema", () => {
  it("aplica valores padrão e aceita página válida", () => {
    const result = pageSchema.safeParse({
      title: "Sobre",
      slug: "",
      content: "<p>Texto</p>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.published).toBe(false);
      expect(result.data.menuOrder).toBe(0);
    }
  });
});

describe("categorySchema", () => {
  it("exige nome com pelo menos 2 caracteres", () => {
    expect(
      categorySchema.safeParse({ name: "A", slug: "", description: "" })
        .success,
    ).toBe(false);
  });
});

describe("userCreateSchema", () => {
  it("exige senha com letra e número", () => {
    expect(
      userCreateSchema.safeParse({
        name: "Fulano",
        email: "fulano@example.com",
        password: "somenteletras",
        role: "EDITOR",
        active: true,
      }).success,
    ).toBe(false);
  });

  it("aceita usuário editor válido", () => {
    expect(
      userCreateSchema.safeParse({
        name: "Fulano",
        email: "fulano@example.com",
        password: "Senha1234",
        role: "EDITOR",
        active: true,
      }).success,
    ).toBe(true);
  });
});

describe("contactSchema (anti-spam)", () => {
  const base = {
    name: "Maria",
    email: "maria@example.com",
    subject: "Dúvida",
    message: "Gostaria de mais informações sobre a Loja.",
  };

  it("aceita mensagem válida", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita quando o campo-armadilha é preenchido", () => {
    expect(
      contactSchema.safeParse({ ...base, website: "http://spam" }).success,
    ).toBe(false);
  });

  it("rejeita mensagem muito curta", () => {
    expect(contactSchema.safeParse({ ...base, message: "oi" }).success).toBe(
      false,
    );
  });
});
