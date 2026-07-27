saving-grace (recommended project layout)
=========================================

This repository is currently the Expo app. Recommended high-level layout for the
project when publishing both the app and a public website is:

saving-grace/
│
├── saving-grace-app/        ← Expo / React Native app
│   ├── App.tsx
│   ├── src/
│   └── app.json
│
├── saving-grace-website/    ← Public website (Next.js)
│   ├── pages/
│   ├── public/
│   └── next.config.js
│
└── README.md

Why this is best
-----------------
- Clean separation of concerns
- Easier deployment (apps and websites have different hosts)
- Easier to explain to schools & funders
- You can change the website without touching the app
- QR codes never break

What NOT to do
--------------
- Don't paste website pages into the Expo app
- Don't mix Next.js files into the Expo repo
- Don't try to reuse navigation between app and website

How they connect (the right way)
-------------------------------
- Website → App: "Open the App" button, QR codes, /app landing page
- App → Website: "Learn more", "Resources", "Community support"

Quick step-by-step (easiest path)
--------------------------------
1. Finish the app where it already lives. Don't move files while you iterate.
   - If this repo is the app, keep working here as your app root.

2. Create the website separately (example commands):

```bash
cd ..
npx create-next-app@latest saving-grace-website --use-npm --yes
cd saving-grace-website
npm run dev
```

3. Add links later
   - Website links → app (deep links / App Store links / QR codes)
   - QR codes → website (for resources, guides)

Notes
-----
- This README file is informational only and does not move or rename files.
- If you want, I can scaffold the `saving-grace-website` folder now (creates a new
  Next.js app as a sibling directory). Tell me if you'd like me to run the
  scaffolding command here.

If you want me to proceed with scaffolding the website now, I'll run the
`create-next-app` command in the parent folder and report back.
