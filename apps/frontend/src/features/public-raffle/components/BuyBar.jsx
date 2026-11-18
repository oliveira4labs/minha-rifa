import { formatMoney } from '../../../shared/lib/format';

export function BuyBar({ count, priceCents, onClear, onReserve }) {
  return (
    <div className="buybar">
      <div>
        <div className="grow">
          <b>{count} número{count === 1 ? '' : 's'}</b>
          <div className="small muted num">{formatMoney(count * priceCents)}</div>
        </div>
        <button type="button" className="btn" onClick={onClear}>Limpar</button>
        <button type="button" className="btn primary" onClick={onReserve}>Reservar</button>
      </div>
    </div>
  );
}
