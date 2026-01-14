# RFP Management System - Setup Guide

This is a complete AI-powered RFP Management System demonstrating full-stack development with OpenAI integration.

## Architecture Overview

### Backend (Node.js + Express)
- **Routes** (`server/routes.ts`): REST API endpoints for RFPs, vendors, proposals
- **AI Service** (`server/aiService.ts`): OpenAI integration for generating and analyzing RFPs
- **Email Service** (`server/emailService.ts`): Nodemailer for sending RFPs and receiving proposals
- **Storage** (`server/storage.ts`): Database abstraction layer
- **Database** (`server/db.ts`): PostgreSQL via Drizzle ORM

### Frontend (React + Vite)
- **Pages**: Dashboard, CreateRfp, RfpDetails, VendorList, RfpList
- **Hooks**: Custom React Query hooks for data fetching
- **UI Components**: Shadcn UI component library

### Shared
- **Schema** (`shared/schema.ts`): Zod schemas and database models
- **Routes** (`shared/routes.ts`): Type-safe API contract definitions

## Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- SMTP credentials (for email, optional for demo)

## Environment Setup

### 1. Database Setup

Create a PostgreSQL database and set the connection string:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/rfp_system"
```

Then push the schema:

```bash
npm run db:push
```

### 2. OpenAI Configuration

Set your OpenAI API key:

```bash
export OPENAI_API_KEY="sk-..."
```

### 3. Email Configuration (Optional)

For sending actual emails, configure SMTP:

```bash
export EMAIL_SMTP_HOST="smtp.gmail.com"
export EMAIL_SMTP_PORT="587"
export EMAIL_SMTP_USER="your-email@gmail.com"
export EMAIL_SMTP_PASS="your-app-password"
export EMAIL_FROM="noreply@rfp-system.local"
```

If not configured, emails will be logged to console only.

## Running the System

### Development

```bash
npm run dev
```

This starts both the backend server (http://localhost:5000) and frontend dev server (http://localhost:3000).

### Production

```bash
npm run build
npm run start
```

## API Endpoints

### Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create new vendor

### RFPs
- `GET /api/rfps` - List all RFPs
- `GET /api/rfps/:id` - Get single RFP
- `POST /api/rfps` - Create new RFP
- `PUT /api/rfps/:id` - Update RFP
- `POST /api/rfps/generate` - AI: Generate structured RFP from raw requirements
- `POST /api/rfps/:id/send` - Send RFP to selected vendors

### Proposals
- `GET /api/rfps/:id/proposals` - List proposals for an RFP
- `GET /api/rfps/:id/recommendation` - AI: Generate vendor recommendation

### Webhooks
- `POST /api/webhooks/email` - Receive inbound vendor proposal email

## Demo Flow

### 1. Create a Vendor

Send POST to `/api/vendors`:
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "description": "IT Services Provider"
}
```

### 2. Create an RFP

Send POST to `/api/rfps`:
```json
{
  "title": "Enterprise CRM System",
  "rawRequirements": "We need a cloud-based CRM that integrates with Slack, supports 500 concurrent users, has mobile apps, and includes AI-powered analytics.",
  "status": "draft"
}
```

### 3. Generate Structured RFP

Send POST to `/api/rfps/generate`:
```json
{
  "rawRequirements": "We need a cloud-based CRM that integrates with Slack, supports 500 concurrent users, has mobile apps, and includes AI-powered analytics."
}
```

The AI will structure it into:
- Title
- Summary
- Deliverables
- Timeline
- Budget
- Constraints
- Success Criteria

### 4. Send RFP to Vendors

Send POST to `/api/rfps/:id/send`:
```json
{
  "vendorIds": [1, 2, 3]
}
```

Vendors receive an email with the RFP details.

### 5. Receive Vendor Proposals

Send POST to `/api/webhooks/email`:
```json
{
  "from": "contact@acme.com",
  "subject": "RE: RFP #1",
  "body": "Our proposal includes... [vendor's full proposal text]"
}
```

The AI will analyze the proposal and assign a score.

### 6. Get AI Recommendation

Send GET to `/api/rfps/:id/recommendation`

The AI compares all proposals and recommends the best vendor based on:
- Requirement completeness
- Price/timeline
- Vendor strengths and weaknesses

## Data Flow

```
User Input
   ↓
Frontend Form
   ↓
API Request
   ↓
Backend Route
   ↓
AI Service (if needed)
   ↓
Database Storage
   ↓
Response to Frontend
   ↓
UI Update
```

## Key Features

### AI Integration
- **RFP Generation**: Converts natural language requirements into structured JSON
- **Proposal Analysis**: Analyzes vendor proposals and assigns scores based on requirement alignment
- **Recommendation Engine**: Compares all vendors and recommends the best option with reasoning

### Email Integration
- **RFP Distribution**: Sends RFP via email with formatted HTML
- **Response Ingestion**: Receives vendor proposals via webhook/API
- **Email Parsing**: Extracts vendor information and proposal content

### Database Design
- **Vendors**: Contact information for bidding vendors
- **RFPs**: Request for proposals with both raw text and AI-structured data
- **Proposals**: Vendor responses with AI-assigned scores and analysis

## Error Handling

All API endpoints include comprehensive error handling:
- Request validation via Zod schemas
- Graceful error messages
- HTTP status codes follow REST conventions
- Try/catch blocks with logging

## Code Quality

- **TypeScript**: Full type safety across frontend and backend
- **Component Separation**: Clean separation of concerns
- **Reusable Hooks**: Custom React Query hooks for data management
- **UI Components**: Shadcn UI for consistent, accessible interface
- **Error Logging**: Console logs for debugging

## Testing the System

### Via Frontend UI
1. Start the dev server
2. Navigate to http://localhost:3000
3. Use the UI to:
   - Add vendors
   - Create RFPs
   - Send to vendors
   - View proposals
   - Get recommendations

### Via API (cURL)

```bash
# Create vendor
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Vendor","email":"test@vendor.com","description":"A test vendor"}'

# Create RFP
curl -X POST http://localhost:5000/api/rfps \
  -H "Content-Type: application/json" \
  -d '{"title":"Test RFP","rawRequirements":"We need...","status":"draft"}'

# Generate structured RFP
curl -X POST http://localhost:5000/api/rfps/generate \
  -H "Content-Type: application/json" \
  -d '{"rawRequirements":"We need a CRM system..."}'
```

## Troubleshooting

### OpenAI Errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API usage and rate limits on https://platform.openai.com
- Ensure model exists (gpt-4o)

### Database Errors
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Run `npm run db:push` to create tables

### Email Errors
- Without SMTP config, emails are logged to console
- To send real emails, configure SMTP environment variables
- Check SMTP credentials are correct

## Project Structure

```
├── client/                    # Frontend
│   ├── src/
│   │   ├── pages/            # React page components
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React Query hooks
│   │   └── lib/              # Utilities
│   └── index.html
├── server/                    # Backend
│   ├── routes.ts             # API endpoints
│   ├── aiService.ts          # OpenAI integration
│   ├── emailService.ts       # Email (Nodemailer)
│   ├── storage.ts            # Database layer
│   ├── db.ts                 # Drizzle ORM config
│   └── index.ts              # Express app setup
├── shared/                    # Shared between frontend and backend
│   ├── schema.ts             # Database schemas & Zod types
│   └── routes.ts             # Type-safe API contracts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Next Steps

To extend the system:

1. **Authentication**: Add user accounts with Passport
2. **Real-time Updates**: Add WebSocket support for proposal notifications
3. **Email Webhooks**: Integrate with email service webhooks (Gmail, SendGrid)
4. **Multiple RFP Versions**: Support versioning and amendments
5. **Attachments**: Support document uploads with RFPs
6. **Calendar Integration**: Auto-sync deadlines with calendar apps
7. **Analytics Dashboard**: Track RFP success rates and vendor performance

## Support

For issues or questions, check:
- Backend logs in terminal running `npm run dev`
- Browser console for frontend errors
- Database logs if using local PostgreSQL

