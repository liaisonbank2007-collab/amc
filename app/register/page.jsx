'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import styles from './register.module.scss';

// 👇 Helper: Extract a readable message from Frappe's messy error format
// 👇 Add this helper ABOVE your component
function parseFrappeError(result, status) {
  if (!result) {
    return {
      message: `Registration failed (${status}). Please try again.`,
      field: null,
    };
  }

  // 1️⃣ Frappe's clean user-facing message
  let cleanMessage = null;
  if (result._server_messages) {
    try {
      const arr = JSON.parse(result._server_messages);
      const parsed = arr
        .map((m) => {
          try {
            return JSON.parse(m).message;
          } catch {
            return m;
          }
        })
        .filter(Boolean);
      if (parsed.length) cleanMessage = parsed.join(' ');
    } catch {
      /* ignore */
    }
  }

  // 2️⃣ Detect which field caused the error from the exception string
  let field = null;
  let friendlyMessage = cleanMessage;

  const raw = `${result.exception || ''} ${result.exc_type || ''}`;

  // Match: Duplicate entry '9137940360' for key 'mobile_no'
  const dupMatch = raw.match(
    /Duplicate entry '([^']+)' for key '([^']+)'/
  );

  if (dupMatch) {
    const [, value, key] = dupMatch;
    if (key.includes('mobile')) {
      field = 'mobile_number';
      friendlyMessage = `Mobile number ${value} is already registered. Please use a different one.`;
    } else if (key.includes('email') || key.includes('name')) {
      field = 'email';
      friendlyMessage = `Email ${value} is already registered. Please sign in instead.`;
    } else {
      friendlyMessage = `${value} is already registered.`;
    }
  } else if (result.exc_type === 'UniqueValidationError') {
    // Fallback: use clean message + guess field from it
    if (/mobile/i.test(cleanMessage || '')) {
      field = 'mobile_number';
      friendlyMessage = 'This mobile number is already registered.';
    } else if (/email/i.test(cleanMessage || '')) {
      field = 'email';
      friendlyMessage = 'This email is already registered.';
    }
  }

  // 3️⃣ Final fallback
  if (!friendlyMessage) {
    friendlyMessage =
      result.data?.message ||
      result.message ||
      `Registration failed (${status}). Please try again.`;
  }

  return { message: friendlyMessage, field };
}

export default function RegistrationPage() {
  const router = useRouter();
  const [apiMessage, setApiMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError, // 👈 NEW: for mapping backend errors to fields
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      mobile_number: '',
      location: '',
    },
  });

  const password = watch('password', '');

 const onSubmit = async (data) => {
  setIsSubmitting(true);
  setApiMessage(null);

  try {
    const response = await fetch('/api/frappe/register_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => null);

    // ✅ Detect success
    const isSuccess =
      response.ok &&
      !result?.exception &&
      (result?.message?.success === true ||
        result?.data?.success === true ||
        (result?.message &&
          typeof result.message === 'object' &&
          result.message.success));

    if (isSuccess) {
      const msg =
        result?.message?.message ||
        result?.data?.message ||
        'Registration successful! Redirecting to login…';

      setApiMessage({ type: 'success', text: msg });
      reset();
      setTimeout(() => router.push('/login'), 1200);
      return;
    }

    // ❌ Error path — parse the messy Frappe response
    const { message, field } = parseFrappeError(result, response.status);

    // Attach error to the specific field so the user sees it inline
    if (field) {
      setError(field, { type: 'server', message });
    }

    setApiMessage({ type: 'error', text: message });
  } catch (error) {
    console.error('Registration error:', error);
    setApiMessage({
      type: 'error',
      text: 'Network error. Please try again later.',
    });
  } finally {
    setIsSubmitting(false);
  }
};
  const getStrength = (pw) => {
    let score = 0;
    if (!pw) return { score: 0, label: '', color: '' };
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'weak' };
    if (score === 3) return { score, label: 'Fair', color: 'fair' };
    if (score === 4) return { score, label: 'Good', color: 'good' };
    return { score, label: 'Strong', color: 'strong' };
  };

  const strength = getStrength(password);

  return (
    <div className={styles.page}>
      <div className={`${styles.blob} ${styles.blobTopLeft}`} />
      <div className={`${styles.blob} ${styles.blobBottomRight}`} />
      <div className={`${styles.blob} ${styles.blobCenter}`} />

      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>
              Join Liaison Bank in just a few seconds
            </p>
          </div>

          {apiMessage && (
            <div
              className={`${styles.alert} ${
                apiMessage.type === 'success'
                  ? styles.alertSuccess
                  : styles.alertError
              }`}
            >
              <span className={styles.alertIcon}>
                {apiMessage.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                )}
              </span>
              <span className={styles.alertText}>{apiMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            {/* Email */}
            <div className={styles.field}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder=" "
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              <label htmlFor="email" className={styles.label}>Email address</label>
              {errors.email && (
                <p className={styles.error}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Names */}
            <div className={styles.row}>
              <div className={styles.field}>
                <input
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder=" "
                  {...register('first_name', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Too short' },
                    maxLength: { value: 50, message: 'Too long' },
                  })}
                  className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
                />
                <label htmlFor="first_name" className={styles.label}>First name</label>
                {errors.first_name && <p className={styles.error}>{errors.first_name.message}</p>}
              </div>

              <div className={styles.field}>
                <input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder=" "
                  {...register('last_name', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Too short' },
                    maxLength: { value: 50, message: 'Too long' },
                  })}
                  className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
                />
                <label htmlFor="last_name" className={styles.label}>Last name</label>
                {errors.last_name && <p className={styles.error}>{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Mobile */}
            <div className={styles.field}>
              <input
                id="mobile_number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder=" "
                maxLength={10}
                {...register('mobile_number', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[6-9][0-9]{9}$/, // Indian mobile numbers starting 6-9
                    message: 'Enter a valid 10-digit mobile number',
                  },
                  setValueAs: (v) => v.replace(/\D/g, ''), // strip non-digits
                })}
                className={`${styles.input} ${errors.mobile_number ? styles.inputError : ''}`}
              />
              <label htmlFor="mobile_number" className={styles.label}>Mobile number</label>
              {errors.mobile_number && (
                <p className={styles.error}>{errors.mobile_number.message}</p>
              )}
            </div>

            {/* Location */}
            <div className={styles.field}>
              <input
                id="location"
                type="text"
                autoComplete="address-level2"
                placeholder=" "
                {...register('location', {
                  required: 'Location is required',
                  minLength: { value: 2, message: 'Too short' },
                })}
                className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
              />
              <label htmlFor="location" className={styles.label}>Location</label>
              {errors.location && <p className={styles.error}>{errors.location.message}</p>}
            </div>

            {/* Password */}
            <div className={styles.field}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder=" "
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  validate: {
                    hasUpper: (v) => /[A-Z]/.test(v) || 'Add at least one uppercase letter',
                    hasLower: (v) => /[a-z]/.test(v) || 'Add at least one lowercase letter',
                    hasNumber: (v) => /[0-9]/.test(v) || 'Add at least one number',
                  },
                })}
                className={`${styles.input} ${styles.inputWithIcon} ${errors.password ? styles.inputError : ''}`}
              />
              <label htmlFor="password" className={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={styles.togglePassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>

              {password && (
                <div className={styles.strength}>
                  <div className={styles.strengthBars}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`${styles.strengthBar} ${
                          i < strength.score ? styles[`strength_${strength.color}`] : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`${styles.strengthLabel} ${styles[`strengthLabel_${strength.color}`]}`}>
                    {strength.label}
                  </span>
                </div>
              )}

              {errors.password && <p className={styles.error}>{errors.password.message}</p>}
            </div>

            <label className={styles.terms}>
              <input type="checkbox" required className={styles.checkbox} />
              <span>
                I agree to the{' '}
                <a href="#" className={styles.link}>Terms</a>{' '}
                and{' '}
                <a href="#" className={styles.link}>Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={isSubmitting} className={styles.submit}>
              <span className={styles.shimmer} />
              {isSubmitting ? (
                <>
                  <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className={styles.spinnerHead} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.arrow}>
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account?{' '}
            <a href="/login" className={styles.link}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}