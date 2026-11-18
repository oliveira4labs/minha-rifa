import { appConfig } from './config/app.config.js';
import { Migrator } from './infrastructure/database/migrator.js';

const USAGE = 'Uso: node dist/migrate.js <up | down [quantidade] | status>';

async function main(): Promise<void> {
  const [command, arg] = process.argv.slice(2);
  const migrator = new Migrator(appConfig.databaseUrl);

  switch (command) {
    case 'up': {
      const applied = await migrator.up();
      console.log(applied.length ? `${applied.length} migração(ões) aplicada(s).` : 'Nada a aplicar: o banco já está atualizado.');
      return;
    }
    case 'down': {
      const steps = arg === undefined ? 1 : Number(arg);
      if (!Number.isInteger(steps) || steps < 1) throw new Error('A quantidade precisa ser um número inteiro maior que zero.');
      const reverted = await migrator.down(steps);
      console.log(reverted.length ? `${reverted.length} migração(ões) revertida(s).` : 'Nenhuma migração aplicada para reverter.');
      return;
    }
    case 'status': {
      const all = await migrator.status();
      for (const m of all) {
        const state = m.appliedAt ? `aplicada em ${m.appliedAt.toLocaleString('pt-BR')}` : 'PENDENTE';
        console.log(`${m.id.padEnd(50)} ${state}${m.missingFile ? '  (arquivo não encontrado!)' : ''}`);
      }
      const pending = all.filter((m) => !m.appliedAt).length;
      console.log(`\n${all.length} migração(ões), ${pending} pendente(s).`);
      return;
    }
    default:
      console.error(USAGE);
      process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(`Erro: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
