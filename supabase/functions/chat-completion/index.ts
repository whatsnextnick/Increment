import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ChatRequest {
  message: string
  user_id: string
}

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const { message, user_id }: ChatRequest = await req.json()

    if (!message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'message and user_id required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Step 1: Generate embedding for the user's question
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding')
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // Step 2: Search for relevant fitness documents using pgvector
    const { data: documents, error: searchError } = await supabase.rpc(
      'match_fitness_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
      }
    )

    if (searchError) {
      console.error('Search error:', searchError)
    }

    // Step 3: Build context from retrieved documents
    const context = documents && documents.length > 0
      ? documents.map((doc: any) => doc.content_chunk).join('\n\n')
      : 'No relevant information found in the knowledge base.'

    const contextSources = documents && documents.length > 0
      ? documents.map((doc: any) => doc.title).join(', ')
      : null

    // Step 4: Call OpenAI Chat Completion with context
    const systemPrompt = `You are Increm AI, a knowledgeable and encouraging fitness coach. Your role is to provide helpful, evidence-based advice on exercise, training, and fitness.

Use the following context from the Increm knowledge base to answer the user's question. If the context doesn't contain relevant information, you can provide general fitness advice, but mention that it's not from the knowledge base.

Context:
${context}

Guidelines:
- Be encouraging and motivating
- Provide specific, actionable advice
- If asked about exercises, mention proper form and safety
- If the question is completely unrelated to fitness, politely redirect to fitness topics
- Keep responses concise but informative (2-4 paragraphs max)`

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!chatResponse.ok) {
      throw new Error('Failed to generate chat response')
    }

    const chatData = await chatResponse.json()
    const aiResponse = chatData.choices[0].message.content

    // Step 5: Store conversation in chat_history
    await supabase.from('chat_history').insert([
      { user_id, message, is_user: true, context_used: contextSources },
      { user_id, message: aiResponse, is_user: false, context_used: contextSources },
    ])

    return new Response(
      JSON.stringify({
        response: aiResponse,
        sources: contextSources,
        documents_used: documents?.length || 0,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error in chat completion:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
