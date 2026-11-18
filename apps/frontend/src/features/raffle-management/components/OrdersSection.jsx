import { OrderCard } from './OrderCard';

export function OrdersSection({ title, orders, emptyText, raffle, onApprove, onCancel }) {
  return (
    <section className="stack-sm">
      <h2>{title} ({orders.length})</h2>
      {orders.length
        ? orders.map((order) => (
          <OrderCard key={order.id} order={order} raffle={raffle} onApprove={onApprove} onCancel={onCancel} />
        ))
        : <p className="card empty">{emptyText}</p>}
    </section>
  );
}
