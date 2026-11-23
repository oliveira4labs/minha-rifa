import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { Loading } from '../shared/ui/components';
import { useToast } from '../shared/ui/feedback/ToastProvider';
import { rafflesApi } from '../features/raffles/api/rafflesApi';
import { RaffleCard } from '../features/raffles/components/RaffleCard';
import { RaffleForm } from '../features/raffles/components/RaffleForm';

export function DashboardPage() {
  useDocumentTitle('Minhas rifas');
  const navigate = useNavigate();
  const toast = useToast();
  const [raffles, setRaffles] = useState(null);
  const [creating, setCreating] = useState(false);
  const [focusForm, setFocusForm] = useState(false);

  useEffect(() => {
    rafflesApi.list().then((list) => {
      setRaffles(list);
      if (!list.length) setCreating(true);
    }, (err) => toast(err.message, true));
  }, [toast]);

  const openForm = () => {
    setFocusForm(true);
    setCreating(true);
  };

  async function create(payload) {
    const { id } = await rafflesApi.create(payload);
    navigate(`/gerenciar?id=${id}`);
  }

  return (
    <main className="wrap stack">
      <div className="row between">
        <h1>Minhas rifas</h1>
        {!creating && <button type="button" className="btn primary" onClick={openForm}>+ Nova rifa</button>}
      </div>

      {creating && (
        <section className="card stack">
          <h2>Nova rifa</h2>
          <RaffleForm
            autoFocus={focusForm}
            onSubmit={create}
            renderActions={({ submitting }) => (
              <div className="row">
                <button className="btn primary" type="submit" disabled={submitting}>
                  {submitting ? 'Criando…' : 'Criar rifa'}
                </button>
                <button className="btn" type="button" onClick={() => setCreating(false)}>Cancelar</button>
              </div>
            )}
          />
        </section>
      )}

      <section className="stack">
        {raffles == null && <Loading />}
        {raffles?.length === 0 && (
          <p className="empty">Você ainda não tem rifas. Preencha o formulário acima para criar a primeira.</p>
        )}
        {raffles?.map((raffle) => <RaffleCard key={raffle.id} raffle={raffle} />)}
      </section>
    </main>
  );
}
