import { sanitizeContent } from "@/lib/security/security";
import { cn } from "@/lib/utils";

/**
 * Renderiza conteúdo rico (HTML) já sanitizado. A sanitização é aplicada
 * novamente na leitura como defesa em profundidade contra XSS armazenado.
 */
export function RichContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = sanitizeContent(html);
  return (
    <div
      className={cn("prose-content", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
