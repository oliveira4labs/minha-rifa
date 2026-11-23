import { BrowserRouter } from 'react-router-dom';
import { ConfirmProvider } from '../shared/ui/feedback/ConfirmProvider';
import { ToastProvider } from '../shared/ui/feedback/ToastProvider';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { RemoteConfigProvider } from '../features/remote-config/context/RemoteConfigContext';
import { AppRoutes } from './AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <RemoteConfigProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </RemoteConfigProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
