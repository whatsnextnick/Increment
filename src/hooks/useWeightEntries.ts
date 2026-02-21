import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useSession } from '../context/SessionContext'
import type { WeightEntry } from '../types/database'

export function useWeightEntries(limit?: number) {
  const { session } = useSession()
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }
    fetchEntries()
  }, [session?.user?.id, limit])

  async function fetchEntries() {
    try {
      setLoading(true)
      let query = supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('recorded_at', { ascending: false })

      if (limit) query = query.limit(limit)

      const { data, error } = await query

      if (error) throw error
      setEntries(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function addEntry(weight_kg: number, recorded_at: string, notes?: string) {
    if (!session?.user?.id) return { error: 'Not authenticated' }

    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .insert({
          user_id: session.user.id,
          weight_kg,
          recorded_at,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) throw error
      await fetchEntries()
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  return { entries, loading, error, addEntry, refetch: fetchEntries }
}

export function useLatestWeight() {
  const { session } = useSession()
  const [latestWeight, setLatestWeight] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }
    fetchLatestWeight()
  }, [session?.user?.id])

  async function fetchLatestWeight() {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('weight_entries')
        .select('weight_kg')
        .eq('user_id', session!.user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()

      setLatestWeight(data?.weight_kg || null)
    } catch (err) {
      setLatestWeight(null)
    } finally {
      setLoading(false)
    }
  }

  return { latestWeight, loading, refetch: fetchLatestWeight }
}
