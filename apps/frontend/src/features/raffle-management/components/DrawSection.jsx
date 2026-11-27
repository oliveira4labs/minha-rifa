import { useEffect, useState } from 'react';
import { toDateTimeInput } from '../../../shared/lib/format';
import { drawStatus } from '../model/raffleRules';

export function DrawSection({ raffle, counts, canDraw, onSaveDate, onDraw }) {
  const [date, setDate] = useState(() => toDateTimeInput(raffle.draw_date));
  const status = drawStatus(raffle, counts, canDraw);

  useEffect(() => {
    setDate(toDateTimeInput(raffle.draw_date));
  }, [raffle.draw_date]);

  return (
    <section className={`card stack-sm side-card${canDraw ? ' draw-ready' : ''}`}>
      <h2>Sorteio</h2>
      <p className={status.highlight ? 'notice' : 'small muted'}>{status.text}</p>
      <label>Data do sorteio
        <span className="date-row">
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="btn" onClick={() => onSaveDate(date)}>Salvar</button>
        </span>
      </label>
      <button type="button" className="btn primary block" disabled={!canDraw} onClick={onDraw}>Realizar sorteio</button>
    </section>
  );
}
