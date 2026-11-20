import { supabase } from './supabase'

// One Supabase Realtime channel per party room. Everyone hears every message; presence shows who is in the room.
export function openRoom(code, key, meta, { onMessage, onPresence, onStatus }) {
  const ch = supabase.channel(`buzzer-room-${code}`, { config: { broadcast: { self: true }, presence: { key } } })
  ch.on('broadcast', { event: 'msg' }, ({ payload }) => onMessage(payload))
  ch.on('presence', { event: 'sync' }, () => onPresence(ch.presenceState()))
  ch.subscribe(async (status) => { onStatus(status); if (status === 'SUBSCRIBED') await ch.track(meta) })
  return { send: (payload) => ch.send({ type: 'broadcast', event: 'msg', payload }), close: () => supabase.removeChannel(ch) }
}
