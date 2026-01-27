# GymCore - Gym Management System

## Overview

GymCore is a full-stack gym management application built with React frontend and Express backend. It provides role-based dashboards for gym owners, trainers, and members to manage classes, bookings, and memberships. The system supports user authentication with session management and uses PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Server Pattern**: Single HTTP server serving both API and static files
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod schemas
- **Development**: Vite dev server integration with HMR support

### Authentication System
- **Strategy**: Passport.js with local username/password strategy
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: Scrypt hashing with random salt
- **Session Duration**: 30-day cookie expiration

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with migrations output to /migrations
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)

### Role-Based Access Control
Three user roles with different permissions:
- **Owner**: Full dashboard access, manage classes, view all members
- **Trainer**: View assigned schedule
- **Member**: View/book classes, manage personal bookings

### Shared Code Pattern
The `/shared` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas
- `routes.ts`: API route definitions with request/response types

### Build System
- **Development**: tsx for running TypeScript server directly
- **Production Build**: 
  - Frontend: Vite builds to dist/public
  - Backend: esbuild bundles server with selected dependencies
- **Database Sync**: `npm run db:push` for schema synchronization

## External Dependencies

### Database
- **PostgreSQL**: Primary database via DATABASE_URL environment variable
- **Session Store**: PostgreSQL table for session persistence (auto-created)

### Core Libraries
- **Drizzle ORM**: Database queries and schema management
- **Passport.js**: Authentication framework
- **Express Session**: Session middleware with PostgreSQL store

### UI Framework
- **Shadcn/ui**: Pre-built accessible components (new-york style)
- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (optional, has default)