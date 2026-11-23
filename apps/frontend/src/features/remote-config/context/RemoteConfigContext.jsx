import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { remoteConfigApi } from '../api/remoteConfigApi';

const RemoteConfigContext = createContext(null);

export function RemoteConfigProvider({ children }) {
  const [config, setConfig] = useState({});

  useEffect(() => {
    remoteConfigApi.get().then(setConfig, () => setConfig({}));
  }, []);

  const isEnabled = useCallback(
    (key) => String(config[key] ?? '').trim().toLowerCase() !== 'disabled',
    [config],
  );

  const value = useMemo(() => ({ config, isEnabled }), [config, isEnabled]);

  return <RemoteConfigContext.Provider value={value}>{children}</RemoteConfigContext.Provider>;
}

export function useRemoteConfig() {
  const ctx = useContext(RemoteConfigContext);
  if (!ctx) throw new Error('useRemoteConfig precisa estar dentro de <RemoteConfigProvider>.');
  return ctx;
}
