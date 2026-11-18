import { useCopy } from '../../../shared/hooks/useCopy';
import { whatsappShareLink } from '../../../shared/lib/whatsapp';
import { CopyBox, ExternalLink } from '../../../shared/ui/components';
import { isLocalHost, publicRaffleUrl, shareMessage } from '../model/raffleRules';

export function ShareSection({ raffle, taken }) {
  const copy = useCopy();
  const url = publicRaffleUrl(raffle.slug);
  const message = shareMessage(raffle, taken);

  return (
    <section className="card stack">
      <h2>Divulgação</h2>
      <CopyBox value={url}>
        <button type="button" className="btn sm" onClick={() => copy(url, 'Link copiado!')}>Copiar link</button>
        <ExternalLink className="btn sm" href={url}>Abrir</ExternalLink>
      </CopyBox>
      {raffle.status === 'open' && (
        <div className="row">
          <button type="button" className="btn" onClick={() => copy(message, 'Mensagem copiada! Cole no WhatsApp.')}>
            Copiar mensagem com números disponíveis
          </button>
          <ExternalLink className="btn wa" href={whatsappShareLink(message)}>Enviar pelo WhatsApp</ExternalLink>
        </div>
      )}
      {isLocalHost() && (
        <p className="small muted">
          Este link só abre neste computador enquanto o sistema não estiver publicado na internet.
        </p>
      )}
    </section>
  );
}
