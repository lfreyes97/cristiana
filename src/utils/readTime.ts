/**
 * Read time utility.
 * Counts words in raw text and estimates reading time.
 */
export function getReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 230));
  return `${minutes} min`;
}
