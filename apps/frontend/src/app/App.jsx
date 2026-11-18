import { BrowserRouter } from 'react-router-dom';
import { ConfirmProvider } from '../shared/ui/feedback/ConfirmProvider';
import { ToastProvider } from '../shared/ui/feedback/ToastProvider';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { AppRoutes } from './AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
