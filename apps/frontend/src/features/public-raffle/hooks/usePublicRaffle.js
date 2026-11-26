import { useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from '../../../shared/hooks/useInterval';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';
import { publicRaffleApi } from '../api/publicRaffleApi';
import { loadOrderTokens, removeOrderToken } from '../lib/buyerStorage';

const POLL_MS = 20000;

const INACTIVE = new Set(['expired', 'cancelled']);
const EXPIRED_MESSAGE = 'O tempo acabou e os números foram liberados.';

async function fetchOrders(slug) {
  const orders = (await Promise.all(
    loadOrderTokens(slug).map((token) => publicRaffleApi.getOrder(token).catch(() => null)),
  )).filter(Boolean);
  const inactive = orders.filter((o) => INACTIVE.has(o.status));
  inactive.forEach((o) => removeOrderToken(slug, o.token));
  return { active: orders.filter((o) => !INACTIVE.has(o.status)), inactive };
}

export function usePublicRaffle(slug, { paused = false } = {}) {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const toast = useToast();
  const shownTokens = useRef(new Set());

  const refresh = useCallback(async () => {
    try {
      const raffle = await publicRaffleApi.get(slug);
      const { active, inactive } = await fetchOrders(slug);
      if (inactive.some((o) => o.status === 'expired' && shownTokens.current.has(o.token))) toast(EXPIRED_MESSAGE, true);
      shownTokens.current = new Set(active.map((o) => o.token));
      setOrders(active);
      setData(raffle);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [slug, toast]);

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

  return { data, orders, error, refresh };
}
