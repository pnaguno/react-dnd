# CMS Electronic PA Submission System - API Guide

## Overview

This guide provides an overview of the enhanced OpenAPI 3.0 specification for the CMS Electronic PA Submission System with automated workflow capabilities.

**OpenAPI Spec File**: `openapi-enhanced.yaml`

## Quick Start

### View the API Documentation

You can view and interact with the API documentation using:

1. **Swagger UI**: Import `openapi-enhanced.yaml` into [Swagger Editor](https://editor.swagger.io/)
2. **Postman**: Import the OpenAPI spec into Postman for testing
3. **Redoc**: Use Redoc for beautiful API documentation
4. **VS Code**: Use OpenAPI extensions for inline documentation

### Authentication

All endpoints (except health checks) require JWT authentication:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints Summary

### 1. Health & Monitoring (2 endpoints)
- `GET /health` - System health check
- `GET /health/ready` - Readiness probe

### 2. PA Request Management (8 endpoints)
- `POST /pa-requests` - Create new PA request
- `GET /pa-requests` - Search/filter PA requests
- `GET /pa-requests/{id}` - Get PA request details
- `PUT /pa-requests/{id}` - Update PA request
- `POST /pa-requests/{id}/submit` - Submit to payer
- `GET /pa-requests/{id}/status` - Get submission status
- `POST /pa-requests/{id}/cancel` - Cancel PA request
- `POST /pa-requests/{id}/validate` - Validate PA request

### 3. Workflow Management (8 endpoints)
- `GET /workflows/rules` - List workflow rules
- `POST /workflows/rules` - Create workflow rule
- `GET /workflows/rules/{id}` - Get workflow rule
- `PUT /workflows/rules/{id}` - Update workflow rule
- `DELETE /workflows/rules/{id}` - Delete workflow rule
- `POST /workflows/rules/{id}/enable` - Enable rule
- `POST /workflows/rules/{id}/disable` - Disable rule

### 4. Payer Endpoint Management (6 endpoints)
- `GET /payer-endpoints` - List payer endpoints
- `POST /payer-endpoints` - Create payer endpoint
- `GET /payer-endpoints/{id}` - Get payer endpoint
- `PUT /payer-endpoints/{id}` - Update payer endpoint
- `DELETE /payer-endpoints/{id}` - Delete payer endpoint
- `POST /payer-endpoints/{id}/test` - Test endpoint connection

### 5. Retry Management (4 endpoints)
- `GET /retries` - List retry queue entries
- `GET /retries/{id}` - Get retry entry
- `POST /retries/{id}/cancel` - Cancel retry
- `POST /retries/{id}/retry-now` - Trigger immediate retry

### 6. Validation (1 endpoint)
- `GET /validation/rules` - List validation rules

### 7. Audit Trail (2 endpoints)
- `GET /audit/trail` - Get audit trail with filtering
- `GET /audit/trail/{id}` - Get specific audit entry

### 8. Configuration (4 endpoints)
- `GET /config` - Get system configuration
- `GET /config/{key}` - Get configuration value
- `PUT /config/{key}` - Update configuration value
- `POST /config/reload` - Reload configuration

**Total: 40+ endpoints**

## Key Features

### 1. Automated Workflow
```yaml
POST /workflows/rules
{
  "name": "Auto-submit urgent requests",
  "ruleType": "auto_submit",
  "conditions": {
    "and": [
      {"field": "priority", "operator": "equals", "value": "urgent"},
      {"field": "patient.memberId", "operator": "exists"}
    ]
  },
  "actions": [{"type": "auto_submit"}],
  "priority": 100
}
```

### 2. Electronic Submission
```yaml
POST /pa-requests/{id}/submit
# Automatically:
# - Validates against CMS rules
# - Routes to correct payer endpoint
# - Selects FHIR or X12 protocol
# - Handles authentication
# - Schedules retries if needed
```

### 3. Retry Management
```yaml
GET /retries?status=pending
# Returns retry queue with:
# - Exponential backoff schedule
# - Error categorization
# - Next retry time
# - Retry count
```

### 4. Real-time Status Tracking
```yaml
GET /pa-requests/{id}/status
{
  "id": "uuid",
  "status": "submitted",
  "submissionProgress": {
    "retryCount": 0,
    "nextRetryAt": null
  }
}
```

## Data Models

### Core Entities

1. **PARequest** - Complete PA request with patient, provider, service details
2. **WorkflowRule** - Configurable automation rules
3. **PayerEndpoint** - Payer integration configuration
4. **RetryEntry** - Retry queue management
5. **AuditEntry** - Comprehensive audit logging
6. **ValidationResult** - Validation outcomes

### Status Flow

```
draft → pending-validation → validated → submitted → in-review → approved/denied
                                    ↓
                                  error (with retry logic)
```

## Common Use Cases

### Use Case 1: Create and Auto-Submit PA Request

```bash
# 1. Create PA request
POST /pa-requests
{
  "priority": "urgent",
  "patient": {...},
  "requestingProvider": {...},
  "serviceRequest": {...}
}

# 2. System automatically:
#    - Generates tracking ID
#    - Evaluates workflow rules
#    - Validates if eligible
#    - Submits to payer
#    - Returns with status "submitted"
```

### Use Case 2: Configure Payer Endpoint

```bash
# 1. Create payer endpoint
POST /payer-endpoints
{
  "payerId": "payer-001",
  "payerName": "Blue Cross Blue Shield",
  "fhirEndpoint": "https://payer.com/fhir",
  "supportsFHIR": true,
  "supportsX12": true,
  "capabilities": {
    "maxRetries": 5,
    "timeoutSeconds": 30
  },
  "authentication": {
    "type": "oauth2",
    "credentials": {...}
  }
}

# 2. Test connection
POST /payer-endpoints/{id}/test
```

### Use Case 3: Monitor Submission Progress

```bash
# 1. Check status
GET /pa-requests/{id}/status

# 2. View retry queue
GET /retries?requestId={id}

# 3. Check audit trail
GET /audit/trail?entityId={id}&entityType=pa_request
```

## Error Handling

### Standard Error Response
```json
{
  "error": "Validation Failed",
  "message": "PA request failed validation",
  "details": [
    {
      "field": "patient.demographics.birthDate",
      "message": "Invalid date format",
      "code": "INVALID_DATE"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `503` - Service Unavailable

## Rate Limiting

Default limits:
- **100 requests per 15 minutes** per IP address

Response headers:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp

## Filtering & Pagination

Most list endpoints support:

```bash
GET /pa-requests?status=submitted&status=in-review&limit=50&offset=0
GET /retries?status=pending&limit=20
GET /audit/trail?entityType=pa_request&startDate=2024-01-01T00:00:00Z
```

## Testing the API

### Using cURL

```bash
# Health check (no auth required)
curl http://localhost:3000/api/v1/health

# Create PA request (with auth)
curl -X POST http://localhost:3000/api/v1/pa-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @pa-request.json

# Get PA request
curl http://localhost:3000/api/v1/pa-requests/{id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import `openapi-enhanced.yaml`
2. Set up environment with base URL and token
3. Use pre-configured requests with examples

## Security Considerations

1. **Always use HTTPS** in production
2. **Rotate JWT tokens** regularly
3. **Implement IP whitelisting** for admin endpoints
4. **Monitor rate limits** and adjust as needed
5. **Review audit logs** regularly for security incidents
6. **Encrypt sensitive data** in payer endpoint credentials

## Next Steps

1. **Review the OpenAPI spec**: `openapi-enhanced.yaml`
2. **Import into Swagger/Postman**: For interactive testing
3. **Implement endpoints**: Follow the spec for consistent API design
4. **Write integration tests**: Use the spec as test cases
5. **Generate client SDKs**: Use OpenAPI generators for client libraries

## Support

For questions or issues:
- **Documentation**: See `openapi-enhanced.yaml` for complete details
- **Spec Location**: `react-dnd/packages/cms-pa-system/openapi-enhanced.yaml`
- **GitHub**: https://github.com/pnaguno/react-dnd

---

**Version**: 2.0.0  
**Last Updated**: February 2024  
**Status**: Ready for Implementation
