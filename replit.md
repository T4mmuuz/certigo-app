# CertiGo - Service Marketplace Platform

## Overview

CertiGo is a local service marketplace application that connects customers with certified professionals (plumbers, electricians, welders, etc.). The platform enables service discovery via interactive maps, booking appointments, processing payments through Stripe, and leaving reviews. It features a 15% platform commission model on all transactions.

## Recent Changes (December 2024)

### Profile Picture Upload
- Added custom profile picture upload using Replit Object Storage
- Users can upload images up to 5MB that are publicly accessible
- Uses presigned URL flow for direct uploads to Google Cloud Storage

### Referral Program
- Users can generate unique referral codes (format: CERTI{userId}{randomChars})
- $5 reward for each referred user who completes a booking
- Referral stats displayed on profile page (total referrals, earnings)

### Service Packages
- Providers can create bundled service packages at discounted rates
- Packages include multiple services with combined pricing
- API endpoints: GET/POST /api/service-packages

### Repeat Booking
- "Book Again" button on completed bookings for quick rebooking
- Automatically schedules for next day at 10 AM with same service

### Cancel Booking with Refund Policy
- Customers can cancel pending/accepted bookings (no refund)
- Provider cancellations result in full customer refund

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Maps**: Leaflet with react-leaflet for service location display
- **Build Tool**: Vite with React plugin

The frontend follows a pages-based structure with reusable components. Custom hooks (`use-auth`, `use-services`, `use-bookings`, `use-reviews`) abstract API interactions and provide clean interfaces for components.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod validation schemas
- **Authentication**: Passport.js with local strategy, express-session for session management
- **Session Storage**: PostgreSQL via connect-pg-simple

The server uses a storage abstraction layer (`server/storage.ts`) that implements the `IStorage` interface, allowing database operations to be centralized and potentially swappable.

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon serverless PostgreSQL driver with WebSocket support
- **Schema Location**: `shared/schema.ts` - defines users, services, bookings, reviews, and transactions tables
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Payment Processing
- **Provider**: Stripe integration via Replit's connector system
- **Features**: Stripe Checkout for deposits, webhook handling for payment confirmation
- **Commission**: 15% platform fee calculated on each transaction
- **Sync Library**: stripe-replit-sync for managed webhooks and schema

### Build System
- **Client**: Vite builds to `dist/public`
- **Server**: esbuild bundles server code to `dist/index.cjs`
- **Development**: tsx for TypeScript execution, Vite dev server with HMR

## External Dependencies

### Database
- **PostgreSQL**: Required for data persistence (Neon serverless compatible)
- **Environment Variable**: `DATABASE_URL` must be set

### Payment Processing
- **Stripe**: Connected via Replit's connector system
- **Credentials**: Managed automatically through `REPLIT_CONNECTORS_HOSTNAME` and identity tokens
- **Webhook**: Auto-configured managed webhook for payment events

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption (minimum 32 characters recommended)
- `REPLIT_DOMAINS`: Used for webhook URL configuration (auto-set in Replit)
- `REPL_IDENTITY` or `WEB_REPL_RENEWAL`: Replit authentication tokens (auto-set)

### Key NPM Packages
- `@neondatabase/serverless`: Serverless PostgreSQL driver
- `drizzle-orm` / `drizzle-kit`: Database ORM and migration tools
- `stripe`: Payment processing SDK
- `stripe-replit-sync`: Replit-specific Stripe integration helper
- `passport` / `passport-local`: Authentication framework
- `express-session` / `connect-pg-simple`: Session management
- `react-leaflet` / `leaflet`: Interactive map components
- `@tanstack/react-query`: Server state management
- `zod`: Runtime type validation for API contracts