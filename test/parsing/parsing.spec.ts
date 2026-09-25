import { describe, expect, it } from 'vitest'
import { parseFloats, parseStrokeDasharray } from '../../src/utils/parsing.js'

describe('parseFloats', () => {
  it('returns an empty array when the input contains no numbers', () => {
    expect(parseFloats('')).toEqual([])
  })

  it('parses comma-, whitespace-, and sign-separated numbers', () => {
    expect(parseFloats('10, 20 30-40+50')).toEqual([10, 20, 30, -40, 50])
  })

  it('parses integers, decimal forms, and scientific notation', () => {
    expect(parseFloats('1.5 .25 2. 1e3 -2.5E-2 +4e+1')).toEqual([1.5, 0.25, 2, 1000, -0.025, 40])
  })

  it('has linear runtime complexity', { timeout: 100 }, () => {
    expect(parseFloats('1'.repeat(10000) + '!')).to.toHaveLength(1)
  })
})

describe('parseStrokeDasharray', () => {
  it('drops all-zero dash arrays that PDF rejects', () => {
    expect(parseStrokeDasharray('0 0')).toBeNull()
    expect(parseStrokeDasharray('0.00 0.00')).toBeNull()
    expect(parseStrokeDasharray('0,0,0')).toBeNull()
  })

  it('keeps non-zero dash arrays', () => {
    expect(parseStrokeDasharray('6,3')).toEqual([6, 3])
    expect(parseStrokeDasharray('0 4')).toEqual([0, 4])
  })

  it('returns an empty array when there are no numbers', () => {
    expect(parseStrokeDasharray('none')).toEqual([])
    expect(parseStrokeDasharray('')).toEqual([])
  })
})
