import { describe, it, expect } from 'vitest'
import { svg2pdf } from '../../src/svg2pdf'
import { StyleSheets } from '../../src/context/stylesheets'
import jsPDF from 'jspdf'
import { loadSvg } from '../utils/loadSvg'

describe('style-sheets', () => {
  it('splits selectors at commas outside quoted attribute values', () => {
    expect(
      StyleSheets.splitSelectorAtCommas(
        'rect, [data-value="one,two"], [data-value=\'three,four\'], circle'
      )
    ).toEqual(['rect', '[data-value="one,two"]', "[data-value='three,four']", 'circle'])
  })

  it('trims selectors and preserves commas in escaped quoted values', () => {
    expect(StyleSheets.splitSelectorAtCommas('  .first  , [title="a\\",b"], .last  ')).toEqual([
      '.first',
      '[title="a\\",b"]',
      '.last'
    ])
  })

  it('returns an empty selector for an empty string', () => {
    expect(StyleSheets.splitSelectorAtCommas('')).toEqual([])
    expect(StyleSheets.splitSelectorAtCommas('   ')).toEqual([])
  })

  it('preserves empty strings inside selectors', () => {
    expect(StyleSheets.splitSelectorAtCommas('[href=""], [target="_blank"]')).toEqual([
      '[href=""]',
      '[target="_blank"]'
    ])
  })

  it('keeps invalid selector fragments when splitting', () => {
    expect(StyleSheets.splitSelectorAtCommas('rect,,[invalid, .circle')).toEqual([
      'rect',
      '',
      '[invalid',
      '.circle'
    ])
    expect(StyleSheets.splitSelectorAtCommas('[title="unterminated, .last')).toEqual([])
  })

  it('style-sheets', async () => {
    const { svgElement, width, height } = await loadSvg('/test/style-sheets/style-sheets.svg')
    const pdf = new jsPDF(width > height ? 'l' : 'p', 'pt', [width, height])
    await svg2pdf(svgElement, pdf, { loadExternalStyleSheets: true })
    await expect(pdf.output('arraybuffer')).toMatchPdfSnapshot('./style-sheets.pdf')
  })
})
