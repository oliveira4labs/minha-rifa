import { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { padNumber } from '../../../shared/lib/format';

const STATUS = { p: { cls: 'paid', label: 'pago' }, r: { cls: 'res', label: 'reservado' } };

// Uma rifa pode ter até 5000 números: cada célula só re-renderiza se as props dela mudarem.
const NumberCell = memo(function NumberCell({ n, total, owner, status, isSelected, isWinner, onClick }) {
  const text = padNumber(n, total);
  const cls = status ? STATUS[status].cls : isSelected ? 'sel' : '';
  const title = status ? `${text} — ${STATUS[status].label} por ${owner}` : `Número ${text}`;
  return (
    <button
      type="button"
      className={`n ${cls}${isWinner ? ' win' : ''}`}
      aria-disabled={status ? 'true' : undefined}
      aria-pressed={status ? undefined : isSelected}
      title={title}
      onClick={() => onClick(n, status ? title : null)}
    >
      {text}
    </button>
  );
});

/**
 * Grade de números. `onPick(n, takenTitle)` — `takenTitle` vem preenchido
 * quando o número já é de alguém (para mostrar quem).
 */
export function NumberGrid({ total, taken, selected, winnerNumber, onlyFree, onPick }) {
  const takenMap = useMemo(() => new Map(taken.map(([n, status, owner]) => [n, { status, owner }])), [taken]);

  const onPickRef = useRef(onPick);
  useLayoutEffect(() => {
    onPickRef.current = onPick;
  });
  const handleClick = useCallback((n, takenTitle) => onPickRef.current(n, takenTitle), []);

  const cells = [];
  for (let n = 1; n <= total; n++) {
    const t = takenMap.get(n);
    cells.push(
      <NumberCell
        key={n}
        n={n}
        total={total}
        status={t?.status}
        owner={t?.owner}
        isSelected={selected.has(n)}
        isWinner={winnerNumber === n}
        onClick={handleClick}
      />,
    );
  }

  return <div className={`numbers${onlyFree ? ' only-free' : ''}`}>{cells}</div>;
}
