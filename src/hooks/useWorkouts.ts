import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useSession } from '../context/SessionContext'
import type { Workout } from '../types/database'

interface WorkoutWithSets extends Workout {
  workout_sets: Array<{
    id: string
    exercise_id: string
    set_number: number
    reps: number
    weight_kg: number
    exercises: {
      name: string
      muscle_group: string
    }
  }>
}

export function useWorkouts(limit?: number) {
  const { session } = useSession()
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }
    fetchWorkouts()
  }, [session?.user?.id, limit])

  async function fetchWorkouts() {
    try {
      setLoading(true)
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_sets (
            id,
            exercise_id,
            set_number,
            reps,
            weight_kg,
            exercises (name, muscle_group)
          )
        `)
        .eq('user_id', session!.user.id)
        .order('started_at', { ascending: false })

      if (limit) query = query.limit(limit)

      const { data, error } = await query

      if (error) throw error
      setWorkouts(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { workouts, loading, error, refetch: fetchWorkouts }
}

export function useWorkoutStats() {
  const { session } = useSession()
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    totalVolume: 0,
    thisWeekVolume: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }
    fetchStats()
  }, [session?.user?.id])

  async function fetchStats() {
    try {
      setLoading(true)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session!.user.id)

      // Get this week's workouts
      const { count: thisWeekWorkouts } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session!.user.id)
        .gte('started_at', oneWeekAgo.toISOString())

      // Get all sets to calculate volume
      const { data: allSets } = await supabase
        .from('workout_sets')
        .select('reps, weight_kg, workouts!inner(user_id, started_at)')
        .eq('workouts.user_id', session!.user.id)

      const totalVolume = (allSets || []).reduce(
        (sum, set) => sum + (set.reps || 0) * (set.weight_kg || 0),
        0
      )

      const thisWeekVolume = (allSets || [])
        .filter((set: any) => new Date(set.workouts.started_at) >= oneWeekAgo)
        .reduce((sum, set) => sum + (set.reps || 0) * (set.weight_kg || 0), 0)

      setStats({
        totalWorkouts: totalWorkouts || 0,
        thisWeekWorkouts: thisWeekWorkouts || 0,
        totalVolume: Math.round(totalVolume),
        thisWeekVolume: Math.round(thisWeekVolume),
      })
    } catch (err) {
      console.error('Error fetching workout stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, refetch: fetchStats }
}
