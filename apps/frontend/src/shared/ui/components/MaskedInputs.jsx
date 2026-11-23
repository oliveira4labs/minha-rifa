// Campos com máscara. Recebem o valor já formatado e avisam a mudança com `onValueChange(texto)`.
import { maskMoney, maskPhone, moneyFromPaste } from '../../lib/masks';

/** Celular com DDD: (11) 91234-5678. Formata ao digitar e ao colar. */
export function PhoneInput({ value, onValueChange, ...props }) {
  return (
    <input
      placeholder="(11) 91234-5678"
      {...props}
      type="tel"
      inputMode="tel"
      value={value}
      onChange={(e) => onValueChange(maskPhone(e.target.value))}
    />
  );
}

/** Valor em reais: R$ 1.234,56. Digitação da direita para a esquerda; ao colar, entende "10" como R$ 10,00. */
export function MoneyInput({ value, onValueChange, ...props }) {
  function handlePaste(e) {
    const pasted = moneyFromPaste(e.clipboardData.getData('text'));
    if (pasted == null) return;
    e.preventDefault();
    onValueChange(pasted);
  }

  return (
    <input
      placeholder="R$ 0,00"
      {...props}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onValueChange(maskMoney(e.target.value))}
      onPaste={handlePaste}
    />
  );
}
