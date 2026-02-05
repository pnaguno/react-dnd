# CMS Electronic PA Submission System - API Documentation

## Overview

This document provides comprehensive API documentation for the CMS Electronic PA Submission System. The API follows RESTful principles and uses JSON for request/response payloads.

## Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.cms-pa-system.com/api/v1`

## Authentication

All API endpoints (except health checks) require JWT authentication.

### Getting a Token

```bash
# Example: Obtain JWT token (implementation-specific)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "your-password"
  }'
```

### Using the Token

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Checks

#### GET /health

Check if the API is running.

**Authentication**: Not required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "up",
    "messageQueue": "up",
    "api": "up"
  }
}
```

### PA Requests

#### POST /pa-requests

Create a new Prior Authorization request.

**Authentication**: Required

**Request Body**:

```json
{
  "priority": "standard",
  "patient": {
    "id": "patient-123",
    "demographics": {
      "name": {
        "use": "official",
        "family": "Smith",
        "given": ["John", "Michael"]
      },
      "birthDate": "1980-01-15",
      "gender": "male",
      "address": {
        "use": "home",
        "line": ["123 Main St", "Apt 4B"],
        "city": "Boston",
        "state": "MA",
        "postalCode": "02101",
        "country": "US"
      },
      "telecom": {
        "phone": "+1-555-0123",
        "email": "john.smith@example.com"
      }
    },
    "memberId": "MEM123456789",
    "coverageInfo": [
      {
        "id": "coverage-1",
        "status": "active",
        "payor": {
          "id": "payer-001",
          "name": "Blue Cross Blue Shield",
          "identifier": "BCBS-MA"
        }
      }
    ]
  },
  "requestingProvider": {
    "npi": "1234567890",
    "name": {
      "use": "official",
      "family": "Johnson",
      "given": ["Sarah"],
      "prefix": ["Dr."]
    },
    "organization": {
      "id": "org-001",
      "name": "Boston Medical Center",
      "address": {
        "line": ["1 Medical Center Place"],
        "city": "Boston",
        "state": "MA",
        "postalCode": "02118"
      },
      "active": true
    },
    "contactInfo": {
      "phone": "+1-555-0199",
      "email": "dr.johnson@bostonmedical.com"
    },
    "specialty": "Cardiology"
  },
  "serviceRequest": {
    "serviceType": {
      "coding": [
        {
          "system": "http://www.ama-assn.org/go/cpt",
          "code": "93000",
          "display": "Electrocardiogram, routine ECG"
        }
      ],
      "text": "ECG"
    },
    "diagnosis": [
      {
        "code": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/sid/icd-10",
              "code": "I25.10",
              "display": "Atherosclerotic heart disease"
            }
          ]
        },
        "onsetDate": "2024-01-01"
      }
    ]
  },
  "notes": "Patient experiencing chest pain"
}
```

**Response** (201 Created):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "draft",
  "priority": "standard",
  "patient": { ... },
  "requestingProvider": { ... },
  "serviceRequest": { ... },
  "automationFlags": {
    "autoPopulated": true,
    "autoSubmitEligible": false,
    "requiresManualReview": true
  },
  "auditTrail": [
    {
      "action": "created",
      "timestamp": "2024-01-15T10:30:00Z",
      "actorId": "user-123"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### GET /pa-requests

Search and filter PA requests.

**Authentication**: Required

**Query Parameters**:
- `status` (array): Filter by status (e.g., `?status=submitted&status=in-review`)
- `priority` (array): Filter by priority
- `patientId` (string): Filter by patient ID
- `providerId` (string): Filter by provider NPI
- `trackingId` (string): Filter by tracking ID
- `limit` (integer): Maximum results (default: 50, max: 100)
- `offset` (integer): Results to skip (default: 0)

**Example**:
```bash
curl -X GET "http://localhost:3000/api/v1/pa-requests?status=submitted&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "submitted",
      "priority": "standard",
      "patient": { ... },
      "submissionDetails": {
        "trackingId": "PA-550e8400-e29b-41d4-a716-446655440000",
        "submittedAt": "2024-01-15T11:00:00Z",
        "submissionMethod": "fhir"
      }
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### GET /pa-requests/{id}

Get a specific PA request by ID.

**Authentication**: Required

**Example**:
```bash
curl -X GET "http://localhost:3000/api/v1/pa-requests/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"
```

#### PUT /pa-requests/{id}

Update an existing PA request.

**Authentication**: Required

**Request Body**:
```json
{
  "status": "validated",
  "notes": "Validation completed successfully"
}
```

#### POST /pa-requests/{id}/submit

Submit a PA request to the payer.

**Authentication**: Required

**Example**:
```bash
curl -X POST "http://localhost:3000/api/v1/pa-requests/550e8400-e29b-41d4-a716-446655440000/submit" \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK):
```json
{
  "success": true,
  "trackingId": "PA-550e8400-e29b-41d4-a716-446655440000",
  "submittedAt": "2024-01-15T11:00:00Z",
  "payerResponse": {
    "status": "received",
    "message": "PA request received and queued for review",
    "referenceNumber": "PAYER-REF-12345"
  }
}
```

#### GET /pa-requests/{id}/status

Get the current status of a PA request.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "in-review",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

## Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Default Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

When rate limit is exceeded:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "patient.demographics.birthDate",
      "message": "Invalid date format"
    }
  ]
}
```

## Pagination

List endpoints support pagination using `limit` and `offset` parameters:

```bash
# Get first page (items 0-49)
GET /pa-requests?limit=50&offset=0

# Get second page (items 50-99)
GET /pa-requests?limit=50&offset=50
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

## Filtering

Use query parameters to filter results:

```bash
# Multiple status values
GET /pa-requests?status=submitted&status=in-review

# Combine multiple filters
GET /pa-requests?status=approved&priority=urgent&limit=20
```

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- **File**: `openapi.yaml`
- **Swagger UI**: `http://localhost:3000/api-docs` (when running)

You can use tools like Swagger UI, Postman, or Insomnia to import the OpenAPI spec for interactive API exploration.

## Testing with cURL

### Create a PA Request

```bash
curl -X POST http://localhost:3000/api/v1/pa-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "urgent",
    "patient": {
      "id": "patient-001",
      "demographics": {
        "name": {
          "family": "Doe",
          "given": ["Jane"]
        },
        "birthDate": "1975-05-20",
        "gender": "female",
        "address": {
          "line": ["456 Oak Ave"],
          "city": "Cambridge",
          "state": "MA",
          "postalCode": "02139"
        }
      },
      "memberId": "MEM987654321",
      "coverageInfo": [{
        "id": "cov-1",
        "status": "active",
        "payor": {
          "id": "payer-002",
          "name": "Aetna",
          "identifier": "AETNA-MA"
        }
      }]
    },
    "requestingProvider": {
      "npi": "9876543210",
      "name": {
        "family": "Williams",
        "given": ["Robert"],
        "prefix": ["Dr."]
      },
      "organization": {
        "id": "org-002",
        "name": "Cambridge Health",
        "address": {
          "line": ["789 Medical Dr"],
          "city": "Cambridge",
          "state": "MA",
          "postalCode": "02139"
        },
        "active": true
      },
      "contactInfo": {
        "phone": "+1-555-0200",
        "email": "dr.williams@cambridgehealth.com"
      }
    },
    "serviceRequest": {
      "serviceType": {
        "coding": [{
          "system": "http://www.ama-assn.org/go/cpt",
          "code": "70450",
          "display": "CT Head without contrast"
        }],
        "text": "CT Scan"
      },
      "diagnosis": [{
        "code": {
          "coding": [{
            "system": "http://hl7.org/fhir/sid/icd-10",
            "code": "R51",
            "display": "Headache"
          }]
        }
      }]
    }
  }'
```

### Search PA Requests

```bash
curl -X GET "http://localhost:3000/api/v1/pa-requests?status=submitted&priority=urgent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Submit a PA Request

```bash
curl -X POST http://localhost:3000/api/v1/pa-requests/550e8400-e29b-41d4-a716-446655440000/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Best Practices

1. **Always use HTTPS** in production
2. **Store JWT tokens securely** (never in localStorage for sensitive apps)
3. **Handle rate limits gracefully** with exponential backoff
4. **Validate data client-side** before sending to reduce errors
5. **Use appropriate HTTP methods** (GET for reads, POST for creates, PUT for updates)
6. **Include correlation IDs** in headers for request tracing
7. **Monitor API usage** and set up alerts for errors

## Support

For API support, contact:
- **Email**: api-support@cms-pa-system.com
- **Documentation**: https://docs.cms-pa-system.com
- **Status Page**: https://status.cms-pa-system.com
