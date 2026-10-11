import { describe, expect, it } from "vitest";

import {
  hashPassword,
  sanitizeContent,
  sanitizeText,
  verifyPassword,
} from "@/lib/security/security";

describe("senhas", () => {
  it("gera hash diferente do texto puro e valida corretamente", async () => {
    const hash = await hashPassword("SenhaSuperSecreta123");
    expect(hash).not.toContain("SenhaSuperSecreta123");
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verifyPassword("SenhaSuperSecreta123", hash)).toBe(true);
    expect(await verifyPassword("senha-errada", hash)).toBe(false);
  });

  it("não lança erro com hash inválido (retorna falso)", async () => {
    expect(await verifyPassword("qualquer", "hash-invalido")).toBe(false);
  });
});

describe("sanitizeContent (anti-XSS)", () => {
  it("remove scripts e manipuladores de evento", () => {
    const dirty =
      '<p onclick="alert(1)">Olá</p><script>alert("xss")</script><img src="x" onerror="alert(2)">';
    const clean = sanitizeContent(dirty);
    expect(clean).not.toMatch(/<script/i);
    expect(clean).not.toMatch(/onclick/i);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).toContain("Olá");
  });

  it("mantém formatação legítima", () => {
    const clean = sanitizeContent(
      "<h2>Título</h2><p>Texto <strong>forte</strong> e <em>ênfase</em>.</p>",
    );
    expect(clean).toContain("<h2>Título</h2>");
    expect(clean).toContain("<strong>forte</strong>");
    expect(clean).toContain("<em>ênfase</em>");
  });

  it("adiciona rel seguro a links externos", () => {
    const clean = sanitizeContent(
      '<a href="https://example.com">Externo</a>',
    );
    expect(clean).toContain('rel="noopener noreferrer nofollow"');
  });

  it("remove esquemas perigosos em links", () => {
    const clean = sanitizeContent('<a href="javascript:alert(1)">x</a>');
    expect(clean).not.toMatch(/javascript:/i);
  });
});

describe("sanitizeText", () => {
  it("remove qualquer marcação HTML", () => {
    expect(sanitizeText("<b>Nome</b> <script>x</script>")).toBe("Nome");
  });
});
