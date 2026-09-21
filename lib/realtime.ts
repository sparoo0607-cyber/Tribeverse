// Supabase Realtime channel names must be unique per active subscription —
// reusing one across two components mounted at once throws "cannot add
// postgres_changes callbacks... after subscribe()". Every subscribeTo*
// helper should call this instead of hardcoding a name.
export function uniqueChannelName(base: string): string {
  return `${base}-${Math.random().toString(36).slice(2, 9)}`
}
