# Zenith Field Service Management

A single-tenant field service quoting application MVP for managing customers, projects, work orders, and quotes.

## Overview

Zenith is a modern web application built to streamline field service operations. This MVP provides comprehensive features for managing customers, work orders, scheduling, time tracking, quotes, parts inventory, and equipment - all while preparing for QuickBooks Desktop integration.

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
- **Testing:** Playwright (E2E)

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

5. **Run the database migrations:**
   - Import the schema from `Zenith Project Managemtn SQL.txt` into your Supabase project
   - Ensure all tables, indexes, and triggers are created

6. **Run the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Schema Reference

The complete database schema is documented in `Zenith Project Managemtn SQL.txt`. This file contains:
- All table definitions with relationships
- Enums for status types
- Indexes for performance optimization
- Triggers for automatic timestamp updates
- Foreign key constraints

Key tables include:
- **customers** - Customer information and contact details
- **locations** - Service locations linked to customers
- **work_orders** - Service work orders with status tracking
- **work_order_schedule** - Scheduling entries for work orders
- **work_order_time_entries** - Time tracking for technicians
- **quotes** - Quote management for projects and work orders
- **quote_lines** - Line items for quotes
- **parts** - Parts catalog and inventory tracking
- **inventory_ledger** - Parts receipt and issue tracking
- **equipment** - Equipment assets and assignments
- **equipment_usage** - Equipment usage logs
- **receipts** - Document receipts and allocations
- **cost_entries** - Cost tracking for work orders
- **projects** - Construction job projects
- **files** - File attachments for various entities
- **employees** - Employee/technician records
- **audit_logs** - System activity audit trail (new)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key | Yes |
| `QUICKBOOKS_CLIENT_ID` | QuickBooks App Client ID from Intuit Developer Portal | For QB Integration |
| `QUICKBOOKS_CLIENT_SECRET` | QuickBooks App Client Secret | For QB Integration |
| `QUICKBOOKS_REDIRECT_URI` | OAuth callback URL (e.g., https://yourapp.com/api/quickbooks/callback) | For QB Integration |
| `QUICKBOOKS_ENVIRONMENT` | QuickBooks environment: 'sandbox' or 'production' | For QB Integration |
| `QUICKBOOKS_ENCRYPTION_KEY` | 32-byte hex key for encrypting OAuth tokens (generate with: openssl rand -hex 32) | For QB Integration |
| `QUICKBOOKS_WEBHOOK_VERIFICATION_TOKEN` | Token for verifying webhook signatures from QuickBooks | For QB Webhooks |
| `CRON_SECRET` | Secret for authenticating cron job requests (generate with: openssl rand -hex 32) | For Scheduled Sync |

## QuickBooks Desktop Integration

Zenith supports integration with QuickBooks Desktop via OAuth 2.0 for customer synchronization and financial data management.

### Prerequisites

1. **QuickBooks Developer Account**: Sign up at [developer.intuit.com](https://developer.intuit.com)
2. **QuickBooks App**: Create a new app in the Intuit Developer Portal
3. **OAuth Credentials**: Get your Client ID and Client Secret from the app settings

### Setup Instructions

1. **Create a QuickBooks App**
   - Go to [developer.intuit.com](https://developer.intuit.com)
   - Create a new app and select "QuickBooks Desktop API" or "QuickBooks Online API" (both use OAuth 2.0)
   - Note your Client ID and Client Secret

2. **Configure OAuth Settings**
   - In your app settings, add redirect URI: `https://yourapp.com/api/quickbooks/callback`
   - For local development, also add: `http://localhost:3000/api/quickbooks/callback`

3. **Generate Encryption Key**
   ```bash
   openssl rand -hex 32
   ```
   Copy the output and add it to your `.env.local` file

4. **Update Environment Variables**
   ```bash
   QUICKBOOKS_CLIENT_ID=your_client_id_here
   QUICKBOOKS_CLIENT_SECRET=your_client_secret_here
   QUICKBOOKS_REDIRECT_URI=http://localhost:3000/api/quickbooks/callback
   QUICKBOOKS_ENVIRONMENT=sandbox
   QUICKBOOKS_ENCRYPTION_KEY=your_generated_32_byte_hex_key
   ```

5. **Run Database Migration**
   Execute the QuickBooks migration file in your Supabase project:
   ```sql
   -- Run migrations/002_add_quickbooks_tables.sql
   ```

6. **Connect QuickBooks**
   - Navigate to Settings in the Zenith application
   - Click "Connect QuickBooks" button
   - Complete OAuth flow with your QuickBooks credentials
   - Click "Sync Customers Now" to perform initial sync

### Features

**Phase 2A**:
- OAuth 2.0 connection flow
- Two-way customer synchronization
- Work order → QuickBooks subcustomer (Job) mapping
- Connection management UI

**Phase 2B (Implemented)**:
- Invoice creation from accepted quotes
- Bill creation from allocated receipts
- Payment webhook handling with signature verification
- Actual vs Estimated cost reports with QuickBooks data
- Background sync worker (runs daily at midnight UTC via cron)
- Manual sync triggers via API endpoints

### Webhook Setup

To receive real-time updates from QuickBooks:

1. **Generate Webhook Verification Token**:
   ```bash
   openssl rand -hex 32
   ```
   Add to `.env`:
   ```
   QUICKBOOKS_WEBHOOK_VERIFICATION_TOKEN=your_generated_token
   ```

2. **Configure Webhook in Intuit Developer Portal**:
   - Navigate to your app settings
   - Add webhook URL: `https://yourdomain.com/api/quickbooks/webhooks`
   - Use the verification token from step 1
   - Subscribe to events: Invoice, Payment, Bill, Customer

3. **Generate Cron Secret** (for scheduled sync):
   ```bash
   openssl rand -hex 32
   ```
   Add to `.env`:
   ```
   CRON_SECRET=your_cron_secret
   ```

### API Endpoints

**Manual Sync Triggers**:
- `POST /api/quickbooks/sync-invoices` - Sync accepted quotes to invoices
- `POST /api/quickbooks/sync-bills` - Sync allocated receipts to bills
- `POST /api/quickbooks/sync-all` - Run full sync worker

**Webhook Handler**:
- `POST /api/quickbooks/webhooks` - Receive QB webhook events (with signature verification)

**Scheduled Sync**:
- `GET /api/cron/quickbooks-sync` - Run sync worker (requires cron secret in Authorization header)

### Data Flow

1. **Invoice Creation**:
   - Quote status → "Accepted"
   - Automatic invoice creation in QuickBooks
   - Invoice ID stored in quote record
   - Payment status updates via webhooks

2. **Bill Creation**:
   - Receipt allocated to work order
   - Automatic bill creation in QuickBooks
   - Bill ID stored in receipt record
   - Job costing linked to work order

3. **Actual Cost Tracking**:
   - Sync worker snapshots costs from QB
   - Stored in `qb_actual_costs` table
   - Displayed in Work Order Profitability report
   - Shows variance between estimated and actual

### Security

- OAuth tokens are encrypted at rest using AES-256-GCM
- Encryption key is stored in environment variables (never committed to source control)
- Token refresh happens automatically before expiration
- All QuickBooks API calls are server-side only
- Webhook signatures are verified using HMAC-SHA256
- Cron endpoint requires bearer token authentication

### Troubleshooting

**Connection Issues:**
- Verify your Client ID and Client Secret are correct
- Ensure redirect URI matches exactly (including protocol and port)
- Check that the encryption key is exactly 64 hex characters (32 bytes)

**Sync Errors:**
- Check the sync error message in the QuickBooks Connection Card
- Review sync logs in the `qb_sync_logs` table
- Verify customer data is complete (name, email, etc.)

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

# Generate types for this project (zmyupmxabjbhnyoubcqp)
npx supabase gen types typescript --project-id zmyupmxabjbhnyoubcqp > lib/supabase/types.ts
```

**Note:** Your project ID can be found in your Supabase project URL: `https://app.supabase.com/project/YOUR_PROJECT_ID`  
**This project's ID:** `zmyupmxabjbhnyoubcqp`

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
- `npm run test:e2e` - Run Playwright E2E smoke tests (requires setup)

## Module Status (Pre-QuickBooks MVP)

This section tracks the implementation status of all major modules in the Zenith Field Service Management application.

### ✅ Completed Modules

- **Dashboard v2**: Enhanced dashboard with profit preview, completed work orders this week, unscheduled backlog, and top customers by quote total
- **Customers**: Full CRUD for customer management with validation
- **Locations**: Service location management linked to customers
- **Work Orders**: Work order creation, status tracking, and management
- **Schedule**: Work order scheduling with employee assignments
- **Time Tracking**: Time entry logging for employees and work orders
- **Quotes**: Quote creation with line items, tax rules, and status management
- **Jobs (Projects)**: Construction project management
- **Parts & Inventory**: Parts catalog with inventory ledger tracking (receipts/issues)
- **Equipment**: Equipment asset management and usage tracking
- **Receipts**: Document receipt upload and allocation to work orders
- **Cost Entries**: Cost tracking and allocation for work orders
- **Files**: File attachment management for various entities
- **Reports**: Comprehensive reporting module with 4 reports:
  - Work Order Profitability (estimated)
  - Tech Hours Summary
  - Parts Usage & Inventory On-Hand
  - Quotes Pipeline with conversion metrics
- **Settings**: Company settings, tax rules, user directory, and default labor rate
- **Audit Log**: System activity logging and viewer

### 🔒 Placeholder Modules (Coming Soon)

- **QuickBooks Integration**: Desktop integration for customer sync, invoicing, and actual cost tracking

### 🏗️ Architecture Features

- **Authentication**: Supabase Auth with middleware protection
- **Data Layer**: Organized server-side data functions in `lib/data/`
- **Validation**: Zod schemas for all forms in `lib/validations/`
- **UI Components**: Reusable shadcn/ui components with custom additions
- **Audit Logging**: Centralized audit trail for key business actions
- **CSV Export**: Reusable CSV export functionality for all reports
- **Pagination**: Reusable pagination component (ready for implementation)
- **Empty States**: Placeholder for list pages with no data
- **Confirmation Dialogs**: Reusable confirmation for destructive actions

## Features (Current MVP)

✅ Next.js 14.2+ with App Router  
✅ TypeScript 5.4+ strict mode  
✅ Tailwind CSS with shadcn/ui theming  
✅ TanStack Query for data fetching  
✅ React Hook Form + Zod validation  
✅ Toast notifications with Sonner  
✅ ESLint + Prettier configuration  
✅ Enhanced Dashboard v2 with financial metrics  
✅ Comprehensive reporting (4 reports)  
✅ Audit logging infrastructure  
✅ CSV export for all reports  
✅ QuickBooks placeholders  
✅ Playwright E2E testing setup  

## Next Steps

This MVP is **ready for QuickBooks Desktop integration**. The next phase of development should focus on:

1. **QuickBooks Desktop Integration**
   - Implement Web Connector for QuickBooks Desktop
   - Sync customers and sub-customers (work orders)
   - Sync invoices from accepted quotes
   - Sync bills and purchase orders
   - Sync time activities from time entries
   - Implement actual vs estimated cost reporting

2. **Row Level Security (RLS)**
   - Implement Supabase RLS policies for multi-tenant support
   - Add tenant isolation at the database level
   - Update authentication to include tenant context

3. **Enhanced UX**
   - Implement pagination for all list pages
   - Add debounced search across all modules
   - Implement loading states with skeleton loaders
   - Add empty states for all list pages
   - Add confirmation dialogs for all destructive actions

4. **Advanced Features**
   - Email notifications for quotes and work orders
   - Mobile-responsive time tracking
   - Advanced filtering and search
   - Bulk operations for common tasks
   - Custom report builder

5. **Performance Optimization**
   - Implement caching strategies
   - Optimize database queries with proper indexing
   - Add pagination to large datasets
   - Implement virtual scrolling for long lists

## Testing

### Smoke Tests

Basic smoke tests are available in `tests/smoke.spec.ts`. To run them:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npm run test:e2e
```

**Note**: Smoke tests require:
- A running development server
- Valid test user credentials in Supabase Auth
- Update TEST_EMAIL and TEST_PASSWORD in the test file

## License

Private - All rights reserved