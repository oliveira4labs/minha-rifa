import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { Topbar } from '../shared/ui/layout/Topbar';
import { AuthForm } from '../features/auth/components/AuthForm';

export function LoginPage() {
  const navigate = useNavigate();
  useDocumentTitle('Minha Rifa');

  return (
    <>
      <Topbar brandTo="/" />
      <main className="wrap narrow stack">
        <div className="stack-sm" style={{ marginTop: 12 }}>
          <h1>Crie sua rifa e compartilhe o link</h1>
          <p className="muted">
            Cadastre o prêmio com fotos, defina os números e o valor, confirme os pagamentos e faça o sorteio.
          </p>
        </div>
        <AuthForm onSuccess={() => navigate('/painel')} />
        <p className="small muted">Recebeu o link de uma rifa? Basta abrir o link — não precisa de conta para comprar.</p>
      </main>
    </>
  );
}
