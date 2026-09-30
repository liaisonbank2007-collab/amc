'use client';

import { useState } from 'react';
import Head from 'next/head';
import styles from './Login.module.scss';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 NEW

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

      localStorage.setItem('user_email', email.trim());
      localStorage.setItem('full_name', (result.full_name || '').trim());

      window.location.href = '/';
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
        <div className={styles.backgroundLayer}>
          <div className={`${styles.orb} ${styles.orbPurple}`} />
          <div className={`${styles.orb} ${styles.orbBlue}`} />
          <div className={`${styles.orb} ${styles.orbIndigo}`} />
          <div className={styles.gridOverlay} />
        </div>

        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <div className={styles.accentBar} />

            <div className={styles.cardInner}>
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
                      type={showPassword ? 'text' : 'password'}  // 👈 NEW
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={styles.input}
                    />

                    {/* 👇 NEW: Show / Hide password toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={styles.togglePassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        // Eye-off icon
                        <svg
                          className={styles.toggleIcon}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        // Eye icon
                        <svg
                          className={styles.toggleIcon}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
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

                  {/* <a href="#" className={styles.forgotLink}>
                    Forgot password?
                  </a> */}
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

              <div className={styles.divider}>
                <div className={styles.dividerLine} />
              </div>

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