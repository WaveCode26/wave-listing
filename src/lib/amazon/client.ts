/**
 * SP-API HTTP client — NA endpoint (covers Amazon BR / A2Q3Y263D00KWC)
 */

import { getAccessToken } from './auth'

const SP_API_BASE = 'https://sellingpartnerapi-na.amazon.com'
export const MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID ?? 'A2Q3Y263D00KWC'

interface SpApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: Record<string, string | string[]>
  body?: unknown
}

export async function spApi<T = unknown>(path: string, options: SpApiOptions = {}): Promise<T> {
  const { method = 'GET', params, body } = options

  const url = new URL(`${SP_API_BASE}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v))
      } else {
        url.searchParams.set(key, value)
      }
    }
  }

  const accessToken = await getAccessToken()

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SP-API ${method} ${path} failed (${res.status}): ${text}`)
  }

  return res.json() as Promise<T>
}
