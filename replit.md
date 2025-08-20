# Overview

Replivo is a modern web application for discovering and hiring AI agents for business automation. The platform allows users to browse pre-built agent bundles, explore individual sub-agents in a marketplace, and request custom agent solutions. Built with a focus on professional UX/UI design, the application provides an intuitive interface for businesses to automate their workflows through intelligent AI agents.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React using Vite as the build tool and bundler. The application uses a file-based routing system with Wouter for lightweight client-side navigation. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing a consistent and accessible design system. Framer Motion handles animations and transitions throughout the interface. TanStack Query manages server state and API interactions with built-in caching and synchronization.

## Backend Architecture
The server is built with Express.js running on Node.js with TypeScript for type safety. The application follows a RESTful API design pattern with routes organized in a modular structure. The server handles static file serving in production and integrates with Vite's development server in development mode for hot module replacement. Middleware is implemented for request logging, JSON parsing, and error handling.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations and migrations. The schema defines four main entities: agents (bundle packages), sub-agents (individual AI agents), custom requests (user-generated requirements), and users. For development and testing purposes, an in-memory storage implementation provides sample data without requiring database setup. The database connection utilizes Neon's serverless PostgreSQL service for scalability.

## Authentication and Authorization
The codebase includes user authentication infrastructure with username/password-based login. Session management is handled through connect-pg-simple for PostgreSQL-backed sessions. The authentication system is prepared for future implementation but currently uses sample data for development purposes.

## Styling and Design System
The application uses Tailwind CSS as the utility-first CSS framework with a custom design system configuration. CSS custom properties define a comprehensive color palette supporting both light and dark themes. Typography uses Inter font family for modern readability. The component library follows the shadcn/ui architecture pattern with Radix UI primitives as the foundation, ensuring accessibility compliance and consistent behavior across components.

## Development Workflow
The project uses TypeScript across both client and server code for type safety and better developer experience. ESBuild handles server-side bundling for production builds while Vite manages client-side bundling and development server. Path aliases simplify imports with @ for client code and @shared for shared utilities and schemas.

# External Dependencies

## Database and ORM
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migration and schema management tools

## Frontend Libraries
- **React**: Core UI library with hooks and functional components
- **Vite**: Build tool and development server
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management and API caching
- **Framer Motion**: Animation and gesture library
- **React Hook Form**: Form state management with validation

## UI Component System
- **Radix UI**: Accessible, unstyled component primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Class Variance Authority**: Type-safe variant styling
- **Lucide React**: Icon library with React components

## Backend Framework
- **Express.js**: Web application framework for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express
- **Zod**: Runtime type validation and schema definition

## Development Tools
- **TypeScript**: Static type checking for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing tool with Autoprefixer
- **Date-fns**: Date manipulation and formatting utilities