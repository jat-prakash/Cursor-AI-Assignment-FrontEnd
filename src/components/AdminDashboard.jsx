import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createPack, 
  listPacks, 
  updatePack, 
  deletePack,
  getCustomers, 
  updateCustomer, 
  deleteCustomer,
  getSubscriptions,
  updateSubscriptionStatus,
  assignSubscription,
  getDashboardMetrics 
} from '../api/api';

export default function AdminDashboard({ token }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Dashboard Metrics State
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pendingSubscriptions: 0,
    totalRevenue: 0
  });

  // Subscription Packs State
  const [packs, setPacks] = useState([]);
  const [packForm, setPackForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    validity_months: ''
  });
  const [editingPack, setEditingPack] = useState(null);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState('all'); // 'all', 'active', 'pending', 'expired', 'inactive'

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeSection === 'packs') {
      loadPacks();
    } else if (activeSection === 'customers') {
      loadCustomers();
    } else if (activeSection === 'subscriptions') {
      loadSubscriptions();
    }
    // Clear message when switching sections unless specifically set by card click
    if (activeSection !== 'subscriptions') {
      setMessage('');
    }
  }, [activeSection]);

  const loadDashboardData = async () => {
    try {
      const result = await getDashboardMetrics(token);
      if (result.success) {
        setDashboardData({
          totalCustomers: result.data.totalCustomers,
          totalSubscriptions: result.data.totalSubscriptions,
          activeSubscriptions: result.data.activeSubscriptions,
          pendingSubscriptions: result.data.pendingSubscriptions,
          expiredSubscriptions: result.data.expiredSubscriptions,
          inactiveSubscriptions: result.data.inactiveSubscriptions,
          totalRevenue: result.data.totalRevenue
        });
      } else {
        // Fallback to simulated data if API fails
        setDashboardData({
          totalCustomers: 0,
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          pendingSubscriptions: 0,
          totalRevenue: 0
        });
        setMessage('Unable to load dashboard metrics');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setMessage('Error loading dashboard data');
    }
  };

  const loadPacks = async () => {
    setLoading(true);
    try {
      const result = await listPacks(token);
      if (result.success) {
        setPacks(result.data || []);
      }
    } catch (error) {
      setMessage('Error loading packs');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await getCustomers(token);
      if (result.success) {
        setCustomers(result.data || []);
      } else {
        setMessage(result.message || 'Error loading customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setMessage('Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const result = await getSubscriptions(token);
      if (result.success) {
        setSubscriptions(result.data || []);
      } else {
        setMessage(result.message || 'Error loading subscriptions');
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setMessage('Error loading subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionStatusChange = async (subscriptionId, newStatus) => {
    try {
      setLoading(true);
      const result = await updateSubscriptionStatus(token, subscriptionId, newStatus);
      if (result.success) {
        setMessage(`Subscription ${newStatus} successfully!`);
        loadSubscriptions(); // Reload the subscriptions list
        loadDashboardData(); // Reload dashboard metrics
      } else {
        setMessage(result.message || 'Failed to update subscription status');
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
      setMessage('Error updating subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || ''
    });
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const result = await deleteCustomer(token, customerId);
      if (result.success) {
        setMessage('Customer deleted successfully!');
        loadCustomers();
        loadDashboardData(); // Reload dashboard metrics
      } else {
        setMessage(result.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setMessage('Error deleting customer');
    }
  };

  const handleCreatePack = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createPack(token, {
        ...packForm,
        price: parseFloat(packForm.price),
        validity_months: parseInt(packForm.validity_months)
      });
      if (result.success) {
        setMessage('Pack created successfully!');
        setPackForm({ name: '', description: '', sku: '', price: '', validity_months: '' });
        loadPacks();
      } else {
        setMessage(result.message || 'Failed to create pack');
      }
    } catch (error) {
      setMessage('Error creating pack');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePack = async (e) => {
    e.preventDefault();
    if (!editingPack) return;
    setLoading(true);
    try {
      const result = await updatePack(token, editingPack.id, {
        ...packForm,
        price: parseFloat(packForm.price),
        validity_months: parseInt(packForm.validity_months)
      });
      if (result.success) {
        setMessage('Pack updated successfully!');
        setEditingPack(null);
        setPackForm({ name: '', description: '', sku: '', price: '', validity_months: '' });
        loadPacks();
      } else {
        setMessage(result.message || 'Failed to update pack');
      }
    } catch (error) {
      setMessage('Error updating pack');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePack = async (packId) => {
    if (!confirm('Are you sure you want to delete this pack?')) return;
    try {
      const result = await deletePack(token, packId);
      if (result.success) {
        setMessage('Pack deleted successfully!');
        loadPacks();
      } else {
        setMessage(result.message || 'Failed to delete pack');
      }
    } catch (error) {
      setMessage('Error deleting pack');
    }
  };

  const startEditPack = (pack) => {
    setEditingPack(pack);
    setPackForm({
      name: pack.name,
      description: pack.description,
      sku: pack.sku,
      price: pack.price.toString(),
      validity_months: pack.validity_months.toString()
    });
  };

  const cancelEdit = () => {
    setEditingPack(null);
    setEditingCustomer(null);
    setPackForm({ name: '', description: '', sku: '', price: '', validity_months: '' });
    setCustomerForm({ name: '', email: '', phone: '' });
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      navigate('/login');
    }
  };

  const navigateToCustomerDashboard = () => {
    navigate('/customer');
  };

  // Metric card click handlers
  const handleCustomersCardClick = () => {
    setActiveSection('customers');
    setMessage('Customer management: View, edit, and manage all customer accounts.');
  };

  const handleSubscriptionsCardClick = () => {
    setActiveSection('subscriptions');
    setSubscriptionFilter('all');
    setMessage('Viewing all subscriptions across all statuses.');
  };

  const handleActiveSubscriptionsCardClick = () => {
    setActiveSection('subscriptions');
    setSubscriptionFilter('active');
    setMessage('Showing only active subscriptions. These customers have full access to services.');
  };

  const handlePendingSubscriptionsCardClick = () => {
    setActiveSection('subscriptions');
    setSubscriptionFilter('requested');
    setMessage('Showing pending subscription requests. These require your approval to activate.');
  };

  const handleRevenueCardClick = () => {
    setActiveSection('subscriptions');
    setSubscriptionFilter('all');
    setMessage('Revenue breakdown: Active and completed subscriptions contribute to total revenue.');
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'url("https://content.jdmagicbox.com/comp/pune/a6/020pxx20.xx20.090714150208.k3a6/catalogue/perennial-systems-bibvewadi-pune-computer-software-developers-6on43m8b4e.jpg?imwidth=444.3333333333333") center/cover no-repeat',
    },
    topHeader: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      padding: '16px 32px',
      borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
      position: 'relative',
      zIndex: 3,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: 800,
      color: '#111827',
      margin: 0
    },
    navIcons: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    navIcon: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      borderRadius: '12px',
      background: isActive ? 'linear-gradient(90deg, #2563eb, #7c3aed)' : 'rgba(107, 114, 128, 0.1)',
      color: isActive ? '#ffffff' : '#374151',
      fontWeight: isActive ? 700 : 500,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      textDecoration: 'none',
      boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
    }),
    logoutButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      background: '#dc2626',
      color: '#ffffff',
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    mainWrapper: {
      display: 'flex',
      flex: 1
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1
    },
    sidebar: {
      width: '280px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      padding: '24px',
      borderRight: '1px solid rgba(229, 231, 235, 0.5)',
      position: 'relative',
      zIndex: 2
    },
    sidebarTitle: {
      fontSize: '24px',
      fontWeight: 800,
      color: '#111827',
      marginBottom: '32px',
      paddingBottom: '16px',
      borderBottom: '2px solid #e5e7eb'
    },
    navItem: (isActive) => ({
      display: 'block',
      width: '100%',
      padding: '16px 20px',
      marginBottom: '8px',
      border: 'none',
      borderRadius: '12px',
      background: isActive ? 'linear-gradient(90deg, #2563eb, #7c3aed)' : 'transparent',
      color: isActive ? '#ffffff' : '#374151',
      fontWeight: isActive ? 700 : 500,
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
      boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
    }),
    mainContent: {
      flex: 1,
      padding: '32px',
      position: 'relative',
      zIndex: 2,
      overflow: 'auto'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
      backdropFilter: 'blur(8px)',
      marginBottom: '24px'
    },
    pageTitle: {
      fontSize: '28px',
      fontWeight: 800,
      color: '#111827',
      marginBottom: '8px'
    },
    pageSubtitle: {
      color: '#6b7280',
      marginBottom: '32px'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    metricCard: (isClickable = true) => ({
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(229, 231, 235, 0.5)',
      cursor: isClickable ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)',
      '&:hover': isClickable ? {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
        background: 'rgba(255, 255, 255, 0.95)'
      } : {}
    }),
    clickableMetricCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(229, 231, 235, 0.5)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)',
      position: 'relative',
      overflow: 'hidden'
    },
    metricValue: {
      fontSize: '32px',
      fontWeight: 800,
      color: '#111827',
      marginBottom: '8px'
    },
    metricLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: 500
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    },
    field: {
      marginBottom: '16px'
    },
    label: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '8px',
      display: 'block'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      outline: 'none',
      background: '#ffffff',
      color: '#111827',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      outline: 'none',
      background: '#ffffff',
      color: '#111827',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    button: (variant = 'primary') => ({
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      background: variant === 'primary' ? 'linear-gradient(90deg, #2563eb, #7c3aed)' :
                 variant === 'secondary' ? '#6b7280' :
                 variant === 'danger' ? '#dc2626' : '#059669',
      color: '#ffffff',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '14px',
      margin: '4px',
      transition: 'all 0.2s ease'
    }),
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    },
    th: {
      background: '#f9fafb',
      padding: '16px',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: 600,
      color: '#374151',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px',
      color: '#111827'
    },
    message: (isError) => ({
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '16px',
      background: isError ? '#fee2e2' : '#d1fae5',
      color: isError ? '#b91c1c' : '#065f46',
      border: '1px solid ' + (isError ? '#fecaca' : '#a7f3d0'),
      fontSize: '14px',
      fontWeight: 500
    })
  };

  const renderDashboard = () => (
    <div>
      <h1 style={styles.pageTitle}>Dashboard Overview</h1>
      <p style={styles.pageSubtitle}>Monitor your license management system metrics - Click on any card for details</p>
      
      {message && (
        <div style={styles.message(message.toLowerCase().includes('error') || message.toLowerCase().includes('failed'))}>
          {message}
        </div>
      )}
      
      <div style={styles.metricsGrid}>
        <div 
          style={styles.clickableMetricCard}
          onClick={handleCustomersCardClick}
          title="Click to view customer details"
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <div style={styles.metricValue}>{dashboardData.totalCustomers}</div>
          <div style={styles.metricLabel}>Total Customers</div>
        </div>
        
        <div 
          style={styles.clickableMetricCard}
          onClick={handleSubscriptionsCardClick}
          title="Click to view all subscriptions"
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <div style={styles.metricValue}>{dashboardData.totalSubscriptions}</div>
          <div style={styles.metricLabel}>Total Subscriptions</div>
        </div>
        
        <div 
          style={styles.clickableMetricCard}
          onClick={handleActiveSubscriptionsCardClick}
          title="Click to view active subscriptions"
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <div style={styles.metricValue}>{dashboardData.activeSubscriptions}</div>
          <div style={styles.metricLabel}>Active Subscriptions</div>
        </div>
        
        <div 
          style={styles.clickableMetricCard}
          onClick={handlePendingSubscriptionsCardClick}
          title="Click to view pending subscriptions"
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <div style={styles.metricValue}>{dashboardData.pendingSubscriptions}</div>
          <div style={styles.metricLabel}>Pending Subscriptions</div>
        </div>
        
        <div 
          style={styles.clickableMetricCard}
          onClick={handleRevenueCardClick}
          title="Click to view revenue details"
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <div style={styles.metricValue}>${dashboardData.totalRevenue.toLocaleString()}</div>
          <div style={styles.metricLabel}>Total Revenue</div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionPacks = () => (
    <div>
      <h1 style={styles.pageTitle}>Subscription Packs</h1>
      <p style={styles.pageSubtitle}>Manage your subscription plans and packages</p>
      
      {message && (
        <div style={styles.message(message.toLowerCase().includes('error') || message.toLowerCase().includes('failed'))}>
          {message}
        </div>
      )}

        <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
          {editingPack ? 'Edit Pack' : 'Create New Pack'}
        </h3>
        <form onSubmit={editingPack ? handleUpdatePack : handleCreatePack}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Pack Name *</label>
              <input
                style={styles.input}
                type="text"
                value={packForm.name}
                onChange={(e) => setPackForm({...packForm, name: e.target.value})}
                placeholder="e.g. Premium Plan"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>SKU *</label>
              <input
                style={styles.input}
                type="text"
                value={packForm.sku}
                onChange={(e) => setPackForm({...packForm, sku: e.target.value})}
                placeholder="e.g. PREM-001"
                required
              />
            </div>
            </div>

              <div style={styles.field}>
            <label style={styles.label}>Description *</label>
            <textarea
              style={styles.textarea}
              value={packForm.description}
              onChange={(e) => setPackForm({...packForm, description: e.target.value})}
              placeholder="Describe the features and benefits..."
              required
                />
              </div>

          <div style={styles.formGrid}>
              <div style={styles.field}>
              <label style={styles.label}>Price ($) *</label>
                <input
                style={styles.input}
                  type="number"
                  step="0.01"
                value={packForm.price}
                onChange={(e) => setPackForm({...packForm, price: e.target.value})}
                  placeholder="0.00"
                required
                />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Validity (months) *</label>
              <input
                style={styles.input}
                type="number"
                min="1"
                max="12"
                value={packForm.validity_months}
                onChange={(e) => setPackForm({...packForm, validity_months: e.target.value})}
                placeholder="1-12"
                required
              />
            </div>
            </div>

          <div>
            <button type="submit" style={styles.button()} disabled={loading}>
              {loading ? 'Processing...' : (editingPack ? 'Update Pack' : 'Create Pack')}
            </button>
            {editingPack && (
              <button type="button" onClick={cancelEdit} style={styles.button('secondary')}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>Existing Packs</h3>
        {packs.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Validity</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packs.map(pack => (
                <tr key={pack.id}>
                  <td style={styles.td}>{pack.name}</td>
                  <td style={styles.td}>{pack.sku}</td>
                  <td style={styles.td}>${pack.price}</td>
                  <td style={styles.td}>{pack.validity_months} months</td>
                  <td style={styles.td}>
                    <button onClick={() => startEditPack(pack)} style={styles.button('success')}>
                      Edit
                    </button>
                    <button onClick={() => handleDeletePack(pack.id)} style={styles.button('danger')}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            No subscription packs found. Create your first pack above.
          </p>
        )}
      </div>
    </div>
  );

  const renderActiveSubscriptions = () => {
    // Filter subscriptions based on current filter
    const filteredSubscriptions = subscriptionFilter === 'all' 
      ? subscriptions 
      : subscriptions.filter(sub => sub.status === subscriptionFilter);

    return (
      <div>
        <h1 style={styles.pageTitle}>Subscriptions Management</h1>
        <p style={styles.pageSubtitle}>Manage customer subscriptions and assignments</p>
        
        {message && (
          <div style={styles.message(message.toLowerCase().includes('error') || message.toLowerCase().includes('failed'))}>
            {message}
          </div>
        )}

        {/* Filter Controls */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>Filter Subscriptions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[
              { key: 'all', label: 'All Subscriptions', count: subscriptions.length },
              { key: 'active', label: 'Active', count: subscriptions.filter(s => s.status === 'active').length },
              { key: 'requested', label: 'Pending', count: subscriptions.filter(s => s.status === 'requested').length },
              { key: 'approved', label: 'Approved', count: subscriptions.filter(s => s.status === 'approved').length },
              { key: 'inactive', label: 'Inactive', count: subscriptions.filter(s => s.status === 'inactive').length },
              { key: 'expired', label: 'Expired', count: subscriptions.filter(s => s.status === 'expired').length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => {
                  setSubscriptionFilter(filter.key);
                  setMessage(`Filtering by ${filter.label.toLowerCase()}`);
                }}
                style={{
                  ...styles.button(subscriptionFilter === filter.key ? 'primary' : 'secondary'),
                  padding: '8px 16px',
                  fontSize: '14px',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {filter.label} <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
            {subscriptionFilter === 'all' ? 'All Subscriptions' : 
             subscriptionFilter === 'active' ? 'Active Subscriptions' :
             subscriptionFilter === 'requested' ? 'Pending Subscriptions' :
             subscriptionFilter === 'approved' ? 'Approved Subscriptions' :
             subscriptionFilter === 'inactive' ? 'Inactive Subscriptions' :
             'Expired Subscriptions'} ({filteredSubscriptions.length})
          </h3>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>Loading subscriptions...</p>
          ) : filteredSubscriptions.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Pack</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Expires</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map(subscription => (
                <tr key={subscription.id}>
                  <td style={styles.td}>{subscription.customer_name}</td>
                  <td style={styles.td}>{subscription.customer_email}</td>
                  <td style={styles.td}>{subscription.pack_name}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: subscription.status === 'active' ? '#d1fae5' : 
                                subscription.status === 'pending' ? '#fef3c7' : '#fee2e2',
                      color: subscription.status === 'active' ? '#065f46' : 
                            subscription.status === 'pending' ? '#92400e' : '#b91c1c'
                    }}>
                      {subscription.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>${subscription.pack_price}</td>
                  <td style={styles.td}>
                    {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {subscription.status === 'active' && (
                      <button 
                        onClick={() => handleSubscriptionStatusChange(subscription.id, 'inactive')}
                        style={styles.button('secondary')}
                      >
                        Deactivate
                      </button>
                    )}
                    {subscription.status === 'requested' && (
                      <button 
                        onClick={() => handleSubscriptionStatusChange(subscription.id, 'approved')}
                        style={styles.button('success')}
                      >
                        Approve
                      </button>
                    )}
                    {subscription.status === 'approved' && (
                      <button 
                        onClick={() => handleSubscriptionStatusChange(subscription.id, 'active')}
                        style={styles.button('success')}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            {subscriptionFilter === 'all' ? 'No subscriptions found.' : 
             `No ${subscriptionFilter} subscriptions found.`}
          </p>
        )}
      </div>
    </div>
    );
  };

  const renderCustomers = () => (
    <div>
      <h1 style={styles.pageTitle}>Customers</h1>
      <p style={styles.pageSubtitle}>Manage customer accounts and information</p>
      
            {message && (
        <div style={styles.message(message.toLowerCase().includes('error') || message.toLowerCase().includes('failed'))}>
                {message}
              </div>
            )}

      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>Customer List</h3>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading customers...</p>
        ) : customers.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Subscriptions</th>
                <th style={styles.th}>Active</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td style={styles.td}>{customer.name}</td>
                  <td style={styles.td}>{customer.email}</td>
                  <td style={styles.td}>{customer.phone || 'N/A'}</td>
                  <td style={styles.td}>{customer.total_subscriptions}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: customer.has_active_subscription ? '#d1fae5' : '#fee2e2',
                      color: customer.has_active_subscription ? '#065f46' : '#b91c1c'
                    }}>
                      {customer.has_active_subscription ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => handleEditCustomer(customer)}
                      style={styles.button('success')}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCustomer(customer.id)}
                      style={styles.button('danger')}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            No customers found.
          </p>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'packs':
        return renderSubscriptionPacks();
      case 'subscriptions':
        return renderActiveSubscriptions();
      case 'customers':
        return renderCustomers();
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      
      {/* Top Navigation Header */}
      <div style={styles.topHeader}>
        <h1 style={styles.headerTitle}>License Management System</h1>
        <div style={styles.navIcons}>
          <button
            onClick={() => setActiveSection('dashboard')}
            style={styles.navIcon(true)}
            title="Admin Dashboard"
          >
            🔧 Admin Dashboard
          </button>
          <button
            onClick={navigateToCustomerDashboard}
            style={styles.navIcon(false)}
            title="Customer Dashboard"
          >
            👤 Customer View
          </button>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={styles.mainWrapper}>
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Admin Panel</h2>
          <button
            onClick={() => setActiveSection('dashboard')}
            style={styles.navItem(activeSection === 'dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveSection('packs')}
            style={styles.navItem(activeSection === 'packs')}
          >
            📦 Subscription Packs
          </button>
          <button
            onClick={() => setActiveSection('subscriptions')}
            style={styles.navItem(activeSection === 'subscriptions')}
          >
            ✅ Active Subscriptions
          </button>
          <button
            onClick={() => setActiveSection('customers')}
            style={styles.navItem(activeSection === 'customers')}
          >
            👥 Customers
          </button>
        </div>

        <div style={styles.mainContent}>
          <div style={styles.card}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}