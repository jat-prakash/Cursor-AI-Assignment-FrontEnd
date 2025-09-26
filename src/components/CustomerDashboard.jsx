import React, { useEffect, useMemo, useState } from 'react';
import { getCustomerProfile, getCurrentSubscription, requestSubscription, getSubscriptionHistory, listPacks } from '../api/api';

export default function CustomerDashboard({ token }) {
  const [profile, setProfile] = useState(null);
  const [currentSub, setCurrentSub] = useState(null);
  const [history, setHistory] = useState([]);
  const [packId, setPackId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [packs, setPacks] = useState([]);

  // Load all customer data
  const loadCustomerData = async () => {
    try {
      const [profileRes, currentSubRes, historyRes, packsRes] = await Promise.all([
        getCustomerProfile(token),
        getCurrentSubscription(token),
        getSubscriptionHistory(token),
        listPacks(token)
      ]);
      
      if (profileRes.success) setProfile(profileRes.data);
      if (currentSubRes.success) setCurrentSub(currentSubRes.data);
      if (historyRes.success) setHistory(historyRes.data);
      if (packsRes.success) setPacks(packsRes.data || []);
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    loadCustomerData();
    setMessage('Data refreshed!');
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    loadCustomerData();
    
    // Auto-refresh current subscription and history every 30 seconds
    const interval = setInterval(() => {
      getCurrentSubscription(token).then(res => res.success && setCurrentSub(res.data));
      getSubscriptionHistory(token).then(res => res.success && setHistory(res.data));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const availablePacks = useMemo(() => {
    if (packs.length > 0) return packs.map((p) => ({ id: p.id, name: p.name, price: p.price }));
    const ids = history.map((h) => h.pack_id).filter((id) => id !== null && id !== undefined);
    return Array.from(new Set(ids)).map((id) => ({ id, name: `Pack ${id}` }));
  }, [packs, history]);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!packId.trim() || loading) return;
    setMessage('');
    setLoading(true);
    const result = await requestSubscription(token, packId.trim());
    setMessage(result.success ? 'Subscription request sent.' : (result.message || 'Request failed.'));
    setLoading(false);
    if (result.success) {
      getSubscriptionHistory(token).then(res => res.success && setHistory(res.data));
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      padding: '32px',
      background: 'url("https://content.jdmagicbox.com/comp/pune/a6/020pxx20.xx20.090714150208.k3a6/catalogue/perennial-systems-bibvewadi-pune-computer-software-developers-6on43m8b4e.jpg?imwidth=444.3333333333333") center/cover no-repeat',
      boxSizing: 'border-box',
      position: 'relative'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      padding: '16px 24px',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(8px)'
    },
    navButton: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    refreshButton: {
      padding: '8px 16px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1
    },
    container: {
      maxWidth: '980px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2
    },
    header: {
      color: '#111827',
      marginBottom: '16px'
    },
    title: {
      margin: 0,
      fontSize: '28px',
      fontWeight: 800,
      color: '#ffffff'
    },
    subtitle: {
      marginTop: '6px',
      color: '#e5e7eb'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    card: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
      backdropFilter: 'blur(8px)'
    },
    sectionTitle: {
      margin: 0,
      marginBottom: '12px',
      fontSize: '18px',
      fontWeight: 700,
      color: '#111827'
    },
    label: {
      color: '#6b7280',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    },
    value: {
      color: '#111827',
      fontWeight: 600
    },
    statusBadge: (status) => ({
      display: 'inline-block',
      padding: '6px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 700,
      color: status === 'active' ? '#065f46' : status === 'pending' ? '#92400e' : '#1f2937',
      background: status === 'active' ? '#d1fae5' : status === 'pending' ? '#fef3c7' : '#e5e7eb',
      border: '1px solid ' + (status === 'active' ? '#a7f3d0' : status === 'pending' ? '#fde68a' : '#e5e7eb')
    }),
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 160px',
      gap: '12px',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      outline: 'none',
      background: '#ffffff',
      color: '#111827',
      boxSizing: 'border-box',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      height: '48px'
    },
    selectWrapper: {
      position: 'relative'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      paddingRight: '48px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      outline: 'none',
      background: '#ffffff',
      color: '#111827',
      boxSizing: 'border-box',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      height: '48px',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none'
    },
    selectArrow: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280',
      pointerEvents: 'none',
      fontSize: '18px'
    },
    button: (disabled) => ({
      height: '48px',
      padding: '0 18px',
      borderRadius: '12px',
      border: 'none',
      background: disabled ? '#93c5fd' : 'linear-gradient(90deg, #2563eb, #7c3aed)',
      color: '#ffffff',
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : '0 8px 24px rgba(37, 99, 235, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    message: (isError) => ({
      marginTop: '10px',
      color: isError ? '#b91c1c' : '#065f46',
      background: isError ? '#fee2e2' : '#d1fae5',
      border: '1px solid ' + (isError ? '#fecaca' : '#a7f3d0'),
      padding: '10px 12px',
      borderRadius: '10px',
      fontSize: '13px'
    }),
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0
    },
    th: {
      textAlign: 'left',
      fontSize: '12px',
      color: '#6b7280',
      padding: '10px 12px',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      fontSize: '14px',
      color: '#111827',
      padding: '12px',
      borderBottom: '1px solid #f3f4f6'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>
      <div style={styles.container}>
        <div style={styles.nav}>
          <button style={styles.navButton} onClick={() => window.location.hash = '/admin'}>
            Admin Dashboard
          </button>
          <button style={styles.navButton}>Customer Dashboard</button>
          <button style={styles.navButton} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.hash = '/login'; }}>
            Logout
          </button>
          <button style={styles.refreshButton} onClick={handleRefresh}>
            🔄 Refresh
          </button>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Customer Dashboard</h1>
          <div style={styles.subtitle}>Manage your profile and subscriptions</div>
        </div>

        <div style={styles.grid}>
          <div style={styles.row}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Profile</h2>
              {profile ? (
                <div>
                  <div><span style={styles.label}>Name</span><div style={styles.value}>{profile.name}</div></div>
                  <div style={{marginTop:'10px'}}><span style={styles.label}>Email</span><div style={styles.value}>{profile.email}</div></div>
                  <div style={{marginTop:'10px'}}><span style={styles.label}>Phone</span><div style={styles.value}>{profile.phone || '—'}</div></div>
                </div>
              ) : (
                <div>Loading profile…</div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Current Subscription</h2>
              {currentSub ? (
                <div>
                  <div><span style={styles.label}>Subscription Plan</span><div style={styles.value}>{currentSub.pack_name || `Pack ID: ${currentSub.pack_id}`}</div></div>
                  {currentSub.pack_price && (
                    <div style={{marginTop:'10px'}}><span style={styles.label}>Price</span><div style={styles.value}>${currentSub.pack_price}</div></div>
                  )}
                  <div style={{marginTop:'10px'}}><span style={styles.label}>Status</span><div style={styles.statusBadge(currentSub.status)}>{currentSub.status.toUpperCase()}</div></div>
                  {currentSub.requested_at && (
                    <div style={{marginTop:'10px'}}><span style={styles.label}>Requested At</span><div style={styles.value}>{new Date(currentSub.requested_at).toLocaleDateString()}</div></div>
                  )}
                  {currentSub.approved_at && (
                    <div style={{marginTop:'10px'}}><span style={styles.label}>Approved At</span><div style={styles.value}>{new Date(currentSub.approved_at).toLocaleDateString()}</div></div>
                  )}
                  {currentSub.assigned_at && (
                    <div style={{marginTop:'10px'}}><span style={styles.label}>Activated At</span><div style={styles.value}>{new Date(currentSub.assigned_at).toLocaleDateString()}</div></div>
                  )}
                  {currentSub.expires_at && (
                    <div style={{marginTop:'10px'}}><span style={styles.label}>Expires At</span><div style={styles.value}>{new Date(currentSub.expires_at).toLocaleDateString()}</div></div>
                  )}
                </div>
              ) : (
                <div style={{textAlign: 'center', color: '#6b7280', padding: '20px'}}>
                  <div style={{fontSize: '16px', marginBottom: '8px'}}>No current subscription</div>
                  <div style={{fontSize: '14px'}}>Request a subscription below to get started</div>
                </div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Request Subscription</h2>
            <form onSubmit={handleRequest}>
              <div style={styles.formRow}>
                <div>
                  <label htmlFor="packId" style={{...styles.label, display:'block', marginBottom:'6px'}}>Pack ID</label>
                  {!manualEntry && (
                    <div style={styles.selectWrapper}>
                      <select
                        id="packId"
                        value={packId}
                        onChange={(e) => setPackId(e.target.value)}
                        style={styles.select}
                      >
                        <option value="">Select a pack</option>
                        {availablePacks.map((p) => (
                          <option key={p.id} value={p.id}>{p.name || `Pack ${p.id}`}</option>
                        ))}
                        {availablePacks.length === 0 && <option value="" disabled>No packs available</option>}
                      </select>
                      <span style={styles.selectArrow}>▾</span>
                    </div>
                  )}
                  {manualEntry && (
                    <input id="packId" value={packId} onChange={e => setPackId(e.target.value)} placeholder="e.g. 101" style={styles.input} />
                  )}
                  <div style={{ marginTop:'6px', fontSize:'12px' }}>
                    <button type="button" onClick={() => setManualEntry((v) => !v)} style={{ background:'transparent', border:'none', color:'#1d4ed8', cursor:'pointer', padding:0 }}>
                      {manualEntry ? 'Choose from list' : 'Enter ID manually'}
                    </button>
                  </div>
                </div>
                <button type="submit" style={styles.button(loading || !packId.trim())} disabled={loading || !packId.trim()}>
                  {loading ? 'Requesting…' : 'Request'}
                </button>
              </div>
            </form>
            {message && (
              <div style={styles.message(!message.toLowerCase().includes('sent'))}>{message}</div>
            )}
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Subscription History</h2>
            {history.length > 0 ? (
              <div style={{overflowX:'auto'}}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Pack</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Requested At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(sub => (
                      <tr key={sub.id}>
                        <td style={styles.td}>{sub.id}</td>
                        <td style={styles.td}>{sub.pack_name || `Pack ID: ${sub.pack_id}`}</td>
                        <td style={styles.td}><span style={styles.statusBadge(sub.status)}>{sub.status}</span></td>
                        <td style={styles.td}>{sub.requested_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No history yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
