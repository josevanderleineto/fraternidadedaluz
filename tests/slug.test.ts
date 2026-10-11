import { describe, expect, it } from "vitest";

import { buildUniqueSlug } from "@/lib/services/slug";
import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("remove acentos e normaliza espaços", () => {
    expect(slugify("Sessão Solene de Aniversário")).toBe(
      "sessao-solene-de-aniversario",
    );
  });

  it("remove caracteres inválidos", () => {
    expect(slugify("Notícia: Loja nº 181!")).toBe("noticia-loja-n-181");
  });
});

describe("buildUniqueSlug", () => {
  it("retorna o slug base quando está livre", async () => {
    const slug = await buildUniqueSlug("noticia", async () => false);
    expect(slug).toBe("noticia");
  });

  it("acrescenta um sufixo numérico quando o slug já existe", async () => {
    const existing = new Set(["noticia", "noticia-2"]);
    const slug = await buildUniqueSlug("noticia", async (candidate) =>
      existing.has(candidate),
    );
    expect(slug).toBe("noticia-3");
  });

  it("usa um nome padrão quando a base é vazia", async () => {
    const slug = await buildUniqueSlug("", async () => false);
    expect(slug).toBe("item");
  });
});
