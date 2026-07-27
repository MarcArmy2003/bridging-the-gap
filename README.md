# Bridging the Gap - The Architecture of Trust

Welcome to the **Bridging the Gap** platform. This repository contains the source code for the platform, which is engineered from the ground up with strict privacy, FERPA compliance, and a "privacy without surveillance" philosophy.

## Live Website

The platform's website is currently hosted live on GitHub Pages:
👉 **[View the Live Site](https://MarcArmy2003.github.io/bridging-the-gap/)**

## Repository Structure

This repository is a monorepo containing both the web application and the mobile application codebase:

- `/saving-grace-website` - The Next.js web application (React, TypeScript, CSS, Supabase).
- `/src` & `/app` - The Expo/React Native mobile application source code.
- `/supabase` - Database migrations, RLS (Row Level Security) policies, and backend configurations.

## How to Run the Website Locally

If your friend wants to run the website locally on their own machine to test or make changes:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MarcArmy2003/bridging-the-gap.git
   ```

2. **Navigate to the website directory:**
   ```bash
   cd bridging-the-gap/saving-grace-website
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

## Deployment

The website is automatically deployed to GitHub Pages via GitHub Actions. Any push to the `main` branch will trigger a new build and update the live URL automatically.