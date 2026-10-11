import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (antigo Middleware) — Next.js 16.
 *
 * Atua apenas como verificação otimista: se não houver cookie de sessão, o
 * usuário é redirecionado ao login antes mesmo de renderizar o painel. A
 * autorização REAL (validar a sessão, o usuário ativo e as permissões) ocorre
 * sempre no servidor, no DAL e nas Server Actions.
 */
const SESSION_COOKIE_NAME = "fdl_session";

/** Cabeçalhos de segurança aplicados a todas as respostas. */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
  return response;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Proteção otimista do painel administrativo.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("proximo", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // Evita processar arquivos estáticos e imagens otimizadas.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$).*)",
  ],
};
