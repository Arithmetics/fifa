# FIFA

A full-stack TypeScript application with TanStack Router, Better Auth, and Prisma.

## Tech Stack

- **Frontend**: TanStack Router (client-side), TanStack Query, shadcn/ui, Tailwind CSS (dark mode by default)
- **Backend**: Node.js, Express, TypeScript, Prisma, Better Auth (Google OAuth only)
- **Database**: PostgreSQL
- **Deployment**: Vercel
- **Node Version Management**: asdf

## Getting Started

### Prerequisites

- Node.js (managed via asdf - see `.tool-versions`)
- PostgreSQL database
- Google OAuth credentials

### Setup

1. **Install asdf plugins and dependencies** (if not already installed):

   ```bash
   asdf plugin add nodejs
   asdf install
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   - Copy `env.example` to `.env` in the root directory
   - Fill in your database URL and Google OAuth credentials

4. **Set up the database**:

   ```bash
   cd api
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start development servers**:

   ```bash
   npm run dev
   ```

   This will start:

   - Frontend on `http://localhost:3000`
   - Backend API on `http://localhost:3001`

## Project Structure

```
fifa/
├── api/              # Backend API (Express + Prisma + Better Auth)
│   ├── prisma/       # Prisma schema and migrations
│   └── src/          # API source code
├── web/              # Frontend (TanStack Router + React Query)
│   └── src/          # Frontend source code
├── package.json      # Root package.json (monorepo)
└── vercel.json       # Vercel deployment configuration
```

## Authentication

- **Provider**: Google OAuth only (no email/password signup)
- **Required**: Users must set a display name after first sign-in
- **Implementation**: Better Auth with Prisma adapter

## Development

- **Frontend**: Uses Vite for development and building
- **Backend**: Uses tsx for development with TypeScript
- **Monorepo**: Managed with npm workspaces and Turborepo

## Deployment

The project is configured for Vercel deployment. See `vercel.json` for configuration.
