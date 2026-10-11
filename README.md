# Loja Fraternidade da Luz nº 181 — Site Institucional

Site institucional completo da **Loja Fraternidade da Luz nº 181**, jurisdicionada
à **Grande Loja do Estado da Bahia (GLEB)**, com:

- **Site público** (Home, Sobre, Notícias/Blog, Contato, Política de Privacidade,
  Termos de Uso, páginas institucionais dinâmicas, 404 personalizado);
- **Blog integrado** com capa, título, resumo, data, categoria, autor, busca,
  filtro por categoria, paginação e URLs amigáveis (`/blog/slug`);
- **Painel administrativo** protegido (`/admin`) para editar páginas, gerenciar
  o blog e as categorias, enviar imagens, gerenciar mensagens de contato,
  configurar os dados institucionais e o SEO — **sem novo deploy**.

> **Aviso institucional.** O projeto **não** cria nem reproduz brasões, símbolos
> ou logotipos oficiais. Ele está preparado para que o administrador **envie o
> logotipo oficial autorizado** pelo painel. Datas de fundação, nomes de
> dirigentes, endereço, telefone e fatos históricos **não são inventados**: todo
> conteúdo inicial é marcado explicitamente como *"conteúdo provisório de
> exemplo"* até que os dados oficiais sejam informados.

---

## Sumário

1. [Tecnologias](#tecnologias)
2. [Requisitos para desenvolvimento local](#requisitos-para-desenvolvimento-local)
3. [Instalação](#instalação)
4. [Variáveis de ambiente](#variáveis-de-ambiente)
5. [Banco de dados PostgreSQL](#banco-de-dados-postgresql)
6. [Migrações](#migrações)
7. [Primeiro administrador](#primeiro-administrador)
8. [Comandos locais](#comandos-locais)
9. [Testes, lint e build](#testes-lint-e-build)
10. [Deploy na Vercel](#deploy-na-vercel)
11. [Atualizações de banco em produção](#atualizações-de-banco-em-produção)
12. [Como gerenciar páginas e artigos](#como-gerenciar-páginas-e-artigos)
13. [Armazenamento de imagens](#armazenamento-de-imagens)
14. [Backup e restauração do PostgreSQL](#backup-e-restauração-do-postgresql)
15. [Segurança em produção](#segurança-em-produção)
16. [Estrutura de pastas](#estrutura-de-pastas)
17. [Limitações conhecidas](#limitações-conhecidas)

---

## Tecnologias

| Camada            | Escolha                                                        |
| ----------------- | -------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router, Server Components, Server Actions)     |
| Linguagem         | TypeScript (modo estrito)                                      |
| Estilo            | Tailwind CSS v4 + componentes acessíveis próprios (Radix)      |
| Ícones            | Lucide React + ícones sociais próprios (marcas não inclusas)   |
| Editor de texto   | Tiptap 3 (WYSIWYG)                                             |
| Banco de dados    | PostgreSQL (Neon ou compatível)                                |
| ORM               | Prisma 7 (Query Compiler + driver adapter `@prisma/adapter-pg`)|
| Autenticação      | iron-session (cookie de sessão cifrado) + DAL próprio          |
| Hash de senha     | bcryptjs                                                       |
| Validação         | Zod 4 + React Hook Form                                        |
| Sanitização HTML  | `sanitize-html` (na escrita e na leitura)                      |
| Imagens           | Cloudinary (ou Vercel Blob) via variáveis de ambiente          |
| Testes            | Vitest                                                         |
| Deploy            | Vercel                                                         |

---

## Requisitos para desenvolvimento local

- **Node.js 20.11+** (recomendado 22 LTS) e npm;
- **PostgreSQL 14+** — local ou um banco na nuvem (Neon);
- Conta no **Cloudinary** (opcional; apenas para upload de imagens);
- Git.

---

## Instalação

```bash
# 1. Clonar o repositório e entrar na pasta
git clone <url-do-repositorio> fraternidade-da-luz
cd fraternidade-da-luz

# 2. Instalar dependências (o postinstall já roda `prisma generate`)
npm install

# 3. Criar o arquivo de ambiente a partir do exemplo
cp .env.example .env
#    e editar o .env com as credenciais reais (ver seção seguinte)

# 4. Aplicar as migrações e popular dados iniciais
npm run db:migrate
npm run db:seed

# 5. Criar o primeiro administrador
npm run admin:create

# 6. Iniciar em desenvolvimento
npm run dev
```

Acesse <http://localhost:3000> (site) e <http://localhost:3000/admin> (painel).

---

## Variáveis de ambiente

Todas as credenciais vêm de variáveis de ambiente. **Nunca** versione o `.env`
(ele já está no `.gitignore`; apenas `.env.example` é versionado, com valores
falsos/vazios). Segredos **nunca** devem usar o prefixo `NEXT_PUBLIC_`.

| Variável                  | Obrigatória | Descrição                                                                                             |
| ------------------------- | :---------: | ----------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`            |     Sim     | Conexão PostgreSQL usada em runtime (no Neon, use a conexão *pooled*, com `sslmode=verify-full`).     |
| `DIRECT_URL`              |   Recom.    | Conexão direta (sem pooler) usada pelas **migrações** do Prisma CLI. No Neon é a URL sem `-pooler`.   |
| `APP_URL`                 |     Sim     | URL pública do site. Usada em sitemap, Open Graph e links absolutos.                                  |
| `SESSION_SECRET`          |     Sim     | Segredo do cookie de sessão (mínimo 32 caracteres). Gere com `openssl rand -base64 48`.               |
| `CLOUDINARY_CLOUD_NAME`   |  Opcional   | Armazenamento de imagens. Sem estes valores o upload fica **desabilitado** no painel.                 |
| `CLOUDINARY_API_KEY`      |  Opcional   | Chave de API do Cloudinary.                                                            |
| `CLOUDINARY_API_SECRET`   |  Opcional   | Segredo da API do Cloudinary.                                                          |
| `CLOUDINARY_FOLDER`       |  Opcional   | Pasta onde as imagens serão salvas (ex.: `fraternidade-da-luz`).                       |
| `INITIAL_ADMIN_NAME`      |  Bootstrap  | Nome do administrador inicial (usado apenas por `npm run admin:create`).                |
| `INITIAL_ADMIN_EMAIL`     |  Bootstrap  | E-mail do administrador inicial.                                                        |
| `INITIAL_ADMIN_PASSWORD`  |  Bootstrap  | Senha do administrador inicial (mínimo 8 caracteres, com letra e número).               |

As variáveis são validadas de forma **preguiçosa** (na primeira utilização) por
`lib/env.ts`, para que o `next build` não falhe por segredos que só existem em
tempo de execução.

---

## Banco de dados PostgreSQL

Recomendamos o **Neon** (PostgreSQL serverless compatível com Vercel):

1. Crie um projeto em <https://neon.tech> e um banco de dados.
2. No painel do Neon, copie **duas** URLs de conexão:
   - **Pooled** (`...-pooler...`) → `DATABASE_URL` (runtime da aplicação);
   - **Direct** (sem `-pooler`) → `DIRECT_URL` (migrações do Prisma CLI).
3. Sempre use `sslmode=verify-full` na string de conexão.

O cliente Prisma é criado uma única vez por processo (`lib/db.ts`) usando o
driver adapter `@prisma/adapter-pg`, apropriado para ambientes serverless.

> O código tolera banco indisponível: páginas públicas usam valores padrão de
> configuração quando a consulta falha, e nenhuma mensagem interna de erro é
> exibida ao visitante.

---

## Migrações

O histórico de migrações fica em `prisma/migrations/` (versionado).

```bash
# Desenvolvimento: cria/aplica uma migração a partir do schema
npm run db:migrate

# Gerar novamente o cliente Prisma após alterar o schema
npm run prisma:generate

# Popular dados iniciais (configurações, 3 páginas de exemplo, categorias)
npm run db:seed

# Abrir o Prisma Studio (interface visual do banco)
npm run db:studio
```

Para criar uma migração nomeada em desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_migracao
```

**Produção:** use sempre `npx prisma migrate deploy` (não destrutivo); **nunca**
`migrate dev`/`migrate reset` em produção.

---

## Primeiro administrador

Não existe **cadastro público** de administradores. O primeiro usuário é criado
por um script seguro que roda no ambiente do desenvolvedor (não no navegador):

```bash
# Via .env (INITIAL_ADMIN_NAME / INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD)
npm run admin:create

# Ou passando os dados na linha de comando
npx tsx scripts/create-admin.ts \
  --email=admin@exemplo.org \
  --password="UmaSenhaForte123" \
  --name="Administrador"
```

O script **nunca usa senha padrão embutida**: exige senha explícita e a valida
(mínimo 8 caracteres, com ao menos uma letra e um número). Se o e-mail já
existir, ele **atualiza** esse usuário (útil como "redefinir senha" e para
reativar a conta), sempre com a função `ADMIN`.

> Remova as variáveis `INITIAL_ADMIN_*` do ambiente após a criação inicial, para
> não manter uma senha fixa em configuração de produção.

---

## Comandos locais

| Comando                    | O que faz                                                        |
| -------------------------- | ---------------------------------------------------------------- |
| `npm run dev`              | Servidor de desenvolvimento (Turbopack).                         |
| `npm run build`            | `prisma generate` + build de produção do Next.js.                |
| `npm run start`            | Sobe o build de produção.                                        |
| `npm run lint`             | ESLint.                                                          |
| `npm run typecheck`        | Verificação de tipos (`tsc --noEmit`).                           |
| `npm test`                 | Executa a suíte de testes (Vitest).                              |
| `npm run test:watch`       | Testes em modo observador.                                       |
| `npm run prisma:generate`  | Gera o cliente Prisma.                                           |
| `npm run db:migrate`       | Cria/aplica migração em desenvolvimento.                         |
| `npm run db:deploy`        | Aplica migrações em produção (`migrate deploy`).                 |
| `npm run db:seed`          | Popula dados iniciais.                                           |
| `npm run db:studio`        | Interface visual do banco.                                       |
| `npm run admin:create`     | Cria/atualiza o administrador inicial.                           |

---

## Testes, lint e build

```bash
npm run typecheck   # tipos
npm run lint        # análise estática
npm test            # 55 testes automatizados
npm run build       # build de produção
```

A suíte cobre, entre outros pontos: login válido e inválido, mensagem genérica
sem revelar se o e-mail existe, bloqueio de usuário desativado, limitação de
tentativas de login por IP, **bloqueio de acesso anônimo ao painel**, **bloqueio
de operação sem permissão (editor não acessa área de ADMIN)**, **rascunhos nunca
aparecem publicamente**, validação de formulários, geração de slug único
(duplicidade), sanitização anti-XSS, hash/verificação de senha e tratamento de
falha de conexão sem vazar detalhes internos.

> **Testes que dependem de serviços externos.** Persistência real no PostgreSQL e
> upload de imagem no Cloudinary dependem de credenciais válidas e são
> verificados no ambiente integrado (local com `DATABASE_URL` real ou na Vercel).
> O código de domínio é testado com dependências simuladas.

---

## Deploy na Vercel

### 1. Repositório Git

```bash
git init
git add .
git commit -m "Site institucional da Loja Fraternidade da Luz nº 181"
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

### 2. Banco de dados

Crie o banco no Neon (seção [Banco de dados](#banco-de-dados-postgresql)) e
guarde as URLs *pooled* e *direct*.

### 3. Projeto na Vercel

1. Em <https://vercel.com>, **Import Project** e selecione o repositório.
2. Framework detectado: **Next.js**. Build Command padrão já roda
   `prisma generate && next build` (definido em `package.json`).
3. Em **Settings → Environment Variables**, cadastre (Production e Preview):
   `DATABASE_URL`, `DIRECT_URL`, `APP_URL`, `SESSION_SECRET` e, se usar
   imagens, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
   `CLOUDINARY_FOLDER`. Defina `APP_URL` com o domínio final
   (ex.: `https://www.fraternidadedaluz181.org.br`).
4. Faça o deploy. Não há dependência de um servidor Node local rodando.

### 4. Aplicar migrações e criar o administrador (uma vez)

Aplique as migrações **antes** de usar o site em produção. Duas opções:

```bash
# Opção A — da sua máquina, apontando o .env para o banco de produção
DIRECT_URL="<url-direct-de-producao>" npm run db:deploy
DIRECT_URL="<url-direct-de-producao>" npm run db:seed
```

```bash
# Opção B — via Vercel CLI
npm i -g vercel
vercel env pull .env.production   # traz as variáveis de produção
npm run db:deploy
npm run db:seed
```

Para criar o administrador de produção, rode **localmente** o script apontando
para o banco de produção (as variáveis `INITIAL_ADMIN_*` também podem ser
exportadas temporariamente):

```bash
DIRECT_URL="<url-direct-de-producao>" npm run admin:create
```

### 5. Domínio personalizado

Em **Settings → Domains**, adicione o domínio e ajuste `APP_URL` para ele. O
`middleware`/`proxy.ts` já envia cabeçalhos de segurança e HSTS em produção.

### 6. Lista de verificação pós-deploy

- [ ] Login funciona em `/admin` com o administrador criado.
- [ ] Acesso a `/admin` sem sessão redireciona para `/admin/login`.
- [ ] É possível editar uma página e ver a alteração **sem novo deploy**.
- [ ] É possível criar, publicar, editar e excluir um artigo.
- [ ] Rascunhos **não** aparecem no site nem no `/sitemap.xml`.
- [ ] Imagens são enviadas e servidas pelo Cloudinary (teste de upload).
- [ ] `/sitemap.xml` e `/robots.txt` respondem corretamente.
- [ ] Conteúdo persiste após um novo deploy (está no PostgreSQL, não na imagem).
- [ ] Nenhum segredo está exposto no código do navegador (variáveis sem `NEXT_PUBLIC_`).

---

## Atualizações de banco em produção

1. Altere `prisma/schema.prisma` localmente.
2. Gere a migração em desenvolvimento: `npx prisma migrate dev --name descricao`.
3. Teste localmente.
4. Comite o schema **e** a pasta `prisma/migrations/`.
5. Em produção, aplique com `npm run db:deploy` (ou `DIRECT_URL=... npm run db:deploy`).

Regra de ouro: **nunca** rode comandos destrutivos (`migrate reset`,
`db push --force-reset`) apontando para o banco de produção.

---

## Como gerenciar páginas e artigos

Tudo é feito pelo painel em `/admin`:

- **Páginas** (`/admin/paginas`): criar/editar páginas institucionais com editor
  visual (títulos, parágrafos, negrito, itálico, listas, links, imagens).
  É possível definir se a página aparece no menu, a ordem e se está publicada.
  A pré-visualização usa o mesmo motor de renderização do site. Ao salvar, o
  conteúdo aparece publicamente na hora (sem redeploy).
- **Artigos / Notícias** (`/admin/posts`): criar/editar/excluir publicações com
  título, slug, resumo, conteúdo formatado, imagem de capa e texto alternativo,
  categorias, autor, palavras-chave e status (**rascunho**, **publicado**,
  **agendado**). Somente conteúdo publicado (ou agendado com data já alcançada)
  é exibido no site. O slug é único — conflitos são resolvidos com sufixo.
- **Categorias** (`/admin/categorias`): criar/editar/excluir sem deixar
  publicações órfãs.
- **Mídia** (`/admin/midia`): enviar imagens (validação de tipo/tamanho) e
  copiar a URL para uso em páginas e artigos.
- **Mensagens** (`/admin/mensagens`): ver mensagens do formulário de contato,
  marcar como lida/respondida e excluir.
- **Configurações** (`/admin/configuracoes`, apenas ADMIN): nome da Loja,
  número, potência jurisdicional, **logotipo oficial**, textos institucionais,
  contato, redes sociais, texto do rodapé e SEO.
- **Usuários** (`/admin/usuarios`, apenas ADMIN): criar/editar/desativar contas
  com funções **ADMIN** (acesso total) ou **EDITOR** (conteúdo). Não há
  autoativação pública; o próprio administrador não pode se desativar nem
  remover a própria função.

### Invalidação de cache

Cada ação de escrita chama `revalidatePath(...)` para as rotas afetadas (página
inicial, `/blog`, `/blog/<slug>`, `/<slug>` e o próprio painel), garantindo que
o conteúdo atualizado apareça imediatamente.

---

## Armazenamento de imagens

As imagens **não** ficam no sistema de arquivos local. O upload usa o
**Cloudinary** por variáveis de ambiente:

1. Crie uma conta em <https://cloudinary.com> e obtenha *cloud name*, *API key*
   e *API secret*.
2. Preencha `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET` (e, opcionalmente, `CLOUDINARY_FOLDER`).
3. O upload é feito por uma rota autenticada (`/api/admin/upload`), com
   verificação de sessão, limitação de requisições e validação de formato,
   tamanho e tipo. Sem as variáveis configuradas, o botão de upload aparece
   desabilitado.

Alternativamente, `next.config.ts` já autoriza imagens de
`*.public.blob.vercel-storage.com` (Vercel Blob) caso você opte por esse serviço.

---

## Backup e restauração do PostgreSQL

**Backup (dump):**

```bash
pg_dump "postgresql://usuario:senha@host/banco?sslmode=verify-full" \
  --no-owner --no-privileges -Fc -f backup-$(date +%Y%m%d).dump
```

**Restauração:**

```bash
pg_restore --no-owner --no-privileges -d \
  "postgresql://usuario:senha@host/banco?sslmode=verify-full" backup-YYYYMMDD.dump
```

O Neon também oferece *point-in-time restore* no painel. Guarde os dumps em local
seguro (nunca no repositório). As imagens ficam no Cloudinary e seguem a política
de backup do próprio provedor.

---

## Segurança em produção

- **Segredos** apenas em variáveis de ambiente; `.env` fora do Git; nada com
  prefixo `NEXT_PUBLIC_`.
- **Senhas** com bcrypt (12 rounds), nunca em texto puro.
- **Sessões** em cookie `httpOnly`, `secure` (em produção), `SameSite=Lax`,
  cifrado pelo iron-session. A sessão é revalidada contra o banco a cada
  requisição — usuários excluídos/desativados perdem acesso na hora.
- **Autorização no servidor** em toda operação administrativa (DAL + Server
  Actions). Esconder botões na interface não é considerado controle de acesso.
- **Proxy (`proxy.ts`)**: verificação otimista de sessão para `/admin` e
  cabeçalhos de segurança (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, e HSTS em produção), além de
  `poweredByHeader: false`.
- **Limitação de tentativas** em login e upload (janela deslizante em memória).
  Em cenários de alto tráfego, considere um limitador distribuído (ex.: Upstash).
- **Sanitização de HTML** com `sanitize-html` na escrita **e** na leitura,
  prevenindo XSS armazenado no editor.
- **Mensagens de erro genéricas** ao visitante; nenhum *stack trace*, SQL ou
  detalhe interno é exposto.
- **Auditoria** (`AuditLog`) das ações administrativas relevantes.
- **Recuperação de senha**: não há envio de e-mail configurado. A redefinição é
  feita de forma segura pelo procedimento do primeiro administrador
  (`npm run admin:create` com o mesmo e-mail atualiza a senha).

---

## Estrutura de pastas

```
app/
  (public)/            # Site público (Home, Sobre, Blog, Contato, páginas, 404)
  admin/               # Login e painel protegido
  api/                 # Rotas (upload autenticado, health check)
  sitemap.ts           # XML sitemap dinâmico
  robots.ts            # robots.txt
components/
  public/              # Cabeçalho, rodapé, cards, paginação, editor de exibição
  admin/               # Painel (shell, formulários, editor Tiptap, uploaders)
  ui/                  # Componentes de interface acessíveis
lib/
  actions/             # Server Actions (mutations, com autorização e revalidação)
  services/            # Regras de negócio e acesso a dados (Prisma)
  auth/                # Sessão (iron-session) e DAL de autenticação/autorização
  security/            # Hash de senha, sanitização, rate limit
  storage/             # Integração com o armazenamento de imagens
  validation/          # Esquemas Zod compartilhados
  db.ts, env.ts, ...   # Cliente Prisma e validação de ambiente
prisma/
  schema.prisma        # Modelo de dados
  migrations/          # Migrações versionadas
  seed.ts              # Dados iniciais
scripts/
  create-admin.ts      # Bootstrap seguro do primeiro administrador
tests/                 # Testes automatizados (Vitest)
proxy.ts               # Proxy/Middleware (Next 16): proteção e cabeçalhos
```

**Entidades do banco:** `User`, `Page`, `Post`, `Category`, `PostCategory`,
`Media`, `SiteSettings`, `ContactMessage`, `AuditLog` — com IDs e timestamps,
índices, chaves únicas (e-mail único, slug único por tipo), relacionamentos
consistentes e exclusões controladas.

---

## Limitações conhecidas

- **Envio de e-mail** não está configurado. O formulário de contato grava as
  mensagens no banco (visíveis no painel) e oferece um link `mailto:` para
  resposta. A redefinição de senha é feita pelo script de bootstrap.
- O **rate limit** é em memória (por instância serverless). Para proteção
  distribuída robusta, integre um armazenamento compartilhado (ex.: Upstash).
- O conteúdo inicial é **provisório de exemplo** e deve ser substituído pelos
  dados oficiais (e pelo logotipo autorizado) no painel administrativo.
