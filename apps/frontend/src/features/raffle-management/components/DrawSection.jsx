import { useEffect, useState } from 'react';
import { toDateTimeInput } from '../../../shared/lib/format';
import { drawStatus } from '../model/raffleRules';

/** Data do sorteio (editável aqui mesmo) e botão de sortear. */
export function DrawSection({ raffle, counts, canDraw, onSaveDate, onDraw }) {
  const [date, setDate] = useState(() => toDateTimeInput(raffle.draw_date));
  const status = drawStatus(raffle, counts, canDraw);

  // Acompanha a data salva no servidor, sem atrapalhar enquanto a pessoa digita.
  useEffect(() => {
    setDate(toDateTimeInput(raffle.draw_date));
  }, [raffle.draw_date]);

  return (
    <section className="card stack">
      <h2>Sorteio</h2>
      <p className={status.highlight ? 'notice' : 'muted'}>{status.text}</p>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <label className="grow" style={{ minWidth: 200 }}>Data do sorteio
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="button" className="btn" onClick={() => onSaveDate(date)}>Salvar data</button>
        <button type="button" className="btn primary" disabled={!canDraw} onClick={onDraw}>Realizar sorteio</button>
      </div>
    </section>
  );
}
