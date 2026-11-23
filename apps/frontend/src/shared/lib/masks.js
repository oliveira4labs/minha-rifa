// Máscaras de digitação (pt-BR). Recebem o texto do campo e devolvem o texto formatado.
import { parseMoney } from './format';

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

/**
 * Celular/telefone com DDD: "(11) 91234-5678" ou "(11) 1234-5678".
 * Aceita colar com +55 na frente (o código do país é removido).
 */
export function maskPhone(value) {
  let d = onlyDigits(value);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  d = d.slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = d.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

const MAX_MONEY_DIGITS = 9; // até R$ 9.999.999,99

/** Centavos → "R$ 1.234,56". */
export const formatMoneyInput = (cents) =>
  `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Valor em reais digitado da direita para a esquerda, como em app de banco:
 * digitar 1, 0, 0, 0 → R$ 0,01 → R$ 0,10 → R$ 1,00 → R$ 10,00.
 */
export function maskMoney(value) {
  const d = onlyDigits(value).replace(/^0+/, '').slice(0, MAX_MONEY_DIGITS);
  return d ? formatMoneyInput(Number(d)) : '';
}

/** Texto colado ("10", "10,50", "R$ 1.234,56") → valor formatado, ou null se não for um valor. */
export function moneyFromPaste(text) {
  const cents = parseMoney(text);
  if (!(cents > 0) || String(cents).length > MAX_MONEY_DIGITS) return null;
  return formatMoneyInput(cents);
}
