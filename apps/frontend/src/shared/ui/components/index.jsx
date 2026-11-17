// Componentes visuais pequenos e sem regra de negócio.
import { formatCountdown } from '../../lib/format';
import { useNow } from '../../hooks/useNow';

/** variant: open | pending | done */
export function Tag({ variant, children }) {
  return <span className={`tag ${variant}`}>{children}</span>;
}

/** Barra com a fatia paga (verde) e a reservada (amarela). */
export function ProgressBar({ paid, pending, total, label }) {
  return (
    <div className="bar" role={label ? 'img' : undefined} aria-label={label}>
      <i style={{ width: `${(paid / total) * 100}%` }} />
      <i className="pend" style={{ width: `${(pending / total) * 100}%` }} />
    </div>
  );
}

export function Chips({ items }) {
  return (
    <div className="chips">
      {items.map((item) => <span key={item} className="chip">{item}</span>)}
    </div>
  );
}

/** Caixa tracejada com um texto copiável (link, chave PIX…) e ações ao lado. */
export function CopyBox({ value, children }) {
  return (
    <div className="pixbox">
      <code>{value}</code>
      {children}
    </div>
  );
}

/** Tempo restante até `to` (timestamp), atualizado a cada segundo. */
export function Countdown({ to }) {
  const now = useNow();
  return <>{formatCountdown(to - now)}</>;
}

export function Stat({ value, label }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export function Loading() {
  return <p className="empty">Carregando…</p>;
}

/** Cartão de erro de página inteira. */
export function ErrorCard({ title, children }) {
  return (
    <div className="card empty">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function ExternalLink({ href, className, children }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}
