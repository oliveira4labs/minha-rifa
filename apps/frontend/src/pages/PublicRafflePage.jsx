import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { ErrorCard, Loading } from '../shared/ui/components';
import { useToast } from '../shared/ui/feedback/ToastProvider';
import { Topbar } from '../shared/ui/layout/Topbar';
import { publicRaffleApi } from '../features/public-raffle/api/publicRaffleApi';
import { BuyBar } from '../features/public-raffle/components/BuyBar';
import { BuyerOrders } from '../features/public-raffle/components/BuyerOrderCard';
import { NumbersSection } from '../features/public-raffle/components/NumbersSection';
import { RaffleHero } from '../features/public-raffle/components/RaffleHero';
import { ReserveDialog } from '../features/public-raffle/components/ReserveDialog';
import { WinnerBanner } from '../features/public-raffle/components/WinnerBanner';
import { useCart } from '../features/public-raffle/hooks/useCart';
import { usePublicRaffle } from '../features/public-raffle/hooks/usePublicRaffle';
import { addOrderToken, saveBuyer } from '../features/public-raffle/lib/buyerStorage';

const scrollToPendingOrder = () => requestAnimationFrame(() => {
  document.querySelector('.order.pending')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

export function PublicRafflePage() {
  const { slug } = useParams();
  const toast = useToast();
  const [reserving, setReserving] = useState(false);
  const { data, orders, error, refresh } = usePublicRaffle(slug, { paused: reserving });
  const raffle = data?.raffle;
  // Números já comprados neste navegador (a pagar, avisados ou pagos): contam no limite por pessoa.
  const ownedCount = orders.reduce((sum, o) => sum + o.numbers.length, 0);
  const cart = useCart(slug, { maxPerBuyer: raffle?.max_per_buyer, ownedCount, onSynced: refresh });
  useDocumentTitle(raffle?.title ?? 'Rifa');

  const takenByOthers = useMemo(
    () => (data ? data.taken.filter(([n]) => !cart.selected.has(n)) : []),
    [data, cart.selected],
  );

  const pick = useCallback((n, takenTitle) => {
    if (takenTitle) return toast(takenTitle);
    if (raffle.status !== 'open' || raffle.visibility === 'private') return undefined;
    return cart.toggle(n);
  }, [raffle, cart, toast]);

  async function reserve(buyer) {
    try {
      const { token } = await publicRaffleApi.reserve(slug, { ...buyer, token: cart.token });
      addOrderToken(slug, token);
      saveBuyer(buyer);
      cart.forget();
      setReserving(false);
      await refresh();
      toast('Prontinho! Seus números estão guardados. Agora é só fazer o PIX e avisar o organizador.');
      scrollToPendingOrder();
    } catch (err) {
      toast(err.message, true);
      setReserving(false);
      await refresh();
    }
  }

  async function sendProof(token) {
    try {
      await publicRaffleApi.proofSent(token);
    } catch (err) {
      toast(err.message, true);
    }
    await refresh();
  }

  let content;
  if (!data && error) {
    content = <ErrorCard title={error.message}><p>Confira se o link está correto.</p></ErrorCard>;
  } else if (!data) {
    content = <Loading />;
  } else {
    content = (
      <>
        {raffle.visibility === 'private' && (
          <p className="notice">Rifa privada: só você está vendo esta página. Ninguém mais consegue abrir o link nem reservar números.</p>
        )}
        {data.winner && <WinnerBanner winner={data.winner} total={raffle.total_numbers} />}
        <RaffleHero raffle={raffle} photos={data.photos} taken={data.taken} />
        {orders.length > 0 && (
          <section className="stack-sm">
            <h2>Seus números</h2>
            <BuyerOrders orders={orders} raffle={raffle} onProofSent={sendProof} />
          </section>
        )}
        {raffle.status === 'open' && (
          <NumbersSection raffle={raffle} taken={takenByOthers} selected={cart.selected} onPick={pick} />
        )}
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main className="wrap stack">{content}</main>
      {raffle?.status === 'open' && cart.numbers.length > 0 && (
        <BuyBar
          count={cart.numbers.length}
          priceCents={raffle.price_cents}
          expiresAt={cart.expiresAt}
          onClear={cart.releaseAll}
          onReserve={() => setReserving(true)}
        />
      )}
      {raffle && (
        <ReserveDialog
          open={reserving && cart.numbers.length > 0}
          numbers={cart.numbers}
          raffle={raffle}
          expiresAt={cart.expiresAt}
          onClose={() => setReserving(false)}
          onConfirm={reserve}
        />
      )}
    </>
  );
}
