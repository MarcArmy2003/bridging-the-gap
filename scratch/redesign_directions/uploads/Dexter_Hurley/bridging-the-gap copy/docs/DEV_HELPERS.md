# Dev Helpers

EXPO_PUBLIC_AUTO_DEMO
- What: When set to `true` and running in development (`__DEV__`), the app will auto-log a demo counselor user to speed testing of counselor flows.
- Default: off (no auto-login).
- Enable locally: copy `.env.example` → `.env` and add:

  EXPO_PUBLIC_AUTO_DEMO=true

- After enabling: restart Metro/Expo with:

  npx expo start -c

Notes
- This is a dev convenience only. Keep the flag off for production-like testing.
- Remove or disable the flag when verifying first-time user flows (Role Select / Home).

EXPO_PUBLIC_DEV_ERROR_BOUNDARY
- What: When set to `true` and running in development (`__DEV__`), a developer-friendly error boundary will render a readable error screen on render-time exceptions. This helps catch import/render issues early during UI/data changes.
- Default: off
- Enable locally (only for development troubleshooting): add to your `.env`:

  EXPO_PUBLIC_DEV_ERROR_BOUNDARY=true

- Notes: This boundary is intentionally gated and will not run in production builds.

EXPO_PUBLIC_RUN_SMOKE
- What: When set to `true` and running in development (`__DEV__`), the app will run a small in-app smoke test that programmatically navigates the counselor happy path (Case Inbox -> Case Detail -> set support plan) and reports a simple pass/fail status on screen.
- Default: off
- Enable locally (only for development troubleshooting): add to your `.env`:

  EXPO_PUBLIC_RUN_SMOKE=true

- Notes: The smoke test uses `EXPO_PUBLIC_AUTO_DEMO=true` (demo user) to ensure a counselor user exists. It is intentionally lightweight and runs inside the app; no external testing framework required.
