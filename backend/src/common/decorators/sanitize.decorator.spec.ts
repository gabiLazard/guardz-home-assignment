import { plainToInstance } from 'class-transformer';
import { Sanitize } from './sanitize.decorator';

class TestDto {
  @Sanitize()
  text: string;

  @Sanitize()
  optional?: string;
}

describe('Sanitize Decorator', () => {
  it('should remove HTML tags from input', () => {
    const input = { text: '<script>alert("XSS")</script>Hello' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Hello');
    expect(result.text).not.toContain('<script>');
  });

  it('should remove all HTML tags and attributes', () => {
    const input = {
      text: '<div class="test" onclick="malicious()">Content</div>',
    };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Content');
    expect(result.text).not.toContain('<div>');
    expect(result.text).not.toContain('onclick');
  });

  it('should handle multiple HTML elements', () => {
    const input = { text: '<b>Bold</b> <i>Italic</i> <u>Underline</u>' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Bold Italic Underline');
  });

  it('should handle nested HTML tags', () => {
    const input = { text: '<div><p><span>Nested</span></p></div>' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Nested');
  });

  it('should remove dangerous script tags', () => {
    const input = { text: '<script src="evil.js"></script>Safe text' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Safe text');
    expect(result.text).not.toContain('script');
  });

  it('should remove iframe tags', () => {
    const input = { text: '<iframe src="malicious.com"></iframe>Content' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Content');
    expect(result.text).not.toContain('iframe');
  });

  it('should handle SQL injection attempts', () => {
    const input = { text: "'; DROP TABLE users; --" };
    const result = plainToInstance(TestDto, input);

    // Should pass through as-is since it's not HTML
    expect(result.text).toBe("'; DROP TABLE users; --");
  });

  it('should preserve plain text', () => {
    const input = { text: 'This is plain text without HTML' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('This is plain text without HTML');
  });

  it('should trim whitespace', () => {
    const input = { text: '  <b>Text</b>  ' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Text');
  });

  it('should handle empty string', () => {
    const input = { text: '' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('');
  });

  it('should handle string with only HTML tags', () => {
    const input = { text: '<div></div><span></span>' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('');
  });

  it('should handle event handlers in HTML', () => {
    const input = {
      text: '<button onclick="alert(\'XSS\')">Click me</button>',
    };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Click me');
    expect(result.text).not.toContain('onclick');
  });

  it('should handle javascript: protocol in attributes', () => {
    const input = { text: '<a href="javascript:alert(\'XSS\')">Link</a>' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Link');
    expect(result.text).not.toContain('javascript:');
  });

  it('should handle non-string values by returning them as-is', () => {
    const input = { text: 123 as unknown as string };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe(123);
  });

  it('should handle optional fields', () => {
    const input = { text: 'Required field' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Required field');
    expect(result.optional).toBeUndefined();
  });

  it('should sanitize optional fields when provided', () => {
    const input = {
      text: 'Required',
      optional: '<script>alert("XSS")</script>Optional',
    };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Required');
    expect(result.optional).toBe('Optional');
  });

  it('should handle encoded HTML entities', () => {
    const input = { text: '&lt;script&gt;alert("XSS")&lt;/script&gt;Text' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toContain('Text');
  });

  it('should handle CSS style attributes', () => {
    const input = {
      text: '<div style="background:url(javascript:alert(\'XSS\'))">Text</div>',
    };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Text');
    expect(result.text).not.toContain('style');
    expect(result.text).not.toContain('javascript');
  });

  it('should handle data attributes', () => {
    const input = { text: '<div data-value="test">Content</div>' };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Content');
    expect(result.text).not.toContain('data-value');
  });

  it('should handle SVG injection attempts', () => {
    const input = {
      text: '<svg onload="alert(\'XSS\')"><circle r="50"/></svg>Text',
    };
    const result = plainToInstance(TestDto, input);

    expect(result.text).toBe('Text');
    expect(result.text).not.toContain('svg');
    expect(result.text).not.toContain('onload');
  });
});
