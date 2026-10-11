"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#0f1a31",
          color: "#fff",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Erro inesperado
          </h1>
          <p style={{ color: "#c6d8ef", marginBottom: "1.5rem" }}>
            Ocorreu um erro ao carregar a aplicação.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "#c9962a",
              color: "#0f1a31",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
