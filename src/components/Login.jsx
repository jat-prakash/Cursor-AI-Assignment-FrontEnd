import React, { useState, useEffect } from 'react';
import { loginAdmin, loginCustomer } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRoleLocal] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const navigate = useNavigate();

  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isFormValid = isEmailValid(email) && password.length >= 6;

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword, role: savedRole } = JSON.parse(savedCredentials);
        setEmail(savedEmail || '');
        setPassword(savedPassword || '');
        setRoleLocal(savedRole || 'customer');
        setRememberPassword(true);
      } catch (error) {
        // If parsing fails, remove invalid data
        localStorage.removeItem('rememberedCredentials');
      }
    }
  }, []);

  // Clear saved credentials when email or role changes (for switching accounts)
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // If email changes and we have saved credentials, but email doesn't match, clear remember state
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials && rememberPassword) {
      try {
        const { email: savedEmail } = JSON.parse(savedCredentials);
        if (savedEmail !== e.target.value) {
          setRememberPassword(false);
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  };

  const handleRoleChange = (newRole) => {
    setRoleLocal(newRole);
    // If role changes and we have saved credentials, but role doesn't match, clear remember state
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials && rememberPassword) {
      try {
        const { role: savedRole } = JSON.parse(savedCredentials);
        if (savedRole !== newRole) {
          setRememberPassword(false);
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    if (!isFormValid) {
      setError('Please enter a valid email and a password with 6+ characters.');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (role === 'admin') {
        result = await loginAdmin(email, password);
      } else {
        result = await loginCustomer(email, password);
        console.log('###### result', result);
      }
      if (result.success) {
        // Save or clear credentials based on remember checkbox
        if (rememberPassword) {
          localStorage.setItem('rememberedCredentials', JSON.stringify({
            email,
            password,
            role
          }));
        } else {
          localStorage.removeItem('rememberedCredentials');
        }
        
        setToken(result.data.token);
        setRole(role);
        navigate(role === 'admin' ? '/admin' : '/customer');
      } else {
        setError(result.message || 'Login failed. Please try again.');
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
      maxWidth: '380px',
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
    roleToggle: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginTop: '12px',
      marginBottom: '8px'
    },
    roleBtn: (active) => ({
      padding: '10px 12px',
      borderRadius: '10px',
      border: '1px solid ' + (active ? '#2563eb' : '#e5e7eb'),
      background: active ? '#eff6ff' : '#ffffff',
      color: active ? '#1d4ed8' : '#374151',
      fontWeight: 600,
      cursor: 'pointer'
    }),
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
    checkboxField: {
      marginTop: '16px',
      marginBottom: '4px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151'
    },
    checkbox: {
      marginRight: '8px',
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      accentColor: '#2563eb'
    },
    checkboxText: {
      userSelect: 'none'
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
          <h1 style={styles.title}>Welcome back</h1>
          <div style={styles.subtitle}>Sign in to continue to your dashboard</div>
        </div>

        <div style={styles.roleToggle} role="tablist" aria-label="Select role">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'customer'}
            onClick={() => handleRoleChange('customer')}
            style={styles.roleBtn(role === 'customer')}
          >
            Customer
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === 'admin'}
            onClick={() => handleRoleChange('admin')}
            style={styles.roleBtn(role === 'admin')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={email ? !isEmailValid(email) : undefined}
              style={styles.input(email && !isEmailValid(email))}
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <input
                id="password"
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={password ? password.length < 6 : undefined}
                style={{...styles.input(password && password.length < 6), paddingRight: '44px'}}
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
          
          <div style={styles.checkboxField}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Remember my password</span>
            </label>
          </div>
          
          <button type="submit" disabled={loading || !isFormValid} style={styles.submit(loading || !isFormValid)}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          {error && <div role="alert" style={styles.error}>{error}</div>}
        </form>

        <div style={styles.footer}>
          New here? <a href="#/register" style={styles.link}>Register as Customer</a>
        </div>
      </div>
    </div>
  );
}
