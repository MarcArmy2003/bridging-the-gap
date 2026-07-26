# Bridging the Gap (BTG) Portal Redesign & Hardening Plan

This document outlines the comprehensive blueprint for the multi-track review, security hardening, and UX/UI redesign of the Bridging the Gap (BTG) portal.

## 1. System Orientation Confirmation

I have fully reviewed and comprehended the current Phase 3 backend baseline for the Bridging the Gap project. I understand the critical components that must be preserved and hardened:
- **Core Stack:** Next.js, NextAuth, Prisma ORM, and RBAC.
- **5-Layer FERPA Defense-in-Depth:**
  1. Schema Constraints (FKs and unique indexes).
  2. Query Filtering (`lib/permissions.ts`).
  3. Explicit Assertions (`lib/assertions.ts` throwing `FERPAViolationError`).
  4. Standardized HTTP 403 Forbidden responses.
  5. Audit Log (append-only, database-backed with `ViolationReason` enums).
- **Authentication:** Dual-login (Credentials + OIDC/OAuth) and the mobile JWT issuer (`btg-backend`).
- **OIDC Linking Tradeoff:** I acknowledge the current risk of linking identity providers via email and the necessity of migrating to durable, OIDC subject-based linking.

> [!IMPORTANT]
> The integrity of the 5-Layer FERPA Defense-in-Depth is paramount. All frontend and backend modifications will strictly adhere to these compliance constraints.

---

## 2. Hardening & Security Blueprint

### Audit Write Transactions
To prevent silent bypasses and ensure accountability, we will wrap authorization checks and audit logging in atomic transactions.

**Proposed Prisma Transaction Pattern:**
```typescript
try {
  await prisma.$transaction(async (tx) => {
    // 1. Perform authorization assertion
    assertParentHasStudentAccess(user, studentId);
    
    // 2. Perform the actual data mutation or access logging
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: 'ACCESS_STUDENT_RECORD',
        resourceId: studentId,
        status: 'SUCCESS'
      }
    });
    
    // 3. Execute business logic...
  });
} catch (error) {
  if (error instanceof FERPAViolationError) {
    // Log the violation outside the transaction if the transaction rolls back
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceId: studentId,
        reason: error.reasonCode,
        status: 'DENIED'
      }
    });
  }
  throw error; // Let Layer 4 handle the 403 response
}
```

### Identity Migration Path (Subject-Based Linking)
Migrating from email-based to subject-based linking ensures durable identity resolution even if upstream emails change.

**Schema Changes (`schema.prisma`):**
```diff
 model User {
   id            String    @id @default(cuid())
   email         String?   @unique
+  btgSubject    String?   @unique
+  btgIssuer     String?
   // ... existing fields
 }
```

**Migration Strategy:**
1. **Schema Update:** Apply the Prisma migration to add `btgSubject` and `btgIssuer`.
2. **Backfill Script:** Create a script to iterate over existing users, query the OIDC provider via email, and backfill the `btgSubject` and `btgIssuer`.
3. **Login Resolution Update:** Update NextAuth callbacks to resolve users by `btgSubject` and `btgIssuer` first, falling back to email (and then linking the subject) only for legacy accounts during a transition period.

### Frontend Response Quality
Implement a robust API client utility that intercepts 403 responses and maps them to user-friendly, localized error states on the frontend, avoiding technical jargon while preserving the strict security boundary.

---

## 3. Competitive Web Research Insights

Based on extensive web research of modern educational portals and secure compliance dashboards (e.g., ClassDojo, Canvas Parent, SecOps dashboards), the following UI/UX patterns are recommended:

*   **Mobile-First & Purposeful Simplicity:** Progressive disclosure is key. Avoid overwhelming parents with data; show high-level summaries first, allowing drill-down for details.
*   **Story-Driven Dashboards:** Contextualize data. Instead of just a grade or a status, provide actionable insights (e.g., "Your student is on track" vs. just "85%").
*   **Information Hierarchy in Compliance:** For staff, utilize a 3-layer approach: At-a-glance KPIs, supporting metrics, and granular investigation logs.
*   **Security-First UI:** Use clear visual signals for secure areas (e.g., lock icons, distinct color themes for sensitive data) and mask PII aggressively on overviews.
*   **Accessibility (WCAG 2.1 AA+):** High-contrast modes, clear typography (e.g., Inter or Roboto), and keyboard navigability are non-negotiable for public-facing educational tools.

---

## 4. UX & UI Redesign Proposals

### Parent Dashboard Wireframe Concept
**Goal:** Intuitive, reassuring, and action-oriented.

*   **Header:** Warm greeting, secure logout, and current notification indicator.
*   **Overview (Bento Grid):**
    *   *Card 1 (Student Profile):* Photo, name, and current overall status (e.g., "All requirements met").
    *   *Card 2 (Action Center):* Highlights pending tasks. **CTA:** `Review FERPA Consent` (not "Submit Form").
    *   *Card 3 (Recent Communications):* Threaded messaging preview with counselors.
*   **Micro-interactions:** Subtle hover states on cards to indicate clickability. Smooth skeleton loaders during data fetches.
*   **UX Copy:** Use phrases like "Manage Access for [Student Name]" instead of "Update Permissions".

### Staff/Counselor Dashboard Wireframe Concept
**Goal:** Efficient, secure command center minimizing administrative burden.

*   **Header:** Role indicator, secure search bar (with masked PII in predictive results), and system status.
*   **Dashboard View:**
    *   *Top Row (KPIs):* "Active Cases", "Pending Consents", "Recent Security Alerts" (color-coded).
    *   *Main Content (Tabular/Grid):* Assigned cases prioritized by urgency.
    *   *Action Panel:* Quick actions for selected cases. **CTA:** `Assign Case to Self`, `Review Confidential Records`.
*   **Security Visuals:** Explicit visual indicators (e.g., a shield icon or distinct banner) when viewing FERPA-protected details.
*   **Audit View:** A dedicated, read-only tab showing the tamper-proof audit log for their assigned cases.

---

## 5. Next Action Plan

> [!NOTE]
> Review and approval of this plan are required before execution begins.

Upon your approval, we will proceed with the following backlog:

- `[ ]` **Ticket 1:** Implement Prisma transaction wrappers for `AuditLog` and authorization assertions.
- `[ ]` **Ticket 2:** Update `schema.prisma` with `btgSubject` and `btgIssuer`, generate migration, and write the backfill script.
- `[ ]` **Ticket 3:** Refactor NextAuth callbacks to prioritize subject-based identity linking.
- `[ ]` **Ticket 4:** Audit and clean up existing production endpoints (remove debug logs, ensure generic 403s).
- `[ ]` **Ticket 5:** Setup frontend design system (Tailwind config, CSS variables) based on the new accessible, warm color palette.
- `[ ]` **Ticket 6:** Implement the Parent Dashboard layout and components.
- `[ ]` **Ticket 7:** Implement the Staff/Counselor Dashboard layout and components.
- `[ ]` **Ticket 8:** Wire up frontend error handling for graceful 403 presentation.

## Open Questions

1. **Tailwind CSS:** The prompt mentions avoiding Tailwind CSS unless explicitly requested, but it's very common in Next.js stacks. Should I proceed with standard vanilla CSS/CSS Modules as per the core instructions, or would you prefer Tailwind for this Next.js project?
2. **OIDC Provider:** Do we have a specific OIDC provider in mind (e.g., Google, Okta, Azure AD) for testing the migration script, or should I mock the provider responses?
