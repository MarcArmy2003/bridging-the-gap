# BTG Backend - Complete Setup & Deployment Guide

## 🎯 Overview

This guide walks through setting up the complete backend authentication system with:
- ✅ Credentials-based login (email + password)
- ✅ NextAuth integration with JWT sessions
- ✅ FERPA-compliant permission isolation
- ✅ Audit logging for compliance
- ✅ Multi-district support

## 📂 Project Structure

```
btg-backend/                          ← New backend project
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/route.ts    ← NextAuth handler
│   └── page.tsx                          ← Dashboard
│
├── lib/
│   ├── auth-options.ts                   ← NextAuth config
│   ├── auth-helpers.ts                   ← FERPA functions
│   ├── auth-middleware.ts                ← Session checking
│   └── prisma.ts                         ← DB client
│
├── prisma/
│   ├── schema.prisma                     ← DB models
│   └── migrations/
│
├── scripts/
│   └── seed.ts                           ← Test data
│
├── .env.local                            ← Environment
├── package.json
└── tsconfig.json

saving-grace-bully-free/                  ← Mobile app (unchanged)
├── app/
├── src/
├── package.json
└── README.md
```

## 🚀 Quick Start (30 minutes)

### 1. Backend Project Already Created ✅

```bash
ls -la ~/btg-backend/
# Should show: node_modules, package.json, prisma/, app/, lib/
```

### 2. Install Remaining Dependencies

```bash
cd ~/btg-backend

# NextAuth already installed, but verify
npm list next-auth prisma @prisma/client bcryptjs

# If any missing:
npm install next-auth @prisma/client bcryptjs
npm install -D prisma ts-node @types/node
```

### 3. Set Up Environment Variables

```bash
cd ~/btg-backend

cat > .env.local << 'ENV'
# Database - Choose one:
# Option A: Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/btg_database"

# Option B: Neon (free PostgreSQL cloud)
# Sign up at https://neon.tech
# DATABASE_URL="postgresql://user:password@neon.tech/neon?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

NODE_ENV="development"
ENV

# Verify .env.local created
cat .env.local
```

### 4. Set Up Database

**Option A: Local PostgreSQL** (if not installed)
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb btg_database
psql -d btg_database -c "SELECT version();"
```

**Option B: Skip local, use Neon** (recommended for simplicity)
1. Go to https://neon.tech
2. Sign up (free tier)
3. Create database
4. Copy connection string
5. Paste into `DATABASE_URL` in `.env.local`

### 5. Create Database Tables

```bash
cd ~/btg-backend

# Generate migration (creates schema in DB)
npx prisma migrate dev --name init

# You'll be prompted:
# ✔ Name of migration? ... init
# ✔ Prisma will create database
# ✔ Prisma will run migration

# Verify tables created
npx prisma studio  # Opens visual database explorer
```

### 6. Seed Test Data

```bash
cd ~/btg-backend

npx ts-node scripts/seed.ts

# Output:
# ✅ Created Parent A: parent.a@example.com
# ✅ Created Parent B: parent.b@example.com
# ✅ Created Counselor: counselor@example.com
# ✅ Created Student A: John Doe
# ✅ Created Student B: Jane Smith
# ✅ Created Guardianship: Parent A → Student A (VERIFIED)
# ✅ Created Guardianship: Parent B → Student B (VERIFIED)
# ✅ Created Case A: Bullying Incident
# ✅ Created Case B: Social Concerns
#
# 📋 Test Credentials:
# Parent A: parent.a@example.com / password123
# Parent B: parent.b@example.com / password456
# Counselor: counselor@example.com / password789
```

### 7. Start Backend Server

```bash
cd ~/btg-backend

npm run dev

# Output:
# > next dev
# ▲ Next.js 14.2.0
# - Local: http://localhost:3000
# - Environments: .env.local
# ✓ Ready in 3.2s
```

### 8. Test Login

```bash
# In another terminal:
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent.a@example.com",
    "password": "password123"
  }'

# Expected response includes session token
```

### 9. Test FERPA Isolation

```bash
# Get session token from login (save it)
TOKEN="<token_from_login>"

# Parent A can see own student
curl -X GET http://localhost:3000/api/parent/students \
  -H "Cookie: next-auth.session-token=$TOKEN"

# Result: ✅ Returns Student A (John Doe)

# Parent A CANNOT see other parent's student
# (This requires getting Student B ID from database - see test plan)

# Result: ❌ 403 Forbidden (FERPA_DENIED)
```

## 📦 File Placement Guide

All backend files should be in the NEW `btg-backend` project, NOT in the mobile app repo.

### Files Created in Mobile App Repo (FOR REFERENCE ONLY)
These are documentation/reference copies:
- [lib/auth-schema.prisma](lib/auth-schema.prisma) - Copy of Prisma schema
- [lib/auth-options.ts](lib/auth-options.ts) - Copy of NextAuth config
- [lib/auth-helpers.ts](lib/auth-helpers.ts) - Copy of FERPA helpers
- [lib/auth-middleware.ts](lib/auth-middleware.ts) - Copy of middleware
- [NEXTAUTH_CREDENTIALS_GUIDE.md](NEXTAUTH_CREDENTIALS_GUIDE.md) - Setup guide
- [NEXTAUTH_TEST_PLAN.md](NEXTAUTH_TEST_PLAN.md) - Testing procedures

### Files That MUST Be in Backend Project

```
btg-backend/
├── prisma/schema.prisma                       ← Real database schema
├── lib/
│   ├── auth-options.ts                        ← Real NextAuth config
│   ├── auth-helpers.ts                        ← Real FERPA logic
│   ├── auth-middleware.ts                     ← Real middleware
│   ├── prisma.ts                              ← Real DB client
│   └── (not .tsx - these are pure TypeScript)
├── app/api/auth/[...nextauth]/route.ts        ← NextAuth API handler
├── scripts/seed.ts                            ← Test data script
├── .env.local                                 ← Environment vars
└── package.json                               ← Backend deps
```

## 🔑 Key Files Explained

### authOptions.ts
- Credentials provider configuration
- Password verification with bcryptjs
- JWT session strategy
- Account deactivation checks

### auth-helpers.ts
- `getAuthedUser()` - Get current user from session
- `assertParentHasStudentAccess()` - FERPA check
- `assertParentHasCaseAccess()` - FERPA check
- `logAuditTrail()` - Log all access

### prisma.ts
- Singleton Prisma client
- Prevents connection pool exhaustion in dev

### schema.prisma
- User (parents, counselors, admins)
- Student (FERPA protected)
- Guardianship (parent-student relationship)
- Case (incident reports)
- AuditLog (compliance trail)

## 🧪 Testing Checklist

After setup, verify:

```bash
# ✅ Database connected
npx prisma migrate status

# ✅ Tables exist
npx prisma studio  # Check tables visually

# ✅ Test data seeded
psql -d btg_database -c "SELECT COUNT(*) FROM \"User\";"
# Should show: 3 (Parent A, Parent B, Counselor)

# ✅ Backend running
curl http://localhost:3000/api/auth/session

# ✅ Login works
curl -X POST http://localhost:3000/api/auth/signin ...

# ✅ FERPA isolation working
curl http://localhost:3000/api/parent/students \
  -H "Cookie: next-auth.session-token=..."

# ✅ Audit logging working
psql -d btg_database -c "SELECT COUNT(*) FROM \"AuditLog\";"
```

## 🚢 Deployment (Production)

### Step 1: Use Production Database

```bash
# Update .env.local for production
DATABASE_URL="postgresql://prod-user:prod-pass@prod-host:5432/btg_prod"
NEXTAUTH_URL="https://api.example.com"
NEXTAUTH_SECRET="<new-strong-secret>"
NODE_ENV="production"
```

### Step 2: Run Migrations

```bash
cd ~/btg-backend
npx prisma migrate deploy
```

### Step 3: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd ~/btg-backend
vercel

# Vercel will:
# - Build the Next.js app
# - Set environment variables from .env.local
# - Deploy to vercel.com
# - Give you a live URL
```

### Step 4: Test Production

```bash
curl -X POST https://api.example.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent.a@example.com",
    "password": "password123"
  }'
```

## 🔗 Connect Mobile App to Backend

In Expo app (.env or app.json):

```json
{
  "expo": {
    "plugins": [],
    "extra": {
      "apiUrl": "http://localhost:3000"  // dev
      // "apiUrl": "https://api.example.com"  // production
    }
  }
}
```

In mobile API calls:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function loginParent(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}
```

## 🛠️ Common Troubleshooting

### "DATABASE_URL not set"
```bash
# Verify .env.local exists
cat ~/btg-backend/.env.local

# Should show DATABASE_URL line
```

### "No such table: User"
```bash
# Tables not created yet
cd ~/btg-backend
npx prisma migrate dev --name init
```

### "Cannot find module 'next-auth'"
```bash
cd ~/btg-backend
npm install next-auth @prisma/client bcryptjs
npm install -D prisma
```

### "NEXTAUTH_SECRET not set"
```bash
# Generate new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="<generated-secret>"
```

### "Port 3000 already in use"
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using 3000:
lsof -ti:3000 | xargs kill -9
```

## 📊 Database Schema Overview

### User Table
```sql
id (CUID)
email (UNIQUE)
password (BCRYPT HASH)
name
role (PARENT | COUNSELOR | ADMIN)
district_id
is_active (can disable accounts)
created_at
updated_at
```

### Student Table (FERPA)
```sql
id (CUID)
first_name
last_name
grade
district_id
is_active
created_at
updated_at
```

### Guardianship (FERPA Foundation)
```sql
id
parent_id (FK -> User)
student_id (FK -> Student)
status (PENDING | VERIFIED | REVOKED)
verified_at
revoked_at
```

### Case
```sql
id
title
description
severity (LOW | MEDIUM | HIGH | CRITICAL)
status (OPEN | CLOSED | IN_REVIEW)
district_id
created_at
updated_at
```

### AuditLog (Compliance)
```sql
id
user_id (who did it)
action (VIEW_STUDENT, VIEW_CASE, MODIFY_CASE, etc)
resource_type (STUDENT, CASE, etc)
resource_id (what they accessed)
status (SUCCESS | DENIED)
reason (why denied)
created_at
```

## 📝 Next Steps

After basic setup working:

1. **Frontend Login Form** - Create React component for login UI
2. **Error Handling** - Add error pages for auth failures
3. **Email Notifications** - Notify parents of case updates
4. **District Admin Panel** - Manage users, verify guardianships
5. **SSO Integration** - Add Google, Microsoft, district-specific SSO
6. **Rate Limiting** - Prevent brute force attacks
7. **2FA (Optional)** - Add two-factor authentication

## 📞 Support

For questions, refer to:
- [NEXTAUTH_CREDENTIALS_GUIDE.md](NEXTAUTH_CREDENTIALS_GUIDE.md) - Architecture
- [NEXTAUTH_TEST_PLAN.md](NEXTAUTH_TEST_PLAN.md) - Testing procedures
- NextAuth docs: https://next-auth.js.org
- Prisma docs: https://www.prisma.io/docs

---

**Status:** ✅ Ready to deploy

**Backend Location:** `/Users/dexterhurley/btg-backend`  
**Mobile App Location:** `/Users/dexterhurley/saving-grace-bully-free`  
**Time to Live:** ~30 minutes
