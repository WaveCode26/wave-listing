/**
 * Amazon Login with Amazon (LWA) — OAuth 2.0 token manager
 * Caches access token in-process; auto-refreshes 60s before expiry.
 */

const LWA_URL = 'https://api.amazon.com/auth/o2/token'

interface TokenCache {
  accessToken: string
  expiresAt: number // ms since epoch
}

let cache: TokenCache | null = null

export async function getAccessToken(): Promise<string> {
  const now = Date.now()

  // Return cached token if still valid (with 60s buffer)
  if (cache && cache.expiresAt - 60_000 > now) {
    return cache.accessToken
  }

  const res = await fetch(LWA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.AMAZON_REFRESH_TOKEN!,
      client_id: process.env.AMAZON_CLIENT_ID!,
      client_secret: process.env.AMAZON_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LWA token refresh failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  cache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return cache.accessToken
}
