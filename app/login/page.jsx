'use client';

import { useState } from 'react';
import Head from 'next/head';
import styles from './Login.module.scss';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const bodyString = new URLSearchParams({
      usr: email.trim(),
      pwd: password,
    }).toString();

    console.log('Body string:', bodyString);

    const res = await fetch('/api/frappe/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      body: bodyString,
    });

    const result = await res.json().catch(() => null);

    // ❌ OLD: if (!res.ok || !result?.success)
    // ✅ NEW: treat as failure only if HTTP fails OR result is missing
    //         also treat Frappe's "message" containing error as failure
    const isFailure =
      !res.ok ||
      !result ||
      (typeof result.message === 'string' &&
        /invalid|failed|error|incorrect/i.test(result.message)) ||
      result.exc;

    if (isFailure) {
      alert(result?.message || `Login failed (${res.status})`);
      return;
    }

    // ✅ Save user info to localStorage
    localStorage.setItem('user_email', email.trim());
    localStorage.setItem('full_name', (result.full_name || '').trim());

    // Optional: save the whole result for later use
    // localStorage.setItem('user', JSON.stringify(result));

    // ✅ Use home_page from response ("/me" in your case)
    window.location.href =  '/';
  } catch (error) {
    console.error('Login error:', error);
    alert('Network error. Please try again later.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <Head>
        <title>Sign In | Premium</title>
        <meta name="description" content="Premium login page" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={styles.page}>
        {/* Background decorations */}
        <div className={styles.backgroundLayer}>
          <div className={`${styles.orb} ${styles.orbPurple}`} />
          <div className={`${styles.orb} ${styles.orbBlue}`} />
          <div className={`${styles.orb} ${styles.orbIndigo}`} />
          <div className={styles.gridOverlay} />
        </div>

        {/* Main card */}
        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <div className={styles.accentBar} />

            <div className={styles.cardInner}>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.logoWrapper}>
                  <svg
                    className={styles.logoIcon}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h1 className={styles.title}>Welcome back</h1>
                <p className={styles.subtitle}>Sign in to your account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Email */}
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email address
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIconWrapper}>
                      <svg
                        className={styles.inputIcon}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIconWrapper}>
                      <svg
                        className={styles.inputIcon}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Actions row */}
                <div className={styles.actionsRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxBox}>
                      <svg
                        className={styles.checkboxCheck}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className={styles.checkboxText}>Remember me</span>
                  </label>

                  <a href="#" className={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                  {isLoading ? (
                    <span className={styles.loadingContent}>
                      <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
                        <circle
                          className={styles.spinnerCircle}
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className={styles.spinnerPath}
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                
              </div>

            

              {/* Signup */}
              <p className={styles.signupText}>
                Don&apos;t have an account?{' '}
                <a href="/register" className={styles.signupLink}>
                  Create one now
                </a>
              </p>
            </div>
          </div>

          <p className={styles.pageFooter}>
            Protected by enterprise-grade security. Your data is safe with us.
          </p>
        </div>
      </div>
    </>
  );
}