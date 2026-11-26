const SEND_URL = 'https://api.whatsapp.com/send';

export function whatsappLink(phone, text) {
  const number = phone.length <= 11 ? `55${phone}` : phone;
  return `${SEND_URL}?phone=${number}${text ? `&text=${encodeURIComponent(text)}` : ''}`;
}

export const whatsappShareLink = (text) => `${SEND_URL}?text=${encodeURIComponent(text)}`;
