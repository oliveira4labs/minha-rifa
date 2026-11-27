import { useState } from 'react';
import { OrderCard } from './OrderCard';

const TAB_LIST = [
  {
    status: 'proof_sent',
    label: 'Avisaram que pagaram',
    empty: 'Nenhum pagamento para conferir. Quando um comprador avisar pelo WhatsApp que fez o PIX, o pedido aparece aqui.',
  },
  { status: 'pending', label: 'Aguardando', empty: 'Ninguém está no meio de um pagamento agora.' },
  { status: 'paid', label: 'Pagos', empty: 'Nenhum pagamento confirmado ainda.' },
];

// Abre na primeira aba com pedido: o que precisa de conferência vem antes
function firstTabWithOrders(orderList) {
  return TAB_LIST.find((tab) => orderList.some((order) => order.status === tab.status))?.status ?? 'proof_sent';
}

export function OrdersPanel({ orders, raffle, onApprove, onCancel }) {
  const [active, setActive] = useState(() => firstTabWithOrders(orders));
  const tab = TAB_LIST.find((t) => t.status === active);
  const shownList = orders.filter((order) => order.status === active);

  return (
    <section className="card orders-panel">
      <div className="orders-head">
        <h2>Pedidos</h2>
        <div className="segmented" role="tablist" aria-label="Situação dos pedidos">
          {TAB_LIST.map((t) => {
            const count = orders.filter((order) => order.status === t.status).length;
            const attention = t.status === 'proof_sent' && count > 0;
            return (
              <button
                key={t.status}
                type="button"
                role="tab"
                id={`orders-tab-${t.status}`}
                aria-selected={active === t.status}
                aria-controls="orders-list"
                className={attention ? 'attention' : undefined}
                onClick={() => setActive(t.status)}
              >
                {t.label} <span className="count num">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="orders-list" role="tabpanel" aria-labelledby={`orders-tab-${active}`}>
        {shownList.length ? (
          <ul className="order-list">
            {shownList.map((order) => (
              <OrderCard key={order.id} order={order} raffle={raffle} onApprove={onApprove} onCancel={onCancel} />
            ))}
          </ul>
        ) : <p className="empty">{tab.empty}</p>}
      </div>
    </section>
  );
}
