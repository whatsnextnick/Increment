import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { supabase } from '../../supabase'
import { useSession } from '../../context/SessionContext'

interface WorkoutDetail {
  id: string
  name: string | null
  started_at: string
  notes: string | null
  workout_sets: Array<{
    id: string
    set_number: number
    reps: number
    weight_kg: number
    exercise_id: string
    exercises: {
      name: string
      muscle_group: string
      equipment: string
    }
  }>
}

export default function WorkoutDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchWorkout()
  }, [id])

  async function fetchWorkout() {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_sets (
            id,
            set_number,
            reps,
            weight_kg,
            exercise_id,
            exercises (name, muscle_group, equipment)
          )
        `)
        .eq('id', id!)
        .eq('user_id', session!.user.id)
        .single()

      if (error) throw error
      setWorkout(data)
    } catch (err) {
      console.error('Error fetching workout:', err)
      navigate('/workouts')
    } finally {
      setLoading(false)
    }
  }

  async function deleteWorkout() {
    if (!confirm('Are you sure you want to delete this workout?')) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id!)

      if (error) throw error
      navigate('/workouts')
    } catch (err: any) {
      alert('Error deleting workout: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <p className="text-surface-400">Loading workout...</p>
        </div>
      </AppShell>
    )
  }

  if (!workout) return null

  const groupedSets = workout.workout_sets.reduce((acc, set) => {
    const key = set.exercise_id
    if (!acc[key]) {
      acc[key] = {
        exercise: set.exercises,
        sets: [],
      }
    }
    acc[key].sets.push(set)
    return acc
  }, {} as Record<string, { exercise: any; sets: any[] }>)

  const totalVolume = workout.workout_sets.reduce(
    (sum, set) => sum + set.reps * set.weight_kg,
    0
  )

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link to="/workouts" className="text-sm text-brand-400 hover:text-brand-300">
            ← Back to workouts
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">
            {workout.name || 'Workout'}
          </h1>
          <p className="mt-1 text-sm text-surface-400">
            {new Date(workout.started_at).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card padding="sm">
            <p className="text-xs text-surface-400">Exercises</p>
            <p className="mt-1 text-xl font-bold text-slate-100">
              {Object.keys(groupedSets).length}
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-surface-400">Total Sets</p>
            <p className="mt-1 text-xl font-bold text-slate-100">
              {workout.workout_sets.length}
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-surface-400">Volume</p>
            <p className="mt-1 text-xl font-bold text-slate-100">
              {Math.round(totalVolume).toLocaleString()} kg
            </p>
          </Card>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {Object.values(groupedSets).map(({ exercise, sets }) => (
            <Card key={exercise.name}>
              <div className="mb-4">
                <h3 className="font-semibold text-slate-100">{exercise.name}</h3>
                <div className="mt-1 flex gap-2">
                  <Badge variant="default" className="capitalize">
                    {exercise.muscle_group}
                  </Badge>
                  <Badge variant="default" className="capitalize">
                    {exercise.equipment}
                  </Badge>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-700 text-left text-xs text-surface-400">
                      <th className="pb-2">SET</th>
                      <th className="pb-2">REPS</th>
                      <th className="pb-2">WEIGHT</th>
                      <th className="pb-2 text-right">VOLUME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sets
                      .sort((a, b) => a.set_number - b.set_number)
                      .map(set => (
                        <tr key={set.id} className="border-b border-surface-800 last:border-0">
                          <td className="py-2 text-surface-400">{set.set_number}</td>
                          <td className="py-2 text-slate-200">{set.reps}</td>
                          <td className="py-2 text-slate-200">{set.weight_kg} kg</td>
                          <td className="py-2 text-right text-surface-400">
                            {(set.reps * set.weight_kg).toFixed(1)} kg
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        {/* Notes */}
        {workout.notes && (
          <Card className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-surface-400">Notes</h3>
            <p className="text-sm text-slate-200">{workout.notes}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="danger" onClick={deleteWorkout} loading={deleting} fullWidth>
            Delete Workout
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
