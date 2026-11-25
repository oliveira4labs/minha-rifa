import { formatDate, formatMoney } from '../../../shared/lib/format';
import { ProgressBar, Tag } from '../../../shared/ui/components';
import { ClampedText } from '../../../shared/ui/components/ClampedText';
import { Gallery } from './Gallery';

export function RaffleHero({ raffle, photos, taken }) {
  const total = raffle.total_numbers;
  const paid = taken.filter(([, status]) => status === 'p').length;
  const pending = taken.length - paid;
  const free = total - taken.length;
  const open = raffle.status === 'open';

  return (
    <section className={`hero${photos.length ? ' has-photos' : ''}`}>
      {photos.length > 0 && <Gallery photos={photos} />}
      <div className="stack">
        <div className="stack-sm">
          <span><Tag variant={open ? 'open' : 'done'}>{open ? 'Rifa aberta' : 'Rifa encerrada'}</Tag></span>
          <h1>{raffle.title}</h1>
        </div>
        <div>
          <span className="price num">{formatMoney(raffle.price_cents)}</span> <span className="muted">por número</span>
        </div>
        <div className="stack-sm">
          <ProgressBar
            paid={paid}
            pending={pending}
            total={total}
            label={`${paid} pagos, ${pending} reservados, ${free} disponíveis`}
          />
          <p className="small muted num"><b style={{ color: 'var(--ink)' }}>{free}</b> de {total} números disponíveis</p>
        </div>
        {raffle.draw_date && <p className="small">🗓️ Sorteio previsto para <b>{formatDate(raffle.draw_date)}</b></p>}
        {raffle.description && <ClampedText className="desc" text={raffle.description} lines={5} />}
      </div>
    </section>
  );
}
