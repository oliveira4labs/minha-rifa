import { padNumber } from '../../../shared/lib/format';

export function WinnerBanner({ winner, total }) {
  return (
    <div className="winner">
      <p><b>Rifa sorteada!</b> Número ganhador:</p>
      <div className="big">{padNumber(winner.number, total)}</div>
      <p>Parabéns ao ganhador! 🎉</p>
    </div>
  );
}
