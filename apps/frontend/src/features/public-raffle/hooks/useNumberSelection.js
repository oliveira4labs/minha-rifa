import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';

export function useNumberSelection(taken, maxPerBuyer) {
  const toast = useToast();
  const [selected, setSelected] = useState(() => new Set());

  useEffect(() => {
    if (!taken) return;
    const takenSet = new Set(taken.map(([n]) => n));
    const lost = [...selected].filter((n) => takenSet.has(n));
    if (!lost.length) return;
    setSelected((prev) => new Set([...prev].filter((n) => !takenSet.has(n))));
    toast(`O número ${lost.join(', ')} acabou de ser reservado por outra pessoa.`, true);
  }, [taken]);

  const toggle = useCallback((n) => {
    if (selected.has(n)) {
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(n);
        return next;
      });
      return;
    }
    if (maxPerBuyer && selected.size >= maxPerBuyer) {
      toast(`Limite de ${maxPerBuyer} número(s) por pessoa nesta rifa.`, true);
      return;
    }
    setSelected((prev) => new Set(prev).add(n));
  }, [selected, maxPerBuyer, toast]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const sorted = [...selected].sort((a, b) => a - b);

  return { selected, sorted, toggle, clear };
}
