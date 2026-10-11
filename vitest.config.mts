import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Configuração dos testes.
 *
 * O alias `server-only` aponta para um stub vazio porque esse módulo é
 * resolvido pelo Next.js em tempo de build (não existe como pacote).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false,
  },
});
