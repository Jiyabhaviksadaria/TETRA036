/**
 * Parses the Content-Disposition header to extract the filename per RFC 6266 and RFC 5987.
 * Supports standard filename and UTF-8 encoded filename* parameters.
 */
export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;

  let filename: string | null = null;

  // 1. Try RFC 5987 filename* parameter
  const filenameStarRegex = /filename\*=(?:[A-Za-z0-9\-]+)'(?:[A-Za-z0-9\-]*?)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9\-_.!~*'()]*)+)/i;
  const starMatch = filenameStarRegex.exec(header);
  if (starMatch && starMatch[1]) {
    try {
      filename = decodeURIComponent(starMatch[1]);
    } catch (e) {
      console.warn("Failed to decode RFC 5987 filename* from header:", e);
    }
  }

  // 2. Try standard filename parameter if filename* wasn't found/decoded
  if (!filename) {
    const filenameRegex = /filename\s*=\s*(?:(['"])(.*?)\1|([^;\n]*))/i;
    const match = filenameRegex.exec(header);
    if (match) {
      filename = match[2] || match[3] || null;
      if (filename) {
        filename = filename.trim();
      }
    }
  }

  return filename;
}
