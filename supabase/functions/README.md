# Supabase Edge Functions

This directory contains Edge Functions for the ForgeFit RAG chatbot system.

## Functions

### 1. `generate-embeddings`
Generates vector embeddings for text using OpenAI's `text-embedding-3-small` model.

**Endpoint:** `https://YOUR_PROJECT.supabase.co/functions/v1/generate-embeddings`

**Request:**
```json
{
  "text": "How do I improve my bench press?"
}
```

**Response:**
```json
{
  "embedding": [0.123, -0.456, ...]
}
```

### 2. `chat-completion`
Handles RAG (Retrieval Augmented Generation) for the fitness chatbot:
1. Generates embedding for user question
2. Searches knowledge base using pgvector
3. Calls OpenAI GPT-4 with retrieved context
4. Stores conversation in database

**Endpoint:** `https://YOUR_PROJECT.supabase.co/functions/v1/chat-completion`

**Request:**
```json
{
  "message": "How do I build muscle?",
  "user_id": "uuid-here"
}
```

**Response:**
```json
{
  "response": "To build muscle effectively...",
  "sources": "Muscle Building Guide, Progressive Overload Basics",
  "documents_used": 3
}
```

## Setup

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Set secrets
```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key-here
```

The following secrets are automatically available:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 5. Deploy functions
```bash
# Deploy both functions
supabase functions deploy generate-embeddings
supabase functions deploy chat-completion
```

### 6. Test locally (optional)
```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve generate-embeddings --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-embeddings' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"text":"test"}'
```

## Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key (set via `supabase secrets set`)

Automatically available:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

## Usage in Frontend

```typescript
import { supabase } from './supabase'

// Generate embedding
const { data } = await supabase.functions.invoke('generate-embeddings', {
  body: { text: 'How to deadlift?' }
})

// Chat with AI
const { data } = await supabase.functions.invoke('chat-completion', {
  body: {
    message: 'How do I build muscle?',
    user_id: session.user.id
  }
})
```

## Monitoring

View logs:
```bash
supabase functions logs generate-embeddings
supabase functions logs chat-completion
```

## Cost Considerations

- **OpenAI Embeddings**: ~$0.00002 per 1K tokens (text-embedding-3-small)
- **OpenAI Chat**: ~$0.15 per 1M input tokens + ~$0.60 per 1M output tokens (gpt-4o-mini)

For a typical chat interaction:
- Embedding: ~$0.00001
- Chat completion: ~$0.0001-0.0005
- **Total per message: ~$0.0001-0.001**
