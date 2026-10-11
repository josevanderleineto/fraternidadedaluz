import type { Metadata } from "next";

import { InstitutionalContentPage } from "@/components/public/institutional-content-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do site da Loja Fraternidade da Luz nº 181.",
};

export default function PrivacidadePage() {
  return (
    <InstitutionalContentPage
      slug="privacidade"
      eyebrow="Institucional"
      title="Política de Privacidade"
      fallback={
        <div className="prose-content">
          <p>
            Esta Política de Privacidade descreve como a Loja Fraternidade da
            Luz nº 181 trata as informações fornecidas por visitantes deste
            site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
            13.709/2018 — LGPD).
          </p>
          <h2>Dados coletados</h2>
          <p>
            Coletamos apenas os dados informados voluntariamente no formulário
            de contato (nome, e-mail, assunto e mensagem), utilizados
            exclusivamente para responder à solicitação.
          </p>
          <h2>Uso das informações</h2>
          <p>
            As informações são utilizadas de forma confidencial, não sendo
            compartilhadas com terceiros para fins comerciais.
          </p>
          <h2>Armazenamento e segurança</h2>
          <p>
            Os dados são armazenados em banco de dados protegido e tratados com
            medidas técnicas e administrativas razoáveis de segurança.
          </p>
          <h2>Direitos do titular</h2>
          <p>
            O titular pode solicitar acesso, correção ou exclusão dos seus
            dados por meio dos canais oficiais de contato divulgados neste
            site.
          </p>
          <p className="text-sm italic text-slate-500">
            Este texto é provisório de exemplo e deve ser revisado e
            complementado pela administração da Loja, com base na legislação
            aplicável e nas práticas internas.
          </p>
        </div>
      }
    />
  );
}
