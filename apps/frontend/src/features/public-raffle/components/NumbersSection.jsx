import { useState } from 'react';
import { formatDuration } from '../../../shared/lib/format';
import { NumberGrid } from './NumberGrid';

/** Card "Escolha seus números": filtro, legenda, grade e regras de reserva. */
export function NumbersSection({ raffle, taken, selected, winnerNumber, onPick }) {
  const [onlyFree, setOnlyFree] = useState(false);
  const open = raffle.status === 'open';

  return (
    <section className="card stack">
      <div className="row between">
        <h2>{open ? 'Escolha seus números' : 'Números'}</h2>
        {open && (
          <label className="row small" style={{ fontWeight: 400, display: 'flex' }}>
            <input
              type="checkbox"
              style={{ width: 'auto', minHeight: 0 }}
              checked={onlyFree}
              onChange={(e) => setOnlyFree(e.target.checked)}
            />
            {' '}Mostrar só disponíveis
          </label>
        )}
      </div>
      <div className="legend">
        <span>Disponível</span>
        {open && <span className="l-sel">Escolhido por você</span>}
        <span className="l-res">Reservado</span>
        <span className="l-paid">Pago</span>
      </div>
      <NumberGrid
        total={raffle.total_numbers}
        taken={taken}
        selected={selected}
        winnerNumber={winnerNumber}
        onlyFree={onlyFree}
        onPick={onPick}
      />
      {open && (
        <p className="small muted">
          Ao reservar, os números ficam guardados para você por {formatDuration(raffle.reserve_minutes)}, até o
          organizador confirmar o pagamento.
          {raffle.max_per_buyer ? ` Limite de ${raffle.max_per_buyer} número(s) por pessoa.` : ''}
        </p>
      )}
    </section>
  );
}
