/**
 * Limitador de requisições simples em memória (janela deslizante).
 *
 * Em ambiente serverless cada instância tem sua própria memória, então este
 * limitador é uma primeira barreira contra abuso e força bruta — não substitui
 * um serviço distribuído (ex.: Upstash) em cenários de alto tráfego. Ainda
 * assim, reduz drasticamente ataques triviais e é documentado no README.
 */

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
};

export type RateLimitOptions = {
  /** Número máximo de tentativas dentro da janela. */
  limit: number;
  /** Tamanho da janela em milissegundos. */
  windowMs: number;
};

/**
 * Registra uma tentativa para `key` e informa se ela é permitida.
 * @param key identificador (ex.: `login:${ip}`)
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    return {
      success: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
    };
  }

  bucket.timestamps.push(now);
  return {
    success: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterMs: 0,
  };
}

/** Limpa o estado de uma chave (ex.: após login bem-sucedido). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Extrai o IP do cliente a partir dos cabeçalhos da requisição. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "desconhecido"
  );
}

/**
 * Hash estável (não reversível) de um IP, para armazenar sem expor o dado
 * pessoal em texto puro (LGPD).
 */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`ip:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
