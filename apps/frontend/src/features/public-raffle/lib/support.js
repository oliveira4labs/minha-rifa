import { SUPPORT_EMAIL } from '../../../shared/lib/contact';

// E-mail para o suporte, já dizendo de qual rifa o comprador está falando
export function supportEmailLink(raffleTitle, pageUrl) {
  const subject = raffleTitle ? `Dúvida sobre a rifa "${raffleTitle}"` : 'Dúvida sobre o Minha Rifa';
  const body = [
    'Olá! Vim pelo Minha Rifa e fiquei com uma dúvida.',
    '',
    ...(raffleTitle ? [`Rifa: ${raffleTitle}`] : []),
    `Link: ${pageUrl}`,
    '',
    'Minha dúvida é: ',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
