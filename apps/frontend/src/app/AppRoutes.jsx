import { Route, Routes } from 'react-router-dom';
import { GuestOnly, RequireAuth } from '../features/auth/components/RouteGuards';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { ManageRafflePage } from '../pages/ManageRafflePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { PublicRafflePage } from '../pages/PublicRafflePage';
import { AdminLayout } from './AdminLayout';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/painel" element={<DashboardPage />} />
          <Route path="/gerenciar" element={<ManageRafflePage />} />
        </Route>
      </Route>

      <Route path="/r/:slug" element={<PublicRafflePage />} />
      <Route path="/privacidade" element={<PrivacyPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
