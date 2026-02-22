# Increm Deployment Guide

This guide provides step-by-step instructions for deploying the Increm fitness tracking application with all its features including RAG chatbot, Edge Functions, and admin dashboard.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Configuration](#database-configuration)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Knowledge Base Ingestion](#knowledge-base-ingestion)
7. [Environment Variables](#environment-variables)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js** 18+ and npm/pnpm/bun
- **Supabase CLI** installed: `npm install -g supabase`
- **Supabase account** at [supabase.com](https://supabase.com)
- **OpenAI API key** for embeddings and chat completion
- **Git** for version control

---

## Supabase Project Setup

### 1. Create a New Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Project Name**: `forgefit` (or your preferred name)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
4. Wait for project to be provisioned (2-3 minutes)

### 2. Get Project Credentials

From your project dashboard:

1. Go to **Settings** → **API**
2. Note down:
   - **Project URL** (`https://your-project.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (for Edge Functions, starts with `eyJ...`)

3. Go to **Settings** → **Database**
4. Note down:
   - **Connection string** (for local development)

---

## Database Configuration

### 1. Connect to Your Project

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

Your project ref is the subdomain from your project URL: `https://[PROJECT_REF].supabase.co`

### 2. Run Migrations

The migrations are already created via the MCP server. To apply them manually or verify:

```bash
# List migrations
supabase db remote list

# If migrations not applied, run them in this order:
```

**Required migrations** (in order):

1. **Enable pgvector extension**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. **Extend profiles table**
```sql
ALTER TABLE profiles
  ADD COLUMN bio TEXT,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN fitness_goal TEXT,
  ADD COLUMN experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN height_cm DECIMAL,
  ADD COLUMN weight_kg DECIMAL,
  ADD COLUMN goal_weight_kg DECIMAL,
  ADD COLUMN activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active')),
  ADD COLUMN units TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

3. **Create exercises table**
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read exercises
CREATE POLICY "Anyone can read exercises" ON exercises
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete exercises
CREATE POLICY "Admins can modify exercises" ON exercises
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

4. **Create workouts table**
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all workouts
CREATE POLICY "Admins can view all workouts" ON workouts
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

5. **Create workout_sets table**
```sql
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  set_number INT NOT NULL,
  reps INT,
  weight_kg DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Users can manage sets for their own workouts
CREATE POLICY "Users can manage own workout sets" ON workout_sets
  FOR ALL TO authenticated
  USING (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  );

-- Admins can view all sets
CREATE POLICY "Admins can view all sets" ON workout_sets
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

6. **Create weight_entries table**
```sql
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Users can manage their own weight entries
CREATE POLICY "Users can manage own weight entries" ON weight_entries
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all weight entries
CREATE POLICY "Admins can view all entries" ON weight_entries
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

7. **Create fitness_documents table** (for RAG)
```sql
CREATE TABLE fitness_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_chunk TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fitness_documents ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read documents
CREATE POLICY "Anyone can read documents" ON fitness_documents
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete documents
CREATE POLICY "Admins can manage documents" ON fitness_documents
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index for vector similarity search
CREATE INDEX ON fitness_documents USING ivfflat (embedding vector_cosine_ops);
```

8. **Create chat_history table**
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  context_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their own chat history
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages" ON chat_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all chat history
CREATE POLICY "Admins can view all chat" ON chat_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

9. **Create similarity search function**
```sql
CREATE OR REPLACE FUNCTION match_fitness_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content_chunk text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fitness_documents.id,
    fitness_documents.title,
    fitness_documents.content_chunk,
    1 - (fitness_documents.embedding <=> query_embedding) AS similarity
  FROM fitness_documents
  WHERE 1 - (fitness_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY fitness_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 3. Seed Exercise Data (Optional)

You can add some initial exercises:

```sql
INSERT INTO exercises (name, muscle_group, equipment, instructions) VALUES
  ('Bench Press', 'Chest', 'Barbell', 'Lie on bench, lower bar to chest, press up'),
  ('Squat', 'Legs', 'Barbell', 'Bar on shoulders, squat down, drive up through heels'),
  ('Deadlift', 'Back', 'Barbell', 'Bend at hips, grip bar, drive through heels to stand'),
  ('Overhead Press', 'Shoulders', 'Barbell', 'Press bar from shoulders to overhead'),
  ('Barbell Row', 'Back', 'Barbell', 'Hinge at hips, row bar to lower chest'),
  ('Pull-up', 'Back', 'Bodyweight', 'Hang from bar, pull chin above bar'),
  ('Dumbbell Curl', 'Arms', 'Dumbbell', 'Curl dumbbells from sides to shoulders');
```

---

## Edge Functions Deployment

### 1. Set Up Supabase CLI

```bash
# Login to Supabase
supabase login

# Ensure you're linked to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Set Secrets

Edge Functions need your OpenAI API key:

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-openai-key-here
```

### 3. Deploy Edge Functions

```bash
# Deploy generate-embeddings function
supabase functions deploy generate-embeddings

# Deploy chat-completion function
supabase functions deploy chat-completion
```

Verify deployment:
```bash
supabase functions list
```

### 4. Test Edge Functions

```bash
# Test generate-embeddings
supabase functions invoke generate-embeddings \
  --body '{"text":"test embedding"}'

# Test chat-completion
supabase functions invoke chat-completion \
  --body '{"message":"What is progressive overload?","user_id":"YOUR_USER_ID"}'
```

---

## Frontend Deployment

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
bun install
```

### 2. Configure Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Build the Application

```bash
npm run build
```

This creates a `dist` folder with optimized static files.

### 4. Deploy to Hosting Platform

#### **Option A: Netlify (Recommended) ⭐**

**Using MCP Server (Easiest):**

The project includes Netlify MCP server integration. See [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) for detailed instructions.

1. Get your Netlify access token
2. Update `.mcp.json` with your token
3. Restart Claude Code
4. Ask Claude to deploy: "Deploy Increm to Netlify"

**Using Netlify CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Using Git Integration:**

1. Push code to GitHub/GitLab
2. Connect repository in Netlify dashboard
3. Configure build settings (already in `netlify.toml`)
4. Deploy automatically on every push

#### Option B: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Option C: Cloudflare Pages

```bash
# Install Wrangler CLI
npm install -g wrangler

# Deploy
wrangler pages deploy dist
```

### 5. Configure Authentication Redirects

In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `https://your-deployed-app.com`
- **Redirect URLs**: `https://your-deployed-app.com/**`

---

## Knowledge Base Ingestion

### 1. Create Admin User

First user signup is a member by default. To make them admin:

```sql
-- In Supabase SQL Editor
UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';
```

Or find user ID from dashboard:
1. Go to **Authentication** → **Users**
2. Copy user ID
3. Run the UPDATE query

### 2. Access Admin Dashboard

1. Sign in to your app
2. Navigate to `/admin`
3. You should see the Admin Dashboard

### 3. Ingest Knowledge Base

1. Go to `/admin/knowledge`
2. Click **Ingest Knowledge Base**
3. Wait for all documents to be processed (shows progress)
4. Verify success message

The system will:
- Chunk each document into ~400 character pieces
- Generate embeddings using OpenAI
- Store in `fitness_documents` table

### 4. Test the Chatbot

1. Navigate to `/chat`
2. Ask a question like "What is progressive overload?"
3. Verify the AI responds with context from knowledge base
4. Check "Sources" to see which documents were used

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | `eyJ...` |

### Edge Function Secrets

Set via Supabase CLI:

| Secret | Description |
|--------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings & chat | `sk-...` |

---

## Testing

### 1. Test User Authentication

- **Sign Up**: Create new account at `/auth/sign-up`
- **Sign In**: Login at `/auth/sign-in`
- **Sign Out**: Click sign out button in header
- **Protected Routes**: Try accessing `/dashboard` while logged out

### 2. Test Workout Logging

- Navigate to `/workouts`
- Click **Log New Workout**
- Search for exercises
- Add sets with reps/weight
- Save workout
- Verify it appears in workout list

### 3. Test Weight Tracking

- Navigate to `/weight`
- Add a weight entry
- Verify it appears in chart and history
- Add multiple entries to see trend

### 4. Test AI Chatbot

- Navigate to `/chat`
- Ask questions:
  - "How do I improve my bench press?"
  - "What is progressive overload?"
  - "How much protein do I need?"
- Verify responses include relevant context
- Check chat history persists on refresh

### 5. Test Admin Features

- Make a user admin (via SQL)
- Sign in as admin
- Navigate to `/admin`
- View user stats and system stats
- Test user role toggle
- Navigate to `/admin/knowledge`
- Test ingestion (clear and re-ingest)

### 6. Performance Testing

```bash
# Install Lighthouse
npm install -g lighthouse

# Test performance
lighthouse https://your-app.com --view
```

Target metrics:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

---

## Troubleshooting

### Issue: "Invalid API key" in Edge Functions

**Solution:**
```bash
# Re-set the secret
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Redeploy functions
supabase functions deploy generate-embeddings
supabase functions deploy chat-completion
```

### Issue: Database migrations not applying

**Solution:**
```bash
# Check remote migrations
supabase db remote list

# Reset and pull
supabase db reset
supabase db pull
```

### Issue: RLS policies blocking queries

**Solution:**
Check that user is authenticated and policies match:
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'workouts';

-- Test with specific user
SET request.jwt.claim.sub = 'user-id-here';
SELECT * FROM workouts;
```

### Issue: Embeddings generation slow

**Solution:**
- Reduce chunk count in knowledge base page
- Use smaller documents
- Batch requests with delays:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000))
```

### Issue: Build fails with module errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

### Issue: Authentication redirects not working

**Solution:**
1. Check Site URL in Supabase dashboard matches deployed URL
2. Add all redirect URLs
3. Check for CORS issues in browser console

### Issue: "Row Level Security" errors

**Solution:**
Ensure all tables have RLS policies:
```sql
-- Check which tables have RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Enable RLS if missing
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## Advanced Configuration

### Custom Domain

1. In your hosting provider, add custom domain
2. Update Supabase authentication URLs
3. Update CORS settings if needed

### Email Templates

Customize in Supabase Dashboard → **Authentication** → **Email Templates**

### Rate Limiting

Consider adding rate limiting for:
- Chat messages (e.g., 10 per minute)
- Weight entries (e.g., 1 per hour)
- Workout creation (e.g., 20 per day)

Use Supabase Edge Functions or middleware.

### Monitoring

Set up monitoring:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Supabase Logs**: Database queries and Edge Function logs

---

## Security Checklist

- [ ] All tables have RLS policies enabled
- [ ] Service role key never exposed to frontend
- [ ] OpenAI API key stored as secret (not in code)
- [ ] HTTPS enabled on deployed app
- [ ] Email confirmation enabled (or disabled intentionally)
- [ ] Admin users verified and limited
- [ ] CORS configured correctly
- [ ] Input validation on all forms
- [ ] SQL injection protection (parameterized queries)

---

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- OpenAI API docs: https://platform.openai.com/docs
- File issues on GitHub repository

---

## License

MIT License - see LICENSE file for details
