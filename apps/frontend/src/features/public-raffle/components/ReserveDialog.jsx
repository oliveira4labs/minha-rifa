import { useEffect, useState } from 'react';
import { formatMoney, padNumbers } from '../../../shared/lib/format';
import { maskPhone } from '../../../shared/lib/masks';
import { Countdown } from '../../../shared/ui/components';
import { PhoneInput } from '../../../shared/ui/components/MaskedInputs';
import { Dialog } from '../../../shared/ui/feedback/Dialog';
import { loadBuyer } from '../lib/buyerStorage';

export function ReserveDialog({ open, numbers, raffle, expiresAt, onClose, onConfirm }) {
  const [buyer, setBuyer] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const saved = loadBuyer();
    setBuyer((b) => ({ name: b.name || saved.name || '', phone: b.phone || maskPhone(saved.phone) }));
  }, [open]);

  const update = (field) => (e) => setBuyer((b) => ({ ...b, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm(buyer);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form className="stack" onSubmit={handleSubmit}>
        <h2>Seus dados</h2>
        <p className="muted small">
          Números {padNumbers(numbers, raffle.total_numbers).join(', ')} — total {formatMoney(numbers.length * raffle.price_cents)}
        </p>
        {expiresAt && (
          <p className="small">Os números ficam guardados por <b className="num"><Countdown to={expiresAt} /></b>. Nesse tempo, confirme seus dados, faça o PIX e envie o comprovante.</p>
        )}
        <label>Seu nome completo
          <input name="name" maxLength={80} required autoComplete="name" value={buyer.name} onChange={update('name')} />
        </label>
        <label>Seu WhatsApp (com DDD)
          <PhoneInput
            name="phone"
            required
            autoComplete="tel"
            value={buyer.phone}
            onValueChange={(phone) => setBuyer((b) => ({ ...b, phone }))}
          />
        </label>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Voltar</button>
          <button type="submit" className="btn primary" disabled={submitting}>Confirmar dados</button>
        </div>
      </form>
    </Dialog>
  );
}
