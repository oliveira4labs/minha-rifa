import { useCallback, useEffect, useState } from 'react';
import { useInterval } from '../../../shared/hooks/useInterval';
import { publicRaffleApi } from '../api/publicRaffleApi';
import { loadOrderTokens, removeOrderToken } from '../lib/buyerStorage';

const POLL_MS = 20000;

const fetchOrders = (slug) => Promise.all(
  loadOrderTokens(slug).map((token) => publicRaffleApi.getOrder(token).catch(() => null)),
).then((orders) => orders.filter(Boolean));

/**
 * Dados da página pública + pedidos deste navegador.
 * Atualiza a cada 20s (exceto com `paused`) e logo que uma reserva vence.
 */
export function usePublicRaffle(slug, { paused = false } = {}) {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const raffle = await publicRaffleApi.get(slug);
      setOrders(await fetchOrders(slug));
      setData(raffle);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useInterval(() => {
    if (!paused) refresh();
  }, POLL_MS);

  useInterval(() => {
    const someExpired = orders.some((o) => o.status === 'pending' && o.expires_at <= Date.now());
    if (someExpired) refresh();
  }, 1000);

  const forgetOrder = useCallback((token) => {
    removeOrderToken(slug, token);
    setOrders((list) => list.filter((o) => o.token !== token));
  }, [slug]);

  return { data, orders, error, refresh, forgetOrder };
}
