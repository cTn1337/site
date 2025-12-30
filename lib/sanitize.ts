import sanitizeHtml from "sanitize-html";

export function cleanText(input: string) {
  return sanitizeHtml(input ?? "", { allowedTags: [], allowedAttributes: {} }).trim();
}
