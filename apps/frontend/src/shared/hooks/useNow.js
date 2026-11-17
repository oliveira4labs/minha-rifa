import { useState } from 'react';
import { useInterval } from './useInterval';

/** Hora atual, atualizada a cada `tick` ms (para contagens regressivas). */
export function useNow(tick = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), tick);
  return now;
}
