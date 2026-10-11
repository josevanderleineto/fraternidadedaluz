import type { Metadata } from "next";

import { InstitutionalContentPage } from "@/components/public/institutional-content-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso do site da Loja Fraternidade da Luz nº 181.",
};

export default function TermosPage() {
  return (
    <InstitutionalContentPage
      slug="termos"
      eyebrow="Institucional"
      title="Termos de Uso"
      fallback={
        <div className="prose-content">
          <p>
            Ao acessar e utilizar este site, o visitante declara ter lido e
            concordado com os termos descritos abaixo.
          </p>
          <h2>Finalidade</h2>
          <p>
            Este site tem caráter institucional e informativo, apresentando a
            Loja Fraternidade da Luz nº 181, suas atividades e publicações.
          </p>
          <h2>Conteúdo</h2>
          <p>
            Os textos, imagens e demais conteúdos são de responsabilidade da
            instituição, sendo vedada a reprodução sem autorização.
          </p>
          <h2>Responsabilidade</h2>
          <p>
            A instituição empenha-se em manter as informações atualizadas e
            corretas, mas não se responsabiliza por uso indevido do conteúdo
            por terceiros.
          </p>
          <h2>Alterações</h2>
          <p>
            Estes termos podem ser atualizados a qualquer momento, passando a
            vigorar a partir da publicação nesta página.
          </p>
          <p className="text-sm italic text-slate-500">
            Este texto é provisório de exemplo e deve ser revisado e
            complementado pela administração da Loja.
          </p>
        </div>
      }
    />
  );
}
