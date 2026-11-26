import { Toaster, toast } from 'sonner';

const DURATION = { info: 3000, error: 5000 };

// Mesma API de antes (`toast(mensagem, isError)`), agora com o sonner: empilha os avisos, deixa arrastar
// para fechar e não fica por cima da barra de compra (aparece no topo).
const show = (message, isError = false) => (isError
  ? toast.error(message, { duration: DURATION.error })
  : toast(message, { duration: DURATION.info }));

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        visibleToasts={3}
        offset={16}
        mobileOffset={12}
        toastOptions={{ className: 'app-toast' }}
      />
    </>
  );
}

export function useToast() {
  return show;
}
