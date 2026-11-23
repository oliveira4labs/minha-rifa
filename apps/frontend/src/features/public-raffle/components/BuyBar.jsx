import { formatMoney } from '../../../shared/lib/format';
import { Countdown } from '../../../shared/ui/components';

export function BuyBar({ count, priceCents, expiresAt, onClear, onReserve }) {
  return (
    <div className="buybar">
      <div>
        <div className="grow">
          <b>{count} número{count === 1 ? '' : 's'} · {formatMoney(count * priceCents)}</b>
          {expiresAt && (
            <div className="small muted num">Guardado{count === 1 ? '' : 's'} para você por <Countdown to={expiresAt} /></div>
          )}
        </div>
        <button type="button" className="btn" onClick={onClear}>Liberar</button>
        <button type="button" className="btn primary" onClick={onReserve}>Continuar</button>
      </div>
    </div>
  );
}
