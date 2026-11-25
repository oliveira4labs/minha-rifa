import { formatDate, formatMoney, formatPhone, padNumbers } from '../../../shared/lib/format';
import { whatsappLink } from '../../../shared/lib/whatsapp';
import { Chips, Countdown, ExternalLink } from '../../../shared/ui/components';

function OrderActions({ order, onApprove, onCancel }) {
  if (order.status === 'paid') {
    return (
      <span className="row">
        <button type="button" className="btn sm danger" onClick={() => onCancel(order)}>Desfazer venda</button>
      </span>
    );
  }
  return (
    <span className="row">
      <button type="button" className="btn sm danger" onClick={() => onCancel(order)}>Recusar</button>
      <button type="button" className="btn sm primary" onClick={() => onApprove(order)}>Confirmar pagamento</button>
    </span>
  );
}

function OrderTiming({ order }) {
  if (order.status === 'pending') {
    return <>Reservado em {formatDate(order.created_at)} · prazo do comprador acaba em <Countdown to={order.expires_at} /></>;
  }
  if (order.status === 'proof_sent') return <>Avisou que pagou em {formatDate(order.proof_sent_at)}</>;
  return <>Pago — confirmado em {formatDate(order.paid_at)}</>;
}

export function OrderCard({ order, raffle, onApprove, onCancel }) {
  return (
    <div className={`order ${order.status}`}>
      <div className="row between">
        <div>
          <b>{order.buyer_name}</b> ·{' '}
          <ExternalLink href={whatsappLink(order.buyer_phone)}>{formatPhone(order.buyer_phone)}</ExternalLink>
        </div>
        <b className="num">{formatMoney(order.numbers.length * raffle.price_cents)}</b>
      </div>
      <Chips items={padNumbers(order.numbers, raffle.total_numbers)} />
      <div className="row between">
        <span className="small muted"><OrderTiming order={order} /></span>
        {raffle.status === 'open' && <OrderActions order={order} onApprove={onApprove} onCancel={onCancel} />}
      </div>
    </div>
  );
}
