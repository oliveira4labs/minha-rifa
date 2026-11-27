import { useDocumentTitle } from '../shared/hooks/useDocumentTitle';
import { SUPPORT_EMAIL as CONTACT_EMAIL } from '../shared/lib/contact';
import { Topbar } from '../shared/ui/layout/Topbar';

const UPDATED_AT = '24 de novembro de 2026';

export function PrivacyPage() {
  useDocumentTitle('Política de Privacidade · Minha Rifa');

  return (
    <>
      <Topbar brandTo="/" />
      <main className="wrap narrow stack">
        <div className="stack-sm" style={{ marginTop: 12 }}>
          <h1>Política de Privacidade</h1>
          <p className="muted">Última atualização: {UPDATED_AT}</p>
        </div>

        <section className="card stack">
          <h2>Quem somos</h2>
          <p>
            O Minha Rifa é um site para criar rifas, compartilhar o link, reservar números, confirmar pagamentos e
            fazer o sorteio. Esta página explica quais dados guardamos e o que fazemos com eles.
          </p>
        </section>

        <section className="card stack">
          <h2>Quem cria rifas (login com Google)</h2>
          <p>
            Ao entrar com sua Conta do Google, recebemos apenas seu <strong>nome</strong>, seu <strong>e-mail</strong> e
            um identificador da conta. Não temos acesso à sua senha, contatos, arquivos ou qualquer outro dado do Google.
          </p>
          <p>
            Também guardamos o que você cadastra nas suas rifas: título, descrição, fotos, valor, chave Pix e WhatsApp
            de contato. A chave Pix e o WhatsApp aparecem para quem abre o link da rifa, para que possam pagar e falar
            com você. Rifas marcadas como privadas, e as fotos delas, só ficam visíveis para você.
          </p>
        </section>

        <section className="card stack">
          <h2>Quem reserva números</h2>
          <p>
            Para reservar números não é preciso criar conta. Pedimos <strong>nome</strong> e <strong>telefone</strong>,
            que ficam visíveis para quem criou a rifa, para que possa confirmar o pagamento e entrar em contato.
            Seu navegador também guarda esses dados e o código das suas reservas, para facilitar as próximas compras.
          </p>
        </section>

        <section className="card stack">
          <h2>Para que usamos os dados</h2>
          <p>
            Usamos os dados apenas para o funcionamento do site: identificar quem está logado, mostrar as rifas,
            registrar reservas e realizar o sorteio. Não vendemos, não alugamos e não compartilhamos seus dados com
            terceiros, e não usamos os dados para publicidade.
          </p>
        </section>

        <section className="card stack">
          <h2>Cookies</h2>
          <p>
            Usamos apenas cookies necessários para manter você logado e para concluir o login com o Google.
            Não usamos cookies de rastreamento ou de anúncios.
          </p>
        </section>

        <section className="card stack">
          <h2>Seus direitos e exclusão de dados</h2>
          <p>
            Você pode pedir a qualquer momento uma cópia, a correção ou a exclusão dos seus dados, conforme a Lei Geral
            de Proteção de Dados (LGPD). Basta escrever para{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <p>
            Você também pode remover o acesso do Minha Rifa à sua Conta do Google em{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
              myaccount.google.com/permissions
            </a>.
          </p>
        </section>

        <section className="card stack">
          <h2>Alterações</h2>
          <p>
            Se esta política mudar, a nova versão será publicada nesta página com a data de atualização.
          </p>
        </section>
      </main>
    </>
  );
}
