import { diff } from 'jest-diff'

const MAX_OUTPUT = 16384

function hex(byte: number): string {
  const value = byte.toString(16)
  return value.length === 1 ? `0${value}` : value
}

function display(byte: number): string {
  if (byte === 10 || byte === 13 || byte === 9) return String.fromCharCode(byte)
  return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ''
}

function ascii(bytes: Uint8Array): string {
  let result = ''
  for (let i = 0; i < bytes.length; i++) result += display(bytes[i])
  return result
}

export function equalBytes(expected: Uint8Array, actual: Uint8Array): number {
  const length = Math.min(expected.length, actual.length)
  for (let i = 0; i < length; i++) {
    if (expected[i] !== actual[i]) return i
  }
  return expected.length === actual.length ? -1 : length
}

export function pdfDiff(
  path: string,
  expected: Uint8Array | undefined,
  actual: Uint8Array
): string {
  const expectedBytes = expected ?? new Uint8Array(0)
  const offset = equalBytes(expectedBytes, actual)
  const expectedByte = expectedBytes[offset] ?? 0
  const actualByte = actual[offset] ?? 0
  let message = `PDF snapshot ${expected ? 'mismatch' : 'missing'}: ${path}\n`
  message += `Expected: ${expected ? expected.length.toLocaleString() : 'missing'} bytes\n`
  message += `Received: ${actual.length.toLocaleString()} bytes\n`
  if (expected) {
    message += `First differing byte: offset ${offset} (expected 0x${hex(expectedByte)} "${display(expectedByte)}", received 0x${hex(actualByte)} "${display(actualByte)}")\n`
  }
  message += '\n'
  if (expected) {
    message += diff(ascii(expectedBytes), ascii(actual), { expand: false }) ?? ''
  } else {
    message += `+ ${ascii(actual).slice(0, MAX_OUTPUT)}`
  }
  return message.length > MAX_OUTPUT
    ? `${message.slice(0, MAX_OUTPUT - 18)}\n...[truncated]`
    : message
}
