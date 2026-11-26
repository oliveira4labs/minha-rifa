import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInterval } from '../../../shared/hooks/useInterval';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';
import { publicRaffleApi } from '../api/publicRaffleApi';
import { loadCartToken, saveCartToken } from '../lib/buyerStorage';

const EMPTY = { token: null, numbers: [], expires_at: null };
const EXPIRED_MESSAGE = 'Seu tempo acabou e os números voltaram a ficar disponíveis. Escolha de novo.';

const limitMessage = (max, owned) => (owned > 0
  ? `Você já tem ${owned} número${owned === 1 ? '' : 's'} nesta rifa. O limite é ${max} por pessoa.`
  : `Limite de ${max} número${max === 1 ? '' : 's'} por pessoa nesta rifa.`);

export function useCart(slug, { maxPerBuyer, ownedCount = 0, onSynced }) {
  const toast = useToast();
  const [cart, setCart] = useState({ token: null, numbers: [], expiresAt: null });
  const tokenRef = useRef(null);
  const numbersRef = useRef(new Set());
  const queue = useRef(Promise.resolve());
  const inFlight = useRef(0);
  const lastServer = useRef(null);
  const onSyncedRef = useRef(onSynced);
  onSyncedRef.current = onSynced;
  const ownedRef = useRef(ownedCount);
  ownedRef.current = ownedCount;

  const apply = useCallback((dto) => {
    tokenRef.current = dto.token;
    numbersRef.current = new Set(dto.numbers);
    saveCartToken(slug, dto.token);
    setCart({ token: dto.token, numbers: dto.numbers, expiresAt: dto.expires_at });
  }, [slug]);

  const resync = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return apply(EMPTY);
    try {
      const order = await publicRaffleApi.getOrder(token);
      const active = order.status === 'held' && order.expires_at > Date.now() && order.numbers.length > 0;
      return apply(active ? { token, numbers: order.numbers, expires_at: order.expires_at } : EMPTY);
    } catch {
      return apply(EMPTY);
    }
  }, [apply]);

  useEffect(() => {
    tokenRef.current = loadCartToken(slug);
    resync();
  }, [slug, resync]);

  const run = useCallback((work) => {
    inFlight.current += 1;
    const job = queue.current.then(work);
    queue.current = job
      .then((dto) => { lastServer.current = dto; })
      .catch((err) => {
        lastServer.current = null;
        toast(err.message, true);
      })
      .finally(async () => {
        inFlight.current -= 1;
        if (inFlight.current > 0) return;
        if (lastServer.current) apply(lastServer.current);
        else await resync();
        onSyncedRef.current?.();
      });
  }, [apply, resync, toast]);

  const setOptimistic = (next) => {
    numbersRef.current = next;
    setCart((c) => ({ ...c, numbers: [...next].sort((a, b) => a - b) }));
  };

  const toggle = useCallback((n) => {
    const current = numbersRef.current;
    if (current.has(n)) {
      const next = new Set(current);
      next.delete(n);
      setOptimistic(next);
      run(() => publicRaffleApi.release(slug, { token: tokenRef.current, number: n }).then((dto) => {
        tokenRef.current = dto.token;
        return dto;
      }));
      return;
    }
    if (maxPerBuyer && current.size + ownedRef.current >= maxPerBuyer) {
      toast(limitMessage(maxPerBuyer, ownedRef.current), true);
      return;
    }
    setOptimistic(new Set(current).add(n));
    run(() => publicRaffleApi.hold(slug, { token: tokenRef.current, number: n }).then((dto) => {
      tokenRef.current = dto.token;
      return dto;
    }));
  }, [slug, maxPerBuyer, run, toast]);

  const releaseAll = useCallback(() => {
    for (const n of [...numbersRef.current]) toggle(n);
  }, [toggle]);

  const forget = useCallback(() => apply(EMPTY), [apply]);

  useInterval(() => {
    if (!cart.expiresAt || cart.expiresAt > Date.now() || inFlight.current > 0) return;
    apply(EMPTY);
    toast(EXPIRED_MESSAGE, true);
    onSyncedRef.current?.();
  }, cart.expiresAt ? 1000 : null);

  const selected = useMemo(() => new Set(cart.numbers), [cart.numbers]);

  return {
    token: cart.token,
    numbers: cart.numbers,
    selected,
    expiresAt: cart.expiresAt,
    toggle,
    releaseAll,
    forget,
  };
}
