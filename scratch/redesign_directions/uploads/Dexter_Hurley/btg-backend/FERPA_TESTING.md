# Phase 3: FERPA Isolation Testing

## Defense Layers Implemented

✅ **Layer 1: Schema Constraints**
- Foreign keys enforce referential integrity
- Unique indexes on guardianship relationships
- Cascade deletes maintain data consistency

✅ **Layer 2: Query Filtering**
- `getVisibleStudents()` - Returns only authorized students
- `getVisibleCases()` - Returns only authorized cases
- Role-based filtering in permissions.ts

✅ **Layer 3: Explicit Assertions** ← NEW
- `assertParentHasStudentAccess()` - Throws on violation
- `assertParentHasCaseAccess()` - Validates guardianship + FERPA consent
- `assertStaffHasCaseAccess()` - Enforces confidentiality rules
- `assertCanViewStudent()` - Universal student access check
- `FERPAViolationError` - Specific error type for audit trails

## Test Scenarios

### Scenario 1: Parent A Tries to Access Parent B's Student

**Setup:**
- Parent A (parent.a@example.com) has guardianship over Emma (STU001) & Liam (STU002)
- Parent B (parent.b@example.com) has guardianship over Sophia (STU003)

**Test:**
1. Login as Parent A
2. Get Sophia's ID from seed data
3. Try: `GET /api/students/{sophia-id}`

**Expected Result:**
```json
{
  "error": "Forbidden - FERPA violation prevented"
}
```

**Console Log:**
```
FERPA violation prevented: Parent {parent-a-id} does not have guardianship over student {sophia-id}
```

### Scenario 2: Parent Without FERPA Consent Tries to Access Case

**Setup:**
- Parent B has guardianship over Sophia but `ferpaConsent: false`
- Sophia has a case (Sensitive Family Matter)

**Test:**
1. Login as Parent B
2. Get Sophia's case ID
3. Try: `GET /api/cases/{case-id}`

**Expected Result:**
```json
{
  "error": "Forbidden - FERPA violation prevented"
}
```

**Console Log:**
```
FERPA violation prevented: Parent {parent-b-id} does not have FERPA consent for student in case {case-id}
```

### Scenario 3: Parent Tries to Access Confidential Case

**Setup:**
- Parent A has guardianship with FERPA consent
- Case exists with `isConfidential: true`

**Test:**
1. Login as Parent A
2. Try: `GET /api/cases/{confidential-case-id}`

**Expected Result:**
```json
{
  "error": "Forbidden - FERPA violation prevented"
}
```

**Console Log:**
```
FERPA violation prevented: Case {case-id} is confidential and cannot be accessed by parents
```

### Scenario 4: Counselor Accesses Non-Assigned Confidential Case

**Setup:**
- Counselor A assigned to confidential case
- Counselor B tries to access it

**Test:**
1. Login as Counselor (not assigned)
2. Try: `GET /api/cases/{confidential-case-id}`

**Expected Result:**
```json
{
  "error": "Forbidden - FERPA violation prevented"
}
```

**Console Log:**
```
FERPA violation prevented: Case {case-id} is confidential and not assigned to user {counselor-id}
```

### Scenario 5: Valid Access (Positive Test)

**Test:**
1. Login as Parent A
2. Try: `GET /api/students/{emma-id}`

**Expected Result:**
```json
{
  "student": {
    "id": "...",
    "firstName": "Emma",
    "lastName": "Johnson",
    "guardianships": [...]
  }
}
```

## Manual Testing Steps

### Get Student IDs from Database

```bash
# Login to see your students
GET /api/students

# Response will show student IDs
```

### Test Parent Isolation

```bash
# Login as parent.a@example.com
# Copy Emma's ID (should work)
GET /api/students/{emma-id}  ✅ 200 OK

# Copy Sophia's ID from Parent B
GET /api/students/{sophia-id}  ❌ 403 Forbidden
```

### Test Case Access

```bash
# Login as parent.a@example.com
GET /api/cases  # See non-confidential cases only

# Try accessing a confidential case
GET /api/cases/{confidential-case-id}  ❌ 403 Forbidden
```

## Audit Log Example

When violations occur, you'll see:

```
[WARN] FERPA violation prevented: Parent abc-123 does not have guardianship over student xyz-789
[WARN] FERPA violation prevented: Case def-456 is confidential and cannot be accessed by parents
```

This provides:
- Audit trail for compliance
- Clear violation reasons
- User/resource identifiers for investigation

## Enterprise Answer

**Question:** "How do you enforce FERPA separation?"

**Answer:**
> "We implement defense in depth with four layers:
> 
> 1. **Schema-level constraints** - Foreign keys and unique indexes enforce legal relationships
> 2. **Query-level filtering** - Role-based data access limits what queries return
> 3. **Explicit permission assertions** - Every sensitive endpoint validates access and throws FERPAViolationError on violation
> 4. **Centralized permission logic** - All enforcement is in lib/assertions.ts, not scattered across routes
> 
> Confidential cases require assignment. Parents need both guardianship AND FERPA consent. All violations are logged for audit."

## Next Steps

To test in production:
1. Run through all scenarios above
2. Verify 403 responses with correct error messages
3. Check server console for FERPA violation logs
4. Confirm audit trail is complete
