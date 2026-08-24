import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculate } from '../src/services/calculatorApi'

type MockResponse = {
  ok: boolean
  text: () => Promise<string>
}

function jsonResponse(body: unknown, ok = true): MockResponse {
  return { ok, text: async () => JSON.stringify(body) }
}

function textResponse(body: string, ok = false): MockResponse {
  return { ok, text: async () => body }
}

describe('calculate (API mocks)', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the operation and operands as JSON', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: 15 }))

    await calculate('add', 10, 5)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/calculate'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'add', a: 10, b: 5 }),
      }),
    )
  })

  it('returns the parsed result on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: 2 }))

    await expect(calculate('divide', 10, 5)).resolves.toBe(2)
  })

  it('throws the message from a JSON error body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'division by zero' }, false))

    await expect(calculate('divide', 10, 0)).rejects.toThrow('division by zero')
  })

  it('throws the raw text when the backend returns a plain-text error', async () => {
    fetchMock.mockResolvedValueOnce(textResponse('division by zero'))

    await expect(calculate('divide', 10, 0)).rejects.toThrow('division by zero')
  })

  it('throws a clean error instead of a parse exception when a 200 response has an empty body', async () => {
    fetchMock.mockResolvedValueOnce(textResponse('', true))

    await expect(calculate('add', 1, 1)).rejects.toThrow('Empty response from server')
  })

  it('propagates network failures', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(calculate('add', 1, 1)).rejects.toThrow('Failed to fetch')
  })
})
