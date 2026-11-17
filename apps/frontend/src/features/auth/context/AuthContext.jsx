import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

/** Guarda a conta logada (administrador). `user === undefined` enquanto carrega. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    authApi.me().then(setUser, () => setUser(null));
  }, []);

  const login = useCallback(async (credentials) => setUser(await authApi.login(credentials)), []);
  const register = useCallback(async (data) => setUser(await authApi.register(data)), []);
  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading: user === undefined, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
