import { Link } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { useWorkouts } from '../../hooks/useWorkouts'

export default function WorkoutsPage() {
  const { workouts, loading } = useWorkouts()

  const groupedWorkouts = workouts.reduce((acc, workout) => {
    const date = new Date(workout.started_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(workout)
    return acc
  }, {} as Record<string, typeof workouts>)

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Workouts</h1>
            <p className="mt-1 text-sm text-surface-400">
              {workouts.length} total workout{workouts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/workouts/new">
            <Button>Log Workout</Button>
          </Link>
        </div>

        {loading ? (
          <Card>
            <p className="py-8 text-center text-sm text-surface-400">Loading workouts...</p>
          </Card>
        ) : workouts.length === 0 ? (
          <Card>
            <EmptyState
              icon={<span className="text-4xl">🏋️</span>}
              title="No workouts yet"
              description="Start tracking your progress by logging your first workout"
              action={{
                label: 'Log First Workout',
                onClick: () => (window.location.href = '/workouts/new'),
              }}
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedWorkouts).map(([month, monthWorkouts]) => (
              <div key={month}>
                <h2 className="mb-3 text-sm font-semibold text-surface-400 uppercase tracking-wide">
                  {month}
                </h2>
                <div className="space-y-3">
                  {monthWorkouts.map(workout => {
                    const totalSets = workout.workout_sets.length
                    const uniqueExercises = new Set(workout.workout_sets.map((s: any) => s.exercise_id)).size
                    const totalVolume = workout.workout_sets.reduce(
                      (sum: number, set: any) => sum + (set.reps || 0) * (set.weight_kg || 0),
                      0
                    )

                    return (
                      <Link
                        key={workout.id}
                        to={`/workouts/${workout.id}`}
                        className="block"
                      >
                        <Card className="transition-all hover:border-surface-600 hover:shadow-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-100">
                                  {workout.name || 'Workout'}
                                </h3>
                                <Badge variant="default">{uniqueExercises} exercises</Badge>
                              </div>
                              <p className="mt-1 text-sm text-surface-400">
                                {new Date(workout.started_at).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                              <div className="mt-3 flex gap-4 text-xs text-surface-400">
                                <span>{totalSets} sets</span>
                                <span>•</span>
                                <span>{Math.round(totalVolume).toLocaleString()} kg volume</span>
                              </div>
                              {workout.workout_sets.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {Array.from(
                                    new Set(workout.workout_sets.map((s: any) => s.exercises?.muscle_group))
                                  )
                                    .filter(Boolean)
                                    .map((group: any) => (
                                      <span
                                        key={group}
                                        className="rounded-full bg-surface-700 px-2 py-0.5 text-xs text-surface-300 capitalize"
                                      >
                                        {group}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                            <div className="text-2xl">
                              {workout.workout_sets.some((s: any) => s.exercises?.muscle_group === 'chest')
                                ? '💪'
                                : workout.workout_sets.some((s: any) => s.exercises?.muscle_group === 'legs')
                                ? '🦵'
                                : '🏋️'}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
