# School OS 2.0 - The Intelligence Engine for Modern Education

A next-generation, high-performance unified platform seamlessly connecting administration, pedagogy, and parental engagement with a powerful developer-first architecture.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🗄️ Backend Setup (Supabase)

School OS 2.0 is designed to use **Supabase** (PostgreSQL) for its backend to enforce strict multi-tenant Row Level Security (RLS). 

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard and run the migration script located at:
   `supabase/migrations/00001_initial_schema.sql`
3. Create a `.env.local` file in the root of this project and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Start swapping out the mock data arrays in `lib/db/mock-data.ts` with real data fetches via `lib/supabase/client.ts`.

## 🌐 Deployment (Vercel)

The easiest way to deploy your Next.js app is to use the Vercel Platform:
1. Push your code to a GitHub repository.
2. Import the project into [Vercel](https://vercel.com/new).
3. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Vercel Environment Variables.
4. Deploy!

## Features 
- **Gamified Pedagogy:** Built-in Python sandbox labs and XP-based achievement engine.
- **Multi-Tenant Core:** Manage limitless institutional branches under a single roof.
- **Enterprise RBAC:** Zero-trust role-based access control for Admins, Teachers, Students, and Parents.
