import { useState } from 'react';
import { useInterval } from './useInterval';

export function useNow(tick = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), tick);
  return now;
}
