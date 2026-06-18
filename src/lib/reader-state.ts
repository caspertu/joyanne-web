const FONT_KEY = 'joyanne:fontSize';
const READ_KEY = 'joyanne:read';
const PROGRESS_KEY = 'joyanne:progress';

export function getFontSize(): number {
  if (typeof localStorage === 'undefined') return 18;
  const v = Number(localStorage.getItem(FONT_KEY));
  return v >= 16 && v <= 24 ? v : 18;
}

export function setFontSize(px: number): void {
  localStorage.setItem(FONT_KEY, String(Math.min(24, Math.max(16, px))));
}

export function isRead(slug: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const data = JSON.parse(localStorage.getItem(READ_KEY) ?? '{}');
    return Boolean(data[slug]);
  } catch {
    return false;
  }
}

export function markRead(slug: string): void {
  try {
    const data = JSON.parse(localStorage.getItem(READ_KEY) ?? '{}');
    data[slug] = true;
    localStorage.setItem(READ_KEY, JSON.stringify(data));
  } catch {
    localStorage.setItem(READ_KEY, JSON.stringify({ [slug]: true }));
  }
}

export function saveProgress(slug: string, ratio: number): void {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
    data[slug] = ratio;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ [slug]: ratio }));
  }
}

export function getProgress(slug: string): number {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
    return Number(data[slug]) || 0;
  } catch {
    return 0;
  }
}