import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Rotas do administrador: sem conta logada, volta para a tela de entrada. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Tela de entrada: quem já está logado vai direto para o painel. */
export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/painel" replace />;
  return <Outlet />;
}
