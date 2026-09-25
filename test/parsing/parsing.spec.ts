import { describe, expect, it } from 'vitest'
import { parseFloats, isEffectivelySolidDashArray } from '../../src/utils/parsing.js'

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

describe('isEffectivelySolidDashArray', () => {
  it('treats all-zero patterns as solid', () => {
    expect(isEffectivelySolidDashArray([0, 0])).toBe(true)
    expect(isEffectivelySolidDashArray([0.0, 0.0])).toBe(true)
    expect(isEffectivelySolidDashArray([0])).toBe(true)
  })

  it('keeps real dash patterns', () => {
    expect(isEffectivelySolidDashArray([6, 3])).toBe(false)
    expect(isEffectivelySolidDashArray([0, 2])).toBe(false)
    expect(isEffectivelySolidDashArray([])).toBe(false)
  })
})
