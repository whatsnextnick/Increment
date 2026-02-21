import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useSession } from '../context/SessionContext'
import type { Profile } from '../types/database'

export function useProfile() {
  const { session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    fetchProfile()
  }, [session?.user?.id])

  async function fetchProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session!.user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!session?.user?.id) return { error: 'Not authenticated' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}
