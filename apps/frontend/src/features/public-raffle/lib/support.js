// Suporte do Minha Rifa (quem mantém o sistema, não o organizador da rifa)
export const SUPPORT_WHATSAPP = '34999188482';

// Mensagem que o comprador manda ao suporte, já dizendo de qual rifa está falando. *texto* = negrito no WhatsApp.
export function supportMessage(raffleTitle, pageUrl) {
  return [
    'Olá! 👋 Vim pelo *Minha Rifa* e fiquei com uma dúvida.',
    '',
    ...(raffleTitle ? [`🎟️ Rifa: *${raffleTitle}*`] : []),
    `🔗 ${pageUrl}`,
    '',
    'Minha dúvida é: ',
  ].join('\n');
}
