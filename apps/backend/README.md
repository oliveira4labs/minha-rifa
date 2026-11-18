# Backend — Minha Rifa

API do sistema de rifas em **NestJS 12 + TypeScript (ESM)**, com banco **PostgreSQL** (driver `pg`, SQL direto, sem ORM). O Postgres roda em Docker (`docker-compose.yml` na raiz).
O código segue uma **arquitetura em camadas (onion básica)**: controller → caso de uso → repositório.
As regras de dependência entre camadas são **verificadas automaticamente** (`npm run lint:arch`).

As regras de negócio completas (do ponto de vista do usuário) estão em [apps/frontend/README.md](../frontend/README.md#regras-de-negócio).
Aqui fica o que o servidor garante e como o código está organizado.

- [Como rodar](#como-rodar)
- [Arquitetura](#arquitetura)
- [Como adicionar uma funcionalidade](#como-adicionar-uma-funcionalidade)
- [Banco de dados](#banco-de-dados-postgresql)
- [API](#api)

---

## Como rodar

Requer Node.js **22.13+** e o Postgres no ar (`npm run db:up` na raiz sobe o do Docker). Na raiz do repositório:

| Comando | O que faz |
|---|---|
| `npm run dev -w @minha-rifa/backend` | Compila e sobe em modo watch (`tsc --watch` + `node --watch`) |
| `npm run build -w @minha-rifa/backend` | Gera `apps/backend/dist` |
| `npm start` | `node dist/main.js` (precisa do build) |
| `docker compose up -d --build` | Postgres + aplicação em containers (porta 3000) |
| `npm run typecheck -w @minha-rifa/backend` | Checagem de tipos |
| `npm run lint:arch` | **Verifica as regras de arquitetura** |
| `npm run migration:create -- <nome>` | Cria um arquivo de migração (veja [Migrações](#migrações)) |
| `npm run migration:run` | Aplica as migrações pendentes |
| `npm run migration:revert [-- n]` | Desfaz a última (ou as `n` últimas) |
| `npm run migration:status` | Lista migrações aplicadas e pendentes |

O build usa `tsc` direto (sem Nest CLI) para não depender do ambiente.
As migrações pendentes também rodam sozinhas quando a aplicação sobe (desligue com `MIGRATE_ON_BOOT=false`).

### Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `3000` | Porta HTTP |
| `DATABASE_URL` | `postgres://rifa:rifa@localhost:5433/minha_rifa` | Conexão com o Postgres (o do docker-compose, na porta 5433) |
| `MIGRATE_ON_BOOT` | `true` | `false` = a aplicação não migra ao subir (as migrações rodam num passo separado do deploy) |
| `DATA_DIR` | `apps/backend/data` | Fotos (`uploads/`). Em produção, aponte para um disco/volume persistente |
| `FRONTEND_DIR` | `apps/frontend/dist` | Build do front servido em produção |

Toda a configuração está em [`src/config/app.config.ts`](src/config/app.config.ts).

---

## Arquitetura

### Camadas

```
            ┌──────────────────────────────────────────────────────┐
            │ presentation   controllers · guard · filtro · jobs   │──┐
            ├──────────────────────────────────────────────────────┤  │ chama só
            │ application    use cases · DTOs · helpers            │◀─┘ casos de uso
            ├──────────────────────────────────────────────────────┤
            │ domain         modelos (interfaces) · regras · erros │◀── tudo aponta
            │                IXxxRepository + token abstrato       │    para dentro
            └──────────────────────────────────────────────────────┘
                                     ▲ implementa as portas
            ┌────────────────────────┴─────────────────────────────┐
            │ infrastructure  repositórios Postgres · fotos em disco│
            └──────────────────────────────────────────────────────┘
   app.module.ts = raiz de composição: único arquivo que conhece todas as camadas
```

| Camada | Pasta | Responsabilidade | Pode depender de |
|---|---|---|---|
| **Domínio** | `src/domain` | Modelos (`interfaces/`), regras puras (`canDraw`, `shortName`, validação de foto, hash de senha), erros de negócio, **interfaces de repositório** (`IXxxRepository`) e a classe abstrata que as implementa (token de injeção) | Nada (só `node:` built-ins). Sem Nest, sem Express |
| **Aplicação** | `src/application` | **Casos de uso** (um por operação), **DTOs** de entrada/saída e helpers | Domínio + `@nestjs/common` (só para `@Injectable`) + `class-validator`/`class-transformer` nos DTOs |
| **Infraestrutura** | `src/infrastructure` | Implementações concretas: Postgres (repositórios, migrações, transação) e disco | Domínio + config |
| **Apresentação** | `src/presentation` | Controllers HTTP, guard de sessão, filtro de erros, validação, interceptor e job agendado | Casos de uso, DTOs e erros do domínio |

### Regras (verificadas por `npm run lint:arch`)

Duas verificações rodam juntas:

- [`.dependency-cruiser.cjs`](.dependency-cruiser.cjs): **quem pode importar quem**.
- [`scripts/check-conventions.mjs`](scripts/check-conventions.mjs): **convenções dentro dos arquivos** (onde ficam os tipos e como o use case recebe o repositório).

O build não quebra, mas a checagem falha apontando arquivo, linha e regra.

| Regra | O que proíbe |
|---|---|
| `domain-is-the-core` | Domínio importar qualquer outra camada |
| `domain-without-framework` | Domínio importar pacotes npm (Nest, Express, etc.) |
| `application-only-knows-domain` | Aplicação importar infraestrutura, apresentação ou config |
| `use-case-does-not-call-use-case` | **Um caso de uso importar outro** |
| `use-case-only-uses-repositories` | Caso de uso importar algo além de: domínio (interfaces e tokens de repositório, modelos, regras, erros), DTOs, helpers e `@nestjs/common` |
| `helpers-do-not-call-use-cases` | Helper virar atalho para chamar caso de uso |
| `dto-is-data-only` | DTO importar caso de uso ou repositório |
| `presentation-only-calls-use-cases` | **Controller (ou guard/job) importar repositório**, modelo ou regra do domínio, ou infraestrutura |
| `presentation-does-not-use-helpers` | Apresentação usar helpers internos da aplicação |
| `infrastructure-implements-domain-only` | Infraestrutura importar aplicação ou apresentação |
| `no-circular` | Dependência circular |
| `types-live-in-dto-or-interfaces` | Declarar `interface`/`type` fora de uma pasta `dto/` ou `interfaces/` |
| `no-inline-object-types` | Tipo objeto escrito na hora (`as { id: number }`, `Promise<{ … }>`, `x: { a; b }`) |
| `use-case-depends-on-repository-interface` | Use case receber repositório pela classe (`x: UserRepository`) em vez de `@Inject(UserRepository) x: IUserRepository` |
| `repository-token-implements-interface` | Classe abstrata de repositório que não `implements IXxxRepository` |

Resumo do fluxo permitido:

```
HTTP ─▶ Controller ─(DTO)─▶ UseCase ─▶ IXxxRepository ◀── XxxRepository (abstrata) ◀── PostgresXxxRepository
                    ◀─(DTO)─        ─▶ regras do domínio     implements                     extends
```

### Repositórios: interface → classe abstrata → implementação

```ts
// domain/repositories/interfaces/user.repository.interface.ts  — o contrato
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
}

// domain/repositories/user.repository.ts  — token de injeção, referencia a interface
export abstract class UserRepository implements IUserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
}

// infrastructure/repositories/postgres-user.repository.ts  — implementação
export class PostgresUserRepository extends UserRepository { … }

// application/auth/use-cases/login.use-case.ts  — o use case depende da INTERFACE
constructor(@Inject(UserRepository) private readonly users: IUserRepository) {}
```

A classe abstrata existe porque interface do TypeScript some na compilação e o Nest precisa de um valor como token.
O vínculo token → implementação fica em [`infrastructure.module.ts`](src/infrastructure/infrastructure.module.ts).

### Contratos

- **Caso de uso**: classe `@Injectable()` que implementa [`UseCase<Input, Output>`](src/application/common/interfaces/use-case.interface.ts), com um único método público `execute(input)`. Recebe e devolve DTOs (nunca modelos do domínio).
- **DTO de entrada**: classe com decorators de [`validation.ts`](src/application/common/validation.ts). Cada campo tem um normalizador (trim, só dígitos, número) e **uma** regra com a mensagem exata em português.
  Campos que dependem de contexto (ex.: `total_numbers` travado quando já há vendas) são marcados com `@Raw()` e validados no caso de uso, com as regras do domínio.
- **DTO de saída**: interface com os nomes da API (snake_case). A tradução modelo → DTO acontece no caso de uso.
- **Onde ficam os tipos**: só em `dto/` (contratos de entrada/saída da aplicação) ou `interfaces/` (modelos do domínio, contratos de repositório, linhas do banco, tipos de HTTP). Use case, repositório, regra, helper e controller **importam** de lá; nunca declaram tipos próprios.
- **Repositório**: interface `IXxxRepository` em `domain/repositories/interfaces` + classe abstrata `XxxRepository implements IXxxRepository` (token). A implementação em `infrastructure/` estende a classe abstrata.
- **Helpers** (`*.helpers.ts`): lógica compartilhada entre casos de uso do mesmo contexto (ex.: `requireOwnedRaffle`, `resolvePhotoFiles`). Recebem repositórios por parâmetro, tipados pela interface. Existem justamente para que **um caso de uso não precise chamar outro**.
- **Erros**: o domínio lança `BusinessRuleError` (400), `NotFoundError` (404), `UnauthenticatedError` (401) ou `NumbersUnavailableError` (409, com `busy`). O [`ApiExceptionFilter`](src/presentation/http/filters/api-exception.filter.ts) traduz para HTTP no formato `{ error }`.

### Estrutura de pastas

```
apps/backend/
├── .dependency-cruiser.cjs        regras de arquitetura (imports)
├── scripts/check-conventions.mjs  regras de convenção (tipos, injeção de repositório)
├── tsconfig.json / tsconfig.build.json
└── src/
    ├── main.ts                    bootstrap do Nest
    ├── app.module.ts              raiz de composição (controllers + casos de uso + infra)
    ├── config/app.config.ts       variáveis de ambiente
    ├── domain/
    │   ├── interfaces/            modelos: User, Raffle, Photo, Order, TakenNumber, PhotoContent…
    │   ├── errors/                erros de negócio
    │   ├── repositories/
    │   │   ├── interfaces/        IUserRepository, ISessionRepository, IRaffleRepository, IPhotoRepository,
    │   │   │                      IPhotoStorage, IOrderRepository, IUnitOfWork  (contratos)
    │   │   └── *.ts               UserRepository, … (classes abstratas = tokens de injeção)
    │   └── rules/                 raffle.rules, photo.rules, security.rules
    ├── application/
    │   ├── common/                interfaces/ (UseCase, tipos de validação) · dto/ (OkDto) · validation.ts
    │   ├── index.ts               lista de todos os casos de uso (para o módulo)
    │   ├── auth/                  dto/ · use-cases/ (register, login, logout, get-session-user)
    │   ├── raffles/               dto/ · raffle.helpers.ts · use-cases/ (list, create, get-details,
    │   │                          update, delete, draw)
    │   ├── orders/                dto/ · order.helpers.ts · use-cases/ (approve, cancel, expire)
    │   └── public-raffle/         dto/ · use-cases/ (get-public-raffle, reserve-numbers, get-buyer-order)
    ├── infrastructure/
    │   ├── database/              PostgresDatabase (pool, transação), PostgresUnitOfWork, Migrator,
    │   │                          migrations/ (001_initial_schema…), interfaces/ (UserRow, RaffleRow, OrderRow…)
    │   ├── repositories/          PostgresUser/Session/Raffle/Photo/OrderRepository (um por arquivo)
    │   ├── storage/               LocalPhotoStorage (DATA_DIR/uploads)
    │   └── infrastructure.module.ts  liga token (classe abstrata) → implementação
    └── presentation/
        ├── http/
        │   ├── controllers/       auth, raffles, orders, public-raffle
        │   ├── guards/            AuthGuard + @CurrentUser / @SessionToken
        │   ├── interfaces/        AuthenticatedRequest, BodyParserError
        │   ├── filters/           ApiExceptionFilter (formato único de erro)
        │   ├── pipes/             validação dos DTOs (primeira mensagem de erro)
        │   ├── interceptors/      ExpireOrdersInterceptor
        │   ├── session-cookie.ts  cookie `sid`
        │   └── http-server.ts     prefixo /api, corpo JSON, arquivos estáticos e fallback do SPA
        └── jobs/                  ExpireOrdersJob (a cada 30 s)
```

### Casos de uso

| Contexto | Caso de uso | Rota |
|---|---|---|
| auth | `RegisterUseCase` | `POST /api/register` |
| | `LoginUseCase` | `POST /api/login` |
| | `LogoutUseCase` | `POST /api/logout` |
| | `GetSessionUserUseCase` | `GET /api/me` e `AuthGuard` |
| raffles | `ListMyRafflesUseCase` | `GET /api/raffles` |
| | `CreateRaffleUseCase` | `POST /api/raffles` |
| | `GetRaffleDetailsUseCase` | `GET /api/raffles/:id` |
| | `UpdateRaffleUseCase` | `PUT /api/raffles/:id` |
| | `DeleteRaffleUseCase` | `DELETE /api/raffles/:id` |
| | `DrawRaffleUseCase` | `POST /api/raffles/:id/draw` |
| orders | `ApproveOrderUseCase` | `POST /api/orders/:id/approve` |
| | `CancelOrderUseCase` | `POST /api/orders/:id/cancel` |
| | `ExpireOrdersUseCase` | `ExpireOrdersInterceptor` (toda requisição) e `ExpireOrdersJob` (30 s) |
| public-raffle | `GetPublicRaffleUseCase` | `GET /api/r/:slug` |
| | `ReserveNumbersUseCase` | `POST /api/r/:slug/reserve` |
| | `GetBuyerOrderUseCase` | `GET /api/pedido/:token` |

### Ciclo de uma requisição

```
express.json (40 MB)            erro de corpo → 413/400 { error }
  → AuthGuard (rotas de admin)  GetSessionUserUseCase(cookie sid) → 401 se não houver sessão
  → ExpireOrdersInterceptor     ExpireOrdersUseCase(now): libera reservas vencidas
  → ValidationPipe              JSON → DTO (normaliza e valida) → 400 com a 1ª mensagem
  → Controller                  monta o input e chama UM caso de uso
  → UseCase                     regras do domínio + repositórios (+ UnitOfWork quando precisa ser atômico)
  → resposta JSON               ou ApiExceptionFilter → { error, busy? }
```

Expirar reservas fica **fora** dos casos de uso (interceptor + job) justamente para nenhum caso de uso precisar chamar outro.

### Transações

- `IUnitOfWork.run(fn)` (token `UnitOfWork`) executa várias chamadas de repositório numa transação **`SERIALIZABLE`**. Usado em: criar/editar rifa, reservar, sortear, expirar.
- Em conflito de concorrência (erro `40001`/`40P01`), a transação é **refeita automaticamente** (até 5 vezes). Por isso o `fn` não deve ter efeitos fora do banco.
- As consultas dentro de `fn` usam a mesma conexão sem precisar passá-la: o `PostgresDatabase` guarda a transação atual em `AsyncLocalStorage`.
- A transação é reentrante: repositórios que precisam de atomicidade interna (`OrderRepository.create`, `release`, `PhotoRepository.replaceAll`) participam da transação externa quando existe uma.
- A PK `(raffle_id, number)` em `tickets` é a última barreira contra número duplicado: o repositório insere os números num `SAVEPOINT` e converte a violação (`23505`) em `NumbersUnavailableError`.
- Testado com concorrência real: 30 reservas simultâneas do mesmo número → 1 sucesso, 29 recusadas (409); 10 reservas paralelas da mesma pessoa com limite 3 → exatamente 3.

---

## Como adicionar uma funcionalidade

1. **Domínio**: regra nova vira função pura em `domain/rules`; modelo novo vai em `domain/interfaces`. Se precisar de dado novo, adicione o método na interface `IXxxRepository` **e** na classe abstrata `XxxRepository`.
2. **Infraestrutura**: implemente o método no repositório Postgres (tipos de linha em `database/interfaces`). Mudou o esquema? `npm run migration:create -- descricao` e escreva o `up`/`down` (veja [Migrações](#migrações)); nunca edite uma migração já aplicada.
3. **Aplicação**: crie `application/<contexto>/dto/*.dto.ts` (entrada com decorators de `validation.ts`, saída como interface) e `application/<contexto>/use-cases/<acao>.use-case.ts` implementando `UseCase<Input, Output>`, recebendo repositórios com `@Inject(XxxRepository) private readonly x: IXxxRepository`. Registre em `application/index.ts`.
   Precisa reaproveitar lógica de outro caso de uso? Extraia para o domínio ou para `<contexto>.helpers.ts`; **não** injete o outro caso de uso.
4. **Apresentação**: adicione o método no controller (ou um controller novo, registrado em `app.module.ts`). O controller só lê parâmetros, chama `useCase.execute(...)` e devolve o resultado.
5. Rode `npm run typecheck -w @minha-rifa/backend` e `npm run lint:arch`.

---

## Banco de dados (PostgreSQL)

```
users ─┬─< sessions
       └─< raffles ─┬─< photos
                    ├─< orders ─< tickets
                    └─────────────< tickets
```

| Tabela | Colunas principais | Observações |
|---|---|---|
| `users` | `name`, `email` (único), `pass_hash`, `salt` | Senha com `scrypt` (64 bytes) + salt aleatório |
| `sessions` | `token` (PK), `user_id` | Token aleatório de 32 bytes, enviado no cookie `sid` |
| `raffles` | `slug` (único), `user_id`, `title`, `description`, `total_numbers`, `price_cents`, `pix_key`, `whatsapp`, `reserve_minutes`, `max_per_buyer`, `draw_date`, `status` (`open`/`drawn`), `winner_number`, `drawn_at` | Datas em ms (epoch). Valores em centavos |
| `photos` | `raffle_id`, `filename`, `position` | Arquivo em `DATA_DIR/uploads`; `position` 0 = capa |
| `orders` | `raffle_id`, `token` (único), `buyer_name`, `buyer_phone`, `numbers` (JSONB), `status`, `created_at`, `expires_at`, `paid_at` | `status`: `pending`, `paid`, `expired`, `cancelled` |
| `tickets` | PK `(raffle_id, number)`, `order_id` | **Garante que um número só pertence a um pedido ativo.** Linhas existem só para pedidos `pending`/`paid` |

- Ids `BIGINT GENERATED ALWAYS AS IDENTITY`; datas em ms como `BIGINT` (o driver converte `BIGINT` para `number`).
- Exclusão em cascata de `photos`, `orders` e `tickets` ao apagar a rifa; `CHECK` nos campos `status`.
- Esquema inicial em [`migrations/001_initial_schema.ts`](src/infrastructure/database/migrations/001_initial_schema.ts).

### Migrações

**Toda mudança no banco (tabela, coluna, índice, ajuste de dados) é feita por migração.** Nada de alterar pelo DBeaver: o que não está numa migração não existe nos outros ambientes.

```bash
npm run migration:create -- adiciona cpf no comprador
```

Cria `src/infrastructure/database/migrations/20261118143000_adiciona_cpf_no_comprador.ts`:

```ts
const migration: Migration = {
  up: `ALTER TABLE orders ADD COLUMN buyer_cpf TEXT;`,   // aplica a mudança
  down: `ALTER TABLE orders DROP COLUMN buyer_cpf;`,     // desfaz exatamente o que o up fez
};
export default migration;
```

```bash
npm run migration:run       # aplica as pendentes
npm run migration:status    # o que já foi aplicado e o que falta
npm run migration:revert    # desfaz a última (npm run migration:revert -- 3 desfaz as 3 últimas)
```

Como funciona ([`migrator.ts`](src/infrastructure/database/migrator.ts) e CLI em [`migrate.ts`](src/migrate.ts)):

- Os arquivos de `migrations/` são lidos automaticamente, em ordem de nome. O prefixo é data/hora (UTC), então duas pessoas criando migrações ao mesmo tempo não colidem. O nome do arquivo é o id gravado em `schema_migrations`.
- Cada migração roda na sua **própria transação**: se uma linha do SQL falhar, nada daquela migração fica no banco e ela continua pendente.
- `pg_advisory_lock`: só um processo migra por vez (várias instâncias subindo juntas, ou CLI + aplicação).
- Migração com `up` vazio (só comentários) é recusada; sem `down`, ela não pode ser revertida.
- `migration:status` avisa quando uma migração aplicada no banco não tem mais arquivo (alguém apagou ou renomeou).
- Os comandos funcionam tanto na raiz do monorepo quanto em `apps/backend` (a raiz repassa para o workspace).
- A aplicação aplica as pendentes ao subir (`npm run dev` também: salvou a migração, o backend reinicia e aplica). Em produção dá para desligar com `MIGRATE_ON_BOOT=false` e rodar `node apps/backend/dist/migrate.js up` como passo do deploy.

Regras:

1. **Nunca edite nem apague uma migração que já rodou** em algum ambiente compartilhado. Precisa corrigir? Crie outra.
2. Teste o `down`: `migration:run`, `migration:revert`, `migration:run` de novo.
3. Mudança que pode perder dados (apagar coluna, mudar tipo) merece backup antes (`pg_dump`, veja o [LEIA-ME](../../LEIA-ME.md)).
4. Os scripts `migration:*` compilam com `tsc` antes de rodar (eles leem `dist/`). Se renomear ou apagar uma migração ainda não aplicada, rode `npm run build` para limpar o `dist/`.

No Docker:

```bash
docker compose exec app node apps/backend/dist/migrate.js status
```

### Conectar (DBeaver, psql)

Postgres do docker-compose: host `localhost`, porta `5433`, banco `minha_rifa`, usuário/senha `rifa`/`rifa`.

```bash
docker compose exec db psql -U rifa -d minha_rifa
```

---

## API

Todas as respostas são JSON (`Cache-Control: no-store`). Erros: `{ "error": "mensagem em português" }`, e na reserva também `busy: [números]`.

### Conta

| Método | Rota | Corpo | Resposta | Regras |
|---|---|---|---|---|
| `POST` | `/api/register` | `{ name, email, password }` | `{ name, email }` + cookie | E-mail válido e único; senha ≥ 6 |
| `POST` | `/api/login` | `{ email, password }` | `{ name, email }` + cookie | 401 se inválido (comparação em tempo constante) |
| `POST` | `/api/logout` | — | `{ ok }` | Apaga a sessão e o cookie |
| `GET` | `/api/me` | — | `{ user: { name, email } \| null }` | |

### Rifas do administrador (exigem login)

| Método | Rota | Resposta / efeito | Regras |
|---|---|---|---|
| `GET` | `/api/raffles` | Lista com `paid`, `pending`, `cover` | Só rifas do usuário |
| `POST` | `/api/raffles` | `{ id, slug }` | Valida campos (`RaffleInputDto` + `CreateRaffleUseCase`), até 8 fotos em data URL |
| `GET` | `/api/raffles/:id` | `{ raffle, photos, orders, taken, counts, can_draw, winner }` | `orders` só pendentes e pagos; `taken` = `[número, 'p'\|'r']` |
| `PUT` | `/api/raffles/:id` | `{ ok }` | Só se `open`. Com números reservados/pagos, `total_numbers` e `price_cents` são ignorados. `photos`: `{ id }` mantém, `{ data }` cria; as ausentes são apagadas |
| `DELETE` | `/api/raffles/:id` | `{ ok }` | Proibido se houver número pago |
| `POST` | `/api/raffles/:id/draw` | `{ winner }` | Ver [Sorteio](#sorteio) |

### Pedidos (exigem login, rifa aberta)

| Método | Rota | Regras |
|---|---|---|
| `POST` | `/api/orders/:id/approve` | Só pedido `pending` → `paid` |
| `POST` | `/api/orders/:id/cancel` | Pedido `pending` ou `paid` → `cancelled`, libera os números |

### Público (sem login)

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| `GET` | `/api/r/:slug` | — | `{ raffle, photos, taken, winner }`. `taken` = `[número, 'p'\|'r', nome abreviado]`. Sem telefones |
| `POST` | `/api/r/:slug/reserve` | `{ name, phone, numbers }` | `{ token }`. 409 + `busy` se algum número já foi pego |
| `GET` | `/api/pedido/:token` | — | `{ token, status, buyer_name, numbers, total_cents, expires_at }` |

O `token` do pedido (16 bytes aleatórios) é a única "credencial" do comprador e fica no `localStorage` dele.

---

## Regras garantidas pelo servidor

### Validação de rifa (`RaffleInputDto` + `toRaffleDetails`)

| Campo | Regra |
|---|---|
| `title` | 1–120 caracteres |
| `description` | 0–5000 |
| `pix_key` | 1–200 |
| `whatsapp` | 10–13 dígitos (só dígitos são guardados) |
| `reserve_minutes` | 5 a 43.200 (30 dias) |
| `max_per_buyer` | vazio ou 1–5000 |
| `draw_date` | vazio ou timestamp em ms |
| `total_numbers` | 2–5000 (ignorado quando travado) |
| `price_cents` | 1 a 10.000.000 (ignorado quando travado) |
| fotos | JPEG/PNG/WebP em data URL, até 5 MB cada, até 8 |

### Reserva

1. Rifa precisa estar `open`; nome 1–80 caracteres; telefone 10–13 dígitos; pelo menos 1 número; números entre 1 e `total_numbers` (duplicados são removidos).
2. Limite por comprador: soma os números já em pedidos ativos com o mesmo telefone.
3. Números ocupados → 409 com `busy`.
4. Cria o pedido com `expires_at = agora + reserve_minutes`.

### Sorteio

- `canDraw`: rifa `open`, pelo menos 1 pago, e (todos pagos **ou** `agora ≥ draw_date`).
- Ganhador: `crypto.randomInt` sobre a lista de números pagos.
- Na mesma transação: cancela pedidos pendentes, grava `status = 'drawn'`, `winner_number`, `drawn_at`.
- Depois disso, edição, aprovação e cancelamento retornam erro.

### Privacidade

- Endpoints públicos só expõem o nome abreviado (`shortName`: primeiro nome + inicial do último).
- Telefones de compradores só saem em `/api/raffles/:id` (dono da rifa).

### Sessão e cookies

- Cookie `sid`: `HttpOnly`, `SameSite=Lax`, `Path=/`, 30 dias. Sem `Secure`; em produção use HTTPS na frente.
- Sessões não expiram no banco (só o cookie). Logout apaga a sessão.

---

## Limitações conhecidas

- Sem rate limit em login/cadastro/reserva.
- Sem testes automatizados (a paridade da API foi verificada com um script externo).
- Fotos chegam em base64 no JSON (corpo até 40 MB).
- Sessões não expiram no banco (só o cookie).
- Fotos ficam em disco local (`DATA_DIR`): com várias instâncias, use um volume compartilhado ou mova para um storage de objetos (S3 etc.) implementando outro `PhotoStorage`.
