import { describe, expect, it } from 'vitest'
import { equalBytes, pdfDiff } from './pdf-diff.js'

describe('PDF diff', () => {
  it('compares binary bytes exactly', () => {
    expect(equalBytes(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(-1)
    expect(equalBytes(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(1)
    expect(equalBytes(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(1)
  })

  it('reports an ASCII diff and omits binary bytes', () => {
    const result = pdfDiff(
      'test/anchor.pdf',
      new Uint8Array([37, 80, 68, 70, 0, 255]),
      new Uint8Array([37, 80, 68, 70, 1, 255])
    )
    expect(result).toContain('test/anchor.pdf')
    expect(result).toContain('offset 4')
    expect(result).toContain('0x00')
    expect(result).toContain('0x01')
    expect(result).not.toContain('- %PDF')
    expect(result).not.toContain('+ %PDF')
    expect(result).not.toContain('\\x00')
    expect(result).not.toContain('\\xff')
    expect(result).not.toContain('[37,')
    expect(result.length).toBeLessThanOrEqual(16384)
  })

  it('shows a jest diff around changed PDF lines', () => {
    const expected = new TextEncoder().encode('header\nkeep one\nchanged old\nkeep two\nfooter')
    const actual = new TextEncoder().encode('header\nkeep one\nchanged new\nkeep two\nfooter')
    const result = pdfDiff('test/example.pdf', expected, actual)
    expect(result).toContain('  keep one')
    expect(result).toContain('- changed old')
    expect(result).toContain('+ changed new')
    expect(result).toContain('  keep two')
  })

  it('keeps insertions aligned like a jest diff', () => {
    const expected = new TextEncoder().encode('header\nkeep one\nkeep two\nfooter')
    const actual = new TextEncoder().encode('header\ninserted\nkeep one\nkeep two\nfooter')
    const result = pdfDiff('test/example.pdf', expected, actual)
    expect(result).toContain('+ inserted')
    expect(result).toContain('  keep one')
    expect(result).toContain('  keep two')
  })

  it('shows all changed ASCII lines', () => {
    const expected = new TextEncoder().encode(
      Array.from({ length: 12 }, (_, index) => `old ${index}`).join('\n')
    )
    const actual = new TextEncoder().encode(
      Array.from({ length: 12 }, (_, index) => `new ${index}`).join('\n')
    )
    const result = pdfDiff('test/example.pdf', expected, actual)

    for (let index = 0; index < 12; index++) {
      expect(result).toContain(`- old ${index}`)
      expect(result).toContain(`+ new ${index}`)
    }
  })

  it('shows distant changes', () => {
    const expectedLines = Array.from({ length: 20 }, (_, index) => `line ${index}`)
    const actualLines = [...expectedLines]
    actualLines[2] = 'changed near the start'
    actualLines[18] = 'changed near the end'
    const result = pdfDiff(
      'test/example.pdf',
      new TextEncoder().encode(expectedLines.join('\n')),
      new TextEncoder().encode(actualLines.join('\n'))
    )

    expect(result).toContain('- line 2')
    expect(result).toContain('+ changed near the start')
    expect(result).toContain('- line 18')
    expect(result).toContain('+ changed near the end')
    expect(result).toContain('  line 0')
    expect(result).toContain('  line 19')
  })

  it('shows changes with jest-diff context', () => {
    const expectedLines = Array.from({ length: 12 }, (_, index) => `line ${index}`)
    const actualLines = [...expectedLines]
    actualLines[2] = 'changed first'
    actualLines[8] = 'changed second'
    const result = pdfDiff(
      'test/example.pdf',
      new TextEncoder().encode(expectedLines.join('\n')),
      new TextEncoder().encode(actualLines.join('\n'))
    )

    expect(result).toContain('- line 2')
    expect(result).toContain('+ changed first')
    expect(result).toContain('- line 8')
    expect(result).toContain('+ changed second')
  })
})
