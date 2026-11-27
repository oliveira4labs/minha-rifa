import { useEffect, useRef } from 'react';
import { maskInteger, maskMoney, maskPhone, moneyFromPaste } from '../../lib/masks';

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

/**
 * Campo de número inteiro que só aceita dígitos (letras, sinais, vírgula e ponto somem ao digitar ou colar).
 * `type="number"` não serve: deixa digitar "e", "+", "-" e "," e, no Safari, qualquer letra.
 * Como `type="text"` ignora `min`/`max`, a faixa é conferida aqui e o navegador mostra o aviso ao enviar.
 */
export function IntegerInput({ value, onValueChange, min, max, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const n = Number(value);
    let message = '';
    if (value !== '' && min != null && n < min) message = `Use um número a partir de ${min}.`;
    else if (value !== '' && max != null && n > max) message = `Use um número até ${max}.`;
    ref.current?.setCustomValidity(message);
  }, [value, min, max]);

  return (
    <input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={value}
      onChange={(e) => onValueChange(maskInteger(e.target.value, max != null ? String(max).length : 6))}
    />
  );
}
