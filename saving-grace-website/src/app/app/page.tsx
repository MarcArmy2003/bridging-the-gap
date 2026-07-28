'use client';

import Link from 'next/link';
import { theme, styles } from '@/styles/theme';
import { APP_NAME } from '@/lib/branding';

export default function AppRedirectPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Hero */}
      <section style={{ ...styles.heroSection, marginTop: theme.spacing.xl }} className="max-w-3xl mx-auto px-6">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ ...styles.heading1, color: theme.colors.primary, marginBottom: theme.spacing.lg }}>
            {APP_NAME} Platform
          </h1>
          <p style={{ ...styles.body, fontSize: '1.2rem', marginBottom: theme.spacing.lg }}>
            Our mobile and web app helps schools, families, and communities support students' social-emotional well-being.
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '900px', margin: `0 auto ${theme.spacing.xl}`, padding: `0 ${theme.spacing.lg}` }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>Built for Everyone</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
          <div style={styles.sectionCard}>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>For Students</h3>
            <p style={styles.body}>Share concerns, get guidance, and connect with trusted adults in a safe, confidential space.</p>
          </div>
          <div style={styles.sectionCard}>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>For Families</h3>
            <p style={styles.body}>Stay informed, provide input, and coordinate with schools to support your child's needs.</p>
          </div>
          <div style={styles.sectionCard}>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>For Schools</h3>
            <p style={styles.body}>Manage cases, track outcomes, reduce bullying, and create a safer school culture.</p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section style={{ maxWidth: '900px', margin: `0 auto ${theme.spacing.xl}`, padding: `${theme.spacing.lg}`, background: theme.colors.background, borderRadius: theme.radius.lg }}>
        <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.lg }}>What's Inside</h2>
        <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2.2' }}>
          <li><strong>Case Management:</strong> Track concerns from report to resolution</li>
          <li><strong>Secure Messaging:</strong> Private communication between families and school staff</li>
          <li><strong>Resource Library:</strong> Access support resources for bullying, mental health, and more</li>
          <li><strong>Audit Trails:</strong> Transparent documentation of all actions and decisions</li>
          <li><strong>Analytics:</strong> District-level insights to guide prevention efforts</li>
        </ul>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto ${theme.spacing.xl}`, padding: `${theme.spacing.xl} ${theme.spacing.lg}`, textAlign: 'center' }}>
        <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.lg }}>Ready to get started?</h2>
        <p style={{ ...styles.body, marginBottom: theme.spacing.lg, fontSize: '1.1rem' }}>
          {APP_NAME} is available as a web app and will be available on mobile app stores.
        </p>
        <Link href="https://expo.dev/@your-project-link" target="_blank" style={{ ...styles.primaryButton, textDecoration: 'none', display: 'inline-block', marginRight: theme.spacing.md, fontSize: '1.1rem' }}>
          Access Web App
        </Link>
        <Link href="/get-support" style={{ ...styles.secondaryButton, textDecoration: 'none', display: 'inline-block', fontSize: '1.1rem' }}>
          Back to Guide
        </Link>
      </section>

      {/* Footer Info */}
      <section style={{ maxWidth: '900px', margin: `0 auto ${theme.spacing.xl}`, padding: `0 ${theme.spacing.lg}`, textAlign: 'center', borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing.xl }}>
        <p style={{ ...styles.body, color: theme.colors.lightText, fontSize: '0.95rem' }}>
          📱 Mobile app store links will be available when officially published.
        </p>
      </section>
    </main>
  );
}
