import { useState } from 'react';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';
import { useRemoteConfig } from '../../remote-config/context/RemoteConfigContext';
import { useAuth } from '../context/AuthContext';

const MODES = {
  login: { tab: 'Entrar', submit: 'Entrar' },
  register: { tab: 'Criar conta', submit: 'Criar conta' },
};

export function AuthForm({ onSuccess }) {
  const { login, register } = useAuth();
  const toast = useToast();
  const { isEnabled } = useRemoteConfig();
  const canRegister = isEnabled('createUser');
  const [selectedMode, setMode] = useState('login');
  const mode = canRegister ? selectedMode : 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === 'register';

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await (isRegister ? register(form) : login(form));
      onSuccess?.();
    } catch (err) {
      toast(err.message, true);
      setSubmitting(false);
    }
  }

  return (
    <div className="card stack">
      {canRegister ? (
        <div className="tabs" role="tablist">
          {Object.entries(MODES).map(([key, { tab }]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              className={mode === key ? 'on' : undefined}
              onClick={() => setMode(key)}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : (
        <h2>Entrar</h2>
      )}
      <form className="stack" onSubmit={handleSubmit}>
        {isRegister && (
          <label>Seu nome
            <input name="name" maxLength={80} autoComplete="name" required value={form.name} onChange={update('name')} />
          </label>
        )}
        <label>E-mail
          <input name="email" type="email" required autoComplete="email" value={form.email} onChange={update('email')} />
        </label>
        <label>Senha {isRegister && <span className="hint">Pelo menos 6 caracteres</span>}
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={update('password')}
          />
        </label>
        <button className="btn primary block" disabled={submitting}>{MODES[mode].submit}</button>
      </form>
    </div>
  );
}
