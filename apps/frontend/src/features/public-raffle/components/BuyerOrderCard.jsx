import { useCopy } from '../../../shared/hooks/useCopy';
import { formatDate, formatMoney, padNumbers } from '../../../shared/lib/format';
import { whatsappLink } from '../../../shared/lib/whatsapp';
import { CopyBox, Countdown, ExternalLink, Tag } from '../../../shared/ui/components';

// Mensagem que o comprador manda ao organizador. *texto* = negrito no WhatsApp.
function receiptMessage(raffle, order, numbersText) {
  const label = order.numbers.length > 1 ? 'Números' : 'Número';
  return [
    `Olá! Aqui é ${order.buyer_name} 👋`,
    `Quero reservar na rifa *${raffle.title}*:`,
    '',
    `🎟️ ${label}: *${numbersText}*`,
    `💰 Total: *${formatMoney(order.total_cents)}*`,
    '',
    'Já fiz o PIX, pode conferir? 🙏',
  ].join('\n');
}

const numbersLabel = (numbers) => (numbers.length === 1
  ? `número ${numbers[0]}`
  : `números ${numbers.slice(0, -1).join(', ')} e ${numbers.at(-1)}`);

const capitalize = (text) => text[0].toUpperCase() + text.slice(1);

const shortDate = (ms) => formatDate(ms).replace(/\/\d{4}, /, ' às ');

/** Linha compacta para pedidos em que o comprador não precisa fazer mais nada. */
function OrderRow({ variant, icon, title, subtitle }) {
  return (
    <div className={`order-row ${variant}`}>
      <span className="order-icon" aria-hidden="true">{icon}</span>
      <div className="grow">
        <b>{title}</b>
        <div className="small muted">{subtitle}</div>
      </div>
    </div>
  );
}

function PendingOrder({ order, numbers, raffle, onProofSent }) {
  const copy = useCopy();
  return (
    <div className="order pending">
      <div className="order-head">
        <span className="order-icon" aria-hidden="true">💸</span>
        <b className="grow">Falta o PIX</b>
        <Tag variant="pending">Finalize em <Countdown to={order.expires_at} /></Tag>
      </div>
      <div className="stack-sm">
        <span>
          Faça o PIX de <b className="num">{formatMoney(order.total_cents)}</b> ({numbersLabel(numbers)}) para a chave:
        </span>
        <CopyBox value={raffle.pix_key}>
          <button type="button" className="btn sm" onClick={() => copy(raffle.pix_key, 'Chave PIX copiada!')}>Copiar</button>
        </CopyBox>
      </div>
      <ExternalLink
        className="btn wa"
        href={whatsappLink(raffle.whatsapp, receiptMessage(raffle, order, numbers.join(', ')))}
        onClick={() => onProofSent(order.token)}
      >
        Já paguei, avisar o organizador
      </ExternalLink>
    </div>
  );
}

// Pedidos `held` (carrinho), `expired` e `cancelled` não têm card: o carrinho aparece na barra de baixo
// e os vencidos/cancelados somem da tela (usePublicRaffle tira do navegador).
export function BuyerOrderCard({ order, raffle, onProofSent }) {
  const numbers = padNumbers(order.numbers, raffle.total_numbers);
  if (order.status === 'paid') {
    const subtitle = `${capitalize(numbersLabel(numbers))} · boa sorte!`;
    return <OrderRow variant="paid" icon="🍀" title="Pagamento confirmado" subtitle={subtitle} />;
  }
  if (order.status === 'proof_sent') {
    return (
      <OrderRow
        variant="waiting"
        icon="⏳"
        title="Aguardando confirmação"
        subtitle={`${capitalize(numbersLabel(numbers))} · avisado em ${shortDate(order.proof_sent_at)}`}
      />
    );
  }
  if (order.status === 'pending') {
    return <PendingOrder order={order} numbers={numbers} raffle={raffle} onProofSent={onProofSent} />;
  }
  return null;
}
