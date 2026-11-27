import { supportEmailLink } from '../lib/support';

// Fim da página da rifa: atalho para o e-mail do suporte com a mensagem pronta
export function SupportFooter({ raffleTitle }) {
  const pageUrl = `${window.location.origin}${window.location.pathname}`;
  return (
    <footer className="support-footer">
      Ficou alguma dúvida? Fale com o <a href={supportEmailLink(raffleTitle, pageUrl)}>nosso suporte</a>.
    </footer>
  );
}
