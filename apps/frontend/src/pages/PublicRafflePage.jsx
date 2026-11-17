import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { ErrorCard, Loading } from '../shared/ui/components';
import { useToast } from '../shared/ui/feedback/ToastProvider';
import { Topbar } from '../shared/ui/layout/Topbar';
import { publicRaffleApi } from '../features/public-raffle/api/publicRaffleApi';
import { BuyBar } from '../features/public-raffle/components/BuyBar';
import { BuyerOrderCard } from '../features/public-raffle/components/BuyerOrderCard';
import { NumbersSection } from '../features/public-raffle/components/NumbersSection';
import { RaffleHero } from '../features/public-raffle/components/RaffleHero';
import { ReserveDialog } from '../features/public-raffle/components/ReserveDialog';
import { WinnerBanner } from '../features/public-raffle/components/WinnerBanner';
import { usePublicRaffle } from '../features/public-raffle/hooks/usePublicRaffle';
import { useNumberSelection } from '../features/public-raffle/hooks/useNumberSelection';
import { addOrderToken, saveBuyer } from '../features/public-raffle/lib/buyerStorage';

const scrollToPendingOrder = () => requestAnimationFrame(() => {
  document.querySelector('.order.pending')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/** Página que o comprador abre pelo link: escolhe números, reserva e paga. */
export function PublicRafflePage() {
  const { slug } = useParams();
  const toast = useToast();
  const [reserving, setReserving] = useState(false);
  const { data, orders, error, refresh, forgetOrder } = usePublicRaffle(slug, { paused: reserving });
  const raffle = data?.raffle;
  const { selected, sorted, toggle, clear } = useNumberSelection(data?.taken, raffle?.max_per_buyer);
  useDocumentTitle(raffle?.title ?? 'Rifa');

  const pick = useCallback((n, takenTitle) => {
    if (takenTitle) return toast(takenTitle);
    if (raffle.status !== 'open') return undefined;
    return toggle(n);
  }, [raffle, toggle, toast]);

  async function reserve(buyer) {
    try {
      const { token } = await publicRaffleApi.reserve(slug, { ...buyer, numbers: sorted });
      addOrderToken(slug, token);
      saveBuyer(buyer);
      clear();
      setReserving(false);
      await refresh();
      toast('Números reservados! Agora faça o pagamento.');
      scrollToPendingOrder();
    } catch (err) {
      toast(err.message, true);
      if (err.busy) {
        setReserving(false);
        await refresh();
      }
    }
  }

  let content;
  if (!data && error) {
    content = <ErrorCard title={error.message}><p>Confira se o link está correto.</p></ErrorCard>;
  } else if (!data) {
    content = <Loading />;
  } else {
    content = (
      <>
        {data.winner && <WinnerBanner winner={data.winner} total={raffle.total_numbers} />}
        <RaffleHero raffle={raffle} photos={data.photos} taken={data.taken} />
        {orders.length > 0 && (
          <section className="stack-sm">
            <h2>Seus pedidos</h2>
            {orders.map((o) => <BuyerOrderCard key={o.token} order={o} raffle={raffle} onForget={forgetOrder} />)}
          </section>
        )}
        <NumbersSection
          raffle={raffle}
          taken={data.taken}
          selected={selected}
          winnerNumber={data.winner?.number}
          onPick={pick}
        />
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main className="wrap stack">{content}</main>
      {raffle?.status === 'open' && selected.size > 0 && (
        <BuyBar count={selected.size} priceCents={raffle.price_cents} onClear={clear} onReserve={() => setReserving(true)} />
      )}
      {raffle && (
        <ReserveDialog
          open={reserving}
          numbers={sorted}
          raffle={raffle}
          onClose={() => setReserving(false)}
          onConfirm={reserve}
        />
      )}
    </>
  );
}
