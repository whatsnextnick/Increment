import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { Exercise, MuscleGroup } from '../types/database'

export function useExercises(muscleGroup?: MuscleGroup) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExercises()
  }, [muscleGroup])

  async function fetchExercises() {
    try {
      setLoading(true)
      let query = supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (muscleGroup) {
        query = query.eq('muscle_group', muscleGroup)
      }

      const { data, error } = await query

      if (error) throw error
      setExercises(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { exercises, loading, error, refetch: fetchExercises }
}

export function useExerciseSearch(searchTerm: string) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setExercises([])
      return
    }

    const debounce = setTimeout(() => {
      searchExercises(searchTerm)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm])

  async function searchExercises(term: string) {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${term}%`)
        .order('name')
        .limit(10)

      setExercises(data || [])
    } catch (err) {
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  return { exercises, loading }
}
