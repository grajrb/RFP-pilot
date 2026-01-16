# RFP Management System - Complete Feature Usage Guide

## Table of Contents
1. [System Setup](#system-setup)
2. [Feature 1: Create RFP](#feature-1-create-rfp)
3. [Feature 2: Manage Vendors](#feature-2-manage-vendors)
4. [Feature 3: Send RFP to Vendors](#feature-3-send-rfp-to-vendors)
5. [Feature 4: Receive & Parse Proposals](#feature-4-receive--parse-proposals)
6. [Feature 5: Compare Vendors & Get Recommendations](#feature-5-compare-vendors--get-recommendations)
7. [Troubleshooting](#troubleshooting)

---

## System Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Copy template
cp .env.example .env

# Edit .env with your settings:
```

**.env Configuration:**
```env
# Database - SQLite (file-based, no server needed)
DATABASE_URL=./rfp.db

# AI - OpenRouter API (supports gpt-3.5-turbo, gpt-4, Claude, Llama, etc.)
# Get free credits at https://openrouter.ai
OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE

# For OpenRouter compatibility
HTTP_REFERER=http://localhost:5173

# Email (optional - for receiving proposals)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
EMAIL_FROM=noreply@rfp-system.local

# Server
SERVER_PORT=5000
NODE_ENV=development
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
npm run dev
```
Expected output:
```
[Server] Listening on http://localhost:5000
[DB] Connected to SQLite database at: ./rfp.db
```

**Terminal 2 - Frontend:**
```bash
npm run dev  # (in client folder, or separate terminal)
```

Frontend will be available at: `http://localhost:5173`

---

## Feature 1: Create RFP

**Purpose:** Convert natural language requirements into structured RFP

### Step-by-Step Guide:

1. **Open Application**
   - Navigate to `http://localhost:5173`
   - Click on "Create RFP" or navigate to `/rfps/create`

2. **Enter Requirements**
   - In the text area, paste or type your requirements in plain English
   - Example:
   ```
   We need a new customer relationship management (CRM) system.
   
   Key requirements:
   - Cloud-based with 99.9% uptime SLA
   - Support for 1000+ contacts minimum
   - Integration with Salesforce
   - Real-time reporting dashboard
   - Custom field configuration
   - Mobile app support (iOS and Android)
   
   Timeline: 3-6 months
   Budget: $50,000-100,000
   
   Must-have: API documentation, training support
   Nice-to-have: AI-powered lead scoring
   ```

3. **AI Structuring**
   - Click "Generate Structured RFP"
   - System calls OpenRouter API to convert text to JSON:
     - **Title:** Auto-generated short title
     - **Summary:** One-paragraph overview
     - **Deliverables:** List of what's needed
     - **Timeline:** Expected delivery date
     - **Budget:** Cost estimate
     - **Constraints:** Limitations and requirements
     - **Success Criteria:** How to measure success

4. **Review & Verify**
   - Check the generated structure is correct
   - Edit any fields that need adjustment
   - Status will show as "draft"

5. **Save RFP**
   - Click "Save" or "Continue"
   - RFP saved to SQLite database
   - Ready to send to vendors

### API Call (if testing via Postman):
```
POST http://localhost:5000/api/rfps
Content-Type: application/json

{
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
  "status": "draft"
}
```

---

## Feature 2: Manage Vendors

**Purpose:** Create and manage vendor database

### Step-by-Step Guide:

1. **Navigate to Vendors**
   - Click "Vendors" in main menu
   - Or go to `http://localhost:5173/vendors`

2. **Add a New Vendor**
   - Click "Add Vendor" button
   - Fill in:
     - **Name:** Vendor company name (e.g., "TechCorp Solutions")
     - **Email:** Contact email (e.g., "sales@techcorp.com")
     - **Description:** Brief company info (optional)
   
   Example:
   ```
   Name: Acme Systems Inc
   Email: procurement@acme.com
   Description: Leading enterprise software provider with 15+ years experience
   ```

3. **Save Vendor**
   - Click "Save" or "Add"
   - Vendor stored in SQLite database
   - Can now send RFPs to this vendor

4. **View All Vendors**
   - All vendors appear in a table
   - Shows: Name, Email, Created Date
   - Can edit or delete from here

5. **Vendor List Example:**
   | Name | Email | Created |
   |------|-------|---------|
   | Acme Systems | sales@acme.com | 2024-01-15 |
   | TechCorp | contact@techcorp.com | 2024-01-15 |
   | GlobalSoft | hello@globalsoft.com | 2024-01-15 |

### API Call:
```
POST http://localhost:5000/api/vendors
Content-Type: application/json

{
  "name": "Acme Systems Inc",
  "email": "procurement@acme.com",
  "description": "Leading enterprise software provider"
}
```

---

## Feature 3: Send RFP to Vendors

**Purpose:** Distribute RFP to vendors via email

### Step-by-Step Guide:

1. **Navigate to RFP Details**
   - Go to RFP List: `http://localhost:5173/rfps`
   - Click on the RFP you want to send
   - Or go to `/rfp/{id}`

2. **Select Vendors**
   - See list of all vendors in database
   - Check boxes next to vendors to send to
   - Example: Select "Acme Systems", "TechCorp", "GlobalSoft"

3. **Send RFP Email**
   - Click "Send RFP" button
   - System will:
     - Prepare email with RFP details
     - Use Nodemailer to send via SMTP
     - Create proposal records for each vendor
     - Update RFP status to "sent"

4. **Email Content Sent:**
   ```
   From: noreply@rfp-system.local
   To: sales@acme.com
   Subject: RFP: Cloud-Based CRM System
   
   Dear Acme Systems,
   
   We are issuing a Request for Proposal for the following:
   
   Title: Cloud-Based CRM System
   Summary: Cloud-based CRM solution for 1000+ contacts with mobile apps
   
   Timeline: 6 months
   Budget: $50,000-100,000
   
   Requirements:
   - 99.9% uptime SLA
   - Support 1000+ contacts
   - Salesforce integration
   - Real-time reporting
   
   Please submit your proposal by [deadline].
   
   Reply to this email with your proposal details.
   
   Best regards,
   RFP Management System
   ```

5. **Verify Status**
   - RFP status changes to "sent"
   - Proposal records created for each vendor
   - Ready to receive responses

### Note on Email Setup:
- **Without email config:** Emails logged to console (development mode)
- **With Gmail:** Use app-specific password at myaccount.google.com
- **With other providers:** Update SMTP settings in .env

### API Call:
```
POST http://localhost:5000/api/rfps/{id}/send
Content-Type: application/json

{
  "vendorIds": [1, 2, 3]
}
```

---

## Feature 4: Receive & Parse Proposals

**Purpose:** Receive vendor proposals and analyze them with AI

### Step-by-Step Guide:

### Option A: Manual Entry (for testing)

1. **Navigate to RFP Details**
   - Go to the RFP that was sent to vendors
   - Scroll to "Proposals" section

2. **Add Manual Proposal**
   - Click "Add Proposal" or similar button
   - Select vendor from dropdown
   - Paste vendor's response text

3. **Vendor Proposal Example:**
   ```
   Thank you for the RFP opportunity. Acme Systems is pleased to propose 
   our Enterprise CRM Platform.
   
   Highlights:
   - Cloud-hosted on AWS with 99.95% SLA
   - Supports unlimited contacts with advanced segmentation
   - Native Salesforce sync with real-time data
   - Dashboards with 200+ pre-built reports
   - Custom fields with drag-and-drop UI
   - iOS and Android apps with offline capability
   - Dedicated account manager and 24/7 support
   
   Implementation Timeline:
   - Week 1-2: Discovery and requirements gathering
   - Week 3-6: System configuration and customization
   - Week 7-8: Testing and quality assurance
   - Week 9: Deployment and training
   Total: 9 weeks (2 months)
   
   Pricing:
   - Setup: $15,000
   - Monthly: $5,000 (includes 5 users)
   - Additional users: $200/month each
   - Implementation: 2 months at $15,000 = $30,000
   
   Total First Year: $45,000
   Annual Cost: $60,000
   
   We have successfully implemented 150+ CRM systems.
   ```

4. **AI Analysis**
   - System calls OpenRouter API to analyze proposal
   - Generates:
     - **Score:** 0-100 rating (e.g., 85/100)
     - **Analysis:** Brief assessment
     - **Structured Response:**
       - Matches: Which requirements they address
       - Gaps: Missing or unclear items
       - Timeline: Their proposed schedule
       - Budget: Their quoted price
       - Strengths: What they do well
       - Weaknesses: Concerns or gaps

5. **Example AI Analysis Output:**
   ```json
   {
     "score": 85,
     "analysis": "Acme Systems provides excellent coverage of core requirements with strong 
                  implementation experience. Timeline is shorter than expected. Only gaps are 
                  AI lead scoring and some custom integration options.",
     "structuredResponse": {
       "matches": [
         "99.95% uptime SLA exceeds requirement",
         "Unlimited contacts capability",
         "Salesforce integration included",
         "Advanced reporting dashboard",
         "Custom field configuration",
         "Mobile apps for iOS and Android"
       ],
       "gaps": [
         "No mention of AI-powered lead scoring",
         "Limited mention of custom API development",
         "Training scope not clearly defined"
       ],
       "proposed_timeline": "9 weeks (2 months)",
       "proposed_budget": "$45,000 setup + $60,000/year ongoing",
       "strengths": [
         "Experienced vendor with 150+ implementations",
         "Comprehensive feature set exceeds requirements",
         "Strong security and reliability metrics",
         "Excellent timeline (faster than needed)",
         "Included 24/7 support"
       ],
       "weaknesses": [
         "Budget slightly above range",
         "Annual costs seem high compared to competitors",
         "Limited mention of customization flexibility"
       ]
     }
   }
   ```

### Option B: Email Integration (production)

1. **Configure Email Receiving**
   - Set up email forwarding/integration to receive proposals
   - Proposals come in as email responses

2. **Automatic Processing**
   - System parses email content
   - Extracts proposal text
   - Runs AI analysis automatically

### API Call:
```
POST http://localhost:5000/api/proposals
Content-Type: application/json

{
  "rfpId": 1,
  "vendorId": 2,
  "rawResponse": "Thank you for the RFP opportunity. Acme Systems is pleased..."
}
```

---

## Feature 5: Compare Vendors & Get Recommendations

**Purpose:** Compare all proposals and get AI-powered vendor recommendation

### Step-by-Step Guide:

1. **Navigate to RFP Comparison**
   - Go to RFP Details page
   - Scroll down to "Proposal Analysis" section
   - All proposals displayed in table format

2. **View Proposal Scores**
   - See each vendor's score out of 100
   - Example table:
   ```
   | Vendor | Score | Timeline | Budget | Status |
   |--------|-------|----------|--------|--------|
   | Acme Systems | 85 | 2 months | $45K | Analyzed |
   | TechCorp | 78 | 3 months | $52K | Analyzed |
   | GlobalSoft | 72 | 4 months | $58K | Analyzed |
   ```

3. **Get AI Recommendation**
   - Click "Get Recommendation" button
   - System calls OpenRouter API to compare all proposals
   - Considers:
     - Scores
     - Timelines
     - Budgets
     - Capabilities
     - Vendor strengths/weaknesses

4. **Example Recommendation Output:**
   ```
   Recommended Vendor: Acme Systems Inc
   
   Reasoning:
   Acme Systems is the recommended choice because they offer the best 
   balance of capability, cost, and timeline. They score highest (85/100) 
   with proven implementation experience. While TechCorp and GlobalSoft 
   also provide good solutions, Acme's shorter timeline (2 months vs 3-4), 
   lower total cost ($45K vs $52-58K), and superior feature set make them 
   the optimal choice. Their 24/7 support and existing integrations align 
   well with your infrastructure requirements.
   ```

5. **Mark RFP Status**
   - Click "Accept Recommendation"
   - Or manually select preferred vendor
   - RFP status changes to "closed"
   - Decision recorded in database

### Complete Example Workflow:

**Scenario:** Comparing 3 vendors for CRM system

**Step 1: View All Proposals**
```
Acme Systems - Score: 85/100
├─ Timeline: 9 weeks
├─ Budget: $45,000 + $60K/year
├─ Strengths: Experience, features, support
└─ Gaps: AI lead scoring

TechCorp - Score: 78/100
├─ Timeline: 12 weeks
├─ Budget: $52,000 + $72K/year
├─ Strengths: Customization, training
└─ Gaps: Slower implementation

GlobalSoft - Score: 72/100
├─ Timeline: 16 weeks
├─ Budget: $58,000 + $85K/year
├─ Strengths: Budget options, flexibility
└─ Gaps: Limited support, slower
```

**Step 2: Get Recommendation**
- AI compares all factors
- Recommends: **Acme Systems**
- Explains: Best score, lowest cost, fastest timeline

**Step 3: Finalize Decision**
- Accept recommendation
- Mark RFP as "closed"
- Begin vendor onboarding

### API Call:
```
GET http://localhost:5000/api/rfps/{id}/recommendation

Response:
{
  "recommendation": "Acme Systems Inc",
  "reasoning": "Acme Systems is the recommended choice because they offer the best..."
}
```

---

## Complete End-to-End Example

**Scenario:** Software development company issuing RFP for QA testing services

### 1. Create RFP
```
Input: "We need QA testing services for our enterprise software platform. 
Must support automated and manual testing, performance testing, and test 
automation framework setup. Need coverage for web and mobile apps."

Output:
- Title: "Enterprise QA Testing Services"
- Status: "draft"
```

### 2. Add Vendors
```
Vendor 1: TestQA Inc (testqa@company.com)
Vendor 2: QualityFirst (sales@qualityfirst.com)
Vendor 3: AutoTest Systems (contact@autotest.com)
```

### 3. Send RFPs
```
Email sent to all 3 vendors
Status changed to: "sent"
3 proposal records created in database
```

### 4. Receive Proposals
```
TestQA Inc responds:
"We offer comprehensive QA services with 10+ years experience..."

QualityFirst responds:
"Our team specializes in automated testing framework setup..."

AutoTest Systems responds:
"We provide 24/7 QA support with dedicated test engineers..."
```

### 5. AI Analysis
```
TestQA Inc: 82/100 - Good coverage, experienced team
QualityFirst: 79/100 - Strong automation focus
AutoTest Systems: 76/100 - Good support but less experience
```

### 6. Get Recommendation
```
Recommendation: TestQA Inc

Reasoning: TestQA Inc provides the best balance of experience, 
comprehensive service coverage, and competitive pricing. While 
QualityFirst excels in automation, TestQA's broader capabilities 
and proven track record make them the optimal choice.
```

### 7. Close RFP
```
Vendor selected: TestQA Inc
RFP status: "closed"
Decision recorded: Ready for onboarding
```

---

## Troubleshooting

### Issue: "OPENROUTER_API_KEY is not set"
**Solution:**
1. Copy `.env.example` to `.env`
2. Get API key from https://openrouter.ai/keys
3. Paste in `.env` as: `OPENROUTER_API_KEY=sk-or-...`
4. Restart server: `npm run dev`

### Issue: Database errors or missing rfp.db
**Solution:**
1. Ensure `DATABASE_URL=./rfp.db` in `.env`
2. SQLite will auto-create the file on first run
3. Check permissions in project directory
4. Clear and restart: Delete `rfp.db` and restart server

### Issue: AI responses are slow or incomplete
**Solution:**
- First request to OpenRouter may take 3-5 seconds (cold start)
- Ensure internet connection is stable
- Check API key is valid at openrouter.ai
- Try with gpt-3.5-turbo model (faster, cheaper)

### Issue: Email sending not working
**Solution:**
1. Check SMTP settings in `.env`
2. For Gmail: Use app-specific password (not main password)
3. Enable "Less secure app access" if needed
4. Without email config, proposals still work (logged to console)

### Issue: Frontend not communicating with backend
**Solution:**
1. Ensure backend running: `npm run dev` (should see port 5000)
2. Ensure frontend running separately
3. Check both are on correct ports (5000 backend, 5173 frontend)
4. Clear browser cache and reload

### Issue: Vendor list not showing
**Solution:**
1. Navigate to `/vendors` page
2. Click "Add Vendor" to create first vendor
3. Refresh page to see updates
4. Check browser console for errors (F12)

---

## Summary

**5 Core Features Working:**
1. ✅ Create RFP with AI structuring
2. ✅ Manage vendors in database
3. ✅ Send RFPs via email to vendors
4. ✅ Receive and analyze proposals with AI scoring
5. ✅ Compare vendors and get recommendations

**Tech Stack:**
- Frontend: React + Vite
- Backend: Express.js
- Database: SQLite (file-based)
- AI: OpenRouter API (supports multiple models)
- Email: Nodemailer SMTP

**All features fully functional and ready to test!**
