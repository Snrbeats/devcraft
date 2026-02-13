import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true }
})

// ── Auth ──────────────────────────────────────────
export async function signUp({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

// ── Projects ──────────────────────────────────────
export async function getProjects(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Invoices ──────────────────────────────────────
export async function getInvoices(userId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Messages ──────────────────────────────────────
export async function getMessages(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function markMessageRead(messageId) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)
  if (error) throw error
}

// ── Bookings ──────────────────────────────────────
export async function createBooking({ userId, date, time, callType }) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ client_id: userId, date, time, call_type: callType }])
    .select()
    .single()
  if (error) throw error
  return data
}
