'use client'

import { createClient } from '@/lib/supabase/client'

export async function addFavorite(maddeId: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Oturum yok') }
  const { error } = await supabase
    .from('favoriler')
    .insert({ user_id: user.id, madde_id: maddeId })
  return { error }
}

export async function removeFavorite(maddeId: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Oturum yok') }
  const { error } = await supabase
    .from('favoriler')
    .delete()
    .eq('user_id', user.id)
    .eq('madde_id', maddeId)
  return { error }
}

export async function isFavorite(maddeId: number): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('favoriler')
    .select('id')
    .eq('user_id', user.id)
    .eq('madde_id', maddeId)
    .maybeSingle()
  return !!data
}
