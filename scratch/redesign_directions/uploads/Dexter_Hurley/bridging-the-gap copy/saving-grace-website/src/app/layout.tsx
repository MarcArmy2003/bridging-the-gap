import React from "react";
import { APP_NAME, APP_TAGLINE, CONTACT_EMAIL } from "@/lib/branding";

const theme = {
  colors: {
    primary: "#F97316",
    secondary: "#111827",
    background: "#F5F1EA",
    accent: "#22C55E",
    border: "#E5E7EB",
  },
};

export const metadata = {
  title: APP_NAME,
  description: APP_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Roboto, sans-serif", margin: 0, background: "#FFFFFF" }}>
        <header
          style={{
            padding: "1.5rem 2rem",
            borderBottom: `2px solid ${theme.colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <strong style={{ fontSize: "1.5rem", color: theme.colors.secondary, letterSpacing: "-0.5px" }}>
              {APP_NAME}
            </strong>
          </a>

          <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <a href="/app" style={{ color: theme.colors.secondary, textDecoration: "none", fontSize: "0.95rem", fontWeight: "500", transition: "color 0.2s" }}>
              Open the App
            </a>
            <a href="/get-support" style={{ fontWeight: "600", textDecoration: "none", fontSize: "0.95rem", padding: "0.5rem 1rem", background: theme.colors.primary, color: "#fff", borderRadius: "8px", transition: "background 0.2s" }}>
              Get Support
            </a>
          </nav>
        </header>

        <main>{children}</main>

        <footer
          style={{
            padding: "3rem 2rem",
            borderTop: `2px solid ${theme.colors.border}`,
            marginTop: "4rem",
            background: theme.colors.background,
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
              <div>
                <strong style={{ color: theme.colors.secondary }}>{APP_NAME}</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {APP_TAGLINE}
                </p>
              </div>
              <div>
                <strong style={{ color: theme.colors.secondary }}>For</strong>
                <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0" }}>
                  <li><a href="/schools" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>Schools & Districts</a></li>
                  <li><a href="/churches" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>Churches & Communities</a></li>
                  <li><a href="/get-support" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>Students & Families</a></li>
                </ul>
              </div>
              <div>
                <strong style={{ color: theme.colors.secondary }}>App</strong>
                <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0" }}>
                  <li><a href="/app" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>Open Web App</a></li>
                  <li><a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: "2rem", textAlign: "center", color: "#999", fontSize: "0.85rem" }}>
              <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved. {APP_TAGLINE}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
