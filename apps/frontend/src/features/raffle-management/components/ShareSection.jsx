import { useCopy } from '../../../shared/hooks/useCopy';
import { whatsappShareLink } from '../../../shared/lib/whatsapp';
import { CopyBox, ExternalLink } from '../../../shared/ui/components';
import { isLocalHost, publicRaffleUrl, shareMessage } from '../model/raffleRules';

function WhatsappPreview({ text }) {
  const parts = text
    .split(/(\*[^*\n]+\*)/g)
    .map((part, i) => (/^\*[^*\n]+\*$/.test(part) ? <b key={i}>{part.slice(1, -1)}</b> : part));
  return <div className="share-preview" aria-label="Prévia da mensagem">{parts}</div>;
}

export function ShareSection({ raffle, taken }) {
  const copy = useCopy();
  const url = publicRaffleUrl(raffle.slug);
  const message = shareMessage(raffle, taken);

  return (
    <section className="card stack-sm side-card">
      <h2>Divulgação</h2>
      <CopyBox value={url} />
      <div className="side-actions">
        <button type="button" className="btn sm" onClick={() => copy(url, 'Link copiado!')}>Copiar link</button>
        <ExternalLink className="btn sm" href={url}>Abrir página</ExternalLink>
      </div>
      {raffle.status === 'open' && (
        <>
          <hr className="divider" />
          <p className="small muted">Mensagem pronta para o WhatsApp, atualizada conforme os números são vendidos.</p>
          <div className="side-actions">
            <ExternalLink className="btn sm wa" href={whatsappShareLink(message)}>Enviar pelo WhatsApp</ExternalLink>
            <button type="button" className="btn sm" onClick={() => copy(message, 'Mensagem copiada! Cole no WhatsApp.')}>
              Copiar mensagem
            </button>
          </div>
          <details className="share-details">
            <summary className="small">Ver a mensagem</summary>
            <WhatsappPreview text={message} />
          </details>
        </>
      )}
      {isLocalHost() && (
        <p className="small muted">Este link só abre neste computador enquanto o sistema não estiver publicado na internet.</p>
      )}
    </section>
  );
}
