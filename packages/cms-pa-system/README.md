# CMS Electronic PA Submission System

A comprehensive healthcare compliance solution that enables automated, electronic submission of Prior Authorization (PA) requests in accordance with CMS regulations.

## Features

- **Electronic PA Submission**: Automated submission using HL7 FHIR R4 and X12 278 standards
- **Workflow Automation**: Intelligent workflows that minimize manual intervention
- **CMS Compliance**: Built to meet CMS-0057-F final rule requirements
- **Security**: HIPAA-compliant with TLS 1.3+ encryption and comprehensive audit trails
- **Integration**: Seamless connectivity with EHR systems and payer APIs

## Architecture

The system follows a microservices architecture with:
- **API Gateway**: Authentication, rate limiting, and request routing
- **PA Request Service**: Core PA lifecycle management
- **Workflow Engine**: Automated workflow execution
- **Integration Service**: External system connectivity (FHIR, X12)
- **Validation Service**: CMS compliance validation

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis 6+
- RabbitMQ 3.11+

## Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

Key environment variables:

- `DB_HOST`, `DB_PORT`, `DB_NAME`: PostgreSQL connection
- `REDIS_HOST`, `REDIS_PORT`: Redis connection
- `RABBITMQ_URL`: RabbitMQ connection string
- `JWT_SECRET`: Secret key for JWT tokens (required)
- `ENCRYPTION_KEY`: Encryption key for sensitive data (min 32 chars, required)

## Database Setup

The application will automatically create the required database schemas on first run:

- `pa_requests`: PA request data
- `audit_trail`: Comprehensive audit logging
- `system_configuration`: System configuration
- `workflow_rules`: Workflow automation rules
- `payer_endpoints`: Payer integration endpoints
- `retry_queue`: Failed request retry management

## Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Health Check
- `GET /health` - System health status
- `GET /health/ready` - Readiness check

### PA Requests (requires authentication)
- `POST /api/v1/pa-requests` - Create PA request
- `GET /api/v1/pa-requests/:id` - Get PA request
- `PUT /api/v1/pa-requests/:id` - Update PA request
- `POST /api/v1/pa-requests/:id/submit` - Submit PA request
- `GET /api/v1/pa-requests` - Search PA requests

### Workflows (requires authentication)
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/:id` - Get workflow
- `PUT /api/v1/workflows/:id` - Update workflow

### Configuration (requires admin role)
- `GET /api/v1/config` - Get configuration
- `PUT /api/v1/config/:key` - Update configuration

## Authentication

All API endpoints (except health checks) require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/pa-requests
```

## Security

- TLS 1.3+ for all communications
- AES-256 encryption for data at rest
- JWT-based authentication
- Role-based access control
- Comprehensive audit trails
- Rate limiting (100 requests per 15 minutes by default)

## Event-Driven Architecture

The system uses RabbitMQ for asynchronous event processing:

- `pa.request.created` - New PA request created
- `pa.request.submitted` - PA request submitted to payer
- `pa.request.updated` - PA request updated
- `pa.response.received` - Response received from payer
- `pa.validation.required` - Validation needed
- `pa.workflow.triggered` - Workflow execution triggered
- `pa.notification.required` - Notification needed
- `pa.audit.event` - Audit event logged
- `pa.error.occurred` - Error occurred

## Development

```bash
# Run linter
npm run lint

# Run tests with coverage
npm test -- --coverage
```

## License

MIT
