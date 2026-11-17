import { useRef } from 'react';
import { imageFileToDataUrl } from '../../../shared/lib/image';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';
import { MAX_PHOTOS } from '../model/raffleFormModel';

let nextLocalId = 0; // chave estável para fotos ainda não salvas

/**
 * Seletor de fotos controlado. Cada foto é `{ id, url }` (já salva) ou `{ data }` (nova).
 * A primeira da lista é a capa.
 */
export function PhotoPicker({ photos, onChange }) {
  const inputRef = useRef(null);
  const toast = useToast();

  const remove = (index) => onChange(photos.filter((_, i) => i !== index));

  async function addFiles(e) {
    const input = e.target;
    const next = [...photos];
    for (const file of [...input.files]) {
      if (next.length >= MAX_PHOTOS) {
        toast(`Máximo de ${MAX_PHOTOS} fotos.`, true);
        break;
      }
      try {
        next.push({ data: await imageFileToDataUrl(file), localId: ++nextLocalId });
      } catch (err) {
        toast(err.message, true);
      }
    }
    input.value = '';
    onChange(next);
  }

  return (
    <div className="stack-sm">
      <span style={{ fontWeight: 600, fontSize: '.92rem' }}>
        Fotos <span className="hint muted" style={{ fontWeight: 400 }}>até {MAX_PHOTOS} — a primeira é a capa</span>
      </span>
      <div className="thumbs">
        {photos.map((photo, i) => (
          <div className="thumb" key={photo.id ?? `new-${photo.localId}`}>
            <img src={photo.url || photo.data} alt={`Foto ${i + 1}`} />
            <button type="button" onClick={() => remove(i)} aria-label={`Remover foto ${i + 1}`}>×</button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button type="button" className="thumb add" onClick={() => inputRef.current.click()} aria-label="Adicionar fotos">
            +
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />
    </div>
  );
}
