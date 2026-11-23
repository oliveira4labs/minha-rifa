import { useState } from 'react';
import { Lightbox } from '../../../shared/ui/media/Lightbox';
import { SlideArrows, SlideTrack } from '../../../shared/ui/media/SlideTrack';

/** Carrossel de fotos do prêmio. Clicar na foto abre em tela cheia. */
export function Gallery({ photos }) {
  const [index, setIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(null);
  const current = index < photos.length ? index : 0;
  const count = photos.length;

  return (
    <div>
      <div className="gallery-main">
        <SlideTrack photos={photos} index={current} onIndexChange={setIndex} onSlideClick={setZoomIndex} altPrefix="Foto do prêmio" />
        <SlideArrows count={count} index={current} onIndexChange={setIndex} />
        <span className="gallery-badge num" aria-hidden="true">
          {count > 1 ? `${current + 1} / ${count} · ` : ''}⤢ ampliar
        </span>
      </div>
      {count > 1 && (
        <div className="gallery-thumbs">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              className={i === current ? 'on' : undefined}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setIndex(i)}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
      <Lightbox photos={photos} startIndex={zoomIndex} onClose={() => setZoomIndex(null)} />
    </div>
  );
}
