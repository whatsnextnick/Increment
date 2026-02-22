# ForgeFit 🏋️

A modern fitness tracking application with AI-powered coaching, built with React, Supabase, and OpenAI.

## Features

- 🔐 **Role-based Authentication** (Admin & Member roles)
- 👤 **User Profiles** with goals, measurements, and progress tracking
- 🏋️ **Workout Logging** with exercise library and set tracking
- ⚖️ **Weight Tracking** with progress visualization
- 🤖 **AI Fitness Coach** powered by RAG (Retrieval Augmented Generation)
- 📊 **Dashboard** with stats, charts, and recent activity
- 👑 **Admin Panel** for user management and knowledge base control
- 🎨 **Advanced UI Components** with animations and accessibility

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router 7** for routing
- **Tailwind CSS v4** for styling
- **Recharts** for data visualization

### Backend
- **Supabase** for database, authentication, and Edge Functions
- **PostgreSQL** with pgvector extension for semantic search
- **OpenAI API** for embeddings and chat completion
- **Deno** for Edge Functions runtime

### Advanced Components
- Toast notification system with portals
- Accessible modal dialogs
- Skeleton loaders
- Dropdown menus
- Animated numbers with intersection observer
- Progress indicators (circular & linear)
- Tabs with context API

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Increment

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions covering:
- Supabase project setup
- Database configuration
- Edge Functions deployment
- Frontend deployment (Netlify, Vercel, Cloudflare)
- Knowledge base ingestion

### Quick Deploy to Netlify

See [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) for Netlify-specific setup using the MCP server.

```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[NETLIFY_SETUP.md](./NETLIFY_SETUP.md)** - Netlify MCP server setup
- **[ADVANCED_COMPONENTS.md](./ADVANCED_COMPONENTS.md)** - UI components documentation

## Project Structure

```
Increment/
├── src/
│   ├── components/
│   │   ├── layout/          # AppShell, navigation
│   │   └── ui/              # Reusable UI components
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── auth/            # Sign in/up
│   │   ├── dashboard/       # Main dashboard
│   │   ├── workouts/        # Workout tracking
│   │   ├── weight/          # Weight tracking
│   │   ├── exercises/       # Exercise library
│   │   ├── chat/            # AI coach
│   │   ├── profile/         # User profile
│   │   └── admin/           # Admin panel
│   ├── router/              # Route configuration
│   ├── types/               # TypeScript definitions
│   └── supabase.ts          # Supabase client
├── supabase/
│   └── functions/           # Edge Functions
│       ├── generate-embeddings/
│       └── chat-completion/
├── knowledge_base/          # RAG documents
├── netlify.toml             # Netlify configuration
└── DEPLOYMENT.md            # Deployment guide
```

## Database Schema

- **profiles** - User profiles with roles, goals, measurements
- **exercises** - Exercise library with muscle groups
- **workouts** - Workout sessions
- **workout_sets** - Individual sets with reps/weight
- **weight_entries** - Weight tracking history
- **fitness_documents** - RAG knowledge base with embeddings
- **chat_history** - AI chat conversation history

## Key Features

### AI Fitness Coach

The chatbot uses Retrieval Augmented Generation (RAG):
1. User asks a question
2. Question is converted to embeddings via OpenAI
3. Similar documents retrieved from knowledge base using pgvector
4. Context + question sent to GPT-4
5. Response and sources displayed to user

### Admin Dashboard

Admins can:
- View user statistics (total, active, admins, members)
- See system stats (workouts, sets, volume, chat messages)
- Manage user roles (promote/demote)
- Ingest knowledge base documents for RAG
- Monitor system usage

### Workout Tracking

- Search exercises by name/muscle group
- Log sets with reps and weight
- Track volume (reps × weight)
- View workout history grouped by month
- See exercise details and instructions

### Progress Tracking

- Weight progress chart with goal visualization
- Workout stats (total workouts, weekly volume)
- Dashboard with quick stats and recent activity
- Animated numbers for engaging UI

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Authentication with Supabase Auth
- Secure Edge Functions
- Environment variable protection
- Input validation

## Performance

- Code splitting with React lazy loading
- Optimized images and assets
- CSS animations (GPU-accelerated)
- Skeleton loaders for perceived performance
- Intersection Observer for lazy animations
- Efficient database queries with indexes

## Accessibility

- ARIA attributes on all interactive elements
- Keyboard navigation support
- Focus management (modals, dropdowns)
- Screen reader friendly
- Semantic HTML
- Color contrast compliance (WCAG AA)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome)

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
- Review [ADVANCED_COMPONENTS.md](./ADVANCED_COMPONENTS.md) for component usage

## Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Supabase](https://supabase.com)
- AI by [OpenAI](https://openai.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Charts by [Recharts](https://recharts.org)

---

**ForgeFit** - Your AI-powered fitness companion 💪
