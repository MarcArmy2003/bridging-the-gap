'use client';

import Link from 'next/link';
import { theme, styles } from '@/styles/theme';
import { APP_NAME, CONTACT_EMAIL } from '@/lib/branding';

export default function ChurchesPage() {
  return (
    <main style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ ...styles.heroSection, textAlign: 'center', marginBottom: theme.spacing.xl }} className="max-w-4xl mx-auto px-6">
        <h1 style={{ ...styles.heading1, color: theme.colors.primary, marginBottom: theme.spacing.lg }}>
          Supporting Students & Families, Together
        </h1>
        <p style={{ ...styles.body, fontSize: '1.2rem', marginBottom: theme.spacing.xl }}>
          Churches and community organizations play a vital role in student safety and wellness. {APP_NAME} helps you partner with schools in a clear, appropriate, and impactful way.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'center' }}>
          <Link href="/get-support" style={{ ...styles.primaryButton, textDecoration: 'none', display: 'inline-block' }}>
            Learn More
          </Link>
          <Link href="/" style={{ ...styles.secondaryButton, textDecoration: 'none', display: 'inline-block' }}>
            Home
          </Link>
        </div>
      </section>

      {/* The Vision */}
      <section style={{ maxWidth: '900px', margin: `0 auto ${theme.spacing.xl}`, padding: `0 ${theme.spacing.lg}` }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>Why This Matters</h2>
        <div style={{ textAlign: 'center' }}>
          <p style={{ ...styles.body, fontSize: '1.1rem', marginBottom: theme.spacing.lg }}>
            Students today face unprecedented stress: bullying, isolation, family instability, mental health challenges. Schools work hard, but they cannot do it alone.
          </p>
          <p style={{ ...styles.body, fontSize: '1.1rem', marginBottom: theme.spacing.lg }}>
            Churches and community organizations have something schools don't: deep relationships with families, spiritual care, and long-term presence in the community.
          </p>
          <p style={{ ...styles.body, fontSize: '1.1rem', fontWeight: '600', color: theme.colors.primary }}>
            {APP_NAME} creates a safe way for these two institutions to work together—without blurring lines or overstepping roles.
          </p>
        </div>
      </section>

      {/* Clear Boundaries */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: theme.spacing.lg, background: theme.colors.lightBg, borderRadius: theme.radius.lg }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.xl }}>Clear Boundaries (This Matters)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: theme.spacing.lg }}>
          <div style={styles.sectionCard}>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>✓ What We DO Support</h3>
            <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2' }}>
              <li>Spiritual care & guidance</li>
              <li>Youth group & mentorship</li>
              <li>Family support services</li>
              <li>Community resource connections</li>
              <li>Prevention education</li>
            </ul>
          </div>
          <div style={styles.sectionCard}>
            <h3 style={{ ...styles.heading3, color: theme.colors.secondary, marginBottom: theme.spacing.md }}>✗ What We Do NOT Do</h3>
            <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2', color: theme.colors.secondary }}>
              <li>Make clinical diagnoses</li>
              <li>Replace school counselors</li>
              <li>Make disciplinary decisions</li>
              <li>Share student data without consent</li>
              <li>Provide therapy or medication</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Partnership Models */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: `0 ${theme.spacing.lg}` }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.xl }}>Partnership Models</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
          <div style={{ ...styles.sectionCard, borderTop: `4px solid ${theme.colors.primary}` }}>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>Education & Prevention</h3>
            <p style={styles.body}>Host parent workshops and youth groups on bullying prevention, mental health, and healthy relationships.</p>
          </div>
          <div style={{ ...styles.sectionCard, borderTop: `4px solid ${theme.colors.accent}` }}>
            <h3 style={{ ...styles.heading3, color: theme.colors.accent, marginBottom: theme.spacing.md }}>Family Support</h3>
            <p style={styles.body}>Offer food pantries, financial aid, counseling referrals, and practical help for families in crisis.</p>
          </div>
          <div style={{ ...styles.sectionCard, borderTop: `4px solid ${theme.colors.primary}` }}>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>Resource Connection</h3>
            <p style={styles.body}>Link students and families to community resources—mental health services, tutoring, job training—through {APP_NAME}.</p>
          </div>
          <div style={{ ...styles.sectionCard, borderTop: `4px solid ${theme.colors.accent}` }}>
            <h3 style={{ ...styles.heading3, color: theme.colors.accent, marginBottom: theme.spacing.md }}>Spiritual Mentorship</h3>
            <p style={styles.body}>Provide ongoing mentorship, spiritual guidance, and community connection for students who need it most.</p>
          </div>
        </div>
      </section>

      {/* Real Example */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: theme.spacing.lg, background: theme.colors.background, borderRadius: theme.radius.lg }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>A Real Example</h2>
        <div>
          <p style={{ ...styles.body, marginBottom: theme.spacing.md }}>
            <strong>Emma, age 14, reports on {APP_NAME} that she's being bullied.</strong>
          </p>
          <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2', marginBottom: theme.spacing.lg }}>
            <li>🏫 Her school counselor sees the report, meets with Emma, and documents support.</li>
            <li>⛪ The counselor also notes: "Emma's church youth leader could help provide stability."</li>
            <li>📱 With Emma's permission, {APP_NAME} alerts her church that support might help.</li>
            <li>✋ The youth leader reaches out—not as a therapist, but as a trusted mentor—and invites Emma to an after-school mentorship group.</li>
            <li>❤️ Emma has school support AND community support. The bullying stops. She feels less alone.</li>
          </ul>
          <p style={{ ...styles.body, fontStyle: 'italic', color: theme.colors.lightText }}>
            Both institutions did their job. Neither overstepped. Emma got help.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: `0 ${theme.spacing.lg}` }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>Why Churches Join</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: theme.spacing.lg }}>
          {[
            { icon: '💪', title: 'Meaningful Impact', desc: 'Actually help the students you serve.' },
            { icon: '🤝', title: 'Stronger Community', desc: 'Build deeper partnerships with schools.' },
            { icon: '📊', title: 'Transparency', desc: 'Know what\'s happening, with clear boundaries.' },
            { icon: '🛡️', title: 'Clear Roles', desc: 'Support students without overstepping.' },
          ].map((item, idx) => (
            <div key={idx} style={styles.sectionCard}>
              <div style={{ fontSize: '2.5rem', marginBottom: theme.spacing.sm }}>{item.icon}</div>
              <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.sm }}>{item.title}</h3>
              <p style={styles.body}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: theme.spacing.lg, background: theme.colors.lightBg, borderRadius: theme.radius.lg }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.xl }}>How to Get Started</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
          {[
            { num: '1', title: 'Learn', desc: `Understand ${APP_NAME} and how community partnerships work.` },
            { num: '2', title: 'Talk to Schools', desc: 'Reach out to your local superintendent or principal about partnership.' },
            { num: '3', title: 'Sign Agreement', desc: 'Establish clear boundaries and expectations with your school district.' },
            { num: '4', title: 'Launch Support', desc: 'Begin identifying and supporting students in partnership with schools.' },
          ].map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: theme.spacing.md }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: theme.colors.primary, color: 'white', borderRadius: '50%', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <h3 style={{ ...styles.heading3, marginBottom: theme.spacing.sm }}>{step.title}</h3>
                <p style={styles.body}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: `0 ${theme.spacing.lg}`, marginBottom: theme.spacing.xl }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>Questions?</h2>
        <div style={{ display: 'grid', gap: theme.spacing.lg }}>
          {[
            { q: `Do we have to use ${APP_NAME} to support students?`, a: `No. You can partner with schools in many ways. ${APP_NAME} is just one tool that makes partnership clearer and safer.` },
            { q: 'What if a student tells us about abuse?', a: `The same rules apply: we report to authorities as required by law. ${APP_NAME} doesn't change your mandated reporter obligations.` },
            { q: 'Can we share student information with the school?', a: `Only with student/family permission. ${APP_NAME} requires explicit consent before information is shared.` },
            { q: 'What does it cost?', a: `${APP_NAME} is free for community partners. Schools may fund the platform.` },
          ].map((item, idx) => (
            <div key={idx} style={styles.sectionCard}>
              <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.sm }}>{item.q}</h3>
              <p style={styles.body}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto ${theme.spacing.xl}`, padding: `${theme.spacing.xl} ${theme.spacing.lg}`, textAlign: 'center' }}>
        <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.lg }}>Ready to support your community?</h2>
        <p style={{ ...styles.body, fontSize: '1.1rem', marginBottom: theme.spacing.lg }}>
          Let's work together to build a safer, more connected community where every student gets the support they need.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'center' }}>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ ...styles.primaryButton, textDecoration: 'none', display: 'inline-block' }}>
            Contact Us
          </a>
          <Link href="/schools" style={{ ...styles.secondaryButton, textDecoration: 'none', display: 'inline-block' }}>
            For Schools
          </Link>
        </div>
      </section>
    </main>
  );
}
