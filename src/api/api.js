const API_BASE = 'http://localhost:8080/api';

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function loginCustomer(email, password) {
  const res = await fetch(`${API_BASE}/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function registerCustomer(email, password, name, phone) {
  const res = await fetch(`${API_BASE}/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, phone })
  });
  return res.json();
}

export async function getCustomerProfile(token) {
  const res = await fetch(`${API_BASE}/customer/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createPack(token, pack) {
  const res = await fetch(`${API_BASE}/v1/pack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(pack)
  });
  return res.json();
}

export async function listPacks(token) {
  const res = await fetch(`${API_BASE}/v1/packs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function requestSubscription(token, pack_id) {
  const res = await fetch(`${API_BASE}/v1/customer/subscription/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pack_id })
  });
  return res.json();
}

export async function getCurrentSubscription(token) {
  const res = await fetch(`${API_BASE}/v1/customer/subscription`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getSubscriptionHistory(token) {
  const res = await fetch(`${API_BASE}/v1/customer/subscription/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// Admin API functions
export async function getDashboardMetrics(token) {
  const res = await fetch(`${API_BASE}/v1/admin/dashboard/metrics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getCustomers(token, page = 1, limit = 10) {
  const res = await fetch(`${API_BASE}/v1/customers?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function updateCustomer(token, customerId, data) {
  const res = await fetch(`${API_BASE}/v1/customer/${customerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteCustomer(token, customerId) {
  const res = await fetch(`${API_BASE}/v1/customer/${customerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function updatePack(token, packId, data) {
  const res = await fetch(`${API_BASE}/v1/pack/${packId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deletePack(token, packId) {
  const res = await fetch(`${API_BASE}/v1/pack/${packId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getSubscriptions(token, page = 1, limit = 10, status = '') {
  const res = await fetch(`${API_BASE}/v1/subscriptions?page=${page}&limit=${limit}&status=${status}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function updateSubscriptionStatus(token, subscriptionId, status) {
  const res = await fetch(`${API_BASE}/v1/subscription/${subscriptionId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function assignSubscription(token, customerId, packId) {
  const res = await fetch(`${API_BASE}/v1/subscription/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ customer_id: customerId, pack_id: packId })
  });
  return res.json();
}
