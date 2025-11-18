import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * Decorator to sanitize string inputs to prevent XSS attacks
 * Removes all HTML tags and dangerous content
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    // Remove all HTML tags and malicious content
    return sanitizeHtml(value, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {}, // No attributes allowed
      disallowedTagsMode: 'discard', // Discard tags instead of escaping
    }).trim();
  });
}
