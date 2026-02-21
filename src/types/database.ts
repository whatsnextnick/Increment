// Database types generated from Supabase schema

export type Role = 'admin' | 'member'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type Units = 'metric' | 'imperial'
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'
export type Equipment = 'barbell' | 'dumbbell' | 'bodyweight' | 'machine' | 'cable' | 'kettlebell' | 'other'

export interface Profile {
  id: string
  display_name: string | null
  height_cm: number | null
  weight_kg: number | null
  goal_weight_kg: number | null
  activity_level: ActivityLevel | null
  units: Units
  role: Role
  bio: string | null
  avatar_url: string | null
  fitness_goal: string | null
  experience_level: ExperienceLevel | null
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  muscle_group: MuscleGroup
  secondary_muscles: string[]
  equipment: Equipment
  instructions: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  name: string | null
  started_at: string
  notes: string | null
  created_at: string
}

export interface WorkoutSet {
  id: string
  workout_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  rpe: number | null
  notes: string | null
  created_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight_kg: number
  recorded_at: string
  notes: string | null
  created_at: string
}

export interface FitnessDocument {
  id: string
  title: string
  content: string
  content_chunk: string
  embedding: number[] | null
  metadata: Record<string, any>
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  message: string
  is_user: boolean
  context_used: string | null
  created_at: string
}
