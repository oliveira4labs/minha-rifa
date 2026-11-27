import { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { padNumber } from '../../../shared/lib/format';

const STATUS = { p: { cls: 'paid', label: 'pago' }, r: { cls: 'res', label: 'reservado' } };

const takenMessage = (text, status) => (status === 'p'
  ? `O número ${text} já foi vendido. Escolha outro.`
  : `O número ${text} já foi reservado. Escolha outro.`);

const NumberCell = memo(function NumberCell({ n, total, status, isSelected, onClick }) {
  const text = padNumber(n, total);
  const cls = status ? STATUS[status].cls : isSelected ? 'sel' : '';
  const title = status ? `${text} — ${STATUS[status].label}` : `Número ${text}`;
  return (
    <button
      type="button"
      className={`n ${cls}`}
      aria-disabled={status ? 'true' : undefined}
      aria-pressed={status ? undefined : isSelected}
      title={title}
      onClick={() => onClick(n, status ? takenMessage(text, status) : null)}
    >
      {text}
    </button>
  );
});

export function NumberGrid({ total, taken, selected, onlyFree, onPick }) {
  const takenMap = useMemo(() => new Map(taken), [taken]);

  const onPickRef = useRef(onPick);
  useLayoutEffect(() => {
    onPickRef.current = onPick;
  });
  const handleClick = useCallback((n, takenTitle) => onPickRef.current(n, takenTitle), []);

  const cells = [];
  for (let n = 1; n <= total; n++) {
    const status = takenMap.get(n);
    cells.push(
      <NumberCell
        key={n}
        n={n}
        total={total}
        status={status}
        isSelected={selected.has(n)}
        onClick={handleClick}
      />,
    );
  }

  return <div className={`numbers${onlyFree ? ' only-free' : ''}`}>{cells}</div>;
}
