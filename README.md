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

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Copy your project credentials** from Project Settings > API:
   - Project URL
   - Anon/Public Key
3. **Add credentials to `.env.local`** (see Installation step 4)
4. **Configure Supabase** (in future prompts):
   - Set up database schema
   - Configure authentication providers
   - Set up storage buckets
   - Configure RLS policies

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