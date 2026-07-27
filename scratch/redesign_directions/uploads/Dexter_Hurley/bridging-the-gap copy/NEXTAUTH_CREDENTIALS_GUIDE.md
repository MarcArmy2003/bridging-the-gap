# NextAuth Setup Guide - Credentials Authentication

## Overview
This guide covers setting up NextAuth with credentials-based authentication (email + password) in the `btg-backend` project.

## Prerequisites
✅ Next.js 14+ project created
✅ Dependencies installed: `next-auth`, `@prisma/client`, `bcryptjs`, `prisma`
✅ Prisma database connected

## File Structure for Backend

```
btg-backend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          ← NextAuth API route (created next)
│   └── (routes)/
│       └── auth/
│           ├── login/
│           │   └── page.tsx          ← Login UI (not covered here)
│           └── error/
│               └── page.tsx          ← Error UI (not covered here)
│
├── lib/
│   ├── auth-options.ts               ← NextAuth config (credentials provider)
│   ├── auth-middleware.ts            ← Session/role checking
│   ├── auth-helpers.ts               ← FERPA permission functions
│   └── prisma.ts                     ← Prisma client
│
├── prisma/
│   └── schema.prisma                 ← Database models
│
├── scripts/
│   └── seed.ts                       ← Test data seeding
│
└── .env.local                        ← Environment variables
```

## Step 1: Create NextAuth API Route

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

This route automatically handles:
- `/api/auth/signin` (login form)
- `/api/auth/callback/credentials` (credentials provider callback)
- `/api/auth/session` (check current session)
- `/api/auth/signout` (logout)

## Step 2: Configure Environment Variables

**File:** `.env.local`

```env
# Database connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/btg_database"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Node environment
NODE_ENV="development"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Step 3: Create Prisma Migration

```bash
npx prisma migrate dev --name init
```

This creates tables for:
- `User` (email, hashed password, role, district_id)
- `Student` (FERPA protected)
- `Guardianship` (parent-student relationships)
- `Case` (incident reports)
- `CaseStudent`, `CaseAssignment` (junction tables)
- `AuditLog` (FERPA compliance tracking)

## Step 4: Seed Test Data

```bash
npm install -D ts-node @types/node

npx ts-node scripts/seed.ts
```

This creates:
- Parent A (can see Student A, Case A)
- Parent B (can see Student B, Case B)
- Counselor (can manage cases)
- Students A & B
- Verified guardianships
- Test cases

## Step 5: Create Parent API Routes

### 1. Login (NextAuth Automatic)
```
POST /api/auth/signin
Body: { email, password }
```

### 2. Get My Students (FERPA Isolated)
```
GET /api/parent/students
Headers: Authorization: Bearer <session_token>
Response: { students: [...] }
```

### 3. Get Single Student (FERPA Check)
```
GET /api/parent/students/[studentId]
Response: { student: {...} }
```

### 4. Get My Cases
```
GET /api/parent/cases
Response: { cases: [...] }
```

### 5. Get Single Case (FERPA Check)
```
GET /api/parent/cases/[caseId]
Response: { case: {...} }
```

## Testing FERPA Isolation

Use the provided test credentials:

**Test 1: Parent A can see own student**
```bash
curl -X GET http://localhost:3000/api/parent/students/[studentAId] \
  -H "Cookie: next-auth.session-token=<tokenA>"

# ✅ Returns: { "student": {...} }
```

**Test 2: Parent A CANNOT see other parent's student**
```bash
curl -X GET http://localhost:3000/api/parent/students/[studentBId] \
  -H "Cookie: next-auth.session-token=<tokenA>"

# ❌ Returns: { "error": "Access denied" } (403)
```

**Test 3: Audit trail is logged**
```bash
# In database, check AuditLog table:
SELECT * FROM "AuditLog" WHERE user_id = '<parentAId>';
```

## Credentials Provider Flow

1. **User submits form** → `POST /api/auth/signin`
2. **NextAuth calls `authorize()`** → Finds user in DB, checks password hash
3. **JWT created** → Contains `id`, `role`, `district_id`
4. **Session cookie set** → `next-auth.session-token`
5. **User makes API call** → Cookie sent automatically
6. **Server validates JWT** → Checks role, district, FERPA access

## Password Hashing

All passwords hashed with bcryptjs before storage:

```typescript
const hashedPassword = await bcryptjs.hash(plainPassword, 10);
await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role: "PARENT",
    district_id,
  },
});
```

## Common Issues

### "Cannot find module 'next-auth'"
```bash
npm install next-auth @prisma/client bcryptjs
npm install -D prisma
```

### "DATABASE_URL not set"
Check `.env.local` exists and has valid PostgreSQL connection string.

### "No matching user found"
Ensure seed script was run: `npx ts-node scripts/seed.ts`

### "Invalid password"
Test credentials from seed script:
- Parent A: `password123`
- Parent B: `password456`

## Next Steps

After credentials auth is working:
1. ✅ Test FERPA isolation with different parent accounts
2. ✅ Test audit trail logging
3. ✅ Add login UI form (React component)
4. ✅ Add error handling/display pages
5. Later: Add SSO providers (Google, Microsoft, District SSO)

## Database Models Summary

### User
- `id` (CUID)
- `email` (unique)
- `password` (hashed bcryptjs)
- `name`
- `role` (PARENT | COUNSELOR | ADMIN)
- `district_id`
- `is_active` (can disable account)

### Student
- `id`
- `first_name`, `last_name`
- `grade`
- `district_id`
- FERPA: Only visible to verified parents

### Guardianship
- Links parent → student
- Status: PENDING | VERIFIED | REVOKED
- FERPA foundation

### Case
- `title`, `description`
- `severity`, `status`
- `district_id`
- Students assigned via `CaseStudent`

### AuditLog
- Every view/modify logged
- FERPA compliance trail
- Indexes for fast queries

## Security Checklist

✅ Passwords hashed with bcryptjs
✅ JWT signed with `NEXTAUTH_SECRET`
✅ Session strategy: JWT (stateless)
✅ FERPA checks at API layer
✅ Audit logging every access
✅ Account disabling support
✅ Role-based access control
✅ District isolation (district_id field)

## Production Deployment

Before going live:
1. Set strong `NEXTAUTH_SECRET`
2. Use production PostgreSQL (not local)
3. Enable HTTPS (`NEXTAUTH_URL="https://..."`)
4. Review and enhance FERPA checks
5. Set up email notifications (parent alerts)
6. Test multi-district isolation
7. Deploy with environment variables in CI/CD
