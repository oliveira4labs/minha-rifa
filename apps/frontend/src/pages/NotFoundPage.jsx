import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { ErrorCard } from '../shared/ui/components';
import { Topbar } from '../shared/ui/layout/Topbar';

export function NotFoundPage() {
  useDocumentTitle('Página não encontrada');
  return (
    <>
      <Topbar brandTo="/" />
      <main className="wrap stack">
        <ErrorCard title="Página não encontrada.">
          <p><Link to="/">Voltar para o início</Link></p>
        </ErrorCard>
      </main>
    </>
  );
}
