import { formatDate, formatMoney } from '../../../shared/lib/format';
import { ProgressBar, Tag } from '../../../shared/ui/components';

// Cabeçalho da gestão: a rifa e os números dela num card só
export function RaffleSummary({ raffle, counts, coverUrl }) {
  const open = raffle.status === 'open';
  const awaiting = counts.awaiting ?? 0;
  const free = raffle.total_numbers - counts.paid - counts.pending;
  const metaList = [
    `${formatMoney(raffle.price_cents)} por número`,
    `${raffle.total_numbers} números`,
    raffle.draw_date ? `Sorteio em ${formatDate(raffle.draw_date)}` : 'Sem data de sorteio',
  ];
  const statList = [
    { value: counts.paid, label: 'pagos' },
    { value: awaiting, label: 'avisaram que pagaram', warn: awaiting > 0 },
    { value: counts.pending - awaiting, label: 'reservados, sem aviso' },
    { value: free, label: 'disponíveis' },
  ];

  return (
    <section className="card summary">
      <div className="summary-head">
        {coverUrl ? <img className="summary-cover" src={coverUrl} alt="" /> : <div className="summary-cover">🎟️</div>}
        <div className="grow stack-sm">
          <div className="summary-title">
            <h1>{raffle.title}</h1>
            <span className="row summary-tags">
              {raffle.visibility === 'private' && <Tag variant="private">Privada</Tag>}
              <Tag variant={open ? 'open' : 'done'}>{open ? 'Aberta' : 'Sorteada'}</Tag>
            </span>
          </div>
          <p className="small muted">{metaList.join(' · ')}</p>
        </div>
      </div>

      <div className="summary-progress">
        <div className="row between small">
          <span><b className="num">{counts.paid}</b> de {raffle.total_numbers} números pagos</span>
          <span className="muted">
            <b className="num summary-money">{formatMoney(counts.paid * raffle.price_cents)}</b>
            {' '}de {formatMoney(raffle.total_numbers * raffle.price_cents)}
          </span>
        </div>
        <ProgressBar
          paid={counts.paid}
          pending={counts.pending}
          total={raffle.total_numbers}
          label={`${counts.paid} pagos e ${counts.pending} reservados de ${raffle.total_numbers}`}
        />
      </div>

      <dl className="summary-stats">
        {statList.map((stat) => (
          <div key={stat.label} className={stat.warn ? 'warn' : undefined}>
            <dt>{stat.label}</dt>
            <dd className="num">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
