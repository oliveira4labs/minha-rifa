import { parseMoney } from './format';

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

// Número inteiro: só dígitos, sem zeros à esquerda e com até `maxLength` dígitos
export const maskInteger = (value, maxLength) => onlyDigits(value).replace(/^0+(?=\d)/, '').slice(0, maxLength);

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

const MAX_MONEY_DIGITS = 9;

export const formatMoneyInput = (cents) =>
  `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function maskMoney(value) {
  const d = onlyDigits(value).replace(/^0+/, '').slice(0, MAX_MONEY_DIGITS);
  return d ? formatMoneyInput(Number(d)) : '';
}

export function moneyFromPaste(text) {
  const cents = parseMoney(text);
  if (!(cents > 0) || String(cents).length > MAX_MONEY_DIGITS) return null;
  return formatMoneyInput(cents);
}
