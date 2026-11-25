# Frontend — Minha Rifa

Interface web do sistema de rifas: React 19 + Vite 8 + React Router 7, em JavaScript (JSX), sem biblioteca de UI.
O visual vem de um único CSS global ([src/shared/styles/global.css](src/shared/styles/global.css)).

- [Como rodar](#como-rodar)
- [Regras de negócio](#regras-de-negócio)
- [Arquitetura](#arquitetura)
- [Convenções](#convenções)

---

## Como rodar

Na raiz do repositório (o front é um workspace npm, `@minha-rifa/frontend`):

| Comando | O que faz |
|---|---|
| `npm install` | Instala as dependências de todos os workspaces |
| `npm run dev` | Postgres no Docker + backend (porta 3000, com `--watch`) + Vite (porta 5173, com recarga automática) |
| `npm run build` | Gera `apps/frontend/dist` |
| `npm start` | Backend servindo o `dist` em http://localhost:3000 |

Em desenvolvimento, o Vite repassa `/api` e `/uploads` para o backend ([vite.config.js](vite.config.js)).
Para apontar para outro backend: `BACKEND_URL=http://host:porta npm run dev -w @minha-rifa/frontend`.

---

## Regras de negócio

### Perfis

| Perfil | Precisa de conta? | O que faz |
|---|---|---|
| **Administrador** | Sim (e-mail + senha) | Cria rifas, divulga o link, confirma pagamentos, sorteia |
| **Comprador** | Não | Abre o link, escolhe números, reserva com nome + WhatsApp, paga via PIX |

Qualquer pessoa pode criar uma conta e vira administradora **apenas das rifas que criar**.

### Conta

- Cadastro: nome (até 80 caracteres), e-mail único (até 160), senha com **mínimo 6 caracteres**.
- Ao entrar ou se cadastrar, a pessoa vai para `/painel`. Sessão dura **30 dias** (cookie `sid`).
- Quem já está logado e abre `/` é levado direto ao painel; quem não está logado e abre `/painel` ou `/gerenciar` volta para `/`.

### Rifa

| Campo | Regra |
|---|---|
| Título | Obrigatório, até 120 caracteres |
| Descrição | Opcional, até 5000 caracteres |
| Fotos | Até **8**; a primeira é a capa. JPG/PNG/WebP. O navegador reduz para no máx. 1600px no lado maior (JPEG 85%, sem cortar) antes de enviar e recusa originais acima de 30 MB; o servidor aceita até 5 MB por foto. Na página pública a foto aparece inteira, com o fundo desfocado da própria foto preenchendo as sobras |
| Quantidade de números | Entre **2 e 5000**. Números vão de 1 até a quantidade |
| Valor por número | Maior que zero, até R$ 100.000,00. Digitado em reais (`10,00`, `1.234,50`) e enviado em centavos |
| Chave PIX | Obrigatória, até 200 caracteres. Texto livre (CPF, celular, e-mail, aleatória) |
| WhatsApp do administrador | Obrigatório, com DDD (10 a 13 dígitos). É para onde o comprador manda o comprovante |
| Tempo de reserva | Em minutos, horas ou dias. O servidor aceita de **5 minutos a 30 dias**. Padrão: 2 horas |
| Limite por comprador | Opcional. Máximo de números por WhatsApp na rifa |
| Data do sorteio | Opcional. Pode ser alterada depois |

Restrições de edição:

- **Quantidade e valor ficam travados** quando já existe pelo menos um número reservado ou pago (o formulário mostra os campos desabilitados e explica o motivo).
- Rifa **sorteada não pode mais ser editada** (o card "Editar dados da rifa" some).
- Rifa só pode ser **excluída se não tiver números pagos**. A exclusão apaga fotos e reservas e pede confirmação.

### Números e reservas (pedidos)

Cada reserva é um **pedido** com um ou mais números. O número fica ocupado **já no clique**, e o prazo
(tempo de reserva da rifa) corre para o **comprador**: nele, ele informa nome e WhatsApp, paga e envia o comprovante.

```
        clica no número        informa nome e WhatsApp     clica em "Enviar comprovante"     admin confirma
 (livre) ─────────────▶ guardado ───────────────────────▶ pendente ──────────────────────────▶ comprovante enviado ─────────────▶ pago
                          │                                  │                                  │  (sem prazo)                    │
           prazo acabou ──┤                   prazo acabou ──┤                    admin recusa ──┤                admin desfaz ──┘
                          ▼                                  ▼                                  ▼                                  ▼
                       expirado                           expirado                          cancelado                          cancelado
     (números voltam a ficar disponíveis em todos esses casos)
```

| Status | Quem vê | O que significa |
|---|---|---|
| `held` (guardado) | Só o próprio comprador (os outros veem "reservado") | Clicou nos números, ainda não informou os dados. Pode soltar um número clicando de novo |
| `pending` (pendente) | Comprador e admin ("Aguardando pagamento do comprador") | Dados informados; falta pagar e enviar o comprovante |
| `proof_sent` (comprovante enviado) | Comprador e admin ("Comprovante enviado — confirme o pagamento") | O relógio parou; o número fica ocupado até o admin confirmar ou recusar |
| `paid` (pago) | Todos | Pagamento confirmado |

- O prazo é contado **a partir do primeiro clique** e vale para todos os números do mesmo carrinho.
- Um número pertence a **no máximo um pedido ativo** por vez. Se dois compradores clicam no mesmo número, o segundo recebe aviso e a grade é atualizada.
- O **limite por comprador** vale no carrinho (não deixa clicar além do limite) e, ao informar os dados, também soma os pedidos que aquele WhatsApp já tem na rifa.
- Pedidos `held` e `pending` expiram sozinhos ao fim do prazo. O servidor libera os números a cada 30s e antes de toda requisição.
- O sistema não consegue ver se a mensagem foi realmente enviada no WhatsApp: o que para o relógio é o clique no botão. Se o comprovante não chegar, o admin **recusa** o pedido.
- No sorteio, todos os pedidos ainda não pagos são **cancelados**.

### Pagamento

Não há integração com meio de pagamento. O fluxo é manual:

1. O comprador clica nos números: eles ficam guardados e a barra de baixo mostra o tempo restante.
2. Em **Continuar**, informa nome e WhatsApp e vê o pedido "Faça o pagamento", com a mesma contagem regressiva.
3. Copia a chave PIX e paga fora do sistema.
4. Toca em "Enviar comprovante pelo WhatsApp": o pedido passa a "Comprovante enviado" (o relógio para) e abre a conversa com o administrador já com a mensagem pronta (números, nome e total).
5. O administrador confere e clica em **Confirmar pagamento** no painel (ou **Recusar**). Uma venda paga ainda pode ser **desfeita** enquanto a rifa estiver aberta.

### Sorteio

- Liberado quando a rifa está aberta, tem pelo menos 1 número pago e:
  - **todos os números estão pagos**, ou
  - **a data do sorteio chegou**.
- Na data, se a rifa não estiver completa, o painel avisa e o administrador pode **adiar a data** ou **sortear só entre os pagos**.
- Sempre há uma confirmação explicando o que vai acontecer (quantos pagos, quantos pendentes serão cancelados). **O sorteio não pode ser desfeito.**
- O ganhador é escolhido no servidor, de forma aleatória (criptograficamente segura), **apenas entre os números pagos**.
- Depois do sorteio: a rifa fica "Sorteada", o painel mostra o número, nome e WhatsApp do ganhador (com botão para avisá-lo), e a página pública mostra só o número sorteado.

### Privacidade

- A página pública **não mostra o nome de quem comprou**: um número ocupado aparece só como reservado ou pago, e o ganhador aparece só pelo número.
- O WhatsApp dos compradores **só o administrador vê**.

### Comprador sem conta

- Os pedidos do comprador ficam guardados **no próprio navegador** (`localStorage`, chave `rifa:<slug>:pedidos`), e o carrinho com os números guardados em `rifa:<slug>:carrinho` (recarregar a página não perde a seleção). Em outro aparelho ele não verá a seção "Seus pedidos".
- Nome e WhatsApp da última reserva são lembrados (`rifa:comprador`) e preenchem o formulário da próxima.
- Pedidos expirados ou cancelados podem ser **dispensados** da lista.

### Divulgação

- Cada rifa tem um link público `/r/<slug>` (slug aleatório de 10 caracteres).
- O painel oferece: copiar link, abrir, e uma **mensagem pronta** (com prévia) para copiar ou enviar pelo WhatsApp: título, primeira frase da descrição, valor, quantos números restam, data do sorteio e o link. Quando sobram 10 números ou menos, ela lista quais são.
- Rodando em `localhost`, o painel avisa que o link só abre naquele computador.

### Atualização automática

| Tela | Intervalo | Pausa quando |
|---|---|---|
| Gestão da rifa (`/gerenciar`) | 15 s | Há diálogo de confirmação aberto |
| Página pública (`/r/:slug`) | 20 s | O diálogo de reserva está aberto |
| Página pública, pedido ou carrinho vencido | 1 s | — (atualiza assim que a contagem chega a zero) |

Na gestão, a atualização **não apaga o que o administrador está digitando** no formulário de edição nem na data do sorteio (ver [Estado do formulário de edição](#estado-do-formulário-de-edição)).
Na página pública, cada clique num número já ocupa (ou solta) o número no servidor. Se outra pessoa pegou antes, aparece o aviso e a grade é atualizada.

### Formatação

- Números exibidos com zeros à esquerda conforme o total (`007` numa rifa de 100).
- Valores em reais (`R$ 10,00`), datas em `dd/mm/aaaa hh:mm`, telefone `(11) 91234-5678`.
- Links de WhatsApp assumem DDI 55 quando o número tem até 11 dígitos.

---

## Arquitetura

### Visão geral

```
               ┌──────────── navegador ────────────┐
               │  React Router                     │
               │   ├─ /            LoginPage       │
               │   ├─ /painel      DashboardPage   │──┐
               │   ├─ /gerenciar   ManageRafflePage│  │ fetch /api/*
               │   └─ /r/:slug     PublicRafflePage│  │ (JSON, cookie sid)
               └───────────────────────────────────┘  │
                                                      ▼
                                       backend (apps/backend/server.js)
                                       serve também o dist/ em produção
```

SPA pura: o front não tem SSR. Em produção o backend devolve `index.html` para qualquer rota sem extensão e o React Router escolhe a tela.

### Estrutura de pastas

```
apps/frontend/
├── index.html               HTML base (só o <div id="root">)
├── vite.config.js           plugin React + proxy de /api e /uploads
└── src/
    ├── main.jsx             monta <App/> e importa o CSS global
    ├── app/                 composição da aplicação
    │   ├── App.jsx          BrowserRouter + providers (Toast, Confirm, Auth)
    │   ├── AppRoutes.jsx    tabela de rotas e guardas
    │   └── AdminLayout.jsx  topo com nome do usuário e "Sair"
    ├── pages/               uma tela por rota; só compõe features
    ├── features/            uma pasta por funcionalidade
    │   ├── auth/
    │   ├── raffles/
    │   ├── raffle-management/
    │   └── public-raffle/
    └── shared/              reutilizável, sem regra de negócio
        ├── api/             httpClient (fetch + ApiError)
        ├── lib/             funções puras: format, whatsapp, image, clipboard, storage
        ├── hooks/           useInterval, useNow, useCopy, useDocumentTitle
        ├── ui/
        │   ├── components/  Tag, ProgressBar, Chips, CopyBox, Countdown, Stat, Loading, ErrorCard, ExternalLink
        │   ├── feedback/    ToastProvider, ConfirmProvider, Dialog
        │   └── layout/      Topbar
        └── styles/global.css
```

### Camadas e dependências

```
pages  ──▶  features  ──▶  shared
  │            │
  └────────────┴──▶ app (só App/rotas importam pages)
```

- **`shared`** não importa nada de `features` nem de `pages`.
- **`features`** importam de `shared` e, quando faz sentido, de outra feature mais "base" (ex.: `raffle-management` usa `rafflesApi` e `RaffleForm` de `raffles`). Nunca importam de `pages`.
- **`pages`** só montam componentes e hooks das features; não chamam `fetch` nem guardam regra.

Dentro de cada feature, a mesma divisão:

| Pasta | Responsabilidade | Pode usar React? |
|---|---|---|
| `api/` | Funções que chamam o backend via `http` | Não |
| `model/` ou `lib/` | Regras puras, conversões, textos, persistência local | Não |
| `hooks/` | Estado, efeitos, polling, orquestração de ações | Sim |
| `components/` | Apresentação; recebem dados e callbacks por props | Sim |
| `context/` | Estado global da feature (só `auth`) | Sim |

### Features

#### `auth`

| Arquivo | Papel |
|---|---|
| `api/authApi.js` | `me`, `login`, `register`, `logout` |
| `context/AuthContext.jsx` | `AuthProvider` + `useAuth()`: `user` (`undefined` = carregando, `null` = deslogado), `login`, `register`, `logout` |
| `components/RouteGuards.jsx` | `RequireAuth` (rotas do admin) e `GuestOnly` (tela de entrada) |
| `components/AuthForm.jsx` | Abas Entrar / Criar conta |

#### `raffles` — CRUD e formulário de rifa (usado no painel e na gestão)

| Arquivo | Papel |
|---|---|
| `api/rafflesApi.js` | `list`, `get`, `create`, `update`, `remove`, `draw` |
| `model/raffleFormModel.js` | `toFormValues(raffle)` (API → campos), `toPayload(values, photos)` (campos → API, valida o valor), `toPartialPayload` (salvar só um campo), `MAX_PHOTOS`, `RESERVE_UNITS` |
| `components/RaffleForm.jsx` | Formulário controlado; recebe `onSubmit`, `onDirty`, `locked` e `renderActions` |
| `components/PhotoPicker.jsx` | Adicionar/remover fotos (redimensiona no navegador) |
| `components/RaffleCard.jsx` | Item da lista "Minhas rifas" |

#### `raffle-management` — tela `/gerenciar`

| Arquivo | Papel |
|---|---|
| `api/ordersApi.js` | `approve`, `cancel` de pedidos |
| `model/raffleRules.js` | Regras puras: `drawStatus`, `drawConfirmText`, `shareMessage`, `freeNumbers`, `isLocked`, `publicRaffleUrl`, `winnerMessage` |
| `hooks/useManagedRaffle.js` | Carrega a rifa, faz polling e controla a "foto" usada pelo formulário de edição |
| `hooks/useRaffleActions.js` | Ações com confirmação + API + recarga + toast: aprovar, recusar/desfazer, salvar data, sortear, salvar edição, excluir |
| `components/*` | `ShareSection`, `StatsGrid`, `DrawSection`, `WinnerCard`, `OrdersSection`/`OrderCard`, `EditRaffleSection` |

#### `public-raffle` — tela `/r/:slug`

| Arquivo | Papel |
|---|---|
| `api/publicRaffleApi.js` | `get(slug)`, `hold`/`release(slug, { token, number })`, `reserve(slug, { token, name, phone })`, `getOrder(token)`, `proofSent(token)` |
| `lib/buyerStorage.js` | Tokens de pedidos e dados do comprador no `localStorage` |
| `hooks/usePublicRaffle.js` | Dados da rifa + pedidos do navegador, polling, `forgetOrder` |
| `hooks/useNumberSelection.js` | Números selecionados, limite por pessoa, remoção de números "perdidos" |
| `components/*` | `RaffleHero`, `Gallery`, `WinnerBanner`, `NumbersSection`/`NumberGrid`, `BuyBar`, `ReserveDialog`, `BuyerOrderCard` |

### Estado

Sem Redux/Zustand/React Query. O estado fica onde é usado:

| Tipo | Onde |
|---|---|
| Usuário logado | `AuthContext` |
| Toast e diálogo de confirmação | `ToastProvider` / `ConfirmProvider` (`useToast()`, `useConfirm()`) |
| Dados de uma tela | Hook da feature (`useManagedRaffle`, `usePublicRaffle`) |
| Campos de formulário | Estado local do componente (`RaffleForm`, `AuthForm`, `ReserveDialog`, `DrawSection`) |
| Dados do comprador | `localStorage` via `buyerStorage` |

`useConfirm()` devolve `{ confirm, isOpen }`. `confirm(opts)` é uma Promise que resolve `true`/`false`, então as ações podem ser escritas em sequência:

```js
if (!(await confirm({ title: 'Excluir esta rifa?', text: '…', danger: true }))) return;
await rafflesApi.remove(id);
```

### Estado do formulário de edição

A tela de gestão atualiza a cada 15 s, mas o formulário "Editar dados da rifa" não pode perder o que está sendo digitado. Solução:

1. `useManagedRaffle` guarda, além de `data`, uma **foto** `form = { data, key }` usada só para preencher o formulário.
2. `EditRaffleSection` informa via `setFormBusy(open || dirty)` se o card está aberto ou alterado.
3. No polling, a foto só é renovada se o formulário **não** estiver ocupado. Ao renovar, `key` muda e o `RaffleForm` é recriado (`key={form.key}`) com os valores novos.
4. Depois de ações que mudam a rifa (salvar edição, salvar data, sortear), `refresh({ resetForm: true })` força a renovação.

`DrawSection` faz algo parecido: guarda o rascunho da data localmente e só sincroniza quando `raffle.draw_date` muda no servidor.

### Comunicação com a API

- [`shared/api/httpClient.js`](src/shared/api/httpClient.js) expõe `http.get/post/put/delete`, envia/recebe JSON e transforma respostas de erro em `ApiError` (`message`, `status`, `busy`).
- A autenticação usa o cookie `sid` (HttpOnly), enviado automaticamente pelo navegador; o front não manipula token.
- Mensagens de erro já vêm prontas em português do backend e são exibidas como toast.

### Performance

- A grade pode ter até 5000 números. `NumberCell` é `memo` e o callback de clique é estável (via ref), então selecionar um número re-renderiza só a célula alterada.
- Contagens regressivas (`<Countdown>`) atualizam sozinhas sem re-renderizar a página inteira.

### Rotas

| Rota | Página | Acesso |
|---|---|---|
| `/` | `LoginPage` | Só deslogado (`GuestOnly`) |
| `/painel` | `DashboardPage` | Logado (`RequireAuth` + `AdminLayout`) |
| `/gerenciar?id=<id>` | `ManageRafflePage` | Logado |
| `/r/:slug` | `PublicRafflePage` | Público |
| `*` | `NotFoundPage` | Público |

---

## Convenções

- **Componentes** em PascalCase, um por arquivo (exceto componentes visuais minúsculos em `shared/ui/components/index.jsx`). Exports nomeados, sem `default`.
- **Hooks** começam com `use` e ficam em `hooks/`.
- **Funções puras** (regras, formatação, textos) ficam fora de componentes, em `model/`/`lib/`, para poderem ser testadas sem React.
- **Estilo**: classes do `global.css` (`card`, `btn primary`, `stack`, `row between`…). Estilo inline só para ajustes pontuais herdados do layout original.
- **Textos** de interface em português; nomes de código em inglês.
- **Nova funcionalidade**: crie `features/<nome>/` com as subpastas necessárias; se precisar de rota, crie a página em `pages/` e registre em `app/AppRoutes.jsx`.
