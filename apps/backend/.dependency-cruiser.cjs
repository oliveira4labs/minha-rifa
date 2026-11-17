/**
 * Regras de arquitetura (onion básica). Rode: npm run lint:arch
 *
 *   presentation (controllers, guards, jobs)  ─┐
 *   infrastructure (repositórios concretos)  ──┼──▶ application (use cases, DTOs) ──▶ domain
 *                                              │
 *   app.module.ts = raiz de composição (único que conhece tudo)
 */
const USE_CASE = '\\.use-case\\.ts$';

module.exports = {
  forbidden: [
    // ---------------------------------------------------------------- domínio
    {
      name: 'domain-is-the-core',
      comment: 'O domínio não depende de nenhuma outra camada.',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: { path: '^src/(application|infrastructure|presentation|config)/|^src/app\\.module' },
    },
    {
      name: 'domain-without-framework',
      comment: 'O domínio é TypeScript puro: sem Nest, Express, class-validator...',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: { dependencyTypes: ['npm', 'npm-dev', 'npm-peer', 'npm-optional'] },
    },

    // ---------------------------------------------------------------- aplicação
    {
      name: 'application-only-knows-domain',
      comment: 'Casos de uso e DTOs não conhecem banco, HTTP nem configuração.',
      severity: 'error',
      from: { path: '^src/application/' },
      to: { path: '^src/(infrastructure|presentation|config)/' },
    },
    {
      name: 'use-case-does-not-call-use-case',
      comment: 'Um caso de uso NUNCA chama outro. Regra comum vai para o domínio ou para um *.helpers.ts.',
      severity: 'error',
      from: { path: USE_CASE },
      to: { path: USE_CASE },
    },
    {
      name: 'helpers-do-not-call-use-cases',
      comment: 'Helpers existem para evitar que um caso de uso chame outro; não podem virar atalho.',
      severity: 'error',
      from: { path: '^src/application/.*\\.helpers\\.ts$' },
      to: { path: USE_CASE },
    },
    {
      name: 'use-case-only-uses-repositories',
      comment: 'Caso de uso depende só de: domínio (interfaces e tokens de repositório, modelos, regras, erros), DTOs, helpers e @nestjs/common (DI).',
      severity: 'error',
      from: { path: USE_CASE },
      to: {
        dependencyTypesNot: ['core'],
        pathNot: [
          '^src/domain/',
          '^src/application/common/',
          '^src/application/[^/]+/dto/',
          '^src/application/[^/]+/[^/]+\\.helpers\\.ts$',
          'node_modules/@nestjs/common/',
        ],
      },
    },
    {
      name: 'dto-is-data-only',
      comment: 'DTO não chama caso de uso nem repositório.',
      severity: 'error',
      from: { path: '^src/application/[^/]+/dto/' },
      to: { path: [USE_CASE, '^src/domain/repositories/'] },
    },

    // ---------------------------------------------------------------- apresentação
    {
      name: 'presentation-only-calls-use-cases',
      comment: 'Controllers, guards, interceptors e jobs só chamam casos de uso: nunca repositórios.',
      severity: 'error',
      from: { path: '^src/presentation/' },
      to: { path: '^src/(infrastructure/|domain/(repositories|interfaces|rules)/)' },
    },
    {
      name: 'presentation-does-not-use-helpers',
      comment: 'Helpers da aplicação são uso interno dos casos de uso.',
      severity: 'error',
      from: { path: '^src/presentation/' },
      to: { path: '^src/application/.*\\.helpers\\.ts$' },
    },

    // ---------------------------------------------------------------- infraestrutura
    {
      name: 'infrastructure-implements-domain-only',
      comment: 'Repositórios concretos implementam portas do domínio; não conhecem casos de uso nem HTTP.',
      severity: 'error',
      from: { path: '^src/infrastructure/' },
      to: { path: '^src/(application|presentation)/' },
    },

    // ---------------------------------------------------------------- geral
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.js'] },
  },
};
