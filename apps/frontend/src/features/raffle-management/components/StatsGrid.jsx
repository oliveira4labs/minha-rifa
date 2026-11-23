import { formatMoney } from '../../../shared/lib/format';
import { Stat } from '../../../shared/ui/components';

export function StatsGrid({ raffle, counts }) {
  const free = raffle.total_numbers - counts.paid - counts.pending;
  const awaiting = counts.awaiting ?? 0;
  return (
    <div className="stats">
      <Stat value={counts.paid} label="pagos" />
      <Stat value={awaiting} label="comprovante enviado" />
      <Stat value={counts.pending - awaiting} label="reservados, sem comprovante" />
      <Stat value={free} label="disponíveis" />
      <Stat
        value={formatMoney(counts.paid * raffle.price_cents)}
        label={`arrecadado de ${formatMoney(raffle.total_numbers * raffle.price_cents)}`}
      />
    </div>
  );
}
