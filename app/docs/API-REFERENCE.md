# INFERA WebNova API Reference
مرجع واجهة برمجة التطبيقات

## Base URL
```
Development: http://localhost:5000/api
Production:  https://your-domain.com/api
```

## Authentication
All API endpoints require authentication via session cookie or Bearer token.

---

## Execution Engine / محرك التنفيذ

### Execute Code
```http
POST /api/execution/run
Content-Type: application/json

{
  "code": "console.log('Hello, World!')",
  "language": "javascript",
  "useDocker": true,
  "timeout": 30000
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello, World!\n",
  "exitCode": 0,
  "executionTime": 125,
  "isolationType": "docker"
}
```

**Supported Languages:**
| Language | Value | Runtime |
|----------|-------|---------|
| JavaScript | `javascript` | Node.js 20 |
| TypeScript | `typescript` | ts-node |
| Python | `python` | Python 3.11 |
| Go | `go` | Go 1.21 |
| PHP | `php` | PHP 8.3 |
| Rust | `rust` | Rust 1.75 |

### Get Status
```http
GET /api/execution/status
```

**Response:**
```json
{
  "available": true,
  "dockerAvailable": true,
  "supportedLanguages": ["javascript", "typescript", "python", "go", "php", "rust"],
  "isolationModes": ["docker", "local"]
}
```

---

## Institutional Memory / الذاكرة المؤسسية

### Create Memory
```http
POST /api/memory
Content-Type: application/json

{
  "title": "Architecture Decision",
  "titleAr": "قرار معماري",
  "content": "Decided to use PostgreSQL for...",
  "contentAr": "تقرر استخدام PostgreSQL...",
  "nodeType": "decision",
  "projectId": "project-uuid",
  "status": "active",
  "importance": "high",
  "metadata": { "category": "database" }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "memory-uuid",
    "title": "Architecture Decision",
    "nodeType": "decision",
    "status": "active",
    "createdAt": "2024-12-23T10:00:00Z"
  }
}
```

### List Memories
```http
GET /api/memory?projectId=uuid&nodeType=decision&status=active&importance=high
```

### Get Memory
```http
GET /api/memory/:id
```

### Search Memories
```http
POST /api/memory/search
Content-Type: application/json

{
  "query": "database architecture decisions",
  "projectId": "project-uuid",
  "limit": 10,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "memory-uuid",
      "title": "Architecture Decision",
      "similarity": 0.92,
      "nodeType": "decision"
    }
  ]
}
```

### Update Memory
```http
PATCH /api/memory/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "archived"
}
```

### Delete Memory (Soft)
```http
DELETE /api/memory/:id
```

### Supersede Memory
```http
POST /api/memory/:id/supersede
Content-Type: application/json

{
  "title": "New Version",
  "content": "Updated content that replaces the old decision"
}
```

### Link Memories
```http
POST /api/memory/:id/link
Content-Type: application/json

{
  "targetId": "other-memory-uuid",
  "relationshipType": "relates_to"
}
```

### Get Statistics
```http
GET /api/memory/stats
```

### AI Analysis
```http
POST /api/memory/analyze
Content-Type: application/json

{
  "memoryId": "memory-uuid",
  "analysisType": "summary"
}
```

---

## Secrets Vault / خزنة الأسرار

### Create Secret
```http
POST /api/vault/secrets
Content-Type: application/json

{
  "name": "API Key",
  "path": "integrations/stripe/api-key",
  "value": "sk_live_xxxxx",
  "scope": "project",
  "secretType": "api-key",
  "projectId": "project-uuid",
  "environment": "production",
  "description": "Stripe production API key",
  "rotationPolicy": "monthly",
  "allowedServices": ["payment-service"],
  "allowedRoles": ["admin"]
}
```

### Get Secret Metadata
```http
GET /api/vault/secrets/:path
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "secret-uuid",
    "name": "API Key",
    "path": "integrations/stripe/api-key",
    "scope": "project",
    "secretType": "api-key",
    "version": 1,
    "rotationPolicy": "monthly",
    "lastRotatedAt": null,
    "createdAt": "2024-12-23T10:00:00Z"
  }
}
```

### Reveal Secret Value
```http
POST /api/vault/secrets/:path/reveal
Content-Type: application/json

{
  "confirm": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "value": "sk_live_xxxxx"
  }
}
```

### Update Secret
```http
PATCH /api/vault/secrets/:path
Content-Type: application/json

{
  "value": "sk_live_new_value",
  "description": "Updated description"
}
```

### Rotate Secret
```http
POST /api/vault/secrets/:path/rotate
Content-Type: application/json

{
  "newValue": "sk_live_rotated_value"
}
```

### Delete Secret
```http
DELETE /api/vault/secrets/:path
```

### List Secrets
```http
GET /api/vault/list?scope=project&projectId=uuid&secretType=api-key
```

### Get Statistics
```http
GET /api/vault/stats
```

### Get Rotation Needed
```http
GET /api/vault/rotation-needed
```

---

## Service-to-Service Authentication

For service-to-service calls to the vault, include these headers:

```http
X-Service-ID: execution-engine
X-Service-Signature: <hmac-sha256-signature>
X-Service-Timestamp: <unix-timestamp>
```

**Signature Generation:**
```javascript
const crypto = require('crypto');

const serviceId = 'execution-engine';
const timestamp = Math.floor(Date.now() / 1000).toString();
const secret = process.env.SERVICE_AUTH_SECRET;

const payload = `${serviceId}:${timestamp}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
```

**Trusted Services:**
- `execution-engine`
- `memory-service`
- `integration-layer`
- `deployment-service`
- `ai-orchestrator`
- `platform-orchestrator`

---

## Note on Extended APIs

The Git API and CI/CD Pipeline endpoints are defined in the integration layer modules but may require additional route registration. Refer to `server/routes.ts` for currently active endpoints.

---

## Error Responses / استجابات الأخطاء

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message in English",
  "errorAr": "رسالة الخطأ بالعربية",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limits / حدود المعدل

| Endpoint Category | Limit |
|-------------------|-------|
| Execution | 10 req/min |
| Memory | 100 req/min |
| Vault | 50 req/min |
| Git | 60 req/min |
| CI/CD | 30 req/min |

---

## Pagination / التقسيم إلى صفحات

List endpoints support pagination:
```http
GET /api/memory?limit=20&offset=40
```

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

---

*INFERA WebNova - Sovereign Digital Platform Operating System*
