import { useLayoutEffect, useRef, useState } from 'react';

export function ClampedText({ text, lines = 5, className = '' }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return undefined;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, lines, expanded]);

  return (
    <div className="clamped">
      <p
        ref={ref}
        className={`${className}${expanded ? '' : ' clamp'}`}
        style={expanded ? undefined : { WebkitLineClamp: lines }}
      >
        {text}
      </p>
      {(overflows || expanded) && (
        <button type="button" className="link-btn" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  );
}
