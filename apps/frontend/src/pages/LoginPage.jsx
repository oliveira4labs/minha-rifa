import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { Topbar } from '../shared/ui/layout/Topbar';
import { AuthForm } from '../features/auth/components/AuthForm';

const STEPS = [
  { icon: '📸', title: 'Cadastre o prêmio', text: 'Fotos, quantidade de números e valor de cada um.' },
  { icon: '📲', title: 'Divulgue o link', text: 'Mensagem pronta para mandar nos grupos do WhatsApp.' },
  { icon: '✅', title: 'Confirme os pagamentos', text: 'Confira o PIX no seu banco e confirme com um clique.' },
  { icon: '🎲', title: 'Sorteie', text: 'Aleatório, só entre os números pagos.' },
];

// Grade de exemplo (só ilustração): p = pago, r = reservado, s = escolhido.
const PREVIEW = ['p', '', 'r', '', 'p', '', 's', '', 'p', '', 'r', 'p', '', '', 's'];
const PREVIEW_CLASS = { p: 'paid', r: 'res', s: 'sel' };

function RafflePreview() {
  return (
    <div className="login-preview card" aria-hidden="true">
      <div className="row between">
        <b>Bicicleta aro 29</b>
        <span className="tag open">Aberta</span>
      </div>
      <div className="small muted">R$ 10,00 por número</div>
      <div className="login-preview-grid">
        {PREVIEW.map((status, i) => (
          <span key={i} className={`n ${PREVIEW_CLASS[status] ?? ''}`}>{String(i + 1).padStart(3, '0')}</span>
        ))}
      </div>
    </div>
  );
}

export function LoginPage() {
  useDocumentTitle('Minha Rifa');

  return (
    <>
      <Topbar brandTo="/" />
      <main className="wrap login">
        <section className="login-hero">
          <div className="stack">
            <span className="login-kicker">Rifas pelo WhatsApp, sem planilha</span>
            <h1>Crie sua rifa e compartilhe o link</h1>
            <p className="login-lead muted">
              Seus compradores escolhem os números pelo celular, pagam no PIX e você acompanha tudo num painel só.
            </p>
            <AuthForm />
          </div>
          <RafflePreview />
        </section>

        <ol className="login-steps">
          {STEPS.map((step) => (
            <li key={step.title}>
              <span className="login-step-icon" aria-hidden="true">{step.icon}</span>
              <div>
                <b>{step.title}</b>
                <p className="small muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="login-buyer small">
          🎟️ <b>Recebeu o link de uma rifa?</b> É só abrir o link: não precisa de conta para comprar.
        </p>
      </main>
    </>
  );
}
