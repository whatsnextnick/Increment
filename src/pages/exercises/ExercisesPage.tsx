import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { useExercises } from '../../hooks/useExercises'
import type { MuscleGroup } from '../../types/database'

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio']

export default function ExercisesPage() {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const { exercises, loading } = useExercises(selectedGroup)

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Exercise Library</h1>
          <p className="mt-1 text-sm text-surface-400">
            Browse {exercises.length} exercises
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div>
              <p className="mb-2 text-xs font-medium text-surface-400 uppercase tracking-wide">
                Muscle Group
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGroup(undefined)}
                  className={`rounded-btn px-3 py-1.5 text-sm font-medium transition-colors ${
                    !selectedGroup
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }`}
                >
                  All
                </button>
                {muscleGroups.map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`rounded-btn px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      selectedGroup === group
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Exercise Grid */}
        {loading ? (
          <Card>
            <p className="py-8 text-center text-sm text-surface-400">Loading exercises...</p>
          </Card>
        ) : filteredExercises.length === 0 ? (
          <Card>
            <p className="py-8 text-center text-sm text-surface-400">
              No exercises found matching your search
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredExercises.map(exercise => (
              <Card key={exercise.id} className="hover:border-surface-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-100">{exercise.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="brand" className="capitalize">
                        {exercise.muscle_group}
                      </Badge>
                      <Badge variant="default" className="capitalize">
                        {exercise.equipment}
                      </Badge>
                    </div>
                    {exercise.instructions && (
                      <p className="mt-3 text-xs text-surface-400 line-clamp-2">
                        {exercise.instructions}
                      </p>
                    )}
                    {exercise.secondary_muscles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-surface-500">
                          Also works: {exercise.secondary_muscles.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 text-2xl">
                    {exercise.muscle_group === 'chest' && '💪'}
                    {exercise.muscle_group === 'back' && '🏋️'}
                    {exercise.muscle_group === 'legs' && '🦵'}
                    {exercise.muscle_group === 'shoulders' && '🤸'}
                    {exercise.muscle_group === 'arms' && '💪'}
                    {exercise.muscle_group === 'core' && '🧘'}
                    {exercise.muscle_group === 'cardio' && '🏃'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
