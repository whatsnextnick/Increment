import { useState, FormEvent } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { useWeightEntries } from '../../hooks/useWeightEntries'
import { useProfile } from '../../hooks/useProfile'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeightPage() {
  const { entries, addEntry, refetch } = useWeightEntries()
  const { profile } = useProfile()
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await addEntry(parseFloat(weight), date, notes || undefined)

    if (error) {
      setMessage({ type: 'error', text: error })
    } else {
      setMessage({ type: 'success', text: 'Weight entry added!' })
      setWeight('')
      setNotes('')
      setDate(new Date().toISOString().split('T')[0])
      refetch()
    }

    setSaving(false)
  }

  const chartData = entries
    .slice()
    .reverse()
    .map(entry => ({
      date: new Date(entry.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight_kg,
    }))

  const latestWeight = entries[0]?.weight_kg
  const weightChange =
    entries.length >= 2 ? latestWeight - entries[entries.length - 1].weight_kg : 0

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Weight Tracker</h1>
          <p className="mt-1 text-sm text-surface-400">Monitor your body weight over time</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Log Weight Form */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Log Weight</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="75.5"
                  required
                />
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Morning weight, after breakfast..."
                    className="w-full rounded-btn bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-slate-100 placeholder:text-surface-400 focus:border-brand-500 outline-none transition-colors resize-none"
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-btn px-3 py-2 text-sm ${
                      message.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button type="submit" loading={saving} fullWidth>
                  Add Entry
                </Button>
              </form>

              {latestWeight && (
                <div className="mt-6 pt-6 border-t border-surface-700">
                  <p className="text-xs text-surface-400 uppercase tracking-wide">Current Weight</p>
                  <p className="mt-1 text-2xl font-bold text-slate-100">{latestWeight} kg</p>
                  {profile?.goal_weight_kg && (
                    <p className="mt-1 text-sm text-surface-400">
                      Goal: {profile.goal_weight_kg} kg
                      {weightChange !== 0 && (
                        <Badge
                          variant={weightChange > 0 ? 'success' : 'warning'}
                          className="ml-2"
                        >
                          {weightChange > 0 ? '+' : ''}
                          {weightChange.toFixed(1)} kg
                        </Badge>
                      )}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Progress Chart */}
          <div className="lg:col-span-2">
            {chartData.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<span className="text-4xl">⚖️</span>}
                  title="No weight entries yet"
                  description="Start tracking your weight to see your progress over time"
                />
              </Card>
            ) : (
              <Card>
                <h2 className="mb-4 text-lg font-semibold text-slate-100">Progress Chart</h2>
                <ResponsiveContainer width="100%" height={300}>
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
                    {profile?.goal_weight_kg && (
                      <Line
                        type="monotone"
                        dataKey={() => profile.goal_weight_kg}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        </div>

        {/* Weight History */}
        {entries.length > 0 && (
          <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-100">History</h2>
            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-btn bg-surface-900 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-200">{entry.weight_kg} kg</p>
                    <p className="text-xs text-surface-400">
                      {new Date(entry.recorded_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {entry.notes && (
                      <p className="mt-1 text-xs text-surface-400">{entry.notes}</p>
                    )}
                  </div>
                  <div className="text-xl">⚖️</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
