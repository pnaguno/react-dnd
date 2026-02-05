# CMS PA System - Setup Guide

## Task 1: Project Structure and Core Infrastructure ✅

This document describes the infrastructure setup completed for the CMS Electronic PA Submission System.

## What Was Implemented

### 1. Project Structure
Created a complete TypeScript microservices project with:
- **Package configuration** (`package.json`) with all required dependencies
- **TypeScript configuration** (`tsconfig.json`) extending the monorepo base config
- **Jest test configuration** for unit and property-based testing
- **ESLint configuration** for code quality
- **Environment configuration** (`.env.example`) with all required settings

### 2. Database Infrastructure
**Location**: `src/infrastructure/database/`

Implemented PostgreSQL database layer with:
- Connection pooling for efficient database access
- Transaction management with automatic rollback on errors
- Schema initialization for all required tables:
  - `pa_requests` - Core PA request data with status tracking
  - `audit_trail` - Comprehensive audit logging (Requirement 5.4)
  - `system_configuration` - System configuration storage
  - `workflow_rules` - Workflow automation rules
  - `payer_endpoints` - Payer integration endpoints
  - `retry_queue` - Failed request retry management
- Proper indexes for query performance
- Health check support

**Key Features**:
- Automatic schema creation on first run
- Connection health monitoring
- Transaction support with BEGIN/COMMIT/ROLLBACK
- Prepared statement support for SQL injection prevention

### 3. Message Queue Infrastructure
**Location**: `src/infrastructure/message-queue/`

Implemented RabbitMQ-based event-driven architecture with:
- Topic exchange for flexible event routing
- Durable queues with TTL and max-length limits
- Event types for type-safe event handling:
  - `pa.request.created`
  - `pa.request.submitted`
  - `pa.request.updated`
  - `pa.response.received`
  - `pa.validation.required`
  - `pa.workflow.triggered`
  - `pa.notification.required`
  - `pa.audit.event`
  - `pa.error.occurred`
- Automatic message acknowledgment and retry
- Connection error handling and recovery

**Key Features**:
- Asynchronous event processing for scalability
- Message persistence for reliability
- Dead letter queue support
- Automatic reconnection on connection loss

### 4. API Gateway
**Location**: `src/api-gateway/`

Implemented secure API gateway with:

#### Security Features (Requirement 5.2):
- **Helmet.js** for security headers
- **CORS** configuration with origin whitelisting
- **Rate limiting** (100 requests per 15 minutes by default)
- **JWT authentication** for all protected endpoints
- **Role-based access control** (RBAC)
- **TLS 1.3+** support (configured via environment)

#### Middleware:
- **Authentication middleware** (`middleware/auth.ts`):
  - JWT token verification
  - User context injection
  - Token expiration handling
  - Role-based authorization
- **Error handler** (`middleware/error-handler.ts`):
  - Centralized error handling
  - Operational vs programming error distinction
  - Secure error messages (no stack traces in production)
- **Request logger** (`middleware/request-logger.ts`):
  - Request/response logging
  - Performance monitoring
  - Audit trail support

#### Routes:
- **Health checks** (`/health`, `/health/ready`) - No auth required
- **PA Requests** (`/api/v1/pa-requests/*`) - Auth required
- **Workflows** (`/api/v1/workflows/*`) - Auth required
- **Configuration** (`/api/v1/config/*`) - Admin role required

### 5. Logging Infrastructure
**Location**: `src/infrastructure/logger/`

Implemented Winston-based logging with:
- Multiple log levels (error, warn, info, debug)
- Console output with colors for development
- File output for production
- Structured JSON logging
- Log rotation (5MB max, 5 files)
- Separate error log file

### 6. Configuration Management
**Location**: `src/config/`

Centralized configuration with:
- Environment variable loading via dotenv
- Type-safe configuration object
- Configuration validation
- Separate configs for:
  - Server settings
  - Database connection
  - Redis connection
  - RabbitMQ connection
  - Security settings (JWT, encryption)
  - Rate limiting
  - External services
  - Logging

### 7. Testing Infrastructure
**Location**: `src/**/__tests__/`

Created comprehensive test suite:
- **Database tests** (`infrastructure/__tests__/database.test.ts`):
  - Connection pool creation
  - Schema initialization
  - Query execution
  - Transaction management with rollback
- **Message queue tests** (`infrastructure/__tests__/message-queue.test.ts`):
  - RabbitMQ connection
  - Exchange and queue creation
  - Event publishing
  - Queue subscription
  - Connection management
- **Authentication tests** (`api-gateway/__tests__/auth.test.ts`):
  - JWT token validation
  - Token expiration handling
  - Invalid token rejection
  - Role-based access control

### 8. Development Tools

#### Docker Compose (`docker-compose.yml`)
Local development environment with:
- PostgreSQL 14
- Redis 7
- RabbitMQ 3.11 with management UI
- Health checks for all services
- Persistent volumes

#### Environment Configuration (`.env.example`)
Complete environment template with:
- Database credentials
- Redis configuration
- RabbitMQ connection
- Security keys (JWT, encryption)
- Rate limiting settings
- External service URLs
- Logging configuration

## Requirements Satisfied

✅ **Requirement 5.2**: Authentication implemented with JWT tokens
✅ **Requirement 5.4**: Audit trail table created with comprehensive logging

## Architecture Decisions

1. **Microservices Structure**: Organized code by service boundaries for future scalability
2. **Event-Driven**: RabbitMQ for asynchronous processing and service decoupling
3. **PostgreSQL**: Relational database for ACID compliance and complex queries
4. **Redis**: Ready for caching and session management (to be implemented)
5. **JWT Authentication**: Stateless authentication for horizontal scaling

## Database Schema

### PA Requests Table
```sql
- id (UUID, PK)
- status (VARCHAR) - draft, validated, submitted, approved, denied, etc.
- priority (VARCHAR) - urgent, standard
- patient_id, patient_member_id
- requesting_provider_npi, requesting_provider_name
- service_type_code, service_type_display
- submission_method (FHIR, X12)
- payer_endpoint, tracking_id (unique)
- workflow_state (JSONB)
- automation_flags (JSONB)
- timestamps (created_at, updated_at, submitted_at)
```

### Audit Trail Table
```sql
- id (UUID, PK)
- entity_type, entity_id
- action, actor_id, actor_type
- timestamp
- changes (JSONB)
- metadata (JSONB)
- ip_address, user_agent
```

### Other Tables
- `system_configuration` - Key-value configuration store
- `workflow_rules` - Workflow automation rules
- `payer_endpoints` - Payer integration endpoints
- `retry_queue` - Failed request retry management

## API Endpoints

### Health Checks (No Auth)
- `GET /health` - System health status
- `GET /health/ready` - Readiness check

### PA Requests (Auth Required)
- `POST /api/v1/pa-requests` - Create PA request
- `GET /api/v1/pa-requests/:id` - Get PA request
- `PUT /api/v1/pa-requests/:id` - Update PA request
- `POST /api/v1/pa-requests/:id/submit` - Submit PA request
- `GET /api/v1/pa-requests` - Search PA requests

### Workflows (Auth Required)
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/:id` - Get workflow
- `PUT /api/v1/workflows/:id` - Update workflow

### Configuration (Admin Only)
- `GET /api/v1/config` - Get configuration
- `PUT /api/v1/config/:key` - Update configuration

## Security Features

1. **Authentication**: JWT-based with configurable expiration
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: 100 requests per 15 minutes (configurable)
4. **Security Headers**: Helmet.js with CSP, HSTS, etc.
5. **CORS**: Configurable origin whitelisting
6. **Encryption**: AES-256 for data at rest (configured)
7. **TLS**: TLS 1.3+ for communications (configured)
8. **Audit Trail**: All actions logged with actor, timestamp, changes

## Next Steps

The infrastructure is now ready for implementing the core business logic:

1. **Task 2**: Implement core data models and validation
2. **Task 3**: Implement PA request service and lifecycle management
3. **Task 4**: Implement workflow engine and automation
4. **Task 5**: Implement integration service (FHIR, X12)
5. **Task 6**: Implement security and encryption services
6. **Task 7**: Implement error handling and resilience

## Running the System

### Prerequisites
```bash
# Start infrastructure services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (REQUIRED: Set JWT_SECRET and ENCRYPTION_KEY)
nano .env
```

### Development
```bash
# Install dependencies (from monorepo root)
yarn install

# Run in development mode
yarn workspace @cms-pa/system dev

# Run tests
yarn workspace @cms-pa/system test

# Build for production
yarn workspace @cms-pa/system build
```

### Verification
```bash
# Check health
curl http://localhost:3000/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "services": {
#     "database": "up",
#     "api": "up"
#   }
# }
```

## File Structure

```
packages/cms-pa-system/
├── src/
│   ├── index.ts                    # Application entry point
│   ├── config/
│   │   └── index.ts                # Configuration management
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── index.ts            # Database connection & schemas
│   │   │   └── __tests__/
│   │   │       └── database.test.ts
│   │   ├── message-queue/
│   │   │   ├── index.ts            # RabbitMQ setup
│   │   │   └── __tests__/
│   │   │       └── message-queue.test.ts
│   │   └── logger/
│   │       └── index.ts            # Winston logger
│   └── api-gateway/
│       ├── index.ts                # API Gateway setup
│       ├── middleware/
│       │   ├── auth.ts             # JWT authentication
│       │   ├── error-handler.ts    # Error handling
│       │   └── request-logger.ts   # Request logging
│       ├── routes/
│       │   ├── health.ts           # Health checks
│       │   ├── pa-requests.ts      # PA request routes
│       │   ├── workflows.ts        # Workflow routes
│       │   └── config.ts           # Configuration routes
│       └── __tests__/
│           └── auth.test.ts        # Auth tests
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── jest.config.js                  # Jest config
├── .eslintrc.js                    # ESLint config
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── docker-compose.yml              # Local dev environment
├── README.md                       # User documentation
└── SETUP.md                        # This file
```

## Summary

Task 1 is **COMPLETE**. The project structure and core infrastructure are fully implemented with:

✅ TypeScript project with microservices structure
✅ Database schemas for PA requests, audit trails, and configuration
✅ Message queue (RabbitMQ) for event-driven architecture
✅ API gateway with authentication and rate limiting
✅ Comprehensive testing infrastructure
✅ Development tools (Docker Compose, environment config)
✅ Security features (JWT, rate limiting, CORS, Helmet)
✅ Logging and monitoring infrastructure

The system is ready for implementing business logic in subsequent tasks.
