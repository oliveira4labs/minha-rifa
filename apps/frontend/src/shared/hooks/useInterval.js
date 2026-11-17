import { useEffect, useRef } from 'react';

/** Executa `callback` a cada `delay` ms sempre com a versão mais recente da função. */
export function useInterval(callback, delay) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay == null) return undefined;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
