import { useEffect, useState } from 'react';
import { RaffleForm } from '../../raffles/components/RaffleForm';
import { isLocked } from '../model/raffleRules';

/**
 * Card recolhível "Editar dados da rifa".
 * `form` é a foto dos dados usada para preencher o formulário (ver useManagedRaffle);
 * quando `form.key` muda, o formulário é recriado com os valores novos.
 */
export function EditRaffleSection({ form, onBusyChange, onSave, onDelete }) {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => setDirty(false), [form.key]);
  useEffect(() => onBusyChange(open || dirty), [open, dirty, onBusyChange]);

  async function save(payload) {
    await onSave(payload);
    setOpen(false);
  }

  return (
    <details className="card" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Editar dados da rifa</summary>
      <div style={{ marginTop: 16 }}>
        <RaffleForm
          key={form.key}
          raffle={form.data.raffle}
          photos={form.data.photos}
          locked={isLocked(form.data.counts)}
          onDirty={() => setDirty(true)}
          onSubmit={save}
          renderActions={() => (
            <div className="row between">
              <button className="btn primary" type="submit">Salvar alterações</button>
              <button className="btn danger" type="button" onClick={onDelete}>Excluir rifa</button>
            </div>
          )}
        />
      </div>
    </details>
  );
}
