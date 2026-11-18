import { Outlet, useNavigate } from 'react-router-dom';
import { Topbar } from '../shared/ui/layout/Topbar';
import { useAuth } from '../features/auth/context/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <>
      <Topbar brandTo="/painel" user={user} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}
