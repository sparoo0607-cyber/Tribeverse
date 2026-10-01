// Second password for the Event Control cockpit (on top of the admin login).
// The password lives in EVENT_CONTROL_PASSWORD; the cookie only stores a hash of it.
export const EVENT_LOCK_COOKIE = 'ec_unlock'

export async function eventLockToken(): Promise<string | null> {
  const password = process.env.EVENT_CONTROL_PASSWORD
  if (!password) return null
  const data = new TextEncoder().encode(`event-control:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
