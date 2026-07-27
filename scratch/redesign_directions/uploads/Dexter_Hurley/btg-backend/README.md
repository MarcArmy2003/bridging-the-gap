# BTG Backend

Next.js + NextAuth backend for case/student APIs with role-based authorization.

## Local Setup

1. Copy `.env.example` to `.env.local` and fill in values.
2. Install deps: `npm install`
3. Run dev server: `npm run dev`
4. Open `http://localhost:3000`

## Authentication Overview

This app currently supports two concurrent login methods:

- `credentials`: existing email/password against Prisma `User`
- `btg`: OIDC/OAuth provider (feature-flagged)

BTG is enabled only when `ENABLE_BTG_AUTH=true`.

### NextAuth Session Contract (Backward Compatible)

The existing fields remain unchanged:

- `session.user.id`
- `session.user.role`

New optional fields:

- `session.user.authProvider` (`credentials` or `btg`)
- `session.authError` (token refresh/callback errors)
- `session.btg.*` (subject, tenant, roles, token metadata)

Sensitive BTG tokens remain server-only in NextAuth JWT and are not returned in `session`.

## BTG Configuration

Set these env vars (see `.env.example`):

- `BTG_OIDC_CLIENT_ID`
- `BTG_OIDC_CLIENT_SECRET`
- `BTG_OIDC_SCOPE`
- One of:
  - `BTG_OIDC_WELL_KNOWN`
  - `BTG_OIDC_ISSUER` plus explicit endpoint URLs
- Optional explicit endpoint URLs:
  - `BTG_OIDC_AUTHORIZATION_URL`
  - `BTG_OIDC_TOKEN_URL`
  - `BTG_OIDC_USERINFO_URL`
  - `BTG_OIDC_LOGOUT_URL`
- `BTG_OIDC_POST_LOGOUT_REDIRECT_URI`
- Optional strict validation values:
  - `BTG_OIDC_EXPECTED_ISSUER`
  - `BTG_OIDC_EXPECTED_AUDIENCE`
  - `BTG_REQUIRE_EMAIL_VERIFIED`

### Callback URLs for BTG Admin

For local development:

- Login callback: `http://localhost:3000/api/auth/callback/btg`
- Logout redirect target: `http://localhost:3000/auth-test`

For deployed environments, replace host accordingly (for example, `https://your-domain/api/auth/callback/btg`).

## BTG Login, Refresh, and Logout Behavior

- BTG login validates required claims (`sub`, `email`), `iss`, and `aud` (when available in ID token).
- BTG login enforces `email_verified` when claim is present and `BTG_REQUIRE_EMAIL_VERIFIED=true`.
- BTG users are treated as identity-provider users and must already exist in Prisma by email.
- App authorization stays Prisma-driven (`User.role`) to preserve existing route checks.
- BTG access/refresh/id tokens are persisted only in NextAuth JWT.
- If refresh token exists and access token is near expiry, NextAuth attempts refresh via `BTG_OIDC_TOKEN_URL`.
- If refresh fails, session is expired and user must re-authenticate.
- BTG logout:
  1. Local NextAuth session is cleared.
  2. User is redirected to `/api/auth/btg/logout`, which forwards to BTG end-session endpoint with `id_token_hint` and `post_logout_redirect_uri` when configured.

## Testing Auth Locally

Open `/auth-test` to use the auth test panel:

- Credentials sign-in remains available.
- BTG sign-in button is available when `ENABLE_BTG_AUTH=true`.
- Session block shows provider and mapped fields.

## Architecture Decisions

- Identity source of truth: BTG for authentication identity; Prisma for application authorization.
- User linking strategy: by email at login time (incremental rollout to avoid schema changes).
- Required BTG claims: `sub`, `email`.
- Optional BTG claims currently captured when present: `name`, `roles`, `tenant`.
- Authorization source: Prisma `User.role` (BTG roles are session metadata only for now).
- Mobile auth (`lib/mobileAuth.ts`): currently separate internal JWT issuer (`btg-backend`), not BTG issuer/audience validation.
  - If mobile should trust BTG access tokens directly later, update verifier to validate BTG issuer, audience, and JWKS.

## Security Tradeoff: Email Linking

Current linking uses BTG `email` to find a Prisma `User`.

- Benefit: no schema migration required for incremental rollout.
- Risk: if email changes or is re-assigned upstream, account linkage can break or be mis-associated.
- Mitigation in this phase: require verified email claim when available, and log rejected attempts.

## Planned Migration: Subject Linking

Recommended migration path to make BTG `sub` the durable identity key:

1. Add columns to Prisma `User`:
   - `btgSubject` (unique, nullable initially)
   - optional `btgIssuer` (for multi-issuer support)
2. Backfill by recording `sub` on successful login where email-linked user exists.
3. Change sign-in linking order:
   - First by `btgSubject` (+ issuer if used), then fallback to email only for unmigrated records.
4. After migration window:
   - disable email fallback by default and enforce subject linking.
5. Add admin tooling for manual account-link repair where needed.

## Rollout Checklist (Staging/Prod)

1. Set `ENABLE_BTG_AUTH=true` only in the target environment after BTG app registration is complete.
2. Configure BTG callback/logout URLs for that environment:
   - `/api/auth/callback/btg`
   - `/auth-test` (or your chosen post-logout route)
3. Set `BTG_OIDC_CLIENT_ID`, `BTG_OIDC_CLIENT_SECRET`, issuer/discovery values, and `BTG_OIDC_TOKEN_URL` for refresh.
4. Set strict validation values: `BTG_OIDC_EXPECTED_ISSUER`, `BTG_OIDC_EXPECTED_AUDIENCE`, and keep `BTG_REQUIRE_EMAIL_VERIFIED=true`.
5. Verify local-user links exist for BTG emails (or expected rejected logins for unlinked users).
6. Execute smoke tests:
   - credentials login
   - BTG login success
   - BTG missing-claim rejection
   - BTG logout redirect
   - protected API route authorization
7. Monitor auth logs for `BTG_*` errors and verify failed refresh forces re-auth.
8. Keep credentials provider enabled until BTG production login stability is confirmed.

## Failure-Mode Matrix

| Failure mode | Detection point | User-visible behavior | System behavior |
| --- | --- | --- | --- |
| BTG login failure (generic callback/provider error) | `signIn` callback exception | Redirect to `/auth-test?error=BTG_CALLBACK_FAILURE` | Error logged server-side |
| Missing claims (`sub` or `email`) | BTG claim validation in `signIn`/`jwt` | Redirect with `BTG_MISSING_CLAIMS` | Login denied |
| Unverified email | BTG claim validation (`BTG_REQUIRE_EMAIL_VERIFIED=true`) | Redirect with `BTG_EMAIL_NOT_VERIFIED` | Login denied |
| Missing local user link | Email linking lookup to Prisma user | Redirect with `BTG_USER_NOT_LINKED` | Login denied; no implicit user creation |
| Refresh-token expiry/refresh failure | JWT refresh attempt via `BTG_OIDC_TOKEN_URL` | Session reports re-auth required; user must sign in again | Token marked `btgNeedsReauth`, session effectively expired |
| BTG logout failure | `/api/auth/btg/logout` route catch block | Redirect to `/auth-test?error=BTG_LOGOUT_FAILED` | Local session already cleared; upstream logout may remain active |
