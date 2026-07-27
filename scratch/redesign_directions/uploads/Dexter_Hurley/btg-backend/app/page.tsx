export default function Home() {
  return (
    <main style={{ padding: "24px", fontFamily: "var(--font-geist-sans)" }}>
      <h1>BTG Backend</h1>
      <p>API backend and auth service for FERPA-protected workflows.</p>
      <p>
        To test authentication providers, open <a href="/auth-test">/auth-test</a>.
      </p>
    </main>
  );
}
