'use client';

import Link from 'next/link';
import { theme, styles } from '@/styles/theme';
import { APP_NAME } from '@/lib/branding';

const primaryButtonStyle = {
  background: theme.colors.primary,
  color: '#fff',
  padding: '14px 28px',
  borderRadius: '12px',
  fontSize: '1rem',
  border: 'none',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textDecoration: 'none',
  display: 'inline-block',
  ':hover': {
    background: '#EA6317',
  },
};

const secondaryButtonStyle = {
  background: '#fff',
  color: theme.colors.secondary,
  padding: '14px 28px',
  borderRadius: '12px',
  fontSize: '1rem',
  border: `2px solid ${theme.colors.secondary}`,
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textDecoration: 'none',
  display: 'inline-block',
};

export default function HomePage() {
  return (
    <main style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* HERO SECTION - Text + Image Grid */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: theme.colors.secondary,
              lineHeight: '1.2',
              marginBottom: '1.5rem',
            }}
          >
            A Safer, More Supportive School Experience
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: '#555',
              lineHeight: '1.6',
              marginBottom: '2rem',
            }}
          >
            {APP_NAME} helps students ask for help, educators respond early, and families stay connected — all in one trusted platform.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
            <Link href="/get-support" style={primaryButtonStyle}>
              Get Support
            </Link>
            <Link href="/schools" style={secondaryButtonStyle}>
              For Schools
            </Link>
          </div>
        </div>

        <div
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            background: theme.colors.background,
            minHeight: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/images/family-school.svg"
            alt="Families and schools working together"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </section>

      {/* What This Is */}
      <section
        style={{
          maxWidth: '1200px',
          margin: `3rem auto`,
          padding: `0 2rem`,
        }}
      >
        <div
          style={{
            background: theme.colors.lightBg,
            padding: '2rem',
            borderRadius: '16px',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ ...styles.heading2, marginBottom: '1rem', color: theme.colors.secondary }}>
            What {APP_NAME} Does
          </h2>
          <p style={{ ...styles.body, fontSize: '1.05rem' }}>
            Creates a clear, calm pathway for support before situations escalate. Students ask for help in their own words. Educators respond with care and coordination. Communities stay informed and connected.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            border: `2px solid ${theme.colors.border}`,
            padding: '2rem',
            borderRadius: '16px',
          }}
        >
          <h2 style={{ ...styles.heading2, marginBottom: '1.5rem', color: theme.colors.secondary }}>
            What It Is NOT
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ ...styles.body, fontWeight: '600', marginBottom: '0.5rem' }}>✓ Not surveillance</p>
              <p style={{ ...styles.body, fontSize: '0.9rem', color: '#666' }}>No tracking. No cameras. Just support.</p>
            </div>
            <div>
              <p style={{ ...styles.body, fontWeight: '600', marginBottom: '0.5rem' }}>✓ Not punishment</p>
              <p style={{ ...styles.body, fontSize: '0.9rem', color: '#666' }}>Help, not discipline. Compassion, not consequence.</p>
            </div>
            <div>
              <p style={{ ...styles.body, fontWeight: '600', marginBottom: '0.5rem' }}>✓ Not replacement</p>
              <p style={{ ...styles.body, fontSize: '0.9rem', color: '#666' }}>Works alongside counselors, parents, community.</p>
            </div>
            <div>
              <p style={{ ...styles.body, fontWeight: '600', marginBottom: '0.5rem' }}>✓ Not medical advice</p>
              <p style={{ ...styles.body, fontSize: '0.9rem', color: '#666' }}>Connects to real professionals for care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Three Steps */}
      <section
        style={{
          background: theme.colors.background,
          padding: '3rem 2rem',
          marginTop: '3rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: '3rem', color: theme.colors.secondary }}>
            How It Works
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                num: '1',
                title: 'Students Report',
                desc: 'A simple, safe way for students to ask for help about anything on their mind — bullying, stress, family issues, mental health.',
                icon: '✋',
              },
              {
                num: '2',
                title: 'Educators Respond',
                desc: 'Counselors and teachers get alerts, coordinate quickly, and provide appropriate support without judgment.',
                icon: '👂',
              },
              {
                num: '3',
                title: 'Community Supports',
                desc: 'Families and community resources connect to help students thrive. Follow-up is tracked and documented.',
                icon: '🤝',
              },
            ].map((item) => (
              <div
                key={item.num}
                style={{
                  background: '#fff',
                  padding: '2rem',
                  borderRadius: '16px',
                  borderTop: `4px solid ${theme.colors.primary}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ ...styles.heading3, color: theme.colors.primary, marginBottom: '0.75rem' }}>
                  {item.title}
                </h3>
                <p style={{ ...styles.body, color: '#666', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features - Grid */}
      <section
        style={{
          maxWidth: '1200px',
          margin: `3rem auto`,
          padding: `0 2rem`,
        }}
      >
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: '3rem', color: theme.colors.secondary }}>
          Built for Trust
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}
        >
          {[
            { icon: '🔒', title: 'Confidential', desc: 'Student information is protected. You control what gets shared.' },
            { icon: '⚡', title: 'Fast Response', desc: 'Alerts reach the right people immediately. No delays.' },
            { icon: '📱', title: 'Mobile-First', desc: 'Students can report from anywhere, anytime, safely.' },
            { icon: '📊', title: 'Transparent', desc: 'Track outcomes, document actions, show impact.' },
            { icon: '🎯', title: 'Guided', desc: 'Simple questions. Compassionate language. No jargon.' },
            { icon: '🌐', title: 'Connected', desc: 'Links students to resources: counseling, mentorship, help.' },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ ...styles.heading3, color: theme.colors.secondary, marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ ...styles.body, color: '#666', fontSize: '0.95rem' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: theme.colors.primary,
          color: '#fff',
          padding: '4rem 2rem',
          marginTop: '4rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Ready to Support Your Community?
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
            }}
          >
            Whether you're a student seeking help, a school district strengthening safety, or a community partner supporting families — {APP_NAME} is here for you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/get-support"
              style={{
                ...primaryButtonStyle,
                background: '#fff',
                color: theme.colors.primary,
              }}
            >
              Get Support
            </Link>
            <Link
              href="/schools"
              style={{
                ...secondaryButtonStyle,
                background: 'transparent',
                borderColor: '#fff',
                color: '#fff',
              }}
            >
              For Schools
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Safe Voice */}
      <section
        style={{
          maxWidth: '1200px',
          margin: `4rem auto`,
          padding: `0 2rem`,
          marginBottom: '4rem',
        }}
      >
        <h2 style={{ ...styles.heading2, textAlign: 'center', marginBottom: '3rem', color: theme.colors.secondary }}>
          Why Schools & Communities Choose {APP_NAME}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {[
            {
              title: 'Designed by educators',
              desc: 'Not imposed by tech. Shaped by counselors, teachers, and school safety leaders who know the work.',
            },
            {
              title: 'Proof of impact',
              desc: 'Early adopters report faster response times, stronger family trust, and documented outcomes.',
            },
            {
              title: 'Grant-eligible',
              desc: 'Qualifies for school safety, mental health, and community resilience funding.',
            },
            {
              title: 'Clear boundaries',
              desc: 'For community partners: support without overstepping. For schools: coordination without burden.',
            },
            {
              title: 'FERPA & HIPAA ready',
              desc: 'Built with privacy and compliance at the core. Your data is protected.',
            },
            {
              title: 'Real support included',
              desc: 'Implementation, training, and ongoing guidance — not just software.',
            },
          ].map((reason, idx) => (
            <div
              key={idx}
              style={{
                background: theme.colors.lightBg,
                padding: '2rem',
                borderRadius: '12px',
                borderLeft: `4px solid ${theme.colors.primary}`,
              }}
            >
              <h3 style={{ ...styles.heading3, color: theme.colors.secondary, marginBottom: '0.75rem' }}>
                {reason.title}
              </h3>
              <p style={{ ...styles.body, color: '#666' }}>
                {reason.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
