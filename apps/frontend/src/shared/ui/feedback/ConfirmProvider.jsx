import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Dialog } from './Dialog';

const ConfirmContext = createContext(null);

/**
 * Diálogo de confirmação reutilizável.
 * `await confirm({ title, text, ok, danger })` → true se a pessoa confirmar.
 */
export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    resolver.current = resolve;
    setOptions(opts);
  }), []);

  const finish = (answer) => {
    resolver.current?.(answer);
    resolver.current = null;
    setOptions(null);
  };

  const value = useMemo(() => ({ confirm, isOpen: options != null }), [confirm, options]);
  const { title, text, ok = 'Confirmar', danger = false } = options ?? {};

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog open={options != null} onClose={() => finish(false)}>
        <h2>{title}</h2>
        <p className="muted" style={{ marginTop: 8, whiteSpace: 'pre-line' }}>{text}</p>
        <div className="actions">
          <button type="button" className="btn" onClick={() => finish(false)}>Voltar</button>
          <button type="button" className={`btn ${danger ? 'danger solid' : 'primary'}`} onClick={() => finish(true)}>
            {ok}
          </button>
        </div>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm precisa estar dentro de <ConfirmProvider>.');
  return ctx;
}
