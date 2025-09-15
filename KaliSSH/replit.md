# Overview

A full-stack web application that provides a multi-model AI terminal interface for cybersecurity operations. The system combines multiple AI models (Llama, DeepSeek, Mistral, Qwen) to provide collaborative analysis and insights, with integrated SSH capabilities for remote command execution on Kali Linux machines. The application features a modern React frontend with a terminal-style interface and an Express.js backend that orchestrates AI model interactions and SSH connections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack React Query for server state management with local React state for UI state
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Consistent component architecture with reusable UI components following atomic design principles

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: TypeScript for type safety and better development experience
- **API Structure**: RESTful endpoints with centralized route registration
- **Multi-Model Orchestration**: Custom service that manages multiple AI models with consensus-based responses
- **SSH Integration**: Dedicated SSH client service for remote command execution
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Tools**: Hot reload with Vite middleware integration

## Data Management
- **Database**: PostgreSQL with Drizzle ORM configured for type-safe database operations
- **Schema**: Centralized schema definitions using Zod for runtime validation
- **Storage**: In-memory storage implementation for development with interface for easy database migration
- **Session Management**: Express session handling with PostgreSQL session store (connect-pg-simple)

## AI Model Integration
- **Provider**: OpenRouter API for accessing multiple AI models
- **Models**: Strategic selection of models with different specializations (general, reasoning, analysis, validation)
- **Orchestration**: Smart load balancing and consensus mechanisms for improved response quality
- **Caching**: Response caching to optimize performance and reduce API costs
- **Error Handling**: Robust fallback mechanisms and timeout handling

## Authentication & Security
- **Session-based Authentication**: Server-side session management
- **SSH Security**: Secure SSH connections with proper key management
- **Input Validation**: Zod schemas for request/response validation
- **Environment Configuration**: Secure environment variable management

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting (@neondatabase/serverless)
- **OpenRouter API**: Multi-model AI service provider for accessing various LLMs

## Frontend Libraries
- **UI Framework**: Radix UI primitives for accessible, unstyled components
- **State Management**: TanStack React Query for server state synchronization
- **Styling**: Tailwind CSS for utility-first styling approach
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Hookform resolvers for form management

## Backend Services
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Store**: connect-pg-simple for PostgreSQL session persistence
- **Validation**: Zod for schema validation and type inference
- **Process Management**: Node.js child_process for SSH command execution

## Development Tools
- **Build Tool**: Vite for fast development and optimized builds
- **Replit Integration**: Specialized Replit plugins for development environment
- **TypeScript**: Full TypeScript support across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds