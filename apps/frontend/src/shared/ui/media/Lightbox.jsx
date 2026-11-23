import { useEffect, useState } from 'react';
import { Dialog } from '../feedback/Dialog';
import { SlideArrows, SlideTrack } from './SlideTrack';

/**
 * Visualizador de fotos em tela cheia, em slides.
 * Abre quando `startIndex` não é null; fecha com o X, Esc ou clique fora da foto.
 * Setas do teclado e arrastar o dedo trocam de foto.
 */
export function Lightbox({ photos, startIndex, onClose }) {
  const open = startIndex != null;
  const [index, setIndex] = useState(startIndex ?? 0);
  const count = photos.length;

  useEffect(() => {
    if (open) setIndex(Math.min(startIndex, count - 1));
  }, [open, startIndex, count]);

  // Se a foto aberta for removida, fecha quando não sobrar nenhuma.
  useEffect(() => {
    if (open && count === 0) onClose();
  }, [open, count, onClose]);

  function handleKeyDown(e) {
    if (count < 2) return;
    if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
    if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
  }

  function handleClick(e) {
    // Clique no fundo (fora da foto e dos botões) fecha.
    if (e.target === e.currentTarget || e.target.classList.contains('slide')) onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} className="lightbox" onKeyDown={handleKeyDown} onClick={handleClick}>
      {open && count > 0 && (
        <>
          <div className="lightbox-stage">
            <SlideTrack photos={photos} index={index} onIndexChange={setIndex} fit="contain" />
            <SlideArrows count={count} index={index} onIndexChange={setIndex} />
          </div>
          <div className="lightbox-bar">
            {count > 1 && <span className="num">{index + 1} / {count}</span>}
            <button type="button" className="lightbox-close" aria-label="Fechar" autoFocus onClick={onClose}>×</button>
          </div>
          {count > 1 && (
            <div className="lightbox-thumbs">
              {photos.map((url, i) => (
                <button
                  key={`${i}-${url.slice(-24)}`}
                  type="button"
                  className={i === index ? 'on' : undefined}
                  aria-label={`Ver foto ${i + 1}`}
                  onClick={() => setIndex(i)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}
