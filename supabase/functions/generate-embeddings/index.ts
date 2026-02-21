import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface EmbeddingRequest {
  text: string
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

    const { text }: EmbeddingRequest = await req.json()

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: text field required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI Embeddings API
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    const embedding = data.data[0].embedding

    return new Response(
      JSON.stringify({ embedding }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error generating embedding:', error)
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
