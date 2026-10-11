import type { NextConfig } from "next";

/**
 * Configuração do Next.js.
 *
 * Optamos pelo modelo de cache "clássico" (dynamic rendering + revalidação
 * sob demanda) em vez de Cache Components, por ser mais previsível para um
 * CMS com painel administrativo e conteúdo dinâmico vindo do PostgreSQL.
 */
const nextConfig: NextConfig = {
  // Remove o cabeçalho `X-Powered-By` para não expor detalhes internos.
  poweredByHeader: false,

  images: {
    // Domínios autorizados a servir imagens otimizadas pelo next/image.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  turbopack: {
    // Define a raiz do projeto para o Turbopack (evita avisos de lockfile fora
    // do repositório e garante resolução consistente).
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
