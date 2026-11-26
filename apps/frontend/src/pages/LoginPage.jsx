import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { Topbar } from '../shared/ui/layout/Topbar';
import { AuthForm } from '../features/auth/components/AuthForm';

export function LoginPage() {
  useDocumentTitle('Entrar · Minha Rifa');

  return (
    <>
      <Topbar brandTo="/" />
      <main className="wrap login">
        <section className="card login-card">
          <span className="login-badge" aria-hidden="true">🎟️</span>
          <div className="stack-sm">
            <h1>Entre na sua conta</h1>
            <p className="muted">Crie suas rifas, divulgue o link e confirme os pagamentos num lugar só.</p>
          </div>
          <AuthForm />
        </section>
        <p className="login-buyer small">
          Recebeu o link de uma rifa? É só abrir: não precisa de conta para comprar.
        </p>
      </main>
    </>
  );
}
