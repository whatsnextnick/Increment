import { Link } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { useProfile } from '../../hooks/useProfile'
import { useWorkouts, useWorkoutStats } from '../../hooks/useWorkouts'
import { useWeightEntries, useLatestWeight } from '../../hooks/useWeightEntries'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { profile } = useProfile()
  const { stats, loading: statsLoading } = useWorkoutStats()
  const { workouts, loading: workoutsLoading } = useWorkouts(3)
  const { entries: weightEntries } = useWeightEntries(30)
  const { latestWeight } = useLatestWeight()

  const chartData = weightEntries
    .slice()
    .reverse()
    .map(entry => ({
      date: new Date(entry.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight_kg,
    }))

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}!
            </h1>
            <p className="mt-1 text-sm text-surface-400">
              {stats.thisWeekWorkouts > 0
                ? `You've logged ${stats.thisWeekWorkouts} workout${stats.thisWeekWorkouts !== 1 ? 's' : ''} this week 💪`
                : 'Ready to crush your goals?'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/workouts">
              <Button size="sm">Log Workout</Button>
            </Link>
            <Link to="/weight">
              <Button size="sm" variant="secondary">Log Weight</Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-l-4 border-l-brand-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Workouts This Week</p>
                <p className="mt-1 text-2xl font-bold text-slate-100">
                  {statsLoading ? '...' : stats.thisWeekWorkouts}
                </p>
              </div>
              <div className="text-3xl">🏋️</div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-accent-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Total Volume (kg)</p>
                <p className="mt-1 text-2xl font-bold text-slate-100">
                  {statsLoading ? '...' : stats.totalVolume.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Current Weight</p>
                <p className="mt-1 text-2xl font-bold text-slate-100">
                  {latestWeight ? `${latestWeight} kg` : '—'}
                </p>
                {profile?.goal_weight_kg && latestWeight && (
                  <p className="text-xs text-surface-400 mt-1">
                    Goal: {profile.goal_weight_kg} kg
                  </p>
                )}
              </div>
              <div className="text-3xl">⚖️</div>
            </div>
          </Card>
        </div>

        {/* Weight Trend Chart */}
        {chartData.length > 0 && (
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Weight Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#f1f5f9',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Recent Workouts */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Recent Workouts</h2>
            <Link to="/workouts" className="text-sm text-brand-400 hover:text-brand-300">
              View all →
            </Link>
          </div>

          {workoutsLoading ? (
            <p className="py-8 text-center text-sm text-surface-400">Loading...</p>
          ) : workouts.length === 0 ? (
            <EmptyState
              icon={<span className="text-3xl">🏋️</span>}
              title="No workouts yet"
              description="Start tracking your progress by logging your first workout"
              action={{ label: 'Log Workout', onClick: () => window.location.href = '/workouts' }}
            />
          ) : (
            <div className="space-y-3">
              {workouts.map(workout => (
                <Link
                  key={workout.id}
                  to={`/workouts/${workout.id}`}
                  className="block rounded-btn border border-surface-700 bg-surface-900 p-4 transition-colors hover:border-surface-600 hover:bg-surface-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-200">
                          {workout.name || 'Workout'}
                        </p>
                        <Badge variant="default">
                          {workout.workout_sets.length} {workout.workout_sets.length === 1 ? 'exercise' : 'exercises'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-surface-400">
                        {new Date(workout.started_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      {workout.workout_sets.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Array.from(new Set(workout.workout_sets.map((s: any) => s.exercises?.muscle_group)))
                            .filter(Boolean)
                            .map((group: any) => (
                              <span
                                key={group}
                                className="rounded-full bg-surface-700 px-2 py-0.5 text-xs text-surface-300"
                              >
                                {group}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Fitness Goal */}
        {profile?.fitness_goal && (
          <Card className="border-l-4 border-l-brand-500">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div className="flex-1">
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Your Goal</p>
                <p className="mt-1 text-sm text-slate-200">{profile.fitness_goal}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
