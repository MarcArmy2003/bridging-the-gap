"use client";

import { FormEvent, useMemo, useState } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import styles from "./AuthTestPanel.module.css";

const ERROR_MESSAGES: Record<string, string> = {
  BTG_MISSING_CLAIMS:
    "BTG login failed: required claims (sub/email) were not present.",
  BTG_USER_NOT_LINKED:
    "BTG login failed: no matching local user was found for this email.",
  BTG_CALLBACK_FAILURE: "BTG login failed during callback processing.",
  BTG_EMAIL_NOT_VERIFIED:
    "BTG login failed because the identity email is not verified.",
  BTG_INVALID_ISSUER: "BTG login failed because token issuer validation failed.",
  BTG_INVALID_AUDIENCE:
    "BTG login failed because token audience validation failed.",
  BTG_TOKEN_REFRESH_FAILED: "BTG session expired and token refresh failed.",
  BTG_REFRESH_TOKEN_MISSING:
    "BTG session expired and no refresh token was available.",
  BTG_TOKEN_ENDPOINT_MISSING:
    "BTG session refresh cannot run because token endpoint is not configured.",
  REAUTH_REQUIRED: "Session expired. Please sign in again.",
  BTG_LOGOUT_FAILED: "BTG logout did not complete cleanly.",
  AccessDenied: "Sign-in was denied by the authentication policy.",
  CredentialsSignin: "Invalid email or password.",
};

type Props = {
  btgEnabled: boolean;
};

export default function AuthTestPanel({ btgEnabled }: Props) {
  return (
    <SessionProvider>
      <AuthTestPanelBody btgEnabled={btgEnabled} />
    </SessionProvider>
  );
}

function AuthTestPanelBody({ btgEnabled }: Props) {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const queryError = params.get("error");
  const externalError = useMemo(() => {
    if (!queryError) return null;
    return ERROR_MESSAGES[queryError] || `Authentication error: ${queryError}`;
  }, [queryError]);

  const sessionError = session?.authError
    ? ERROR_MESSAGES[session.authError] || session.authError
    : null;

  async function onCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFormError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setFormError(ERROR_MESSAGES[result.error] || result.error);
      return;
    }

    window.location.href = "/auth-test";
  }

  async function onBtgSignIn() {
    setFormError(null);
    await signIn("btg", { callbackUrl: "/auth-test" });
  }

  async function onSignOut() {
    const provider = session?.user?.authProvider;
    await signOut({ redirect: false });

    if (provider === "btg") {
      window.location.href = "/api/auth/btg/logout";
      return;
    }

    window.location.href = "/auth-test";
  }

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <h1>BTG Backend Auth Test</h1>
        <p>
          Credentials login remains enabled. BTG sign-in can be tested in
          parallel when toggled on.
        </p>

        {externalError ? <div className={styles.error}>{externalError}</div> : null}
        {sessionError ? <div className={styles.error}>{sessionError}</div> : null}
        {formError ? <div className={styles.error}>{formError}</div> : null}

        {status === "authenticated" && session.user ? (
          <div className={styles.sessionBlock}>
            <h2>Session</h2>
            <p>
              <strong>User ID:</strong> {session.user.id}
            </p>
            <p>
              <strong>Email:</strong> {session.user.email || "(none)"}
            </p>
            <p>
              <strong>Role:</strong> {session.user.role}
            </p>
            <p>
              <strong>Provider:</strong>{" "}
              {session.user.authProvider || "credentials"}
            </p>
            {session.btg?.subject ? (
              <p>
                <strong>BTG Subject:</strong> {session.btg.subject}
              </p>
            ) : null}
            <button className={styles.button} onClick={onSignOut} type="button">
              Sign out
            </button>
          </div>
        ) : (
          <div className={styles.loginGrid}>
            <form className={styles.form} onSubmit={onCredentialsSubmit}>
              <h2>Credentials</h2>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className={styles.button} type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in with credentials"}
              </button>
            </form>

            <div className={styles.form}>
              <h2>BTG</h2>
              <p>
                BTG auth is currently <strong>{btgEnabled ? "enabled" : "disabled"}</strong>.
              </p>
              <button
                className={styles.button}
                type="button"
                onClick={onBtgSignIn}
                disabled={!btgEnabled}
              >
                Sign in with BTG
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
