import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';
import googleLogo from '../../../shared/assets/google-logo.webp';
import { GOOGLE_LOGIN_URL } from '../api/authApi';

export function AuthForm() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const error = params.get('erro');

  useEffect(() => {
    if (!error) return;
    toast(error, true);
    setParams((p) => {
      p.delete('erro');
      return p;
    }, { replace: true });
  }, [error, toast, setParams]);

  return (
    <div className="card stack">
      <div className="tabs" role="tablist" style={{ gridTemplateColumns: '1fr' }}>
        <button type="button" role="tab" aria-selected className="on">Entrar</button>
      </div>
      <a className="btn-google" href={GOOGLE_LOGIN_URL}>
        <img className="btn-google-logo" src={googleLogo} alt="" />
        <span>Entrar com Google</span>
      </a>
    </div>
  );
}
