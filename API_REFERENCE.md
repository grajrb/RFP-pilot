# RFP Management System - API Quick Reference

## Base URL
```
http://localhost:5000
```

## Vendor Endpoints

### List Vendors
```
GET /api/vendors
```
**Response:** `Vendor[]`
```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "description": "IT Services",
    "createdAt": "2024-01-14T12:00:00Z"
  }
]
```

### Create Vendor
```
POST /api/vendors
```
**Body:** 
```json
{
  "name": "New Vendor",
  "email": "contact@vendor.com",
  "description": "Vendor description"
}
```
**Response (201):** `Vendor` (created)

---

## RFP Endpoints

### List RFPs
```
GET /api/rfps
```
**Response:** `Rfp[]` (sorted by creation date, newest first)

### Get Single RFP
```
GET /api/rfps/:id
```
**Response (200):** `Rfp`
```json
{
  "id": 1,
  "title": "Enterprise CRM",
  "rawRequirements": "We need a CRM that...",
  "structuredRequirements": {
    "title": "Enterprise CRM",
    "summary": "...",
    "deliverables": [...],
    "timeline": "3 months",
    "budget": "$50k",
    "constraints": [...],
    "successCriteria": [...]
  },
  "status": "draft",
  "createdAt": "2024-01-14T12:00:00Z"
}
```
**Response (404):** `{ message: "RFP not found" }`

### Create RFP
```
POST /api/rfps
```
**Body:**
```json
{
  "title": "Project Title",
  "rawRequirements": "Natural language requirements",
  "structuredRequirements": null,
  "status": "draft"
}
```
**Response (201):** `Rfp` (created)
**Response (400):** `{ message: "Error message", field: "fieldName" }`

### Update RFP
```
PUT /api/rfps/:id
```
**Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "rawRequirements": "Updated requirements",
  "structuredRequirements": {...},
  "status": "sent"
}
```
**Response (200):** `Rfp` (updated)
**Response (404):** `{ message: "RFP not found" }`

### Generate Structured RFP (AI)
```
POST /api/rfps/generate
```
**Body:**
```json
{
  "rawRequirements": "We need a system that..."
}
```
**Response (200):**
```json
{
  "title": "AI-generated title",
  "structuredRequirements": {
    "title": "...",
    "summary": "...",
    "deliverables": [...],
    "timeline": "...",
    "budget": "...",
    "constraints": [...],
    "successCriteria": [...]
  }
}
```
**Response (500):** `{ message: "Failed to generate: ..." }`

### Send RFP to Vendors
```
POST /api/rfps/:id/send
```
**Body:**
```json
{
  "vendorIds": [1, 2, 3]
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Sent to 3 vendors"
}
```
**Response (404):** `{ message: "RFP not found" }`
**Response (500):** `{ message: "Failed to send: ..." }`

---

## Proposal Endpoints

### List Proposals for RFP
```
GET /api/rfps/:id/proposals
```
**Response:** `Proposal[]`
```json
[
  {
    "id": 1,
    "rfpId": 1,
    "vendorId": 2,
    "rawResponse": "Our proposal is...",
    "structuredResponse": {
      "matches": ["Req 1", "Req 2"],
      "gaps": ["Req 3"],
      "proposed_timeline": "4 weeks",
      "proposed_budget": "$75k",
      "strengths": [...],
      "weaknesses": [...]
    },
    "score": 87,
    "aiAnalysis": "Good proposal with strong coverage",
    "createdAt": "2024-01-14T13:00:00Z"
  }
]
```

### Get AI Recommendation
```
GET /api/rfps/:id/recommendation
```
**Response (200):**
```json
{
  "recommendation": "TechSolutions",
  "reasoning": "Best value with strong implementation partner and good coverage of requirements. Price is competitive at $75k..."
}
```
**Response (404):** `{ message: "RFP not found" }`
**Response (400):** `{ message: "No proposals received for this RFP yet" }`
**Response (500):** `{ message: "Failed to generate recommendation: ..." }`

---

## Webhook Endpoints

### Receive Inbound Email
```
POST /api/webhooks/email
```
**Body:**
```json
{
  "from": "vendor@company.com",
  "subject": "RE: RFP #1",
  "body": "Our proposal details here..."
}
```
**Response (200):**
```json
{
  "success": true
}
```
**Response (400):** `{ message: "Validation error" }`
**Response (500):** `{ message: "Failed to process email" }`

**How it works:**
1. Parses `from` to find vendor by email
2. Extracts RFP ID from subject (looks for `RFP #123`)
3. Calls AI to analyze proposal against RFP
4. Creates `Proposal` record with score and analysis
5. Returns success/failure

---

## Common Workflows

### Workflow 1: Create and Send RFP

```bash
# 1. Create vendors (if not exist)
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendor Inc",
    "email": "sales@vendor.com",
    "description": "Service provider"
  }'

# 2. Generate RFP structure (AI)
curl -X POST http://localhost:5000/api/rfps/generate \
  -H "Content-Type: application/json" \
  -d '{
    "rawRequirements": "We need a cloud platform with AI..."
  }'
# Copy response structuredRequirements

# 3. Create RFP (draft)
curl -X POST http://localhost:5000/api/rfps \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cloud Platform",
    "rawRequirements": "We need a cloud platform with AI...",
    "structuredRequirements": {...},
    "status": "draft"
  }'

# 4. Send RFP to vendors
curl -X POST http://localhost:5000/api/rfps/1/send \
  -H "Content-Type: application/json" \
  -d '{
    "vendorIds": [1, 2, 3]
  }'
```

### Workflow 2: Process Vendor Responses

```bash
# 1. Receive vendor proposal via webhook
curl -X POST http://localhost:5000/api/webhooks/email \
  -H "Content-Type: application/json" \
  -d '{
    "from": "sales@vendor.com",
    "subject": "RE: RFP #1",
    "body": "Our proposal includes: ...detailed proposal..."
  }'

# 2. Get all proposals for RFP
curl http://localhost:5000/api/rfps/1/proposals

# 3. Get AI recommendation
curl http://localhost:5000/api/rfps/1/recommendation
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |

---

## Data Structures

### Vendor
```typescript
{
  id: number
  name: string
  email: string
  description?: string
  createdAt: Date
}
```

### RFP
```typescript
{
  id: number
  title: string
  rawRequirements: string
  structuredRequirements?: {
    title: string
    summary: string
    deliverables: string[]
    timeline: string
    budget: string
    constraints: string[]
    successCriteria: string[]
  }
  status: "draft" | "sent" | "closed"
  createdAt: Date
}
```

### Proposal
```typescript
{
  id: number
  rfpId: number
  vendorId: number
  rawResponse: string
  structuredResponse?: {
    matches: string[]
    gaps: string[]
    proposed_timeline: string
    proposed_budget: string
    strengths: string[]
    weaknesses: string[]
  }
  score?: number (0-100)
  aiAnalysis?: string
  createdAt: Date
}
```

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/rfp_system
OPENAI_API_KEY=sk-...

# Optional (email)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
EMAIL_FROM=noreply@rfp-system.local

# Optional (server)
SERVER_PORT=5000
NODE_ENV=development
```

---

## Rate Limiting

Currently no rate limiting implemented. In production, add:
- OpenAI API rate limits (check account limits)
- Email rate limits (e.g., 10 RFPs/minute)
- Request rate limiting (express-rate-limit)

---

## Security Notes

⚠️ This is a **single-user demo system**. For production:
- Add authentication (Passport, JWT)
- Add authorization (role-based access)
- Validate all inputs (Zod handles this)
- Sanitize email content (prevent injection)
- Use HTTPS only
- Add CORS configuration
- Implement audit logging

