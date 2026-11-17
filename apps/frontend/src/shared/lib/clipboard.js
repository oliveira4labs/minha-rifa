export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // navegadores sem Clipboard API (ou fora de HTTPS)
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}
