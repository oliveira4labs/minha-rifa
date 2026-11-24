import { useRef } from 'react';

const SWIPE_MIN_PX = 40;

export function SlideTrack({
  photos, index, onIndexChange, fit = 'contain', backdrop = false, onSlideClick, altPrefix = 'Foto',
}) {
  const touchStartX = useRef(null);
  const count = photos.length;

  function handleTouchEnd(e) {
    if (touchStartX.current == null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_MIN_PX) return;
    onIndexChange((index + (dx < 0 ? 1 : -1) + count) % count);
  }

  return (
    <div
      className={`slides fit-${fit}`}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
    >
      <div className="slides-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {photos.map((url, i) => {
          const loading = Math.abs(i - index) <= 1 ? 'eager' : 'lazy';
          const img = (
            <>
              {backdrop && <img className="slide-backdrop" src={url} alt="" aria-hidden="true" loading={loading} draggable={false} />}
              <img className="slide-photo" src={url} alt={`${altPrefix} ${i + 1} de ${count}`} loading={loading} draggable={false} />
            </>
          );
          return (
            <div className="slide" key={`${i}-${url.slice(-24)}`} aria-hidden={i !== index}>
              {onSlideClick ? (
                <button
                  type="button"
                  className="slide-hit"
                  tabIndex={i === index ? 0 : -1}
                  aria-label={`Ampliar foto ${i + 1}`}
                  onClick={() => onSlideClick(i)}
                >
                  {img}
                </button>
              ) : img}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SlideArrows({ count, index, onIndexChange }) {
  if (count < 2) return null;
  const go = (step) => onIndexChange((index + step + count) % count);
  return (
    <>
      <button type="button" className="slide-arrow prev" aria-label="Foto anterior" onClick={() => go(-1)}>‹</button>
      <button type="button" className="slide-arrow next" aria-label="Próxima foto" onClick={() => go(1)}>›</button>
    </>
  );
}
