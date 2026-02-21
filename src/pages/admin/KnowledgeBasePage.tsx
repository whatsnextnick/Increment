import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabase'
import { Navigate } from 'react-router-dom'

// Knowledge base documents (in a real app, these would be fetched from files)
const knowledgeDocs = [
  {
    title: 'Progressive Overload',
    category: 'Training',
    content: `Progressive overload is the gradual increase of stress placed upon the body during exercise training. It's the fundamental principle behind muscle growth and strength gains.

Methods of Progressive Overload:
1. Increase Weight: Add 2.5-5 lbs to your lifts when you can complete all prescribed sets and reps with good form.
2. Increase Reps: If you're doing 3 sets of 8 reps, work up to 3 sets of 12 before adding weight.
3. Increase Sets: Add an extra set to your exercises.
4. Increase Frequency: Train a muscle group an additional time per week.

Practical Application for beginners:
- Week 1: 135 lbs × 3 sets × 8 reps
- Week 2: 135 lbs × 3 sets × 10 reps
- Week 3: 135 lbs × 3 sets × 12 reps
- Week 4: 140 lbs × 3 sets × 8 reps

Important: Don't rush progression, listen to your body, deload periodically every 4-8 weeks, and track your workouts.`,
  },
  {
    title: 'Bench Press Form',
    category: 'Exercise Technique',
    content: `The bench press targets the chest, triceps, and front deltoids. Proper form is crucial for safety and effectiveness.

Setup:
- Lie on bench with eyes directly under the bar
- Grip slightly wider than shoulder-width
- Feet flat on floor, knees at 90 degrees
- Create small arch in lower back, shoulder blades pinched together

The Movement:
- Lower bar in controlled manner (2-3 seconds)
- Bar touches chest at nipple line
- Elbows at 45-degree angle, not flared to 90 degrees
- Drive bar up explosively
- Press back slightly toward rack

Common Mistakes:
- Bouncing bar off chest
- Flaring elbows to 90 degrees
- Lifting butt off bench
- Not using full range of motion
- Uneven bar path

Progression: Start with just the bar, add 5 lbs per week for beginners, use a spotter for heavy sets.`,
  },
  {
    title: 'Protein Intake',
    category: 'Nutrition',
    content: `For muscle building: 1.6-2.2 grams per kilogram of body weight per day (0.7-1g per pound).

Examples:
- 70 kg person: 112-154g protein/day
- 80 kg person: 128-176g protein/day
- 90 kg person: 144-198g protein/day

Protein Distribution: Spread intake throughout the day, aim for 4-5 meals with 25-40g protein each.

Best Protein Sources:
- Chicken breast: 31g per 100g
- Lean beef: 26g per 100g
- Eggs: 13g per 2 large eggs
- Greek yogurt: 10g per 100g
- Fish: 20-25g per 100g
- Whey protein: 20-25g per scoop

Timing: Post-workout consume 20-40g protein within 2 hours. Before bed, 30-40g slow-digesting protein can support overnight recovery.

More protein doesn't equal more muscle beyond ~2.2g/kg body weight.`,
  },
  {
    title: 'Recovery and Sleep',
    category: 'Recovery',
    content: `Sleep is when muscles grow. Training provides stimulus, but rest allows adaptation.

Optimal Sleep: 7-9 hours per night, athletes may need 8-10 hours.

Effects of Poor Sleep:
- Reduced muscle protein synthesis by 18%
- Increased cortisol
- Decreased testosterone and growth hormone
- Reduced performance
- Increased injury risk

Sleep Optimization:
- Consistent schedule
- Dark environment (blackout curtains)
- Cool temperature 65-68°F (18-20°C)
- No screens 1 hour before bed
- Avoid caffeine after 2 PM
- No large meals 2-3 hours before bed

Muscle Recovery: Groups need 48-72 hours to fully recover.

Active Recovery: Light walking, stretching, or easy cycling on rest days.

Deload Weeks: Every 4-8 weeks, reduce volume by 40-50% but maintain intensity.`,
  },
]

export default function KnowledgeBasePage() {
  const { profile } = useProfile()
  const [ingesting, setIngesting] = useState(false)
  const [progress, setProgress] = useState('')
  const [documentCount, setDocumentCount] = useState(0)

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  async function chunkText(text: string, chunkSize = 400): Promise<string[]> {
    const sentences = text.split(/[.!?]\s+/)
    const chunks: string[] = []
    let currentChunk = ''

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim())
    return chunks
  }

  async function ingestKnowledgeBase() {
    setIngesting(true)
    setProgress('Starting ingestion...')

    try {
      let totalChunks = 0

      for (const doc of knowledgeDocs) {
        setProgress(`Processing: ${doc.title}...`)

        // Chunk the document
        const chunks = await chunkText(doc.content)

        for (let i = 0; i < chunks.length; i++) {
          setProgress(`${doc.title} - Chunk ${i + 1}/${chunks.length}`)

          // Generate embedding
          const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
            'generate-embeddings',
            {
              body: { text: chunks[i] },
            }
          )

          if (embeddingError) throw embeddingError

          // Store in database
          const { error: insertError } = await supabase.from('fitness_documents').insert({
            title: doc.title,
            content: doc.content,
            content_chunk: chunks[i],
            embedding: embeddingData.embedding,
            metadata: {
              category: doc.category,
              chunk_index: i,
              total_chunks: chunks.length,
            },
          })

          if (insertError) throw insertError
          totalChunks++
        }
      }

      setDocumentCount(totalChunks)
      setProgress(`✅ Successfully ingested ${totalChunks} chunks from ${knowledgeDocs.length} documents!`)
    } catch (err: any) {
      setProgress(`❌ Error: ${err.message}`)
      console.error('Ingestion error:', err)
    } finally {
      setIngesting(false)
    }
  }

  async function clearKnowledgeBase() {
    if (!confirm('Are you sure you want to delete all knowledge base documents?')) return

    try {
      const { error } = await supabase.from('fitness_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error
      setProgress('✅ Knowledge base cleared')
      setDocumentCount(0)
    } catch (err: any) {
      setProgress(`❌ Error: ${err.message}`)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Knowledge Base Management</h1>
            <Badge variant="accent">Admin Only</Badge>
          </div>
          <p className="mt-1 text-sm text-surface-400">
            Ingest fitness knowledge documents for the RAG chatbot
          </p>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-400">Available Documents</span>
                <Badge variant="brand">{knowledgeDocs.length}</Badge>
              </div>
              {documentCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">Ingested Chunks</span>
                  <Badge variant="success">{documentCount}</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={ingestKnowledgeBase}
                loading={ingesting}
                disabled={ingesting}
                fullWidth
              >
                Ingest Knowledge Base
              </Button>
              <Button
                onClick={clearKnowledgeBase}
                variant="danger"
                disabled={ingesting}
                fullWidth
              >
                Clear Knowledge Base
              </Button>
            </div>
          </Card>

          {/* Progress */}
          {progress && (
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Progress</h2>
              <div className="rounded-btn bg-surface-900 p-4">
                <p className="text-sm font-mono text-slate-300">{progress}</p>
              </div>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Available Documents</h2>
            <div className="space-y-3">
              {knowledgeDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="rounded-btn bg-surface-900 p-4 border border-surface-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-200">{doc.title}</h3>
                      <Badge variant="default" className="mt-2">
                        {doc.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-surface-400">
                      ~{Math.ceil(doc.content.length / 400)} chunks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
