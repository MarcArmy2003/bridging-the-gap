export const theme = {
  colors: {
    primary: '#F97316', // warm orange
    secondary: '#111827', // near-black
    background: '#F5F1EA', // soft tan
    accent: '#22C55E', // calm green
    text: '#1F2937', // dark gray
    lightText: '#6B7280', // medium gray
    lightBg: '#F9FAFB', // very light gray
    border: '#E5E7EB', // light border
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
};

// Reusable style objects
export const styles = {
  heroSection: {
    background: theme.colors.background,
    padding: `${theme.spacing.xl} ${theme.spacing.lg}`,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionCard: {
    background: '#FFFFFF',
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
  },
  primaryButton: {
    background: theme.colors.primary,
    color: '#FFFFFF',
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.radius.md,
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  secondaryButton: {
    background: '#FFFFFF',
    color: theme.colors.primary,
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.radius.md,
    border: `2px solid ${theme.colors.primary}`,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  heading1: {
    fontSize: '3rem',
    fontWeight: '700',
    color: theme.colors.secondary,
    lineHeight: '1.2',
  },
  heading2: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.secondary,
    lineHeight: '1.3',
  },
  heading3: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  body: {
    fontSize: '1rem',
    color: theme.colors.text,
    lineHeight: '1.6',
  },
};
