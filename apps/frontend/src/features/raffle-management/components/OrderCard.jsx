import { formatDate, formatMoney, formatPhone, padNumbers } from '../../../shared/lib/format';
import { whatsappLink } from '../../../shared/lib/whatsapp';
import { Chips, Countdown, ExternalLink } from '../../../shared/ui/components';

function OrderActions({ order, onApprove, onCancel }) {
  if (order.status === 'paid') {
    return <button type="button" className="btn sm danger" onClick={() => onCancel(order)}>Desfazer venda</button>;
  }
  return (
    <>
      <button type="button" className="btn sm danger" onClick={() => onCancel(order)}>Recusar</button>
      <button type="button" className="btn sm primary" onClick={() => onApprove(order)}>Confirmar pagamento</button>
    </>
  );
}

function OrderTiming({ order }) {
  if (order.status === 'pending') {
    return <>Reservado em {formatDate(order.created_at)} · prazo do comprador acaba em <Countdown to={order.expires_at} /></>;
  }
  if (order.status === 'proof_sent') return <>Pagamento informado em {formatDate(order.proof_sent_at)}</>;
  return <>Confirmado em {formatDate(order.paid_at)}</>;
}

// Uma linha da lista de pedidos: quem, quais números, quanto, quando e as ações
export function OrderCard({ order, raffle, onApprove, onCancel }) {
  return (
    <li className={`admin-order ${order.status}`}>
      <div className="admin-order-main">
        <div className="admin-order-who">
          <b>{order.buyer_name}</b>
          <ExternalLink className="small" href={whatsappLink(order.buyer_phone)}>{formatPhone(order.buyer_phone)}</ExternalLink>
        </div>
        <b className="num">{formatMoney(order.numbers.length * raffle.price_cents)}</b>
      </div>
      <Chips items={padNumbers(order.numbers, raffle.total_numbers)} />
      <div className="admin-order-foot">
        <span className="small muted"><OrderTiming order={order} /></span>
        {raffle.status === 'open' && (
          <span className="admin-order-actions">
            <OrderActions order={order} onApprove={onApprove} onCancel={onCancel} />
          </span>
        )}
      </div>
    </li>
  );
}
