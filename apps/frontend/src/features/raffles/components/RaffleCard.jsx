import { Link } from 'react-router-dom';
import { formatMoney, padNumber } from '../../../shared/lib/format';
import { ProgressBar, Tag } from '../../../shared/ui/components';

function StatusTag({ raffle }) {
  if (raffle.status === 'drawn') {
    return <Tag variant="done">Sorteada — nº {padNumber(raffle.winner_number, raffle.total_numbers)}</Tag>;
  }
  if (raffle.pending) return <Tag variant="pending">{raffle.pending} aguardando confirmação</Tag>;
  return <Tag variant="open">Aberta</Tag>;
}

export function RaffleCard({ raffle }) {
  const free = raffle.total_numbers - raffle.paid - raffle.pending;
  return (
    <Link className="card raffle-card" to={`/gerenciar?id=${raffle.id}`}>
      {raffle.cover ? <img className="cover" src={raffle.cover} alt="" /> : <div className="cover">🎟️</div>}
      <div className="grow stack-sm">
        <div className="row between">
          <h3>{raffle.title}</h3>
          <span className="row" style={{ gap: 6 }}>
            {raffle.visibility === 'private' && <Tag variant="private">Privada</Tag>}
            <StatusTag raffle={raffle} />
          </span>
        </div>
        <ProgressBar paid={raffle.paid} pending={raffle.pending} total={raffle.total_numbers} />
        <p className="small muted num">
          {raffle.paid} pagos · {raffle.pending} reservados · {free} disponíveis · {formatMoney(raffle.price_cents)} cada
        </p>
      </div>
    </Link>
  );
}
