import { useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from '../../../shared/hooks/useInterval';
import { rafflesApi } from '../../raffles/api/rafflesApi';

const POLL_MS = 15000;

/**
 * Carrega a rifa do administrador e atualiza a cada 15s (exceto com `paused`).
 *
 * O formulário de edição usa uma "foto" separada dos dados (`form`), que só é
 * renovada quando a pessoa não está editando — ou quando `refresh({ resetForm: true })`.
 * Assim a atualização automática não apaga o que ela está digitando.
 */
export function useManagedRaffle(id, { paused = false } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ data: null, key: 0 });
  const formBusy = useRef(false);

  const refresh = useCallback(async ({ resetForm = false } = {}) => {
    const next = await rafflesApi.get(id);
    setData(next);
    setError(null);
    if (resetForm || !formBusy.current) setForm((f) => ({ data: next, key: f.key + 1 }));
    return next;
  }, [id]);

  useEffect(() => {
    refresh({ resetForm: true }).catch(setError);
  }, [refresh]);

  useInterval(() => {
    if (!paused) refresh().catch(() => {});
  }, POLL_MS);

  const setFormBusy = useCallback((busy) => {
    formBusy.current = busy;
  }, []);

  return { data, error, refresh, form, setFormBusy };
}
