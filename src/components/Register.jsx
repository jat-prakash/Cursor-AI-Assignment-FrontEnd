import React, { useState } from 'react';
import { registerCustomer } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isNameValid = name.trim().length >= 2;
  const isPasswordValid = password.length >= 6;
  const isFormValid = isNameValid && isEmailValid(email) && isPasswordValid;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    if (!isFormValid) {
      setError('Please complete the form with valid details.');
      return;
    }
    setLoading(true);
    try {
      const result = await registerCustomer(email, password, name, phone);
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'url("https://content.jdmagicbox.com/comp/pune/a6/020pxx20.xx20.090714150208.k3a6/catalogue/perennial-systems-bibvewadi-pune-computer-software-developers-6on43m8b4e.jpg?imwidth=444.3333333333333") center/cover no-repeat',
      padding: '24px',
      position: 'relative'
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      borderRadius: '16px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      padding: '28px',
      position: 'relative',
      zIndex: 2
    },
    header: {
      marginBottom: '16px'
    },
    title: {
      margin: 0,
      fontSize: '24px',
      fontWeight: 700,
      color: '#111827'
    },
    subtitle: {
      marginTop: '6px',
      color: '#6b7280',
      fontSize: '14px'
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '12px'
    },
    label: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '6px'
    },
    inputWrap: {
      position: 'relative'
    },
    input: (invalid) => ({
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid ' + (invalid ? '#ef4444' : '#e5e7eb'),
      outline: 'none',
      background: '#ffffff',
      color: '#111827',
      transition: 'border-color 0.15s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      boxSizing: 'border-box'
    }),
    togglePw: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '4px 6px'
    },
    submit: (disabled) => ({
      marginTop: '16px',
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: 'none',
      background: disabled ? '#93c5fd' : 'linear-gradient(90deg, #2563eb, #7c3aed)',
      color: '#ffffff',
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : '0 8px 24px rgba(37, 99, 235, 0.35)',
      boxSizing: 'border-box'
    }),
    error: {
      marginTop: '12px',
      color: '#b91c1c',
      background: '#fee2e2',
      border: '1px solid #fecaca',
      padding: '10px 12px',
      borderRadius: '10px',
      fontSize: '13px'
    },
    footer: {
      marginTop: '14px',
      fontSize: '13px',
      color: '#6b7280'
    },
    link: {
      color: '#1d4ed8',
      fontWeight: 600,
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create your account</h1>
          <div style={styles.subtitle}>Register to start managing your subscriptions</div>
        </div>

        <form onSubmit={handleRegister} noValidate>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              aria-invalid={name ? !isNameValid : undefined}
              style={styles.input(name && !isNameValid)}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={email ? !isEmailValid(email) : undefined}
              style={styles.input(email && !isEmailValid(email))}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="phone" style={styles.label}>Phone (optional)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(+1) 555-123-4567"
              autoComplete="tel"
              style={styles.input(false)}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                aria-invalid={password ? !isPasswordValid : undefined}
                style={{ ...styles.input(password && !isPasswordValid), paddingRight: '44px' }}
              />
              <button
                type="button"
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                onClick={() => setPasswordVisible((v) => !v)}
                style={styles.togglePw}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !isFormValid} style={styles.submit(loading || !isFormValid)}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
          {error && <div role="alert" style={styles.error}>{error}</div>}
        </form>

        <div style={styles.footer}>
          Already have an account? <a href="#/login" style={styles.link}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
