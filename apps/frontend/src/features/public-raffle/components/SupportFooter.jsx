import { whatsappLink } from '../../../shared/lib/whatsapp';
import { ExternalLink } from '../../../shared/ui/components';
import { SUPPORT_WHATSAPP, supportMessage } from '../lib/support';

// Fim da página da rifa: atalho para o suporte no WhatsApp com a mensagem pronta
export function SupportFooter({ raffleTitle }) {
  const pageUrl = `${window.location.origin}${window.location.pathname}`;
  return (
    <footer className="support-footer">
      Ficou alguma dúvida? Fale com o{' '}
      <ExternalLink href={whatsappLink(SUPPORT_WHATSAPP, supportMessage(raffleTitle, pageUrl))}>nosso suporte</ExternalLink>.
    </footer>
  );
}
