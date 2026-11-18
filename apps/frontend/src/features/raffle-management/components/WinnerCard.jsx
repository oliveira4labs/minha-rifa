import { formatDate, formatPhone, padNumber } from '../../../shared/lib/format';
import { whatsappLink } from '../../../shared/lib/whatsapp';
import { ExternalLink } from '../../../shared/ui/components';
import { winnerMessage } from '../model/raffleRules';

export function WinnerCard({ raffle, winner }) {
  return (
    <div className="winner stack-sm">
      <p><b>Rifa sorteada</b> em {formatDate(winner.drawn_at)}. Número ganhador:</p>
      <div className="big">{padNumber(winner.number, raffle.total_numbers)}</div>
      <p><b>{winner.name}</b> · {formatPhone(winner.phone)}</p>
      <div>
        <ExternalLink className="btn wa" href={whatsappLink(winner.phone, winnerMessage(raffle, winner))}>
          Avisar ganhador pelo WhatsApp
        </ExternalLink>
      </div>
    </div>
  );
}
