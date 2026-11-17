// Regras e textos da tela de gestão, sem dependência de React.
import { formatDate, formatMoney, padNumber, padNumbers } from '../../../shared/lib/format';

export const publicRaffleUrl = (slug) => `${window.location.origin}/r/${slug}`;

export const isLocalHost = () => /^(localhost|127\.|\[::1\])/.test(window.location.host);

/** Quantidade e valor ficam travados quando já há números reservados ou pagos. */
export const isLocked = (counts) => counts.paid + counts.pending > 0;

export const isComplete = (raffle, counts) => counts.paid === raffle.total_numbers;

export function freeNumbers(raffle, taken) {
  const takenSet = new Set(taken.map(([n]) => n));
  const free = [];
  for (let n = 1; n <= raffle.total_numbers; n++) if (!takenSet.has(n)) free.push(n);
  return free;
}

/** Mensagem de divulgação para WhatsApp, com os números ainda disponíveis. */
export function shareMessage(raffle, taken) {
  const free = freeNumbers(raffle, taken);
  return `🎟️ *${raffle.title}*\n${formatMoney(raffle.price_cents)} cada número` +
    (raffle.draw_date ? `\nSorteio: ${formatDate(raffle.draw_date)}` : '') +
    (free.length
      ? `\n\nNúmeros disponíveis (${free.length}):\n${padNumbers(free, raffle.total_numbers).join(', ')}`
      : '\n\nTodos os números já foram escolhidos!') +
    `\n\nEscolha o seu aqui: ${publicRaffleUrl(raffle.slug)}`;
}

/** Texto explicando se o sorteio está liberado. `highlight` = mostrar como aviso. */
export function drawStatus(raffle, counts, canDraw) {
  const complete = isComplete(raffle, counts);
  if (complete) return { highlight: false, text: 'Todos os números estão pagos. Você já pode sortear.' };
  if (counts.paid === 0) {
    return { highlight: false, text: 'Ainda não há números pagos. O sorteio é feito entre os números com pagamento confirmado.' };
  }
  if (canDraw) {
    return {
      highlight: true,
      text: `A data do sorteio chegou e ${raffle.total_numbers - counts.paid} número(s) ainda não foram pagos. ` +
        `Você pode adiar a data ou sortear entre os ${counts.paid} números pagos.`,
    };
  }
  if (raffle.draw_date) {
    return {
      highlight: false,
      text: `O sorteio é liberado quando todos os números estiverem pagos ou a partir de ${formatDate(raffle.draw_date)}.`,
    };
  }
  return {
    highlight: false,
    text: 'O sorteio é liberado quando todos os números estiverem pagos. Para poder sortear antes disso, defina uma data do sorteio.',
  };
}

export function drawConfirmText(raffle, counts) {
  const intro = isComplete(raffle, counts)
    ? `Todos os ${raffle.total_numbers} números estão pagos. O sistema vai sortear um deles agora.`
    : `Apenas ${counts.paid} de ${raffle.total_numbers} números foram pagos. ` +
      `O sorteio será feito somente entre os ${counts.paid} números pagos.` +
      (counts.pending
        ? `\n${counts.pending} número(s) reservado(s) sem pagamento confirmado ficarão de fora e serão cancelados.`
        : '');
  return `${intro}\n\nDepois de sorteada, a rifa é encerrada e isso não pode ser desfeito.`;
}

export const winnerMessage = (raffle, winner) =>
  `Parabéns, ${winner.name}! Você ganhou a rifa "${raffle.title}" com o número ` +
  `${padNumber(winner.number, raffle.total_numbers)}! 🎉`;
