# Sistema de Rifas

Site para criar rifas, compartilhar o link, confirmar pagamentos e sortear.

Documentação detalhada:

- [Frontend](apps/frontend/README.md): regras de negócio, arquitetura e convenções do React.
- [Backend](apps/backend/README.md): API, banco de dados e regras garantidas pelo servidor.

## Como rodar

Precisa de **Docker** (para o Postgres) e **Node.js 22.13+**.

### Tudo no Docker (igual produção)

```bash
docker compose up -d --build
```

Abra http://localhost:3000. Sobe dois containers: `db` (Postgres 17) e `app` (backend servindo o front).
Para parar: `docker compose down` (os dados continuam nos volumes).

### Desenvolvimento

```bash
npm install
```

```bash
npm run dev
```

Sobe o Postgres no Docker (`npm run db:up`), o backend na porta 3000 e o front com recarga automática.
Abra http://localhost:5173 (o Vite repassa `/api` e `/uploads` para o backend).

### Outros comandos

| Comando | O que faz |
|---|---|
| `npm run db:up` / `npm run db:down` | Liga/desliga só o Postgres |
| `npm run build` | Compila front e back |
| `npm start` | Backend servindo o front compilado (precisa do Postgres no ar) |
| `npm run docker:up` / `npm run docker:down` | Mesmo que `docker compose up -d --build` / `down` |
| `npm run lint:arch` | Verifica as regras de arquitetura do backend |
| `npm run migration:create -- <nome>` | Cria uma migração (toda mudança no banco é por migração) |
| `npm run migration:run` / `migration:revert` / `migration:status` | Aplica pendentes / desfaz a última / lista |

Configuração: copie `.env.example` para `.env` se quiser mudar usuário, senha ou portas.

### Acessar o banco (DBeaver, psql…)

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Porta | `5433` (para não conflitar com outro Postgres na 5432) |
| Banco | `minha_rifa` |
| Usuário / senha | `rifa` / `rifa` |

Ou pelo terminal:

```bash
docker compose exec db psql -U rifa -d minha_rifa
```

## Estrutura (monorepo com npm workspaces)

```
apps/
  backend/                @minha-rifa/backend — NestJS + TypeScript, PostgreSQL (driver pg)
    src/
      domain/             modelos, regras puras, erros, interfaces de repositório
      application/        casos de uso + DTOs (um caso de uso nunca chama outro)
      infrastructure/     repositórios Postgres, migrações e fotos em disco
      presentation/       controllers, guard de sessão, filtro de erros, jobs
  frontend/               @minha-rifa/frontend — React + Vite + React Router
    src/
      main.jsx            ponto de entrada
      app/                App (providers), rotas e layout do administrador
      pages/              uma tela por rota: monta as features, sem regra própria
      features/           código de cada funcionalidade
        auth/             login/cadastro, contexto do usuário, proteção de rotas
        raffles/          API de rifas, formulário de criar/editar, card da lista
        raffle-management/  tela de gestão: divulgação, sorteio, pedidos, edição
        public-raffle/    página do comprador: grade de números, reserva, pedidos
      shared/             reutilizável e sem regra de negócio
        api/              cliente HTTP (fetch + ApiError)
        lib/              formatação, WhatsApp, imagem, clipboard, localStorage
        hooks/            useInterval, useNow, useCopy, useDocumentTitle
        ui/               Topbar, Toast, diálogo de confirmação, componentes visuais
        styles/global.css
```

Dentro de cada feature: `api/` (chamadas HTTP), `model/` ou `lib/` (regras puras, sem React),
`hooks/` (estado e efeitos) e `components/` (só apresentação).

Rotas: `/` (entrar), `/painel` (minhas rifas), `/gerenciar?id=` (gestão), `/r/:slug` (página pública).
Em produção o backend serve `apps/frontend/dist` (configurável por `FRONTEND_DIR`) e devolve o
`index.html` para qualquer rota sem extensão; o React Router resolve a tela.

## Onde ficam os dados

| O quê | Desenvolvimento (`npm run dev`) | Docker (`docker compose up`) |
|---|---|---|
| Banco | Postgres do container `db`, volume `minha-rifa_pgdata` | Mesmo |
| Fotos | `apps/backend/data/uploads/` | Volume `minha-rifa_uploads` (montado em `/data`) |

As tabelas são criadas automaticamente na primeira vez que o backend sobe (migrações).
Toda mudança no esquema é feita por migração; veja [Migrações no README do backend](apps/backend/README.md#migrações).
`docker compose down` mantém os dados; `docker compose down -v` **apaga** banco e fotos.

Backup do banco:

```bash
docker compose exec db pg_dump -U rifa minha_rifa > backup.sql
```

## Regras

- Qualquer pessoa cria uma conta e vira administradora das rifas que criar.
- Comprador não precisa de conta: abre o link, escolhe os números, informa nome e WhatsApp.
- O número fica ocupado **já no clique**, pelo tempo definido na rifa. Nesse prazo ninguém mais consegue pegá-lo,
  e o comprador precisa informar os dados, pagar e enviar o comprovante. Se não der tempo, o número volta a ficar disponível sozinho.
- O comprador vê a chave PIX e um botão para enviar o comprovante pelo WhatsApp do administrador. Ao clicar nele,
  o relógio para e o número fica guardado até o administrador confirmar ou recusar (sem prazo).
- O administrador confirma (ou recusa) cada reserva no painel. Também pode desfazer uma venda já confirmada.
- Limite de números por pessoa é opcional, por rifa (controlado pelo WhatsApp informado).
- Sorteio: liberado quando todos os números estão pagos **ou** quando chega a data do sorteio.
  Na data, se a rifa não estiver completa, o administrador pode adiar a data ou sortear só entre os pagos.
  Sempre há uma confirmação antes, e o sorteio não pode ser desfeito.
- Na página pública aparecem só nomes abreviados ("Maria S."); o WhatsApp dos compradores só o administrador vê.

## Publicar na internet

A aplicação é uma imagem Docker única (`Dockerfile` na raiz). Em produção:

1. **Banco**: use um Postgres gerenciado (Neon, Supabase, RDS, Render, Railway…) ou o próprio `docker-compose.yml` numa VPS.
2. **App**: rode a imagem com as variáveis:
   - `DATABASE_URL` = endereço do Postgres (ex.: `postgres://usuario:senha@host:5432/banco`);
   - `DATA_DIR=/data` com um **disco/volume persistente** montado em `/data` (fotos);
   - `PORT` (padrão 3000).
3. Coloque HTTPS na frente (o cookie de sessão não tem `Secure`; o proxy/plataforma cuida do TLS).

Gerar e enviar a imagem para um registry:

```bash
docker build -t SEU_REGISTRY/minha-rifa:1.0.0 .
```

```bash
docker push SEU_REGISTRY/minha-rifa:1.0.0
```

As migrações rodam sozinhas quando a aplicação sobe (com trava, então várias instâncias podem subir juntas). Se preferir rodá-las num passo separado do deploy: `MIGRATE_ON_BOOT=false` na aplicação e `node apps/backend/dist/migrate.js up` antes de subir.
