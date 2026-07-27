# Website Rebrand Implementation Guide
## Bridging the Gap™ – School Safety

**Target:** saving-grace-website (Next.js project)  
**Status:** Ready for implementation  
**Copy Version:** 1.0 (February 2026)  

---

## 📋 Quick Reference: Copy to Deploy

### Hero Section (Above the Fold)

```
HEADLINE:
Bridging the Gap™ – School Safety

SUBHEADLINE:
Connecting students, families, schools, and safety partners 
before concerns become crises.

BODY COPY:
Bridging the Gap™ is a role-based school safety and wellness platform 
designed to help students speak up, educators respond appropriately, 
families stay informed, and School Resource Officers receive timely 
awareness of serious threats — all while respecting privacy, policy, 
and care-first intervention.

CTA BUTTON 1:
▶️ See How It Works
→ Link to: #how-it-works (anchor) or /how-it-works (page)

CTA BUTTON 2:
▶️ For Schools & Districts
→ Link to: /sales or /districts
```

---

## 🎨 Design Implementation

### Color Palette
```css
--primary-blue: #1E3A8A;        /* Deep Blue - Trust, Safety */
--secondary-orange: #F97316;    /* Warm Orange - Action, Urgency */
--background-tan: #F5F1EA;      /* Neutral Tan - Calm, Clarity */
--text-white: #FFFFFF;          /* White - Clean, Professional */
```

### Typography
- **Font Family:** Inter, Poppins, or similar sans-serif (rounded edges)
- **Hero Headline:** 48px–64px, bold, deep blue
- **Subheadline:** 20px–28px, regular, deep blue
- **Body Copy:** 16px–18px, regular, dark gray
- **CTA Buttons:** 16px, bold, white text on orange background

### Logo Placeholder
```
Symbol: Bridge arc connecting two shapes
Location: Top left of hero section
Size: 60px–80px
Color: Deep blue primary
Spacing: 16px–24px from edge
```

---

## 📄 Full Page Copy (Verbatim)

### Page Structure
```
homepage/
├── Hero Section (above fold)
├── How It Works Section
├── Call-to-Action Section (optional)
├── Footer with Disclaimer
└── Navigation updated
```

### Navigation Bar
```
Logo: Bridging the Gap™
Links:
  - Home
  - How It Works
  - For Schools & Districts
  - Resources
  - Contact
```

---

### SECTION 1: Hero (Full Width)

**Background:** Light tan (#F5F1EA) or gradient (tan to white)  
**Layout:** Left-aligned text + right-side imagery (optional bridge graphic)

#### HTML Structure
```html
<section class="hero">
  <div class="hero-content">
    <h1>Bridging the Gap™ – School Safety</h1>
    <p class="subheadline">
      Connecting students, families, schools, and safety partners 
      before concerns become crises.
    </p>
    <div class="hero-body">
      <p>
        Bridging the Gap™ is a role-based school safety and wellness platform 
        designed to help students speak up, educators respond appropriately, 
        families stay informed, and School Resource Officers receive timely 
        awareness of serious threats — all while respecting privacy, policy, 
        and care-first intervention.
      </p>
    </div>
    <div class="cta-buttons">
      <button class="btn btn-primary">▶️ See How It Works</button>
      <button class="btn btn-secondary">▶️ For Schools & Districts</button>
    </div>
  </div>
  <div class="hero-image">
    <!-- Bridge graphic or illustration -->
  </div>
</section>
```

---

### SECTION 2: How It Works

**Background:** White  
**Layout:** 4 columns (stacked on mobile)

#### HTML Structure
```html
<section id="how-it-works" class="how-it-works">
  <h2>How It Works</h2>
  <div class="steps-grid">
    
    <div class="step">
      <div class="step-number">1</div>
      <h3>Students Report Early</h3>
      <p>
        Students can submit confidential concerns related to bullying, 
        mental health, safety, or basic needs.
      </p>
    </div>

    <div class="step">
      <div class="step-number">2</div>
      <h3>Counselors Guide the Response</h3>
      <p>
        Guidance counselors review, triage, and coordinate support 
        using built-in tools and resources.
      </p>
    </div>

    <div class="step">
      <div class="step-number">3</div>
      <h3>Parents Stay Informed</h3>
      <p>
        Guardians receive appropriate updates, guidance prompts, 
        and resource suggestions.
      </p>
    </div>

    <div class="step">
      <div class="step-number">4</div>
      <h3>Safety Partners Are Alerted When Needed</h3>
      <p>
        High-risk threats are escalated directly to School Resource Officers 
        based on district policy.
      </p>
    </div>

  </div>
</section>
```

**CSS Styling Notes:**
- Step numbers: Orange background (#F97316), white text, large font
- Step cards: Light tan background, rounded corners, shadow
- Headings: Deep blue (#1E3A8A), 20px bold
- Body text: Dark gray, 16px, line-height 1.6

---

### SECTION 3: Secondary CTA (Optional)

**Background:** Deep blue (#1E3A8A)  
**Text:** White  
**Layout:** Centered

```html
<section class="cta-section">
  <div class="cta-content">
    <h2>Ready to Bring Safety Home?</h2>
    <p>
      Bridging the Gap™ is helping districts across the country 
      identify concerns early and respond with care.
    </p>
    <button class="btn btn-white">Schedule a Demo</button>
  </div>
</section>
```

---

### SECTION 4: Footer (with Legal Disclaimer)

**Background:** Deep blue (#1E3A8A) or dark gray  
**Text:** White  
**Layout:** Multi-column footer

#### Footer Content
```html
<footer class="footer">
  <div class="footer-content">
    
    <div class="footer-column">
      <h4>Product</h4>
      <ul>
        <li><a href="#">Features</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Security</a></li>
      </ul>
    </div>

    <div class="footer-column">
      <h4>Company</h4>
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Blog</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>

    <div class="footer-column">
      <h4>Legal</h4>
      <ul>
        <li><a href="#">Privacy</a></li>
        <li><a href="#">Terms</a></li>
        <li><a href="#">FERPA</a></li>
      </ul>
    </div>

  </div>

  <!-- CRITICAL DISCLAIMER -->
  <div class="footer-disclaimer">
    <p>
      Bridging the Gap™ is a support and prevention platform. 
      It does not provide medical, legal, or law-enforcement advice 
      and operates in alignment with district-approved safety protocols.
    </p>
  </div>

  <div class="footer-bottom">
    <p>&copy; 2026 Bridging the Gap™ – School Safety. All rights reserved.</p>
  </div>

</footer>
```

**Disclaimer Styling:**
- Font size: 12px–14px
- Color: Light gray or light tan
- Margin: 24px top/bottom
- Centered or left-aligned
- Italic optional

---

## 🔍 SEO & Meta Tags

Update all pages with new brand:

```html
<!-- Meta Tags -->
<title>Bridging the Gap™ – School Safety | Early Prevention Platform</title>
<meta name="description" 
      content="Bridging the Gap™ is a school safety and wellness platform helping districts identify concerns early and coordinate care-first responses.">
<meta property="og:title" 
      content="Bridging the Gap™ – School Safety">
<meta property="og:description" 
      content="Connecting students, families, schools, and safety partners before concerns become crises.">
<meta property="og:image" 
      content="/images/bridging-the-gap-og-image.png">

<!-- Keywords -->
<!-- primary: Bridging the Gap, school safety, student wellbeing, threat reporting -->
<!-- secondary: bullying prevention, mental health support, SRO integration -->
<!-- tertiary: K-12 safety platform, school counselor tools -->
```

---

## 📱 Mobile Responsiveness

### Breakpoints
```css
/* Desktop: 1024px+ */
.hero { display: flex; }

/* Tablet: 768px–1023px */
@media (max-width: 1023px) {
  .hero { flex-direction: column; }
  .steps-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile: <768px */
@media (max-width: 767px) {
  h1 { font-size: 32px; }
  .steps-grid { grid-template-columns: 1fr; }
  .cta-buttons { flex-direction: column; }
}
```

---

## 🔄 Migration Checklist

Before going live, verify:

- [ ] **All copy updated** (search for "Saving Grace" — should be 0 results)
- [ ] **Logo deployed** (bridge symbol + text in header)
- [ ] **Colors correct** (blue #1E3A8A, orange #F97316)
- [ ] **CTA buttons functional** (links working)
- [ ] **Disclaimer present** (footer, not hidden)
- [ ] **Meta tags updated** (SEO, social sharing)
- [ ] **Mobile responsive** (test on phone/tablet)
- [ ] **Accessibility** (WCAG AA minimum)
  - [ ] Color contrast meets standards
  - [ ] Text readable without color alone
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
- [ ] **Legal review** (lawyer approves copy, especially disclaimer)
- [ ] **Analytics updated** (track new brand traffic)
- [ ] **Redirects in place** (old URLs → new if applicable)

---

## 📧 Email Notification Template

When website goes live, send announcement:

```
Subject: Introducing Bridging the Gap™ – School Safety

Hello [District Name],

We're excited to announce a strategic rebrand of our platform.

Bridging the Gap™ – School Safety better reflects our mission: 
connecting students, families, schools, and safety partners 
before concerns become crises.

🌉 What's changing?
• New name: Bridging the Gap™ – School Safety
• New website: bridgingthegap.school (launching [DATE])
• Same great features: No changes to your data or workflows
• Better trademark protection: Clearer legal ownership for districts

🔒 Your data is safe
All student information, reports, and audit logs remain unchanged. 
This is purely a branding refresh.

Questions? Contact us at [support email]

Warmly,
[Your Team]
```

---

## 🎯 Launch Timeline

### Week 1
- [ ] Copy approval from leadership
- [ ] Logo design final
- [ ] Domain registration (bridgingthegap.school)
- [ ] DNS pointing configured

### Week 2
- [ ] Website development (Next.js pages updated)
- [ ] QA testing (all pages, mobile, accessibility)
- [ ] SEO audit
- [ ] Lawyer approves copy

### Week 3
- [ ] Final staging review
- [ ] Analytics configured
- [ ] Redirects set up
- [ ] Email notifications prepared

### Week 4
- [ ] **LAUNCH:** Website goes live
- [ ] Email announcement sent
- [ ] Social media posts
- [ ] Board presentation scheduled

---

## 📞 Support & Questions

For implementation questions:
- **Copy Issues:** Refer to BRAND_GUIDELINES.md
- **Design Direction:** See logo concept in BRAND_GUIDELINES.md
- **Trademark Usage:** Check BRAND_GUIDELINES.md ™ symbol section
- **Approval Chain:** CEO → Marketing → Legal

---

**Document Version:** 1.0  
**Prepared:** February 2026  
**Next Review:** March 2026 (post-launch)
