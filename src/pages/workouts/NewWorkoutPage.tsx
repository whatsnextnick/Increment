import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useSession } from '../../context/SessionContext'
import { useExerciseSearch } from '../../hooks/useExercises'
import { supabase } from '../../supabase'
import type { Exercise } from '../../types/database'

interface WorkoutExercise {
  exercise: Exercise
  sets: Array<{ reps: number; weight: number }>
}

export default function NewWorkoutPage() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [workoutName, setWorkoutName] = useState('')
  const [notes, setNotes] = useState('')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [saving, setSaving] = useState(false)
  const { exercises: searchResults } = useExerciseSearch(searchTerm)

  function addExercise(exercise: Exercise) {
    setWorkoutExercises(prev => [
      ...prev,
      { exercise, sets: [{ reps: 0, weight: 0 }] }
    ])
    setSearchTerm('')
    setShowSearch(false)
  }

  function removeExercise(index: number) {
    setWorkoutExercises(prev => prev.filter((_, i) => i !== index))
  }

  function addSet(exerciseIndex: number) {
    setWorkoutExercises(prev => {
      const updated = [...prev]
      const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1]
      updated[exerciseIndex].sets.push({ ...lastSet })
      return updated
    })
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setWorkoutExercises(prev => {
      const updated = [...prev]
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex)
      return updated
    })
  }

  function updateSet(exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) {
    setWorkoutExercises(prev => {
      const updated = [...prev]
      updated[exerciseIndex].sets[setIndex][field] = value
      return updated
    })
  }

  async function saveWorkout() {
    if (!session?.user?.id || workoutExercises.length === 0) return

    setSaving(true)
    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: session.user.id,
          name: workoutName || null,
          notes: notes || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Create workout sets
      const allSets = workoutExercises.flatMap(we =>
        we.sets.map((set, setIdx) => ({
          workout_id: workout.id,
          exercise_id: we.exercise.id,
          set_number: setIdx + 1,
          reps: set.reps,
          weight_kg: set.weight,
        }))
      )

      const { error: setsError } = await supabase
        .from('workout_sets')
        .insert(allSets)

      if (setsError) throw setsError

      navigate('/workouts')
    } catch (err: any) {
      alert('Error saving workout: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">New Workout</h1>
          <p className="mt-1 text-sm text-surface-400">Log your sets and track your progress</p>
        </div>

        <div className="space-y-4">
          {/* Workout Info */}
          <Card>
            <div className="space-y-4">
              <Input
                label="Workout Name (optional)"
                placeholder="e.g., Push Day, Leg Day"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How did it feel? Any observations?"
                  className="w-full rounded-btn bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-slate-100 placeholder:text-surface-400 focus:border-brand-500 outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Exercise List */}
          {workoutExercises.map((we, exerciseIdx) => (
            <Card key={exerciseIdx}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-100">{we.exercise.name}</h3>
                  <p className="text-xs text-surface-400 capitalize">{we.exercise.muscle_group}</p>
                </div>
                <button
                  onClick={() => removeExercise(exerciseIdx)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                {we.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-2">
                    <span className="w-16 text-sm text-surface-400">Set {setIdx + 1}</span>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ''}
                      onChange={e => updateSet(exerciseIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      className="h-10 w-24 rounded-btn bg-surface-800 border border-surface-600 px-3 text-sm text-slate-100 focus:border-brand-500 outline-none"
                    />
                    <span className="text-sm text-surface-400">×</span>
                    <input
                      type="number"
                      placeholder="Weight"
                      step="0.5"
                      value={set.weight || ''}
                      onChange={e => updateSet(exerciseIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      className="h-10 w-24 rounded-btn bg-surface-800 border border-surface-600 px-3 text-sm text-slate-100 focus:border-brand-500 outline-none"
                    />
                    <span className="text-sm text-surface-400">kg</span>
                    {we.sets.length > 1 && (
                      <button
                        onClick={() => removeSet(exerciseIdx, setIdx)}
                        className="ml-auto text-sm text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addSet(exerciseIdx)}
                  className="w-full"
                >
                  + Add Set
                </Button>
              </div>
            </Card>
          ))}

          {/* Add Exercise */}
          <Card>
            {!showSearch ? (
              <Button variant="secondary" onClick={() => setShowSearch(true)} fullWidth>
                + Add Exercise
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {searchResults.length > 0 && (
                  <div className="max-h-60 space-y-1 overflow-y-auto">
                    {searchResults.map(exercise => (
                      <button
                        key={exercise.id}
                        onClick={() => addExercise(exercise)}
                        className="w-full rounded-btn bg-surface-700 p-3 text-left transition-colors hover:bg-surface-600"
                      >
                        <p className="text-sm font-medium text-slate-200">{exercise.name}</p>
                        <p className="text-xs text-surface-400 capitalize">{exercise.muscle_group} • {exercise.equipment}</p>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="ghost" onClick={() => setShowSearch(false)} fullWidth size="sm">
                  Cancel
                </Button>
              </div>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/workouts')}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={saveWorkout}
              loading={saving}
              disabled={workoutExercises.length === 0}
              fullWidth
            >
              Save Workout
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
