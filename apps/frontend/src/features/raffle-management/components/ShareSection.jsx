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
    <section className="card stack">
      <h2>Divulgação</h2>
      <CopyBox value={url}>
        <button type="button" className="btn sm" onClick={() => copy(url, 'Link copiado!')}>Copiar link</button>
        <ExternalLink className="btn sm" href={url}>Abrir</ExternalLink>
      </CopyBox>
      {raffle.status === 'open' && (
        <div className="stack-sm">
          <span className="small muted">Mensagem pronta para divulgar (atualiza sozinha conforme os números são vendidos):</span>
          <WhatsappPreview text={message} />
          <div className="row">
            <button type="button" className="btn" onClick={() => copy(message, 'Mensagem copiada! Cole no WhatsApp.')}>
              Copiar mensagem
            </button>
            <ExternalLink className="btn wa" href={whatsappShareLink(message)}>Enviar pelo WhatsApp</ExternalLink>
          </div>
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
