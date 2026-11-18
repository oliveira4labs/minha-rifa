import { useState } from 'react';

export function Gallery({ photos }) {
  const [index, setIndex] = useState(0);
  const current = index < photos.length ? index : 0;

  return (
    <div>
      <div className="gallery-main">
        <img src={photos[current]} alt="Foto do prêmio" />
      </div>
      {photos.length > 1 && (
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
    </div>
  );
}
