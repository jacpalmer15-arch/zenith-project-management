# Zenith Field Service Management

A single-tenant field service quoting application MVP for managing customers, projects, and quotes.

## Overview

Zenith is a modern web application built to streamline field service operations. This MVP provides essential features for managing customers, creating projects, and generating professional quotes.

## Tech Stack

- **Framework:** Next.js 14.2+ (App Router)
- **Language:** TypeScript 5.4+ (strict mode)
- **UI Library:** React 18.3+
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Data Fetching:** TanStack Query (React Query) v5
- **Forms:** React Hook Form + Zod validation
- **Notifications:** Sonner
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Code Quality:** ESLint + Prettier

## Prerequisites

- Node.js 18+ or 20+ (recommended)
- npm 9+ or yarn
- Supabase account and project

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd zenith-project-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` with your Supabase credentials:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (found in Project Settings > API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key (found in Project Settings > API)

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key | Yes |

## Project Structure

```
zenith-project-management/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── providers.tsx      # Client-side providers (QueryClient, Toaster)
│   └── globals.css        # Global styles and Tailwind directives
├── components/            # React components
│   └── ui/               # shadcn/ui components (added as needed)
├── lib/                  # Utility functions and helpers
│   └── utils.ts          # Common utilities (cn function)
├── features/             # Feature-specific modules (future use)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── components.json       # shadcn/ui configuration
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── prettier.config.json  # Prettier configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Connecting to Supabase

This application uses Supabase for backend services including database, authentication, and storage. Follow these steps to connect your Supabase project.

### 1. Get your Supabase credentials

- Go to your Supabase project dashboard at [supabase.com](https://supabase.com)
- Navigate to **Settings > API**
- Copy the **Project URL** and **anon/public key**

### 2. Configure environment variables

- Copy `.env.example` to `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
- Add your Supabase URL and anon key to `.env.local`
- (Optional) Add service role key if needed for admin operations
  - **Warning:** Keep this key secret and never commit it to version control

### 3. Generate TypeScript types

After setting up your database schema, generate TypeScript types for type-safe database queries:

```bash
# Login to Supabase (uses npx to avoid global installation)
npx supabase login

# Generate types (replace YOUR_PROJECT_ID with your actual project ID)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

**Note:** Your project ID can be found in your Supabase project URL: `https://app.supabase.com/project/YOUR_PROJECT_ID`

### 4. Using the Supabase clients

The application provides three Supabase clients for different use cases:

#### Browser Client (Client Components)

Use in Client Components that run in the browser:

```typescript
// In a Client Component
'use client'
import { createClient } from '@/lib/supabase/browserClient'

export function MyComponent() {
  const supabase = createClient()
  // Use supabase client...
}
```

#### Server Client (Server Components)

Use in Server Components, Server Actions, and Route Handlers:

```typescript
// In a Server Component
import { createClient } from '@/lib/supabase/serverClient'

export default async function MyPage() {
  const supabase = await createClient()
  // Use supabase client...
}
```

#### Admin Client (Server-Side Only)

Use **only** for server-side operations that require service role access. Avoid using this unless absolutely necessary:

```typescript
// In a Server Action or Route Handler only
import { createAdminClient } from '@/lib/supabase/adminClient'

export async function myServerAction() {
  const supabase = createAdminClient()
  // Use admin client with caution...
}
```

**Important:** The admin client bypasses Row Level Security (RLS) policies. Use with extreme caution.

## Development Commands

- `npm run dev` - Start the development server at http://localhost:3000
- `npm run build` - Build the production application
- `npm run start` - Start the production server (after build)
- `npm run lint` - Run ESLint to check code quality

## Features (Current MVP)

✅ Next.js 14.2+ with App Router  
✅ TypeScript 5.4+ strict mode  
✅ Tailwind CSS with shadcn/ui theming  
✅ TanStack Query for data fetching  
✅ React Hook Form + Zod validation  
✅ Toast notifications with Sonner  
✅ ESLint + Prettier configuration  

## Next Steps

🔜 **PROMPT 2:** Supabase clients setup (browser + server)  
🔜 **PROMPT 3:** Authentication implementation  
🔜 **PROMPT 4:** App shell layout and navigation  
🔜 **PROMPT 5+:** Business features (customers, projects, quotes, etc.)  

## License

Private - All rights reserved