import { useState } from 'react';
import { formatDuration } from '../../../shared/lib/format';
import { NumberGrid } from './NumberGrid';

export function NumbersSection({ raffle, taken, selected, onPick }) {
  const [onlyFree, setOnlyFree] = useState(false);

  return (
    <section className="card stack">
      <div className="row between">
        <h2>Escolha seus números</h2>
        <label className="row small" style={{ fontWeight: 400, display: 'flex' }}>
          <input
            type="checkbox"
            style={{ width: 'auto', minHeight: 0 }}
            checked={onlyFree}
            onChange={(e) => setOnlyFree(e.target.checked)}
          />
          {' '}Mostrar só disponíveis
        </label>
      </div>
      <div className="legend">
        <span>Disponível</span>
        <span className="l-sel">Escolhido por você</span>
        <span className="l-res">Reservado</span>
        <span className="l-paid">Pago</span>
      </div>
      <NumberGrid
        total={raffle.total_numbers}
        taken={taken}
        selected={selected}
        onlyFree={onlyFree}
        onPick={onPick}
      />
      <p className="small muted">
        Ao clicar em um número, ele fica guardado para você por {formatDuration(raffle.reserve_minutes)}.
      </p>
    </section>
  );
}
