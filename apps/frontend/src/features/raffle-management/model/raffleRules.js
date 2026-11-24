import { formatDate, formatMoney, padNumber, padNumbers } from '../../../shared/lib/format';

export const publicRaffleUrl = (slug) => `${window.location.origin}/r/${slug}`;

export const isLocalHost = () => /^(localhost|127\.|\[::1\])/.test(window.location.host);

export const isLocked = (counts) => counts.paid + counts.pending > 0;

export const isComplete = (raffle, counts) => counts.paid === raffle.total_numbers;

export function freeNumbers(raffle, taken) {
  const takenSet = new Set(taken.map(([n]) => n));
  const free = [];
  for (let n = 1; n <= raffle.total_numbers; n++) if (!takenSet.has(n)) free.push(n);
  return free;
}

const PRIZE_PREVIEW_MAX = 140;
const LAST_NUMBERS_LISTED = 10;

function prizePreview(description) {
  const firstLine = (description ?? '').trim().split(/\n/)[0].trim();
  if (!firstLine) return '';
  const sentence = firstLine.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? firstLine;
  if (sentence.length <= PRIZE_PREVIEW_MAX) return sentence;
  const cut = sentence.slice(0, PRIZE_PREVIEW_MAX);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, '')}…`;
}

function availabilityLine(raffle, free) {
  const total = raffle.total_numbers;
  if (free.length === 0) return '✅ Todos os números já foram escolhidos!';
  if (free.length <= LAST_NUMBERS_LISTED) {
    const which = free.length === 1 ? 'Último número' : `Últimos ${free.length} números`;
    return `⚡ *${which}:* ${padNumbers(free, total).join(', ')}`;
  }
  if (free.length === total) return `🔥 Todos os ${total} números ainda estão disponíveis`;
  return `🔥 Restam *${free.length}* de ${total} números`;
}

export function shareMessage(raffle, taken) {
  const free = freeNumbers(raffle, taken);
  const prize = prizePreview(raffle.description);
  const details = [
    prize ? `🎁 ${prize}` : null,
    `💰 Apenas *${formatMoney(raffle.price_cents)}* por número`,
    availabilityLine(raffle, free),
    raffle.draw_date ? `🗓️ Sorteio: ${formatDate(raffle.draw_date).replace(', ', ' às ')}` : null,
  ].filter(Boolean);
  const call = free.length ? '👉 Escolha seus números da sorte:' : '👉 Acompanhe a rifa:';
  return [`🎟️ *${raffle.title}*`, details.join('\n'), `${call}\n${publicRaffleUrl(raffle.slug)}`].join('\n\n');
}

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
