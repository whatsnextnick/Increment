import { FormEvent, useState, useEffect } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useProfile } from '../../hooks/useProfile'
import { useSession } from '../../context/SessionContext'

export default function ProfilePage() {
  const { session } = useSession()
  const { profile, loading, updateProfile } = useProfile()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    fitness_goal: '',
    experience_level: '',
    height_cm: '',
    weight_kg: '',
    goal_weight_kg: '',
    activity_level: '',
    units: 'metric',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        fitness_goal: profile.fitness_goal || '',
        experience_level: profile.experience_level || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        goal_weight_kg: profile.goal_weight_kg?.toString() || '',
        activity_level: profile.activity_level || '',
        units: profile.units || 'metric',
      })
    }
  }, [profile])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const updates = {
      display_name: formData.display_name || null,
      bio: formData.bio || null,
      avatar_url: formData.avatar_url || null,
      fitness_goal: formData.fitness_goal || null,
      experience_level: formData.experience_level || null,
      height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      goal_weight_kg: formData.goal_weight_kg ? parseFloat(formData.goal_weight_kg) : null,
      activity_level: formData.activity_level || null,
      units: formData.units as 'metric' | 'imperial',
    }

    const { error } = await updateProfile(updates)

    if (error) {
      setMessage({ type: 'error', text: error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <p className="text-surface-400">Loading profile...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
            <p className="mt-1 text-sm text-surface-400">Manage your account settings</p>
          </div>
          {profile && (
            <Badge variant={profile.role === 'admin' ? 'accent' : 'brand'}>
              {profile.role === 'admin' ? '👑 Admin' : 'Member'}
            </Badge>
          )}
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-surface-700">
              <div className="h-16 w-16 rounded-full bg-surface-700 flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl text-surface-400">👤</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{session?.user.email}</p>
                <p className="text-xs text-surface-400">Joined {new Date(profile?.created_at || '').toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Display Name"
                value={formData.display_name}
                onChange={e => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Your name"
              />
              <Input
                label="Avatar URL"
                type="url"
                value={formData.avatar_url}
                onChange={e => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-slate-300">Bio</label>
              <textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="w-full rounded-btn bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-slate-100 placeholder:text-surface-400 focus:border-brand-500 outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="fitness_goal" className="mb-1.5 block text-sm font-medium text-slate-300">Fitness Goal</label>
              <textarea
                id="fitness_goal"
                rows={2}
                value={formData.fitness_goal}
                onChange={e => setFormData(prev => ({ ...prev, fitness_goal: e.target.value }))}
                placeholder="E.g., Build muscle, lose fat, train for marathon..."
                className="w-full rounded-btn bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-slate-100 placeholder:text-surface-400 focus:border-brand-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="experience_level" className="mb-1.5 block text-sm font-medium text-slate-300">Experience Level</label>
                <select
                  id="experience_level"
                  value={formData.experience_level}
                  onChange={e => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
                  className="h-10 w-full rounded-btn bg-surface-800 border border-surface-600 px-3 text-sm text-slate-100 focus:border-brand-500 outline-none transition-colors"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="activity_level" className="mb-1.5 block text-sm font-medium text-slate-300">Activity Level</label>
                <select
                  id="activity_level"
                  value={formData.activity_level}
                  onChange={e => setFormData(prev => ({ ...prev, activity_level: e.target.value }))}
                  className="h-10 w-full rounded-btn bg-surface-800 border border-surface-600 px-3 text-sm text-slate-100 focus:border-brand-500 outline-none transition-colors"
                >
                  <option value="">Select activity</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Very Active</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Height (cm)"
                type="number"
                step="0.1"
                value={formData.height_cm}
                onChange={e => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                placeholder="175"
              />
              <Input
                label="Current Weight (kg)"
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={e => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                placeholder="75"
              />
              <Input
                label="Goal Weight (kg)"
                type="number"
                step="0.1"
                value={formData.goal_weight_kg}
                onChange={e => setFormData(prev => ({ ...prev, goal_weight_kg: e.target.value }))}
                placeholder="80"
              />
            </div>

            {message && (
              <div
                className={`rounded-btn px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-surface-700">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  )
}
