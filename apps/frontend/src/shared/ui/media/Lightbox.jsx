import { useEffect, useState } from 'react';
import { Dialog } from '../feedback/Dialog';
import { SlideArrows, SlideTrack } from './SlideTrack';

function isOutsidePhoto(target, { clientX, clientY }) {
  if (!target.classList.contains('slide-photo') || !target.naturalWidth) return false;
  const box = target.getBoundingClientRect();
  const scale = Math.min(box.width / target.naturalWidth, box.height / target.naturalHeight);
  const width = target.naturalWidth * scale;
  const height = target.naturalHeight * scale;
  const x = clientX - box.left - (box.width - width) / 2;
  const y = clientY - box.top - (box.height - height) / 2;
  return x < 0 || y < 0 || x > width || y > height;
}

export function Lightbox({ photos, startIndex, onClose }) {
  const open = startIndex != null;
  const [index, setIndex] = useState(startIndex ?? 0);
  const count = photos.length;

  useEffect(() => {
    if (open) setIndex(Math.min(startIndex, count - 1));
  }, [open, startIndex, count]);

  useEffect(() => {
    if (open && count === 0) onClose();
  }, [open, count, onClose]);

  function handleKeyDown(e) {
    if (count < 2) return;
    if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
    if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
  }

  function handleClick(e) {
    const { target } = e;
    if (target === e.currentTarget || target.classList.contains('lightbox-stage') || isOutsidePhoto(target, e)) onClose();
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
