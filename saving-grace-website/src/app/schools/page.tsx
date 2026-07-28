'use client';

import Link from 'next/link';
import { theme, styles } from '@/styles/theme';
import { APP_NAME, CONTACT_EMAIL } from '@/lib/branding';

export default function SchoolsPage() {
  return (
    <main style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ ...styles.heroSection, textAlign: 'center', marginBottom: theme.spacing.xl }} className="max-w-4xl mx-auto px-6">
        <h1 style={{ ...styles.heading1, color: theme.colors.primary, marginBottom: theme.spacing.lg }}>
          A Safety & Support Platform Built for Schools
        </h1>
        <p style={{ ...styles.body, fontSize: '1.2rem', marginBottom: theme.spacing.xl }}>
          Reduce response time. Strengthen communication. Empower your district to support every student.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'center' }}>
          <Link href="/get-support" style={{ ...styles.primaryButton, textDecoration: 'none', display: 'inline-block' }}>
            See It In Action
          </Link>
          <Link href="/" style={{ ...styles.secondaryButton, textDecoration: 'none', display: 'inline-block' }}>
            Learn More
          </Link>
        </div>
      </section>

      {/* The Problem */}
      <section style={{ maxWidth: '900px', margin: `0 auto ${theme.spacing.xl}`, padding: `0 ${theme.spacing.lg}` }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>The Challenge Every District Faces</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: theme.spacing.lg }}>
          <div style={{ ...styles.sectionCard, borderLeft: `4px solid ${theme.colors.primary}` }}>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>Fragmented Reporting</h3>
            <p style={styles.body}>
              Students, parents, and teachers report concerns through different channels—emails, phone calls, forms. Nothing connects.
            </p>
          </div>
          <div style={{ ...styles.sectionCard, borderLeft: `4px solid ${theme.colors.accent}` }}>
            <h3 style={{ ...styles.heading3, color: theme.colors.accent, marginBottom: theme.spacing.md }}>Slow Response</h3>
            <p style={styles.body}>
              Delays in identifying, escalating, and supporting students who need help most.
            </p>
          </div>
          <div style={{ ...styles.sectionCard, borderLeft: `4px solid ${theme.colors.secondary}` }}>
            <h3 style={{ ...styles.heading3, color: theme.colors.secondary, marginBottom: theme.spacing.md }}>Workload Burden</h3>
            <p style={styles.body}>
              Counselors and safety teams spend hours on coordination instead of direct student support.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: theme.spacing.lg, background: theme.colors.background, borderRadius: theme.radius.lg }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.xl }}>How {APP_NAME} Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: theme.spacing.lg }}>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md, display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: theme.colors.primary, color: 'white', borderRadius: '50%', marginRight: theme.spacing.sm, fontWeight: 'bold', fontSize: '0.9rem' }}>1</span>
              Report
            </h3>
            <p style={styles.body}>A simple, safe way for students to ask for help. Parents and teachers can report concerns too.</p>
          </div>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md, display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: theme.colors.primary, color: 'white', borderRadius: '50%', marginRight: theme.spacing.sm, fontWeight: 'bold', fontSize: '0.9rem' }}>2</span>
              Route
            </h3>
            <p style={styles.body}>Reports are immediately categorized and routed to the right team—counselors, safety officers, or administrators.</p>
          </div>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md, display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: theme.colors.primary, color: 'white', borderRadius: '50%', marginRight: theme.spacing.sm, fontWeight: 'bold', fontSize: '0.9rem' }}>3</span>
              Manage
            </h3>
            <p style={styles.body}>Your team has a single source of truth. Track outcomes, communicate securely, and document everything.</p>
          </div>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md, display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: theme.colors.primary, color: 'white', borderRadius: '50%', marginRight: theme.spacing.sm, fontWeight: 'bold', fontSize: '0.9rem' }}>4</span>
              Follow-Up
            </h3>
            <p style={styles.body}>The platform suggests resources, tracks intervention effectiveness, and closes the loop on every case.</p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: `0 ${theme.spacing.lg}` }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>Built For Your District</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: theme.spacing.lg }}>
          {['Role-Based Access', 'FERPA & HIPAA Compliant', 'No Extra Burden', 'Data & Outcomes', 'Mobile-First', 'Guided Pathways'].map((feature, idx) => (
            <div key={idx} style={styles.sectionCard}>
              <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.sm }}>✓ {feature}</h3>
              <p style={styles.body}>
                {feature === 'Role-Based Access' && 'Students, parents, teachers, counselors, SROs, and administrators see only what they need to.'}
                {feature === 'FERPA & HIPAA Compliant' && 'Built with privacy, security, and legal compliance at the core.'}
                {feature === 'No Extra Burden' && 'Replaces fragmented workflows. Your team works faster, not harder.'}
                {feature === 'Data & Outcomes' && 'Track trends, demonstrate impact, and show funders & boards what\'s working.'}
                {feature === 'Mobile-First' && 'Students can report from anywhere—in class, at home, or on the bus.'}
                {feature === 'Guided Pathways' && 'Questions adapt based on student responses. No jargon. Simple, supportive language.'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Who Benefits */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: theme.spacing.lg, background: theme.colors.lightBg, borderRadius: theme.radius.lg }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.lg }}>For Your Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: theme.spacing.lg }}>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>Superintendents & Principals</h3>
            <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2' }}>
              <li>• Dashboard of all active cases and outcomes</li>
              <li>• Compliance documentation automated</li>
              <li>• Data for grant applications & board reports</li>
              <li>• Reduces liability through systematic response</li>
            </ul>
          </div>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>School Counselors</h3>
            <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2' }}>
              <li>• One place to manage all student cases</li>
              <li>• Secure messaging with families</li>
              <li>• Automated resource recommendations</li>
              <li>• More time for direct student support</li>
            </ul>
          </div>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>Teachers & Staff</h3>
            <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2' }}>
              <li>• Easy way to report student concerns</li>
              <li>• Know students got help (read-only outcomes)</li>
              <li>• Peace of mind that system is tracking follow-up</li>
            </ul>
          </div>
          <div>
            <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: theme.spacing.md }}>Safety Teams & SROs</h3>
            <ul style={{ ...styles.body, marginLeft: theme.spacing.lg, lineHeight: '2' }}>
              <li>• High-severity threat alerts</li>
              <li>• Coordinated response protocols</li>
              <li>• Documentation for incident review</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto`, padding: `0 ${theme.spacing.lg}` }}>
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: theme.spacing.xl }}>Why Districts Choose {APP_NAME}</h2>
        <div style={{ display: 'grid', gap: theme.spacing.lg }}>
          {[
            { title: 'Designed by educators & counselors', desc: 'Not imposed by tech—shaped by people who know school safety.' },
            { title: 'Proof of impact', desc: 'Early adopters report 40% faster response times and stronger family trust.' },
            { title: 'Grant-eligible', desc: 'Qualifies for school safety, mental health, and community resilience funding.' },
            { title: 'Real support, not just software', desc: 'Implementation, training, and ongoing guidance included.' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: theme.spacing.md }}>
              <div style={{ flexShrink: 0, width: '28px', height: '28px', background: theme.colors.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>✓</div>
              <div>
                <h3 style={{ ...styles.heading3, marginBottom: theme.spacing.sm }}>{item.title}</h3>
                <p style={styles.body}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '900px', margin: `${theme.spacing.xl} auto ${theme.spacing.xl}`, padding: `${theme.spacing.xl} ${theme.spacing.lg}`, textAlign: 'center' }}>
        <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.lg }}>Ready to transform how your district supports students?</h2>
        <p style={{ ...styles.body, fontSize: '1.1rem', marginBottom: theme.spacing.lg }}>
          See {APP_NAME} in action. Talk to your leadership team. Let's build a safer, more connected school community together.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'center' }}>
          <Link href="/get-support" style={{ ...styles.primaryButton, textDecoration: 'none', display: 'inline-block' }}>
            Schedule a Demo
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ ...styles.secondaryButton, textDecoration: 'none', display: 'inline-block' }}>
            Contact Leadership
          </a>
        </div>
      </section>
    </main>
  );
}
