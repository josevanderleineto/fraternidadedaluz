import { beforeEach, describe, expect, it } from "vitest";

import { getClientIp, rateLimit, resetRateLimit } from "@/lib/security/rate-limit";

describe("rateLimit", () => {
  const options = { limit: 3, windowMs: 60_000 };

  beforeEach(() => {
    resetRateLimit("test:key");
  });

  it("permite até o limite e então bloqueia", () => {
    expect(rateLimit("test:key", options).success).toBe(true);
    expect(rateLimit("test:key", options).success).toBe(true);
    expect(rateLimit("test:key", options).success).toBe(true);

    const blocked = rateLimit("test:key", options);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("informa tentativas restantes", () => {
    const first = rateLimit("test:key", options);
    expect(first.remaining).toBe(2);
  });

  it("reinicia o contador ao limpar a chave", () => {
    rateLimit("test:key", options);
    rateLimit("test:key", options);
    rateLimit("test:key", options);
    expect(rateLimit("test:key", options).success).toBe(false);

    resetRateLimit("test:key");
    expect(rateLimit("test:key", options).success).toBe(true);
  });
});

describe("getClientIp", () => {
  it("usa o primeiro IP do cabeçalho x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });
    expect(getClientIp(headers)).toBe("203.0.113.10");
  });

  it("recorre a x-real-ip quando não há x-forwarded-for", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.5" });
    expect(getClientIp(headers)).toBe("198.51.100.5");
  });

  it("retorna um valor padrão sem cabeçalhos", () => {
    expect(getClientIp(new Headers())).toBe("desconhecido");
  });
});
