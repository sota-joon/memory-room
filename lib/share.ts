export async function copyText(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function shareUrl(title: string, url: string) {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;

  try {
    await navigator.share({ title, url });
    return true;
  } catch {
    return false;
  }
}
