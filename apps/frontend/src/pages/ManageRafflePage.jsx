import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { ErrorCard, Loading } from '../shared/ui/components';
import { useConfirm } from '../shared/ui/feedback/ConfirmProvider';
import { DrawRevealDialog } from '../features/raffle-management/components/DrawRevealDialog';
import { DrawSection } from '../features/raffle-management/components/DrawSection';
import { EditRaffleSection } from '../features/raffle-management/components/EditRaffleSection';
import { OrdersPanel } from '../features/raffle-management/components/OrdersPanel';
import { RaffleSummary } from '../features/raffle-management/components/RaffleSummary';
import { ShareSection } from '../features/raffle-management/components/ShareSection';
import { WinnerCard } from '../features/raffle-management/components/WinnerCard';
import { useDrawReveal } from '../features/raffle-management/hooks/useDrawReveal';
import { useManagedRaffle } from '../features/raffle-management/hooks/useManagedRaffle';
import { useRaffleActions } from '../features/raffle-management/hooks/useRaffleActions';

export function ManageRafflePage() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { isOpen: confirmOpen } = useConfirm();
  const reveal = useDrawReveal();
  const { data, error, refresh, form, setFormBusy } = useManagedRaffle(id, { paused: confirmOpen || reveal.isOpen });
  const actions = useRaffleActions(id, data, refresh, reveal);
  useDocumentTitle(data ? `Gerenciar — ${data.raffle.title}` : 'Gerenciar rifa');

  return (
    <main className="wrap stack">
      <Link to="/painel" className="small">← Minhas rifas</Link>
      {!data && error && <ErrorCard title={error.message} />}
      {!data && !error && <Loading />}
      {data && (
        <>
          <RaffleOverview data={data} actions={actions} />
          <DrawRevealDialog reveal={reveal} raffle={data.raffle} coverUrl={data.photos[0]?.url} />
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

  return (
    <div className="stack">
      <RaffleSummary raffle={raffle} counts={counts} coverUrl={data.photos[0]?.url} />
      {winner && <WinnerCard raffle={raffle} winner={winner} />}
      <div className="manage-grid">
        {!winner && (
          <div className="manage-draw">
            <DrawSection
              raffle={raffle}
              counts={counts}
              canDraw={data.can_draw}
              onSaveDate={actions.saveDrawDate}
              onDraw={actions.draw}
            />
          </div>
        )}
        <div className="manage-orders">
          <OrdersPanel orders={orders} raffle={raffle} onApprove={actions.approveOrder} onCancel={actions.cancelOrder} />
        </div>
        <div className="manage-share">
          <ShareSection raffle={raffle} taken={taken} />
        </div>
      </div>
    </div>
  );
}
