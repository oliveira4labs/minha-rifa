import { Link } from 'react-router-dom';

function Brand() {
  return <>minha<span>rifa</span></>;
}

export function Topbar({ brandTo, user, onLogout }) {
  return (
    <header className="topbar">
      <div>
        {brandTo
          ? <Link className="brand" to={brandTo}><Brand /></Link>
          : <span className="brand"><Brand /></span>}
        {user && (
          <div className="row">
            <span className="small muted">{user.name}</span>
            <button type="button" className="btn sm" onClick={onLogout}>Sair</button>
          </div>
        )}
      </div>
    </header>
  );
}
