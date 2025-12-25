/**
 * Safely converts unknown values into displayable strings.
 * 
 * Handles cases where text fields from upstream data sources can be:
 * - string
 * - null/undefined
 * - object (common with rich-text editors or JSON blobs)
 * - arrays, numbers, etc.
 * 
 * @param value - The value to convert to a string
 * @returns A trimmed string if the value can be meaningfully converted, or null
 */
export function safeString(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (value == null) return null;

  // Common cases: rich text objects or JSON blobs
  if (typeof value === "object") {
    try {
      // Prefer common patterns if you have them (optional)
      // e.g. { text: "..." } or { content: [{ text: "..." }] }
      // Fallback to JSON stringify for debuggability
      const json = JSON.stringify(value);
      return json && json !== "{}" ? json : null;
    } catch {
      return null;
    }
  }

  // Numbers/booleans: stringify (optional), or return null
  return String(value).trim() || null;
}

