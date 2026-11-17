/** Link wa.me para um telefone (DDD + número; assume Brasil se não tiver DDI). */
export function whatsappLink(phone, text) {
  const number = phone.length <= 11 ? `55${phone}` : phone;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Link wa.me sem destinatário: a pessoa escolhe para quem enviar. */
export const whatsappShareLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;
