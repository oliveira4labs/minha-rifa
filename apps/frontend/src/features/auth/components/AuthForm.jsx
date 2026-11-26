import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
    <div className="login-action">
      <a className="btn-google" href={GOOGLE_LOGIN_URL}>
        <img className="btn-google-logo" src={googleLogo} alt="" />
        <span>Entrar com Google</span>
      </a>
      <p className="small muted">
        Ao entrar, você concorda com a <Link to="/privacidade">Política de Privacidade</Link>.
      </p>
    </div>
  );
}
