'use client';

import Link from 'next/link';
import { theme, styles } from '@/styles/theme';
import { APP_NAME } from '@/lib/branding';

export default function GetSupportPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Hero */}
      <section style={{ ...styles.heroSection, marginTop: theme.spacing.xl }} className="max-w-3xl mx-auto px-6">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ ...styles.heading1, color: theme.colors.accent, marginBottom: theme.spacing.lg }}>
            You're Not Alone
          </h1>
          <p style={{ ...styles.body, fontSize: '1.2rem', marginBottom: theme.spacing.lg, maxWidth: '600px', margin: '0 auto 2rem' }}>
            If you or someone you know needs support, this platform can help guide you to the right next step.
          </p>
          <p style={{ ...styles.body, fontSize: '1.1rem', marginBottom: theme.spacing.xl }}>
            You can ask for help, share concerns, or find guidance in a confidential and supportive way.
          </p>
          <Link href="/app" style={{ ...styles.primaryButton, textDecoration: 'none', display: 'inline-block', fontSize: '1.1rem' }}>
            Open the App
          </Link>
        </div>
      </section>

      {/* Safety Info */}
      <section style={{ maxWidth: '900px', margin: `0 auto ${theme.spacing.xl}`, padding: `0 ${theme.spacing.lg}` }}>
        <div style={{ ...styles.sectionCard, marginBottom: theme.spacing.lg }}>
          <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.md }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.lg }}>
            <div>
              <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.sm }}>Step 1: Tell Us</h3>
              <p style={styles.body}>Share what's going on in your own words. No judgment.</p>
            </div>
            <div>
              <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.sm }}>Step 2: We Guide You</h3>
              <p style={styles.body}>Get personalized guidance and resources based on your situation.</p>
            </div>
            <div>
              <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.sm }}>Step 3: Get Support</h3>
              <p style={styles.body}>Connect with trusted adults, counselors, or community resources.</p>
            </div>
          </div>
        </div>

        <div style={{ ...styles.sectionCard, background: theme.colors.background }}>
          <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.md }}>Your Privacy & Safety</h2>
          <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2' }}>
            <li>✓ Your information is kept confidential</li>
            <li>✓ You control what you share</li>
            <li>✓ Adults in your life are notified appropriately (with your input)</li>
            <li>✓ You get help, not punishment</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: `${theme.spacing.xl} ${theme.spacing.lg}`, textAlign: 'center' }}>
        <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.lg }}>Ready to take the first step?</h2>
        <Link href="/app" style={{ ...styles.primaryButton, textDecoration: 'none', display: 'inline-block', fontSize: '1.1rem' }}>
          Open {APP_NAME}
        </Link>
      </section>
    </main>
  );
}
