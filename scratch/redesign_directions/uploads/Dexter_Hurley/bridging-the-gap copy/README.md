# Bridging the Gap
## Student Safety & Wellness Platform

**Status:** Active Development  
**Version:** 1.0.0  
**Platform:** React Native (Expo) + Next.js Website  

---

## 📋 About Bridging the Gap

Bridging the Gap is a prevention-focused, role-based school safety and wellness platform designed to:

✅ **Enable Students** to report concerns confidentially (bullying, mental health, safety)  
✅ **Support Counselors** with structured workflows and built-in guidance  
✅ **Engage Families** with age-appropriate updates and resource suggestions  
✅ **Alert Safety Partners** (SROs) to high-risk threats per district policy  

**Mission:** Connecting students, families, schools, and safety partners before concerns become crises.

---

## 🚀 Quick Start

### 🌐 Hosting the Website (GitHub Pages)

Because the website (`saving-grace-website`) is a static Next.js export, it can be hosted natively and for free on your GitHub repository!

**How to activate your live website:**
1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. GitHub will auto-detect the Next.js project. Click **Configure** on the suggested Next.js workflow and commit the file. 
4. Your site will automatically build and deploy. Once finished, the live URL will be displayed at the top of the Settings > Pages screen!

### 📱 Local Development Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Clone the repository
git clone https://github.com/[org]/bridging-the-gap-school-safety.git
cd bridging-the-gap-school-safety

# Install dependencies
npm install

# Start Expo development server
npx expo start

# In another terminal, open web version
npm run web

# Or open mobile:
# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
# Or scan QR code with Expo Go app
```

### Environment Variables

Create `.env.local` with:

```env
EXPO_PUBLIC_API_URL=https://api.safevoice.app
EXPO_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
# Optional fallback (legacy): EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📁 Project Structure

```
bridging-the-gap-school-safety/
├── app/                          # Expo app (React Native)
│   └── components/
│       ├── PageHeader.tsx
│       ├── BoardPresentationMode.tsx
│       └── theme.ts
├── src/                          # Core application code
│   ├── components/               # Shared components
│   │   ├── PrimaryButton.tsx
│   │   ├── SectionCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SeverityBadge.tsx
│   │   ├── theme.ts             # Brand colors & typography
│   │   └── DemoInfoPanel.tsx
│   ├── data/                     # APIs & data models
│   │   ├── apiTypes.ts
│   │   ├── threatClassification.ts
│   │   ├── threatEscalation.ts
│   │   ├── sroNotificationApi.ts
│   │   └── demoData.ts
│   ├── models/                   # TypeScript types
│   │   └── types.ts              # ThreatReport, Case, User, etc.
│   ├── screens/                  # Screen components
│   │   ├── staff/
│   │   │   └── ThreatIntakeScreen.tsx
│   │   ├── law/
│   │   │   └── SROThreatPortalScreen.tsx
│   │   └── ...
│   ├── utils/                    # Utilities
│   │   ├── useDemo.tsx           # Demo mode hook
│   │   ├── threatClassification.ts
│   │   ├── threatEscalation.ts
│   │   └── requireRole.ts
│   ├── store/                    # State management
│   │   └── AppContext.tsx
│   └── navigation/               # Navigation
│       └── AppNavigator.tsx
├── docs/                         # Documentation
│   ├── BRAND_GUIDELINES.md       # Complete brand guidelines
│   ├── THREAT_REPORTING_ARCHITECTURE.md
│   ├── BRAND_NAMING_GUIDANCE.md
│   ├── WEBSITE_REBRAND_IMPLEMENTATION.md
│   ├── DISTRICT_SALES_MATERIALS.md
│   └── ...
├── App.tsx                       # Main app entry
├── app.json                      # Expo configuration
└── package.json
```

---

## 🎯 Key Features

### For Students
- Confidential reporting of concerns (bullying, mental health, safety)
- Structured intake (no free-text diagnosis)
- Updates on support status
- Resource suggestions

### For Counselors
- Incoming case dashboard
- Triage and assignment tools
- Built-in guidance framework
- Parent communication templates
- Support tracking

### For Parents
- Age-appropriate updates on student concerns
- Guidance tips and resources
- No over-sharing of health details
- Communication preferences

### For School Resource Officers
- Real-time threat alerts
- Detailed incident context
- Resolution workflow
- Audit logging

### For Administrators
- System usage analytics
- Audit trail review
- Policy configuration
- Board reporting

---

## 🔒 Security & Compliance

- **FERPA Compliant:** Student health/educational data protected
- **Encrypted:** End-to-end encryption (TLS) + AES-256 at rest
- **Auditable:** Immutable audit trail of all actions
- **Role-Based:** Access control enforced per role
- **SOC 2 Ready:** Aligns with security best practices

---

## 📚 Documentation

Key documents:

- [BRAND_GUIDELINES.md](./docs/BRAND_GUIDELINES.md) — Full brand identity, usage rules, legal info
- [THREAT_REPORTING_ARCHITECTURE.md](./docs/THREAT_REPORTING_ARCHITECTURE.md) — Threat system design, escalation rules, compliance
- [WEBSITE_REBRAND_IMPLEMENTATION.md](./docs/WEBSITE_REBRAND_IMPLEMENTATION.md) — Website copy, implementation checklist
- [DISTRICT_SALES_MATERIALS.md](./docs/DISTRICT_SALES_MATERIALS.md) — Sales pitch, RFP template, board talking points

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Check TypeScript
```bash
npm run type-check
```

### Lint Code
```bash
npm run lint
```

---

## 🚢 Deployment

### Development
```bash
npx expo start --clear
```

### Production Build
```bash
npx expo export
```

### Web Deployment (Vercel)
```bash
npm run build
vercel deploy
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "feat: description"`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

**Code Style:**
- TypeScript strict mode
- ESLint rules enforced
- 2-space indentation
- Descriptive commit messages

---

## 📄 License

This project is proprietary. All rights reserved.

For licensing inquiries, contact: legal@bridgingthegap.school

---

## 📞 Support & Contact

- **Website:** https://bridgingthegap.school
- **Email:** support@bridgingthegap.school
- **Sales:** sales@bridgingthegap.school
- **Issue Tracker:** [GitHub Issues](https://github.com/[org]/bridging-the-gap-school-safety/issues)

---

## 🎓 Brand Information

**Official Name:** Safe Voice  
**Trademark Status:** ™ (pending ® federal registration)  
**Color Palette:** Deep Blue (#1E3A8A), Warm Orange (#F97316)  
**Tagline:** "Connecting students, families, schools, and safety partners before concerns become crises."

For complete brand guidelines, see [BRAND_GUIDELINES.md](./docs/BRAND_GUIDELINES.md).

---

**Last Updated:** February 2026  
**Maintainer:** [Your Team]
