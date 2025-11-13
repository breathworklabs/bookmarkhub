import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  stripHTML,
  sanitizeBookmarkContent,
} from '../../src/utils/sanitization'

describe('sanitization', () => {
  describe('sanitizeHTML', () => {
    describe('Basic HTML Sanitization', () => {
      it('should preserve safe HTML tags', () => {
        const html = '<p>Hello <strong>world</strong></p>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Hello <strong>world</strong></p>')
      })

      it('should preserve allowed formatting tags', () => {
        const html = '<p>Text with <em>emphasis</em> and <u>underline</u></p>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text with <em>emphasis</em> and <u>underline</u></p>')
      })

      it('should preserve links with safe attributes', () => {
        const html = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
        const result = sanitizeHTML(html)
        expect(result).toContain('href="https://example.com"')
        expect(result).toContain('>Link</a>')
      })

      it('should preserve headings', () => {
        const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>')
      })

      it('should preserve lists', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>')
      })

      it('should preserve blockquotes', () => {
        const html = '<blockquote>Quote text</blockquote>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<blockquote>Quote text</blockquote>')
      })

      it('should preserve code blocks', () => {
        const html = '<pre><code>const x = 1;</code></pre>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<pre><code>const x = 1;</code></pre>')
      })

      it('should preserve line breaks', () => {
        const html = 'Line 1<br>Line 2<br>Line 3'
        const result = sanitizeHTML(html)
        expect(result).toBe('Line 1<br>Line 2<br>Line 3')
      })
    })

    describe('XSS Attack Prevention', () => {
      it('should remove script tags', () => {
        const html = '<p>Safe text</p><script>alert("XSS")</script>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Safe text</p>')
        expect(result).not.toContain('<script>')
        expect(result).not.toContain('alert')
      })

      it('should remove inline event handlers', () => {
        const html = '<a href="#" onclick="alert(\'XSS\')">Click</a>'
        const result = sanitizeHTML(html)
        expect(result).not.toContain('onclick')
        expect(result).not.toContain('alert')
      })

      it('should remove javascript: protocol in links', () => {
        const html = '<a href="javascript:alert(\'XSS\')">Click</a>'
        const result = sanitizeHTML(html)
        expect(result).not.toContain('javascript:')
        expect(result).not.toContain('alert')
      })

      it('should remove onerror handlers', () => {
        const html = '<img src="x" onerror="alert(\'XSS\')">'
        const result = sanitizeHTML(html)
        expect(result).not.toContain('onerror')
        expect(result).not.toContain('alert')
        // img tag is not allowed in sanitizeHTML
        expect(result).not.toContain('<img')
      })

      it('should remove onload handlers', () => {
        const html = '<body onload="alert(\'XSS\')">Content</body>'
        const result = sanitizeHTML(html)
        expect(result).not.toContain('onload')
        expect(result).not.toContain('alert')
        expect(result).not.toContain('<body')
      })

      it('should remove onmouseover handlers', () => {
        const html = '<div onmouseover="alert(\'XSS\')">Hover me</div>'
        const result = sanitizeHTML(html)
        expect(result).not.toContain('onmouseover')
        expect(result).not.toContain('alert')
        // div is not allowed in sanitizeHTML
        expect(result).toBe('Hover me')
      })

      it('should remove style tags', () => {
        const html = '<p>Text</p><style>body{background:red}</style>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('<style>')
      })

      it('should remove iframe tags', () => {
        const html = '<p>Text</p><iframe src="evil.com"></iframe>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('<iframe>')
      })

      it('should remove object tags', () => {
        const html = '<p>Text</p><object data="evil.swf"></object>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('<object>')
      })

      it('should remove embed tags', () => {
        const html = '<p>Text</p><embed src="evil.swf">'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('<embed>')
      })

      it('should handle encoded XSS attempts', () => {
        const html = '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert()">Click</a>'
        const result = sanitizeHTML(html)
        // DOMPurify should decode and remove the javascript: protocol
        expect(result).not.toContain('javascript')
        expect(result).not.toContain('alert')
      })

      it('should prevent data URI XSS', () => {
        const html = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>'
        const result = sanitizeHTML(html)
        expect(result).not.toContain('data:')
        expect(result).not.toContain('<script>')
      })
    })

    describe('Data Attribute Handling', () => {
      it('should remove data attributes', () => {
        const html = '<p data-id="123" data-track="click">Text</p>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('data-id')
        expect(result).not.toContain('data-track')
      })
    })

    describe('Forbidden Tags Handling', () => {
      it('should remove disallowed tags but keep content', () => {
        const html = '<div>This is <span>important</span> text</div>'
        const result = sanitizeHTML(html)
        // div and span are not in ALLOWED_TAGS, but KEEP_CONTENT is true
        expect(result).toBe('This is important text')
      })

      it('should remove img tags', () => {
        const html = '<p>Text</p><img src="image.jpg" alt="Image">'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('<img')
      })

      it('should remove video tags', () => {
        const html = '<p>Text</p><video src="video.mp4"></video>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('<video>')
      })

      it('should remove form tags', () => {
        const html = '<form><input type="text"></form>'
        const result = sanitizeHTML(html)
        expect(result).toBe('')
        expect(result).not.toContain('<form>')
        expect(result).not.toContain('<input>')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        const result = sanitizeHTML('')
        expect(result).toBe('')
      })

      it('should handle plain text without HTML', () => {
        const text = 'Just plain text'
        const result = sanitizeHTML(text)
        expect(result).toBe('Just plain text')
      })

      it('should handle malformed HTML', () => {
        const html = '<p>Unclosed paragraph'
        const result = sanitizeHTML(html)
        expect(result).toContain('Unclosed paragraph')
      })

      it('should handle nested tags', () => {
        const html = '<p><strong><em>Nested</em></strong></p>'
        const result = sanitizeHTML(html)
        expect(result).toBe('<p><strong><em>Nested</em></strong></p>')
      })

      it('should handle special characters', () => {
        const html = '<p>&lt;script&gt;alert()&lt;/script&gt;</p>'
        const result = sanitizeHTML(html)
        expect(result).toContain('&lt;script&gt;')
      })
    })
  })

  describe('stripHTML', () => {
    describe('HTML Stripping', () => {
      it('should remove all HTML tags', () => {
        const html = '<p>Hello <strong>world</strong></p>'
        const result = stripHTML(html)
        expect(result).toBe('Hello world')
      })

      it('should keep text content', () => {
        const html = '<div><p>Paragraph 1</p><p>Paragraph 2</p></div>'
        const result = stripHTML(html)
        expect(result).toBe('Paragraph 1Paragraph 2')
      })

      it('should remove links but keep text', () => {
        const html = '<a href="https://example.com">Link text</a>'
        const result = stripHTML(html)
        expect(result).toBe('Link text')
        expect(result).not.toContain('href')
        expect(result).not.toContain('<a')
      })

      it('should remove all formatting', () => {
        const html = '<strong>Bold</strong> <em>Italic</em> <u>Underline</u>'
        const result = stripHTML(html)
        expect(result).toBe('Bold Italic Underline')
      })

      it('should remove headings but keep text', () => {
        const html = '<h1>Title</h1><h2>Subtitle</h2>'
        const result = stripHTML(html)
        expect(result).toBe('TitleSubtitle')
      })

      it('should remove lists but keep content', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
        const result = stripHTML(html)
        expect(result).toBe('Item 1Item 2')
      })

      it('should remove code blocks but keep code', () => {
        const html = '<pre><code>const x = 1;</code></pre>'
        const result = stripHTML(html)
        expect(result).toBe('const x = 1;')
      })
    })

    describe('Security', () => {
      it('should remove script tags and content', () => {
        const html = '<p>Safe</p><script>alert("XSS")</script><p>More safe</p>'
        const result = stripHTML(html)
        expect(result).toBe('SafeMore safe')
        expect(result).not.toContain('<script>')
        expect(result).not.toContain('alert')
      })

      it('should remove all event handlers', () => {
        const html = '<div onclick="alert()">Click me</div>'
        const result = stripHTML(html)
        expect(result).toBe('Click me')
        expect(result).not.toContain('onclick')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        const result = stripHTML('')
        expect(result).toBe('')
      })

      it('should handle plain text', () => {
        const text = 'Just plain text'
        const result = stripHTML(text)
        expect(result).toBe('Just plain text')
      })

      it('should handle HTML entities', () => {
        const html = '<p>&lt;html&gt;</p>'
        const result = stripHTML(html)
        expect(result).toContain('&lt;')
        expect(result).toContain('&gt;')
      })

      it('should handle nested structures', () => {
        const html = '<div><p><span><strong>Text</strong></span></p></div>'
        const result = stripHTML(html)
        expect(result).toBe('Text')
      })
    })
  })

  describe('sanitizeBookmarkContent', () => {
    describe('Permissive Sanitization', () => {
      it('should allow all basic formatting tags', () => {
        const html = '<p>Text with <strong>bold</strong>, <em>italic</em>, and <u>underline</u></p>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<p>Text with <strong>bold</strong>, <em>italic</em>, and <u>underline</u></p>')
      })

      it('should allow both strong and b tags', () => {
        const html = '<strong>Strong</strong> and <b>Bold</b>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<strong>Strong</strong> and <b>Bold</b>')
      })

      it('should allow both em and i tags', () => {
        const html = '<em>Emphasis</em> and <i>Italic</i>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<em>Emphasis</em> and <i>Italic</i>')
      })

      it('should allow img tags with safe attributes', () => {
        const html = '<img src="image.jpg" alt="Description" title="Title">'
        const result = sanitizeBookmarkContent(html)
        expect(result).toContain('<img')
        expect(result).toContain('src="image.jpg"')
        expect(result).toContain('alt="Description"')
      })

      it('should allow span tags', () => {
        const html = '<span class="highlight">Highlighted text</span>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toContain('<span')
        expect(result).toContain('class="highlight"')
      })

      it('should allow div tags', () => {
        const html = '<div class="container">Content</div>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toContain('<div')
        expect(result).toContain('class="container"')
      })

      it('should allow class attributes', () => {
        const html = '<p class="text-large">Styled text</p>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toContain('class="text-large"')
      })

      it('should allow links with target attribute', () => {
        const html = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toContain('href="https://example.com"')
        expect(result).toContain('target')
      })
    })

    describe('Security - Forbidden Tags', () => {
      it('should explicitly forbid script tags', () => {
        const html = '<p>Safe</p><script>alert("XSS")</script>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<p>Safe</p>')
        expect(result).not.toContain('<script>')
        expect(result).not.toContain('alert')
      })

      it('should explicitly forbid style tags', () => {
        const html = '<p>Text</p><style>body{background:red}</style>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<p>Text</p>')
        expect(result).not.toContain('<style>')
      })

      it('should explicitly forbid iframe tags', () => {
        const html = '<div>Content</div><iframe src="evil.com"></iframe>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<div>Content</div>')
        expect(result).not.toContain('<iframe>')
      })

      it('should explicitly forbid object tags', () => {
        const html = '<div>Content</div><object data="evil.swf"></object>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<div>Content</div>')
        expect(result).not.toContain('<object>')
      })

      it('should explicitly forbid embed tags', () => {
        const html = '<div>Content</div><embed src="evil.swf">'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<div>Content</div>')
        expect(result).not.toContain('<embed>')
      })
    })

    describe('Security - Forbidden Attributes', () => {
      it('should forbid onerror handlers', () => {
        const html = '<img src="x.jpg" onerror="alert(\'XSS\')">'
        const result = sanitizeBookmarkContent(html)
        expect(result).not.toContain('onerror')
        expect(result).not.toContain('alert')
      })

      it('should forbid onload handlers', () => {
        const html = '<img src="x.jpg" onload="alert(\'XSS\')">'
        const result = sanitizeBookmarkContent(html)
        expect(result).not.toContain('onload')
        expect(result).not.toContain('alert')
      })

      it('should forbid onclick handlers', () => {
        const html = '<div onclick="alert(\'XSS\')">Click</div>'
        const result = sanitizeBookmarkContent(html)
        expect(result).not.toContain('onclick')
        expect(result).not.toContain('alert')
      })

      it('should forbid onmouseover handlers', () => {
        const html = '<span onmouseover="alert(\'XSS\')">Hover</span>'
        const result = sanitizeBookmarkContent(html)
        expect(result).not.toContain('onmouseover')
        expect(result).not.toContain('alert')
      })

      it('should prevent data attributes', () => {
        const html = '<div data-id="123" data-evil="payload">Content</div>'
        const result = sanitizeBookmarkContent(html)
        expect(result).not.toContain('data-id')
        expect(result).not.toContain('data-evil')
      })
    })

    describe('Complex Content', () => {
      it('should handle rich bookmark content', () => {
        const html = `
          <div class="bookmark-content">
            <h2>Article Title</h2>
            <p>Introduction paragraph with <strong>bold</strong> text.</p>
            <img src="hero.jpg" alt="Hero image">
            <ul>
              <li>Point one</li>
              <li>Point two</li>
            </ul>
            <blockquote>Important quote</blockquote>
            <p>More content with <a href="https://example.com">a link</a>.</p>
          </div>
        `
        const result = sanitizeBookmarkContent(html)

        expect(result).toContain('<div')
        expect(result).toContain('<h2>')
        expect(result).toContain('<p>')
        expect(result).toContain('<strong>')
        expect(result).toContain('<img')
        expect(result).toContain('<ul>')
        expect(result).toContain('<li>')
        expect(result).toContain('<blockquote>')
        expect(result).toContain('<a href')
      })

      it('should handle Twitter/X content with images', () => {
        const html = `
          <div class="tweet-content">
            <p>Check out this amazing view!</p>
            <img src="https://pbs.twimg.com/media/abc123.jpg" alt="Photo">
            <span class="hashtag">#nature</span>
          </div>
        `
        const result = sanitizeBookmarkContent(html)

        expect(result).toContain('<div')
        expect(result).toContain('<p>')
        expect(result).toContain('<img')
        expect(result).toContain('src="https://pbs.twimg.com/media/abc123.jpg"')
        expect(result).toContain('<span')
      })

      it('should preserve nested formatting', () => {
        const html = '<div><p><span><strong><em>Deeply nested</em></strong></span></p></div>'
        const result = sanitizeBookmarkContent(html)
        expect(result).toBe('<div><p><span><strong><em>Deeply nested</em></strong></span></p></div>')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        const result = sanitizeBookmarkContent('')
        expect(result).toBe('')
      })

      it('should handle plain text', () => {
        const text = 'Just plain text'
        const result = sanitizeBookmarkContent(text)
        expect(result).toBe('Just plain text')
      })

      it('should handle malformed HTML', () => {
        const html = '<div><p>Unclosed tags'
        const result = sanitizeBookmarkContent(html)
        expect(result).toContain('Unclosed tags')
      })

      it('should handle mixed case tags', () => {
        const html = '<DIV><P>Mixed Case</P></DIV>'
        const result = sanitizeBookmarkContent(html)
        expect(result.toLowerCase()).toContain('mixed case')
      })
    })

    describe('XSS Attack Vectors', () => {
      it('should prevent SVG-based XSS', () => {
        const html = '<svg><script>alert("XSS")</script></svg>'
        const result = sanitizeBookmarkContent(html)
        expect(result).not.toContain('<script>')
        expect(result).not.toContain('alert')
      })

      it('should prevent CSS expression attacks', () => {
        const html = '<div style="background:expression(alert(\'XSS\'))">Text</div>'
        const result = sanitizeBookmarkContent(html)
        expect(result).not.toContain('expression')
        expect(result).not.toContain('alert')
      })

      it('should prevent base64 encoded XSS in src', () => {
        const html = '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">'
        const result = sanitizeBookmarkContent(html)
        // DOMPurify should handle this appropriately
        expect(result).not.toContain('<script>')
      })
    })
  })

  describe('Comparison of Sanitization Levels', () => {
    it('sanitizeHTML should be more restrictive than sanitizeBookmarkContent', () => {
      const html = '<div class="test"><img src="test.jpg"></div>'

      const strictResult = sanitizeHTML(html)
      const permissiveResult = sanitizeBookmarkContent(html)

      // sanitizeHTML removes div and img
      expect(strictResult).not.toContain('<div')
      expect(strictResult).not.toContain('<img')

      // sanitizeBookmarkContent allows div and img
      expect(permissiveResult).toContain('<div')
      expect(permissiveResult).toContain('<img')
    })

    it('stripHTML should remove all tags while others preserve structure', () => {
      const html = '<p><strong>Bold text</strong></p>'

      const sanitized = sanitizeHTML(html)
      const stripped = stripHTML(html)
      const bookmarkSanitized = sanitizeBookmarkContent(html)

      // sanitizeHTML and sanitizeBookmarkContent preserve tags
      expect(sanitized).toContain('<p>')
      expect(bookmarkSanitized).toContain('<p>')

      // stripHTML removes all tags
      expect(stripped).not.toContain('<')
      expect(stripped).toBe('Bold text')
    })

    it('all three should remove dangerous script tags', () => {
      const html = '<p>Safe</p><script>alert("XSS")</script>'

      const sanitized = sanitizeHTML(html)
      const stripped = stripHTML(html)
      const bookmarkSanitized = sanitizeBookmarkContent(html)

      expect(sanitized).not.toContain('<script>')
      expect(stripped).not.toContain('<script>')
      expect(bookmarkSanitized).not.toContain('<script>')

      expect(sanitized).not.toContain('alert')
      expect(stripped).not.toContain('alert')
      expect(bookmarkSanitized).not.toContain('alert')
    })
  })
})
