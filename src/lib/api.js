import { supabase } from './supabase'

// ─── AUTH ───────────────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  return profile
}

// ─── TIPS ───────────────────────────────────────────────────
export async function fetchTips(sport = null) {
  let query = supabase
    .from('tips')
    .select('*')
    .order('match_date', { ascending: false })

  if (sport && sport !== 'all') {
    query = query.eq('sport', sport)
  }

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data
}

export async function createTip(tipData) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('tips')
    .insert({ ...tipData, created_by: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTip(id, updates) {
  const { data, error } = await supabase
    .from('tips')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── SUBSCRIPTIONS ──────────────────────────────────────────
export async function submitSubscription({ planType, mobileNumber, transactionRef }) {
  const { data: { user } } = await supabase.auth.getUser()
  const prices = { weekly: 15000, monthly: 45000 }
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan_type: planType,
      price: prices[planType],
      currency: 'UGX',
      payment_status: 'pending',
      payment_method: 'mobile_money',
      mobile_number: mobileNumber,
      transaction_ref: transactionRef,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPendingSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, users:user_id(email, full_name)')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data
}

export async function activateSubscription(subId, userId, planType) {
  const { data: { user: admin } } = await supabase.auth.getUser()
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + (planType === 'weekly' ? 7 : 30))

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      payment_status: 'confirmed',
      start_date: now.toISOString(),
      end_date: end.toISOString(),
      activated_by: admin.id,
      activated_at: now.toISOString(),
    })
    .eq('id', subId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── STATS ──────────────────────────────────────────────────
export async function getStats() {
  const { data, error } = await supabase.rpc('get_performance_stats')
  if (error) { console.error(error); return null }
  return data?.[0]
}

export async function getLastTen() {
  const { data, error } = await supabase.rpc('get_last_n_performance', { n: 10 })
  if (error) { console.error(error); return [] }
  return data
}