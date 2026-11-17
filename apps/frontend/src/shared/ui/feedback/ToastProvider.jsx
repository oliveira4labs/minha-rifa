import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

const DURATION = { info: 3000, error: 6000 };

/** Mensagem curta no rodapé da tela. Só uma por vez: a nova substitui a anterior. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = useCallback((message, isError = false) => {
    clearTimeout(timer.current);
    setToast({ message, isError, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), isError ? DURATION.error : DURATION.info);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div key={toast.key} className={`toast${toast.isError ? ' err' : ''}`} role="status">
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/** `toast(mensagem, éErro?)` */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  return ctx;
}
