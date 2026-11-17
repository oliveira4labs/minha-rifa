import { useEffect, useState } from 'react';
import { formatMoney, padNumbers } from '../../../shared/lib/format';
import { Dialog } from '../../../shared/ui/feedback/Dialog';
import { loadBuyer } from '../lib/buyerStorage';

/** Pede nome e WhatsApp do comprador para confirmar a reserva. */
export function ReserveDialog({ open, numbers, raffle, onClose, onConfirm }) {
  const [buyer, setBuyer] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // Ao abrir, preenche com os dados da última compra (sem sobrescrever o que já foi digitado).
  useEffect(() => {
    if (!open) return;
    const saved = loadBuyer();
    setBuyer((b) => ({ name: b.name || saved.name || '', phone: b.phone || saved.phone || '' }));
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
        <h2>Reservar números</h2>
        <p className="muted small">
          Números {padNumbers(numbers, raffle.total_numbers).join(', ')} — total {formatMoney(numbers.length * raffle.price_cents)}
        </p>
        <label>Seu nome completo
          <input name="name" maxLength={80} required autoComplete="name" value={buyer.name} onChange={update('name')} />
        </label>
        <label>Seu WhatsApp (com DDD)
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="(11) 91234-5678"
            value={buyer.phone}
            onChange={update('phone')}
          />
        </label>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Voltar</button>
          <button type="submit" className="btn primary" disabled={submitting}>Confirmar reserva</button>
        </div>
      </form>
    </Dialog>
  );
}
