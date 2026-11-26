import { useCopy } from '../../../shared/hooks/useCopy';
import { formatDate, formatMoney, padNumbers } from '../../../shared/lib/format';
import { whatsappLink } from '../../../shared/lib/whatsapp';
import { Chips, CopyBox, Countdown, ExternalLink, Tag } from '../../../shared/ui/components';

// Mensagem que o comprador manda ao organizador. *texto* = negrito no WhatsApp.
function receiptMessage(raffle, order, numbersText) {
  const label = order.numbers.length > 1 ? 'Números' : 'Número';
  return [
    `Olá! Aqui é ${order.buyer_name} 👋`,
    `Quero reservar na rifa *${raffle.title}*:`,
    '',
    `🎟️ ${label}: *${numbersText}*`,
    `💰 Total: *${formatMoney(order.total_cents)}*`,
    '',
    'Já fiz o PIX, pode conferir? 🙏',
  ].join('\n');
}

function PaidOrder({ order, numbers }) {
  return (
    <div className="order paid">
      <div className="row between"><b>Pagamento confirmado ✓</b><Tag variant="open">Seus números</Tag></div>
      <Chips items={numbers} />
      <p className="small muted">Em nome de {order.buyer_name}. Boa sorte!</p>
    </div>
  );
}

function PendingOrder({ order, numbers, raffle, onProofSent }) {
  const copy = useCopy();
  return (
    <div className="order pending">
      <div className="row between">
        <b>Seus números estão guardados!</b>
        <Tag variant="pending">Finalize em <Countdown to={order.expires_at} /></Tag>
      </div>
      <Chips items={numbers} />
      <p>Total: <b className="num">{formatMoney(order.total_cents)}</b></p>
      <div className="stack-sm">
        <span className="small"><b>1.</b> Faça o PIX para esta chave:</span>
        <CopyBox value={raffle.pix_key}>
          <button type="button" className="btn sm" onClick={() => copy(raffle.pix_key, 'Chave PIX copiada!')}>Copiar</button>
        </CopyBox>
        <span className="small"><b>2.</b> Depois, é só avisar o organizador:</span>
        <ExternalLink
          className="btn wa"
          href={whatsappLink(raffle.whatsapp, receiptMessage(raffle, order, numbers.join(', ')))}
          onClick={() => onProofSent(order.token)}
        >
          Avisar o organizador pelo WhatsApp
        </ExternalLink>
      </div>
      <p className="small muted">
        Fique de olho no tempo: se ele acabar antes do aviso, os números voltam a ficar livres para outras pessoas.
      </p>
    </div>
  );
}

function ProofSentOrder({ order, numbers, raffle }) {
  return (
    <div className="order proof_sent">
      <div className="row between">
        <b>Organizador avisado ✓</b>
        <Tag variant="pending">Aguardando o organizador</Tag>
      </div>
      <Chips items={numbers} />
      <p className="small muted">
        Você avisou em {formatDate(order.proof_sent_at)}. Seus números estão guardados até o organizador conferir o PIX e confirmar.
      </p>
      <ExternalLink
        className="small"
        href={whatsappLink(raffle.whatsapp, receiptMessage(raffle, order, numbers.join(', ')))}
      >
        Abrir a conversa no WhatsApp de novo
      </ExternalLink>
    </div>
  );
}

// Pedidos `held` (carrinho), `expired` e `cancelled` não têm card: o carrinho aparece na barra de baixo
// e os vencidos/cancelados somem da tela (usePublicRaffle tira do navegador).
export function BuyerOrderCard({ order, raffle, onProofSent }) {
  const numbers = padNumbers(order.numbers, raffle.total_numbers);
  if (order.status === 'paid') return <PaidOrder order={order} numbers={numbers} />;
  if (order.status === 'proof_sent') return <ProofSentOrder order={order} numbers={numbers} raffle={raffle} />;
  if (order.status === 'pending') {
    return <PendingOrder order={order} numbers={numbers} raffle={raffle} onProofSent={onProofSent} />;
  }
  return null;
}
