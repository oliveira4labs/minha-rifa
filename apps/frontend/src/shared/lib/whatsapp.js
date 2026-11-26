// api.whatsapp.com/send em vez de wa.me: o redirecionamento do wa.me estraga emojis (vira "�") em alguns
// aparelhos, porque decodifica o texto duas vezes.
const SEND_URL = 'https://api.whatsapp.com/send';

export function whatsappLink(phone, text) {
  const number = phone.length <= 11 ? `55${phone}` : phone;
  return `${SEND_URL}?phone=${number}${text ? `&text=${encodeURIComponent(text)}` : ''}`;
}

export const whatsappShareLink = (text) => `${SEND_URL}?text=${encodeURIComponent(text)}`;
