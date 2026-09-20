/**
 * @module sanitize
 * @description Input sanitization utilities for security.
 * Prevents XSS and injection attacks by stripping dangerous characters from user input.
 */

/**
 * Sanitizes a user-provided search query by:
 * 1. Trimming whitespace
 * 2. Stripping HTML tags
 * 3. Removing control characters
 * 4. Limiting length to prevent ReDoS
 *
 * @param raw - The raw, unsanitized user input
 * @returns A safe string suitable for filtering/display
 */
export function sanitizeSearchQuery(raw: string): string {
  if (!raw) return '';

  return raw
    .trim()
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove control chars
    .substring(0, 200);                // Cap length to prevent abuse
}

/**
 * Escapes a string for safe insertion into HTML.
 * @param str - The string to escape
 * @returns HTML-safe string with entities escaped
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m] ?? m);
}

/**
 * Validates that a value is a finite number within an expected range.
 * @param value - The value to validate
 * @param min - Minimum acceptable value
 * @param max - Maximum acceptable value
 * @returns The clamped value, or `min` if invalid
 */
export function sanitizeNumber(value: unknown, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
