# Implementation Plan: Dual-Track Development & Collaboration

This document outlines the parallel execution strategy for hardening the Bridging the Gap backend (OIDC Identity Linking), spinning up the React Native (Expo) mobile application, and securely hosting the repository on GitHub so your friend can consume and deploy it.

## 1. GitHub Hosting & Collaboration Strategy
To ensure your friend can securely take ownership or fork the project without complicating your primary development environment:

1. **Repository Conversion (Template)**: We will make sure the repository is clean (no sensitive `.env` values checked in). Once pushed to your GitHub account, you can mark the repository as a **"Template Repository"** in the GitHub Settings. 
2. **Consumption**: Your friend can navigate to your repository and click the **"Use this template"** button. This gives them a pristine, independent copy of the codebase (without carrying over your commit history) to deploy against their own Supabase instance.
3. **Web Deployment**: The Next.js frontend has been configured for static export (`/out`). Your friend can easily host this static site for free on **GitHub Pages**.

## 2. Track 1: Backend Architecture (Supabase OIDC Linking)
*Note: In my previous message, I accidentally referenced "Prisma" — however, this project natively uses raw Supabase PostgreSQL schemas and Row Level Security (RLS) for maximum performance and compliance. We will implement OIDC linking natively via Supabase.*

Currently, the `public.users` table relies heavily on `email` and standard uuid associations. To ensure robust OIDC (Single Sign-On) identity linking that is resistant to email changes:
1. **Schema Migration**: We will create a new Supabase migration (`supabase/migrations/..._oidc_identity_linking.sql`) to explicitly enforce `auth.uid()` as the primary identity key, mapping the `public.users.id` directly to the `auth.users.id` created by external providers (Google, Apple, Microsoft).
2. **Database Triggers**: We will write a secure Postgres trigger (`on_auth_user_created`) to automatically upsert records into `public.users` whenever a new user logs in via an OIDC provider, guaranteeing the `public.users` table never falls out of sync.

## 3. Track 2: Mobile App (React Native Expo)
The foundation of the Expo app exists (`App.tsx` and `src/navigation`). We will apply the new "Dusk Letter" branding:
1. **Theme Porting**: Extract the Next.js CSS tokens and translate them into a React Native `StyleSheet` / `Theme` object (`src/styles/theme.ts`).
2. **Component Updates**: Refactor the main navigation shells and the Home screen to utilize the new typography, Rose Parchment backgrounds, and Spruce/Plum accents.
3. **Authentication Boundary**: Ensure the mobile app consumes the same Supabase Auth instance, allowing users to seamlessly transition between the web portal and the mobile app using the new OIDC logic.

---

## User Review Required
> [!IMPORTANT]
> **Approval Needed**: Since we are about to modify the core database schema (Track 1) and rewrite the mobile app's core routing/theming (Track 2), please review the plan above. Click **"Proceed"** to authorize me to execute both tracks in parallel!
