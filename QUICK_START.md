# RFP Management System - Quick Start Guide

## 🚀 Fast Setup (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- npm installed
- OpenRouter API key (free credits available)

### 1. Get API Key (1 min)
1. Visit https://openrouter.ai/keys
2. Sign up / Log in
3. Copy your API key (starts with `sk-or-`)

### 2. Setup Project (2 min)
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API key
# Change this line:
# OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE
```

Or quick setup with one command:
```bash
echo "OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE" >> .env
```

### 3. Install & Run (2 min)
```bash
# Install dependencies
npm install

# Start backend (Terminal 1)
npm run dev

# Start frontend (Terminal 2, in client directory or separate terminal)
npm run dev
```

**Backend starts at:** `http://localhost:5000`
**Frontend at:** `http://localhost:5173`

---

## ✅ Quick Test Checklist

After setup, verify everything works:

- [ ] Backend running (check console for "Listening on http://localhost:5000")
- [ ] Frontend running (visit http://localhost:5173)
- [ ] Can see main dashboard
- [ ] Can navigate to "Create RFP" page

---

## 📚 Complete Guides

### Feature Usage Guide
See **`FEATURE_USAGE_GUIDE.md`** for:
- How to create RFPs with AI structuring
- How to manage vendors
- How to send RFPs to vendors
- How to receive and analyze proposals
- How to get vendor recommendations

### API Testing Guide
See **`POSTMAN_API_GUIDE.md`** for:
- All 11 API endpoints
- Curl command examples
- Postman request templates
- Sample test data
- Error handling

---

## 🔑 API Key Setup Details

### Option A: Free OpenRouter Credits
```bash
# Get key: https://openrouter.ai/keys
# Sign up and receive free trial credits
# Update .env:
OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE
```

### Option B: Use Different Model
OpenRouter supports multiple models. Edit `server/aiService.ts` line 24:

Default (cheapest):
```typescript
"openai/gpt-3.5-turbo"
```

Other options:
```typescript
"openai/gpt-4-turbo"           // More powerful
"anthropic/claude-3-sonnet"    // Claude model
"meta-llama/llama-2-70b"       // Open source
```

---

## 📁 Project Structure

```
RFP-Pilot/
├── client/                    # React frontend
│   └── src/
│       ├── pages/            # 7 main pages
│       ├── components/       # UI components
│       └── hooks/            # React hooks for API
│
├── server/                    # Express backend
│   ├── aiService.ts          # OpenRouter AI integration
│   ├── emailService.ts       # Nodemailer
│   ├── routes.ts             # 11 API endpoints
│   ├── db.ts                 # SQLite database config
│   └── index.ts              # Server startup
│
├── shared/                    # Type definitions
│   ├── schema.ts             # Database schema
│   └── routes.ts             # API contracts
│
├── rfp.db                     # SQLite database (auto-created)
├── .env                       # Configuration (create from .env.example)
├── FEATURE_USAGE_GUIDE.md    # Step-by-step feature guide
└── POSTMAN_API_GUIDE.md      # API endpoint documentation
```

---

## 🧪 Test All 5 Features

### Feature 1: Create RFP
1. Go to http://localhost:5173/rfp/create
2. Paste requirements in text area
3. Click "Generate Structured RFP"
4. Watch AI convert text to JSON structure

### Feature 2: Manage Vendors
1. Go to http://localhost:5173/vendors
2. Click "Add Vendor"
3. Enter: Name, Email, Description
4. Click "Save"
5. Repeat to create 2-3 vendors

### Feature 3: Send RFPs
1. Go to RFP List: http://localhost:5173/rfps
2. Click on your RFP
3. Select vendors to send to
4. Click "Send RFP"
5. See status change to "sent"

### Feature 4: Receive Proposals
1. In RFP details, find "Proposals" section
2. Click "Add Proposal"
3. Select a vendor from dropdown
4. Paste vendor's response text
5. Click "Submit"
6. Wait for AI analysis (scores and recommendations)

### Feature 5: Get Recommendation
1. After creating 2-3 proposals
2. Scroll to "Vendor Comparison"
3. Click "Get Recommendation"
4. See AI pick the best vendor with reasoning

---

## 🔧 Troubleshooting

### "OPENROUTER_API_KEY is not set"
```bash
# Make sure .env file has the key
cat .env | grep OPENROUTER

# Should show: OPENROUTER_API_KEY=sk-or-...
```

### Database errors
```bash
# Delete old database and restart
rm rfp.db
npm run dev
```

### Port already in use
```bash
# If 5000 or 5173 busy, update .env:
SERVER_PORT=5001
```

### AI responses slow
- First call takes 3-5 seconds (normal)
- Check internet connection
- Verify API key is valid

---

## 📊 API Quick Reference

### Create Vendor
```bash
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{"name":"Company","email":"email@domain.com"}'
```

### Create RFP
```bash
curl -X POST http://localhost:5000/api/rfps \
  -H "Content-Type: application/json" \
  -d '{"title":"RFP Title","rawRequirements":"..."}'
```

### Send RFP to Vendors
```bash
curl -X POST http://localhost:5000/api/rfps/1/send \
  -H "Content-Type: application/json" \
  -d '{"vendorIds":[1,2,3]}'
```

### Create & Analyze Proposal
```bash
curl -X POST http://localhost:5000/api/proposals \
  -H "Content-Type: application/json" \
  -d '{"rfpId":1,"vendorId":1,"rawResponse":"..."}'
```

### Get Recommendation
```bash
curl -X GET http://localhost:5000/api/rfps/1/recommendation
```

See **POSTMAN_API_GUIDE.md** for complete API documentation.

---

## 🎯 What's Included

✅ **5 Core Features:**
1. AI-powered RFP creation and structuring
2. Vendor database management
3. Email-based RFP distribution
4. Proposal receiving and AI analysis
5. Vendor comparison and recommendations

✅ **Tech Stack:**
- React 18 + Vite (Frontend)
- Express.js + TypeScript (Backend)
- SQLite (Database - no server needed)
- OpenRouter API (AI - supports multiple models)
- Nodemailer (Email)
- Drizzle ORM (Type-safe database)

✅ **Ready to Use:**
- Full CRUD operations for vendors
- AI-powered RFP structuring
- Proposal scoring (0-100)
- Vendor recommendations
- Type-safe end-to-end

✅ **Well Documented:**
- Feature usage guide with examples
- API documentation with curl commands
- Test data provided
- Error handling documented

---

## 🚀 Next Steps

1. **Complete all 5 features** using FEATURE_USAGE_GUIDE.md
2. **Test all API endpoints** using POSTMAN_API_GUIDE.md
3. **Create demo video** showing the complete workflow
4. **Deploy to production** when ready

---

## 📞 Support

See documentation files for detailed help:
- **FEATURE_USAGE_GUIDE.md** - How to use each feature
- **POSTMAN_API_GUIDE.md** - API endpoint documentation
- **README.md** - Project overview

---

## ✨ System Ready!

All 5 features are fully implemented and tested. You can now:
1. ✅ Create RFPs with AI structuring
2. ✅ Manage vendor database
3. ✅ Send RFPs to vendors
4. ✅ Receive and analyze proposals
5. ✅ Compare vendors and get recommendations

**Start with:** `npm run dev` and visit `http://localhost:5173`
