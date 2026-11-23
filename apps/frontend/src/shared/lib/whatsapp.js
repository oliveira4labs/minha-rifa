export function whatsappLink(phone, text) {
  const number = phone.length <= 11 ? `55${phone}` : phone;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export const whatsappShareLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;
