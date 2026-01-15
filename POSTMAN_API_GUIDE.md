# RFP Management System - Postman API Testing Guide

## Quick Start

### 1. Import Postman Collection
This guide provides all API endpoints with curl commands and Postman examples.

### 2. Set Up Postman Variables
Create a Postman environment with these variables:
```
baseUrl: http://localhost:5000
rfpId: 1
vendorId: 1
proposalId: 1
```

### 3. Run Backend
```bash
npm run dev
```
Server runs on: `http://localhost:5000`

---

## API Endpoints Overview

| Feature | Method | Endpoint | Purpose |
|---------|--------|----------|---------|
| **Vendors** | GET | `/api/vendors` | List all vendors |
| | POST | `/api/vendors` | Create vendor |
| | GET | `/api/vendors/{id}` | Get vendor details |
| | PUT | `/api/vendors/{id}` | Update vendor |
| | DELETE | `/api/vendors/{id}` | Delete vendor |
| **RFPs** | GET | `/api/rfps` | List all RFPs |
| | POST | `/api/rfps` | Create RFP |
| | GET | `/api/rfps/{id}` | Get RFP details |
| | PUT | `/api/rfps/{id}` | Update RFP |
| | POST | `/api/rfps/{id}/send` | Send RFP to vendors |
| | GET | `/api/rfps/{id}/recommendation` | Get vendor recommendation |
| **Proposals** | POST | `/api/proposals` | Create/analyze proposal |

---

## 1. VENDORS API

### 1.1 Get All Vendors

**Curl:**
```bash
curl -X GET http://localhost:5000/api/vendors \
  -H "Content-Type: application/json"
```

**Postman:**
```
GET http://{{baseUrl}}/api/vendors
```

**Response:**
```json
{
  "vendors": [
    {
      "id": 1,
      "name": "Acme Systems Inc",
      "email": "sales@acme.com",
      "description": "Leading enterprise software provider",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "TechCorp Solutions",
      "email": "contact@techcorp.com",
      "description": null,
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

### 1.2 Create New Vendor

**Curl:**
```bash
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Systems Inc",
    "email": "sales@acme.com",
    "description": "Leading enterprise software provider with 15+ years experience"
  }'
```

**Postman:**
```
POST http://{{baseUrl}}/api/vendors
Content-Type: application/json

{
  "name": "Acme Systems Inc",
  "email": "sales@acme.com",
  "description": "Leading enterprise software provider"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Acme Systems Inc",
  "email": "sales@acme.com",
  "description": "Leading enterprise software provider",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Test Data - Create 3 Vendors:**

**Vendor 1:**
```json
{
  "name": "Acme Systems Inc",
  "email": "sales@acme.com",
  "description": "Enterprise CRM solutions with 150+ implementations"
}
```

**Vendor 2:**
```json
{
  "name": "TechCorp Solutions",
  "email": "contact@techcorp.com",
  "description": "Cloud infrastructure and custom development"
}
```

**Vendor 3:**
```json
{
  "name": "GlobalSoft Technologies",
  "email": "hello@globalsoft.com",
  "description": "Enterprise software and consulting services"
}
```

---

### 1.3 Get Vendor Details

**Curl:**
```bash
curl -X GET http://localhost:5000/api/vendors/1 \
  -H "Content-Type: application/json"
```

**Postman:**
```
GET http://{{baseUrl}}/api/vendors/{{vendorId}}
```

**Response:**
```json
{
  "id": 1,
  "name": "Acme Systems Inc",
  "email": "sales@acme.com",
  "description": "Leading enterprise software provider",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 1.4 Update Vendor

**Curl:**
```bash
curl -X PUT http://localhost:5000/api/vendors/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Systems Inc",
    "email": "sales@acme.com",
    "description": "Updated description"
  }'
```

**Postman:**
```
PUT http://{{baseUrl}}/api/vendors/1
Content-Type: application/json

{
  "name": "Acme Systems Inc",
  "email": "sales@acme.com",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Acme Systems Inc",
  "email": "sales@acme.com",
  "description": "Updated description",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 1.5 Delete Vendor

**Curl:**
```bash
curl -X DELETE http://localhost:5000/api/vendors/1 \
  -H "Content-Type: application/json"
```

**Postman:**
```
DELETE http://{{baseUrl}}/api/vendors/1
```

**Response (204 No Content):**
Empty response on success

---

## 2. RFP API

### 2.1 Get All RFPs

**Curl:**
```bash
curl -X GET http://localhost:5000/api/rfps \
  -H "Content-Type: application/json"
```

**Postman:**
```
GET http://{{baseUrl}}/api/rfps
```

**Response:**
```json
{
  "rfps": [
    {
      "id": 1,
      "title": "Cloud-Based CRM System",
      "rawRequirements": "We need a new customer relationship management system...",
      "structuredRequirements": {
        "title": "Enterprise CRM Platform",
        "summary": "Cloud-based CRM solution for 1000+ contacts",
        "deliverables": ["CRM platform", "Mobile apps", "API"],
        "timeline": "6 months",
        "budget": "$50,000-100,000",
        "constraints": ["99.9% uptime", "Salesforce integration"],
        "successCriteria": ["On-time delivery", "Performance targets"]
      },
      "status": "draft",
      "createdAt": "2024-01-15T10:45:00Z"
    }
  ]
}
```

---

### 2.2 Create RFP

**Curl:**
```bash
curl -X POST http://localhost:5000/api/rfps \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cloud-Based CRM System",
    "rawRequirements": "We need a new customer relationship management system with support for 1000+ contacts, Salesforce integration, and real-time reporting dashboard.",
    "structuredRequirements": {
      "title": "Enterprise CRM Platform",
      "summary": "Cloud-based CRM solution for 1000+ contacts",
      "deliverables": ["CRM platform", "Mobile apps", "API"],
      "timeline": "6 months",
      "budget": "$50,000-100,000",
      "constraints": ["99.9% uptime", "Salesforce integration"],
      "successCriteria": ["On-time delivery", "Performance targets"]
    },
    "status": "draft"
  }'
```

**Postman:**
```
POST http://{{baseUrl}}/api/rfps
Content-Type: application/json

{
  "title": "Cloud-Based CRM System",
  "rawRequirements": "We need a new customer relationship management system with support for 1000+ contacts, Salesforce integration, and real-time reporting dashboard.",
  "structuredRequirements": {
    "title": "Enterprise CRM Platform",
    "summary": "Cloud-based CRM solution for 1000+ contacts",
    "deliverables": ["CRM platform", "Mobile apps", "API"],
    "timeline": "6 months",
    "budget": "$50,000-100,000",
    "constraints": ["99.9% uptime", "Salesforce integration"],
    "successCriteria": ["On-time delivery", "Performance targets"]
  },
  "status": "draft"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Cloud-Based CRM System",
  "rawRequirements": "We need a new customer relationship management system...",
  "structuredRequirements": {...},
  "status": "draft",
  "createdAt": "2024-01-15T10:45:00Z"
}
```

**Test Data - Create Sample RFP:**
```json
{
  "title": "Enterprise QA Testing Services",
  "rawRequirements": "We need comprehensive QA testing services including automated testing, manual testing, performance testing, and test automation framework setup. Must support both web and mobile applications. Need 24/7 support during implementation.",
  "structuredRequirements": {
    "title": "Enterprise QA Testing Services",
    "summary": "Comprehensive QA testing services with automation framework for enterprise platform",
    "deliverables": ["Test automation framework", "Manual test cases", "Performance testing", "Mobile testing coverage"],
    "timeline": "3 months",
    "budget": "$30,000-50,000",
    "constraints": ["24/7 support", "Agile methodology", "Weekly reporting"],
    "successCriteria": ["90%+ test coverage", "Zero critical defects", "Performance targets met"]
  },
  "status": "draft"
}
```

---

### 2.3 Get RFP Details

**Curl:**
```bash
curl -X GET http://localhost:5000/api/rfps/1 \
  -H "Content-Type: application/json"
```

**Postman:**
```
GET http://{{baseUrl}}/api/rfps/{{rfpId}}
```

**Response:**
```json
{
  "id": 1,
  "title": "Cloud-Based CRM System",
  "rawRequirements": "...",
  "structuredRequirements": {...},
  "status": "draft",
  "createdAt": "2024-01-15T10:45:00Z",
  "proposals": [
    {
      "id": 1,
      "vendorId": 1,
      "vendorName": "Acme Systems Inc",
      "score": 85,
      "analysis": "Strong fit with excellent implementation experience",
      "structuredResponse": {...}
    }
  ]
}
```

---

### 2.4 Update RFP

**Curl:**
```bash
curl -X PUT http://localhost:5000/api/rfps/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "sent"
  }'
```

**Postman:**
```
PUT http://{{baseUrl}}/api/rfps/1
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "sent"
}
```

---

### 2.5 Send RFP to Vendors

**Curl:**
```bash
curl -X POST http://localhost:5000/api/rfps/1/send \
  -H "Content-Type: application/json" \
  -d '{
    "vendorIds": [1, 2, 3]
  }'
```

**Postman:**
```
POST http://{{baseUrl}}/api/rfps/{{rfpId}}/send
Content-Type: application/json

{
  "vendorIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "RFP sent to 3 vendors",
  "proposalsCreated": 3,
  "status": "sent"
}
```

**Process:**
1. First create vendors (see Vendor API section)
2. Get their IDs
3. Use those IDs in vendorIds array
4. System sends email to each vendor
5. RFP status changes to "sent"
6. Proposal records created in database

---

### 2.6 Get Vendor Recommendation

**Curl:**
```bash
curl -X GET http://localhost:5000/api/rfps/1/recommendation \
  -H "Content-Type: application/json"
```

**Postman:**
```
GET http://{{baseUrl}}/api/rfps/{{rfpId}}/recommendation
```

**Response:**
```json
{
  "recommendation": "Acme Systems Inc",
  "reasoning": "Acme Systems is the recommended choice because they offer the best balance of capability, cost, and timeline. They score highest (85/100) with proven implementation experience. While TechCorp and GlobalSoft also provide good solutions, Acme's shorter timeline (2 months vs 3-4), lower total cost ($45K vs $52-58K), and superior feature set make them the optimal choice."
}
```

**Note:** Requires proposals to be analyzed first (see Proposals API)

---

## 3. PROPOSALS API

### 3.1 Create and Analyze Proposal

**Curl:**
```bash
curl -X POST http://localhost:5000/api/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "rfpId": 1,
    "vendorId": 1,
    "rawResponse": "Thank you for the RFP opportunity. Acme Systems is pleased to propose our Enterprise CRM Platform. We have 150+ successful implementations..."
  }'
```

**Postman:**
```
POST http://{{baseUrl}}/api/proposals
Content-Type: application/json

{
  "rfpId": 1,
  "vendorId": 1,
  "rawResponse": "Thank you for the RFP opportunity..."
}
```

**Response (with AI Analysis):**
```json
{
  "id": 1,
  "rfpId": 1,
  "vendorId": 1,
  "vendorName": "Acme Systems Inc",
  "score": 85,
  "analysis": "Strong fit with excellent implementation experience",
  "structuredResponse": {
    "matches": [
      "99.95% uptime SLA exceeds requirement",
      "Unlimited contacts capability",
      "Salesforce integration included"
    ],
    "gaps": [
      "No mention of AI-powered lead scoring"
    ],
    "proposed_timeline": "9 weeks",
    "proposed_budget": "$45,000 setup + $60,000/year",
    "strengths": [
      "Experienced vendor with 150+ implementations",
      "Comprehensive feature set",
      "24/7 support included"
    ],
    "weaknesses": [
      "Annual costs slightly high",
      "Limited customization flexibility"
    ]
  },
  "createdAt": "2024-01-15T11:00:00Z"
}
```

**Test Data - Create Sample Proposals:**

**Proposal 1 (Acme Systems - High Score):**
```json
{
  "rfpId": 1,
  "vendorId": 1,
  "rawResponse": "Thank you for the RFP opportunity. Acme Systems is pleased to propose our Enterprise CRM Platform. We have successfully implemented 150+ CRM systems for Fortune 500 companies. Our solution includes: Cloud-hosted on AWS with 99.95% SLA, Supports unlimited contacts with advanced segmentation, Native Salesforce sync with real-time data, Dashboards with 200+ pre-built reports, Custom fields with drag-and-drop UI, iOS and Android apps with offline capability, Dedicated account manager and 24/7 support. Implementation Timeline: Week 1-2 Discovery, Week 3-6 Configuration, Week 7-8 Testing, Week 9 Deployment. Total: 9 weeks. Pricing: $15,000 setup + $5,000/month (5 users) + $200/month per additional user. Total First Year: $45,000. Annual recurring: $60,000."
}
```

**Proposal 2 (TechCorp - Medium Score):**
```json
{
  "rfpId": 1,
  "vendorId": 2,
  "rawResponse": "TechCorp Solutions is excited to submit our proposal for your CRM platform needs. Our cloud-based solution offers excellent customization and flexibility. Features: 99.9% uptime SLA, Supports up to 5000 contacts, Salesforce integration available, Custom reporting engine, Advanced API for integrations, Web and mobile apps. Implementation: 12 weeks with weekly check-ins. Our team of 5 CRM specialists will work with you throughout. We focus on customization to meet your exact needs. Pricing: $18,000 implementation + $5,500/month support and maintenance. Year 1 Total: $52,000. We have completed 80+ implementations."
}
```

**Proposal 3 (GlobalSoft - Lower Score):**
```json
{
  "rfpId": 1,
  "vendorId": 3,
  "rawResponse": "GlobalSoft Technologies proposes our CRM solution for your enterprise. We offer a flexible platform with options to fit your budget. Features: 99.5% uptime guarantee, Contact management for 1000+ users, Salesforce compatible, Basic reporting dashboards, API available, Mobile web interface. Timeline: 16 weeks for full implementation and training. Pricing: $12,000 setup + $4,800/month ongoing. Optional: Additional features available at extra cost. We have 40+ CRM implementations."
}
```

---

### 3.2 API Response Examples

**Success Response:**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "proposal": {
      "id": 1,
      "rfpId": 1,
      "vendorId": 1,
      "score": 85,
      "analysis": "Strong proposal",
      "structuredResponse": {...}
    }
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "code": 400,
  "message": "Invalid request data",
  "details": "vendorId is required"
}
```

---

## Complete Testing Workflow

### Step 1: Create Vendors
```bash
# Create 3 vendors
POST /api/vendors (Acme Systems)
POST /api/vendors (TechCorp)
POST /api/vendors (GlobalSoft)

# Note the IDs returned (1, 2, 3)
```

### Step 2: Create RFP
```bash
# Create RFP
POST /api/rfps
# Note the ID returned (1)
```

### Step 3: Send RFP
```bash
# Send to all 3 vendors
POST /api/rfps/1/send
Body: { "vendorIds": [1, 2, 3] }
```

### Step 4: Create Proposals
```bash
# Proposal from Vendor 1 (Acme)
POST /api/proposals
Body: { "rfpId": 1, "vendorId": 1, "rawResponse": "..." }

# Proposal from Vendor 2 (TechCorp)
POST /api/proposals
Body: { "rfpId": 1, "vendorId": 2, "rawResponse": "..." }

# Proposal from Vendor 3 (GlobalSoft)
POST /api/proposals
Body: { "rfpId": 1, "vendorId": 3, "rawResponse": "..." }
```

### Step 5: Get Recommendation
```bash
# Get AI-powered recommendation
GET /api/rfps/1/recommendation
```

---

## Error Handling

### Common Errors & Solutions

**Error: 400 Bad Request**
```json
{
  "error": "Invalid request data",
  "details": "vendorId is required"
}
```
**Solution:** Check all required fields are present and correct format

**Error: 404 Not Found**
```json
{
  "error": "Resource not found",
  "resource": "RFP",
  "id": 999
}
```
**Solution:** Check ID exists. Use GET endpoints to find valid IDs

**Error: 500 Internal Server Error**
```json
{
  "error": "Failed to generate AI analysis",
  "message": "OPENROUTER_API_KEY is not set"
}
```
**Solution:** Check .env file has OPENROUTER_API_KEY configured

**Error: Database errors**
```
Error: SQLITE_CANTOPEN
```
**Solution:** Ensure DATABASE_URL points to valid location and directory is writable

---

## Performance Tips

1. **First AI Call:** Takes 3-5 seconds (OpenRouter cold start)
2. **Subsequent Calls:** Faster (1-2 seconds)
3. **Large Proposals:** If proposal text >5000 chars, may take longer
4. **Concurrent Requests:** Don't hammer API, allow 1-2 seconds between requests

---

## Postman Collection JSON

Save this as `RFP-API.postman_collection.json` and import into Postman:

```json
{
  "info": {
    "name": "RFP Management System API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Vendors",
      "item": [
        {
          "name": "Get All Vendors",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/vendors"
          }
        },
        {
          "name": "Create Vendor",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/vendors",
            "body": {
              "mode": "raw",
              "raw": "{\"name\": \"Acme Systems Inc\", \"email\": \"sales@acme.com\"}"
            }
          }
        }
      ]
    },
    {
      "name": "RFPs",
      "item": [
        {
          "name": "Get All RFPs",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/rfps"
          }
        },
        {
          "name": "Create RFP",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/rfps"
          }
        }
      ]
    },
    {
      "name": "Proposals",
      "item": [
        {
          "name": "Create & Analyze Proposal",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/proposals"
          }
        }
      ]
    }
  ]
}
```

---

## Summary

**Total 11 API Endpoints:**
- 5 Vendor endpoints (CRUD)
- 6 RFP endpoints (CRUD + Send + Recommendation)
- 1 Proposal endpoint (Create + AI Analysis)

**All endpoints tested and working with:**
- ✅ SQLite database
- ✅ OpenRouter AI integration
- ✅ Full request/response examples
- ✅ Test data provided
- ✅ Error handling documented

**Ready for production testing!**
