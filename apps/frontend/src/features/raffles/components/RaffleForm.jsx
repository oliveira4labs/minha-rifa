import { useState } from 'react';
import { MoneyInput, PhoneInput } from '../../../shared/ui/components/MaskedInputs';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';
import { toFormValues, toPayload } from '../model/raffleFormModel';
import { PhotoPicker } from './PhotoPicker';

export function RaffleForm({
  raffle, photos: initialPhotos = [], locked = false, autoFocus = false, onSubmit, onDirty, renderActions,
}) {
  const toast = useToast();
  const [values, setValues] = useState(() => toFormValues(raffle));
  const [photos, setPhotos] = useState(initialPhotos);
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    onDirty?.();
  };

  const field = (name) => ({
    name,
    value: values[name],
    onChange: (e) => setField(name, e.target.value),
  });

  const maskedField = (name) => ({
    name,
    value: values[name],
    onValueChange: (value) => setField(name, value),
  });

  const changePhotos = (next) => {
    setPhotos(next);
    onDirty?.();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(toPayload(values, photos, { locked }));
    } catch (err) {
      toast(err.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label>Título da rifa
        <input {...field('title')} maxLength={120} required autoFocus={autoFocus} placeholder="Ex.: Rifa de uma bicicleta aro 29" />
      </label>
      <label>Descrição <span className="hint">Conte o que é o prêmio, o estado, como será a entrega…</span>
        <textarea {...field('description')} maxLength={5000} />
      </label>

      <PhotoPicker photos={photos} onChange={changePhotos} />

      <div className="grid2">
        <label>Quantidade de números
          <input {...field('total_numbers')} type="number" inputMode="numeric" min={2} max={5000} required disabled={locked} />
        </label>
        <label>Valor de cada número
          <MoneyInput {...maskedField('price')} required disabled={locked} />
        </label>
      </div>
      {locked && (
        <p className="small muted">Quantidade e valor não podem mudar porque já existem números reservados ou pagos.</p>
      )}

      <div className="grid2">
        <label>Chave PIX para pagamento
          <input {...field('pix_key')} maxLength={200} required placeholder="CPF, celular, e-mail ou chave aleatória" />
        </label>
        <label>Seu WhatsApp (com DDD) <span className="hint">Para onde os compradores enviam o comprovante</span>
          <PhoneInput {...maskedField('whatsapp')} required />
        </label>
      </div>

      <div className="grid2">
        <label>Tempo de reserva <span className="hint">Sem confirmação nesse prazo, o número volta a ficar disponível</span>
          <span className="row" style={{ flexWrap: 'nowrap' }}>
            <input {...field('reserve_value')} type="number" inputMode="numeric" min={1} required />
            <select {...field('reserve_unit')}>
              <option value="min">minutos</option>
              <option value="h">horas</option>
              <option value="d">dias</option>
            </select>
          </span>
        </label>
        <label>Limite de números por pessoa <span className="hint">Deixe vazio para não limitar</span>
          <input {...field('max_per_buyer')} type="number" inputMode="numeric" min={1} placeholder="Sem limite" />
        </label>
      </div>

      <label>Data do sorteio <span className="hint">Opcional. Você pode alterar depois</span>
        <input {...field('draw_date')} type="datetime-local" />
      </label>

      <label>Visibilidade <span className="hint">Privada: só você vê a página e as fotos, e ninguém consegue reservar números</span>
        <select {...field('visibility')}>
          <option value="public">Pública — qualquer pessoa com o link</option>
          <option value="private">Privada — só você</option>
        </select>
      </label>

      {renderActions({ submitting })}
    </form>
  );
}
