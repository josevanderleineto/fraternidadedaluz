import "server-only";

/**
 * Gera um slug único a partir de um texto base.
 * @param base texto já normalizado (slugify)
 * @param isTaken função que verifica se o slug já existe
 */
export async function buildUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = base && base.length > 0 ? base : "item";
  let candidate = root;
  let counter = 1;

  // Limite de segurança para evitar loop infinito.
  while (counter < 1000) {
    const taken = await isTaken(candidate);
    if (!taken) return candidate;
    counter += 1;
    candidate = `${root}-${counter}`;
  }

  return `${root}-${Date.now()}`;
}
