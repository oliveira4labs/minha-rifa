import { maskMoney, maskPhone, moneyFromPaste } from '../../lib/masks';

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
