import { useNavigate } from 'react-router-dom';
import { fromDateTimeInput, padNumbers } from '../../../shared/lib/format';
import { useConfirm } from '../../../shared/ui/feedback/ConfirmProvider';
import { useToast } from '../../../shared/ui/feedback/ToastProvider';
import { rafflesApi } from '../../raffles/api/rafflesApi';
import { toPartialPayload } from '../../raffles/model/raffleFormModel';
import { ordersApi } from '../api/ordersApi';
import { drawConfirmText } from '../model/raffleRules';

export function useRaffleActions(id, data, refresh, reveal) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const run = (fn) => async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      toast(err.message, true);
      refresh().catch(() => {});
    }
  };

  const approveOrder = run(async (order) => {
    await ordersApi.approve(order.id);
    await refresh();
    toast(`Pagamento de ${order.buyer_name} confirmado.`);
  });

  const cancelOrder = run(async (order) => {
    const paid = order.status === 'paid';
    const numbers = padNumbers(order.numbers, data.raffle.total_numbers).join(', ');
    const ok = await confirm({
      title: paid ? 'Desfazer esta venda?' : 'Recusar esta reserva?',
      text: `${numbers} — ${order.buyer_name}\n\nOs números voltam a ficar disponíveis para outras pessoas.`,
      ok: paid ? 'Desfazer venda' : 'Recusar reserva',
      danger: true,
    });
    if (!ok) return;
    await ordersApi.cancel(order.id);
    await refresh();
  });

  const saveDrawDate = run(async (inputValue) => {
    const drawDate = fromDateTimeInput(inputValue);
    await rafflesApi.update(id, toPartialPayload(data.raffle, data.photos, { draw_date: drawDate }));
    await refresh({ resetForm: true });
    toast(drawDate ? 'Data do sorteio salva.' : 'Data do sorteio removida.');
  });

  const draw = run(async () => {
    reveal.preload(); // baixa o rufar enquanto o admin lê a confirmação
    const ok = await confirm({
      title: 'Realizar o sorteio?',
      text: `${drawConfirmText(data.raffle, data.counts)}\n\n` +
        'Na próxima tela, sem valores nem dados dos compradores, você clica em "Sortear". Dá para gravar a tela e mandar aos participantes.',
      ok: 'Ir para o sorteio',
    });
    if (!ok) return;
    // O ganhador é sorteado e salvo no servidor só no "Sortear" do palco; a animação roda enquanto a resposta chega
    const drawn = await reveal.open({
      poolSize: data.counts.paid,
      digitCount: String(data.raffle.total_numbers).length,
      fetchWinner: () => rafflesApi.draw(id).then((result) => result.winner),
    });
    if (!drawn) return;
    await refresh({ resetForm: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const saveEdits = async (payload) => {
    await rafflesApi.update(id, payload);
    await refresh({ resetForm: true });
    toast('Alterações salvas.');
  };

  const deleteRaffle = run(async () => {
    const ok = await confirm({
      title: 'Excluir esta rifa?',
      text: 'A rifa, as fotos e as reservas serão apagadas. Isso não pode ser desfeito.',
      ok: 'Excluir rifa',
      danger: true,
    });
    if (!ok) return;
    await rafflesApi.remove(id);
    navigate('/painel');
  });

  return { approveOrder, cancelOrder, saveDrawDate, draw, saveEdits, deleteRaffle };
}
