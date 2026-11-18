import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(import.meta.dirname, '..', 'src');
const TYPE_HOME = /[/\\](dto|interfaces)[/\\]/;

const RULES = [
  {
    name: 'types-live-in-dto-or-interfaces',
    message: 'Interfaces e types ficam em dto/ ou interfaces/ (e são importados de lá).',
    applies: (file) => !TYPE_HOME.test(file),
    test: (line) => /^\s*(export\s+)?(interface\s+\w+|type\s+\w+(<[^>]*>)?\s*=)/.test(line),
  },
  {
    name: 'no-inline-object-types',
    message: 'Tipo objeto escrito na hora: crie uma interface em dto/ ou interfaces/.',
    applies: (file) => !TYPE_HOME.test(file),
    test: (line) => /\bas\s+(unknown\s+as\s+)?\{/.test(line) || /Promise<\{/.test(line) || /:\s*\{[^}]*\w\??:\s*[^,}]+;[^}]*\}/.test(line),
  },
  {
    name: 'use-case-depends-on-repository-interface',
    message: 'Use case recebe o repositório pela interface: `@Inject(XRepository) private readonly x: IXRepository`.',
    applies: (file) => file.endsWith('.use-case.ts'),
    test: (line) => /private readonly \w+: (?!I[A-Z])\w*(Repository|Storage|UnitOfWork)\b/.test(line)
      || (/private readonly \w+: I\w*(Repository|Storage|UnitOfWork)\b/.test(line) && !/@Inject\(/.test(line)),
  },
  {
    name: 'repository-token-implements-interface',
    message: 'A classe abstrata do repositório implementa a interface correspondente (`implements IXRepository`).',
    applies: (file) => /[/\\]domain[/\\]repositories[/\\][^/\\]+\.ts$/.test(file),
    test: (line) => /export abstract class \w+(?! implements I\w+)\s*\{/.test(line),
  },
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });
}

const violations = [];
for (const file of walk(SRC)) {
  const rel = path.relative(path.dirname(SRC), file);
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line) || /^\s*import\b/.test(line)) return;
    for (const rule of RULES) {
      if (rule.applies(file) && rule.test(line)) violations.push(`  error ${rule.name}: ${rel}:${i + 1}\n        ${line.trim()}\n        → ${rule.message}`);
    }
  });
}

if (violations.length) {
  console.error(violations.join('\n'));
  console.error(`\nx ${violations.length} violação(ões) de convenção.`);
  process.exit(1);
}
console.log('✔ convenções ok (tipos em dto/interfaces, use cases dependem de interfaces de repositório)');
