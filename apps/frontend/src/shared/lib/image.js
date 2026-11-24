export const MAX_PHOTO_SIDE = 1600;
const JPEG_QUALITY = 0.85;
const MAX_ORIGINAL_MB = 30;

export function imageFileToDataUrl(file) {
  if (file.size > MAX_ORIGINAL_MB * 1024 * 1024) {
    return Promise.reject(new Error(`A foto "${file.name}" passa de ${MAX_ORIGINAL_MB} MB. Escolha uma foto menor.`));
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Não foi possível ler a foto "${file.name}". Use JPG, PNG ou WebP.`));
    };
    img.src = url;
  });
}
