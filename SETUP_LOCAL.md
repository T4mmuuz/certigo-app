# Local Setup Guide - Service Marketplace App

## Prerequisites

Before you begin, make sure you have these installed on your computer:

1. **Node.js** (v20 or higher)
   - Download from https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v12 or higher)
   - Download from https://www.postgresql.org/download/
   - Or use a hosted option like:
     - [Supabase](https://supabase.com) (free tier available)
     - [Neon](https://neon.tech) (free tier available)
     - [Railway](https://railway.app) (free tier available)

3. **Git** (optional, but recommended)
   - Download from https://git-scm.com/

## Step 1: Download the Code from Replit

1. In Replit, click the **three dots menu (⋯)** in the top right
2. Select **"Download as ZIP"** (or similar export option)
3. Extract the ZIP file to a folder on your computer
4. Open a terminal/command prompt in that folder

## Step 2: Install Dependencies

Run this command in your project directory:

```bash
npm install
```

This installs all required packages from `package.json`. It may take 2-5 minutes.

## Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with:

```
DATABASE_URL=postgresql://username:password@localhost:5432/service_marketplace
SESSION_SECRET=your-random-secret-key-here-at-least-32-characters
```

**Replace these values:**
- `username` - Your PostgreSQL username (default: `postgres`)
- `password` - Your PostgreSQL password
- `localhost:5432` - If using hosted DB (Supabase, Neon), replace with their connection string
- `service_marketplace` - Database name (create this in PostgreSQL)

### Option A: Local PostgreSQL

If using PostgreSQL locally:

1. Open PostgreSQL (psql or pgAdmin)
2. Create a database:
   ```sql
   CREATE DATABASE service_marketplace;
   ```
3. Get your connection string:
   ```
   postgresql://postgres:your_password@localhost:5432/service_marketplace
   ```

### Option B: Hosted Database (Recommended for simplicity)

1. Go to [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a free account
3. Create a new database
4. Copy the connection string and paste into `.env`

## Step 4: Set Up the Database

Run this command to create tables:

```bash
npm run db:push
```

This uses Drizzle ORM to sync your database schema. You should see output like:
```
[✓] Pulling schema from database...
[✓] Applying migrations...
```

## Step 5: Start the App

Run the development server:

```bash
npm run dev
```

You should see output like:
```
Server running on http://localhost:5000
```

**Open in your browser:** http://localhost:5000

## Step 6: Test the App

1. **Sign Up** - Create a new account (choose "Customer" or "Provider" role)
2. **Log In** - Use your credentials
3. **Explore** - Browse services on the map, search by category
4. **Demo Account** - Use these pre-created accounts:
   - Username: `plumber_john`
   - Password: `password123`
   - (or) Username: `customer_jane` | Password: `password123`

## Project Structure

```
service-marketplace/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/            # Home, Auth, ServiceDetails, Bookings, Profile
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom data fetching hooks
│   │   ├── lib/              # Utilities (query client, API calls)
│   │   └── index.css         # Global styles
│   └── index.html
├── server/                    # Express Backend
│   ├── index.ts              # App setup & server start
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # Database layer
│   ├── db.ts                 # Database connection
│   └── vite.ts               # Vite dev server config
├── shared/                    # Shared Code
│   ├── schema.ts             # Database tables & types
│   └── routes.ts             # API contract
├── package.json              # Dependencies
├── drizzle.config.ts         # Database config
├── tailwind.config.ts        # Tailwind CSS config
├── vite.config.ts            # Vite build config
└── tsconfig.json             # TypeScript config
```

## Available Commands

```bash
npm run dev          # Start development server (frontend + backend)
npm run build        # Build for production
npm start            # Run production build
npm run db:push      # Sync database schema
npm run check        # TypeScript type checking
```

## Troubleshooting

### Error: "Cannot find module '@neondatabase/serverless'"
- Run: `npm install`
- If still failing: Delete `node_modules` folder and `package-lock.json`, then `npm install` again

### Error: "DATABASE_URL is not set"
- Check your `.env` file exists and has `DATABASE_URL` defined
- Make sure `.env` is in the root directory (same level as `package.json`)

### Error: "Port 5000 already in use"
- Another app is using port 5000
- Either: Close the other app, or change the port in `server/index.ts`

### Database Connection Failed
- Verify your PostgreSQL is running
- Check your connection string is correct (username, password, database name)
- If using hosted DB, make sure your IP is whitelisted

### "Cannot read property 'query' of undefined"
- Database connection issue. Make sure `.env` `DATABASE_URL` is correct

### Frontend not loading (white page)
- Wait 30 seconds for Vite to compile
- Check browser console (F12) for error messages
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Key Features

✅ **Authentication** - Sign up / Login with Passport.js  
✅ **Service Discovery** - Map view with service providers  
✅ **Search & Filter** - Find services by category or keyword  
✅ **Provider Profiles** - View ratings, reviews, and details  
✅ **Bookings** - Schedule appointments with deposit flow  
✅ **Reviews** - Leave ratings and comments  
✅ **Responsive Design** - Works on mobile and desktop  

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Express.js, Passport.js (auth), Drizzle ORM
- **Database**: PostgreSQL
- **Real-time**: Leaflet (maps), React Leaflet
- **Forms**: React Hook Form + Zod validation

## API Endpoints

All endpoints start with `/api/`:

### Authentication
- `POST /api/register` - Sign up new user
- `POST /api/login` - Log in
- `POST /api/logout` - Log out
- `GET /api/user` - Get current user (requires auth)

### Services
- `GET /api/services?category=plumbing&search=john` - List services
- `GET /api/services/:id` - Get service details with reviews
- `POST /api/services` - Create new service (requires auth, provider role)

### Bookings
- `POST /api/bookings` - Create booking (requires auth, customer role)
- `GET /api/bookings` - Get user's bookings (requires auth)

### Reviews
- `POST /api/reviews` - Create review (requires auth)

## Deploying to Production

To deploy this app:

1. **Use a hosting service**:
   - [Railway](https://railway.app)
   - [Render](https://render.com)
   - [Heroku](https://heroku.com)
   - [Vercel](https://vercel.com)

2. **Set environment variables** on the hosting platform:
   - `DATABASE_URL` - Production database URL
   - `SESSION_SECRET` - Strong random string (32+ chars)
   - `NODE_ENV` - Set to "production"

3. **Build command**: `npm run build`
4. **Start command**: `npm start`

## Getting Help

If you run into issues:

1. Check the terminal output for error messages
2. Look at the browser console (F12 → Console tab)
3. Verify `.env` file has correct values
4. Make sure PostgreSQL is running
5. Try deleting `node_modules` and running `npm install` again

## Next Steps

- Customize colors in `client/src/index.css`
- Add more service categories in `client/src/pages/Home.tsx`
- Implement real geolocation instead of mock location
- Add email notifications for bookings
- Integrate payment processing (Stripe, PayPal)
- Add messaging between customers and providers

Good luck! 🚀
