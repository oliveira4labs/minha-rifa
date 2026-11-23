import { formatCountdown } from '../../lib/format';
import { useNow } from '../../hooks/useNow';

export function Tag({ variant, children }) {
  return <span className={`tag ${variant}`}>{children}</span>;
}

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

export function CopyBox({ value, children }) {
  return (
    <div className="pixbox">
      <code>{value}</code>
      {children}
    </div>
  );
}

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

export function ErrorCard({ title, children }) {
  return (
    <div className="card empty">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function ExternalLink({ href, className, onClick, children }) {
  return <a className={className} href={href} onClick={onClick} target="_blank" rel="noopener noreferrer">{children}</a>;
}
