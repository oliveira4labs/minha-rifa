import { useCopy } from '../../../shared/hooks/useCopy';
import { formatMoney, padNumbers } from '../../../shared/lib/format';
import { whatsappLink } from '../../../shared/lib/whatsapp';
import { Chips, CopyBox, Countdown, ExternalLink, Tag } from '../../../shared/ui/components';

function receiptMessage(raffle, order, numbersText) {
  const which = order.numbers.length > 1 ? 'os números' : 'o número';
  return `Olá! Reservei ${which} ${numbersText} da rifa "${raffle.title}" em nome de ${order.buyer_name}. ` +
    `Total: ${formatMoney(order.total_cents)}. Segue o comprovante do PIX.`;
}

function PaidOrder({ order, numbers }) {
  return (
    <div className="order paid">
      <div className="row between"><b>Pagamento confirmado ✓</b><Tag variant="open">Seus números</Tag></div>
      <Chips items={numbers} />
      <p className="small muted">Em nome de {order.buyer_name}. Boa sorte!</p>
    </div>
  );
}

function PendingOrder({ order, numbers, raffle }) {
  const copy = useCopy();
  return (
    <div className="order pending">
      <div className="row between">
        <b>Aguardando pagamento</b>
        <Tag variant="pending">Reservado por <Countdown to={order.expires_at} /></Tag>
      </div>
      <Chips items={numbers} />
      <p>Total: <b className="num">{formatMoney(order.total_cents)}</b></p>
      <div className="stack-sm">
        <span className="small"><b>1.</b> Pague com PIX usando a chave:</span>
        <CopyBox value={raffle.pix_key}>
          <button type="button" className="btn sm" onClick={() => copy(raffle.pix_key, 'Chave PIX copiada!')}>Copiar</button>
        </CopyBox>
        <span className="small"><b>2.</b> Envie o comprovante para o organizador confirmar:</span>
        <ExternalLink className="btn wa" href={whatsappLink(raffle.whatsapp, receiptMessage(raffle, order, numbers.join(', ')))}>
          Enviar comprovante pelo WhatsApp
        </ExternalLink>
      </div>
      <p className="small muted">Se o pagamento não for confirmado dentro do prazo, os números voltam a ficar disponíveis.</p>
    </div>
  );
}

function InactiveOrder({ order, numbers, onForget }) {
  return (
    <div className="order">
      <div className="row between">
        <b>{order.status === 'expired' ? 'A reserva expirou' : 'A reserva foi cancelada'}</b>
        <button type="button" className="btn sm" onClick={() => onForget(order.token)}>Dispensar</button>
      </div>
      <Chips items={numbers} />
      <p className="small muted">Esses números voltaram a ficar disponíveis.</p>
    </div>
  );
}

/** Pedido do comprador, conforme o status: pago, aguardando pagamento ou encerrado. */
export function BuyerOrderCard({ order, raffle, onForget }) {
  const numbers = padNumbers(order.numbers, raffle.total_numbers);
  if (order.status === 'paid') return <PaidOrder order={order} numbers={numbers} />;
  if (order.status === 'pending') return <PendingOrder order={order} numbers={numbers} raffle={raffle} />;
  return <InactiveOrder order={order} numbers={numbers} onForget={onForget} />;
}
