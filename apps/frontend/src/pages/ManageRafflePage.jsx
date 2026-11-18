import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { ErrorCard, Loading, Tag } from '../shared/ui/components';
import { useConfirm } from '../shared/ui/feedback/ConfirmProvider';
import { DrawSection } from '../features/raffle-management/components/DrawSection';
import { EditRaffleSection } from '../features/raffle-management/components/EditRaffleSection';
import { OrdersSection } from '../features/raffle-management/components/OrdersSection';
import { ShareSection } from '../features/raffle-management/components/ShareSection';
import { StatsGrid } from '../features/raffle-management/components/StatsGrid';
import { WinnerCard } from '../features/raffle-management/components/WinnerCard';
import { useManagedRaffle } from '../features/raffle-management/hooks/useManagedRaffle';
import { useRaffleActions } from '../features/raffle-management/hooks/useRaffleActions';

export function ManageRafflePage() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { isOpen: confirmOpen } = useConfirm();
  const { data, error, refresh, form, setFormBusy } = useManagedRaffle(id, { paused: confirmOpen });
  const actions = useRaffleActions(id, data, refresh);
  useDocumentTitle(data ? `Gerenciar — ${data.raffle.title}` : 'Gerenciar rifa');

  return (
    <main className="wrap stack">
      <Link to="/painel" className="small">← Minhas rifas</Link>
      {!data && error && <ErrorCard title={error.message} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          <RaffleOverview data={data} actions={actions} />
          {data.raffle.status === 'open' && (
            <EditRaffleSection
              form={form}
              onBusyChange={setFormBusy}
              onSave={actions.saveEdits}
              onDelete={actions.deleteRaffle}
            />
          )}
        </>
      )}
    </main>
  );
}

function RaffleOverview({ data, actions }) {
  const { raffle, counts, winner, orders, taken } = data;
  const pending = orders.filter((o) => o.status === 'pending');
  const paid = orders.filter((o) => o.status === 'paid');
  const open = raffle.status === 'open';

  const drawSection = (
    <DrawSection
      raffle={raffle}
      counts={counts}
      canDraw={data.can_draw}
      onSaveDate={actions.saveDrawDate}
      onDraw={actions.draw}
    />
  );
  const orderProps = { raffle, onApprove: actions.approveOrder, onCancel: actions.cancelOrder };

  return (
    <div className="stack">
      <div className="row between">
        <h1>{raffle.title}</h1>
        <Tag variant={open ? 'open' : 'done'}>{open ? 'Aberta' : 'Sorteada'}</Tag>
      </div>
      {winner && <WinnerCard raffle={raffle} winner={winner} />}
      <ShareSection raffle={raffle} taken={taken} />
      <StatsGrid raffle={raffle} counts={counts} />
      {!winner && drawSection}
      <OrdersSection
        title="Aguardando confirmação de pagamento"
        orders={pending}
        emptyText="Nenhuma reserva pendente. Quando alguém reservar números, aparece aqui para você confirmar depois de receber o comprovante."
        {...orderProps}
      />
      <OrdersSection title="Pagos" orders={paid} emptyText="Nenhum pagamento confirmado ainda." {...orderProps} />
    </div>
  );
}
