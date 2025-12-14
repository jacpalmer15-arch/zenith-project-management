'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { Settings, SettingsUpdate } from '@/lib/db'

/**
 * Get the application settings (should only be one row)
 */
export async function getSettings(): Promise<Settings> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to fetch settings: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Settings not found')
  }
  
  return data as Settings
}

/**
 * Update the application settings
 */
export async function updateSettings(
  id: string,
  updates: SettingsUpdate
): Promise<Settings> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('settings')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`)
  }
  
  if (!data) {
    throw new Error('Settings not found after update')
  }
  
  return data as Settings
}
