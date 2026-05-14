// Shared API helper
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('oasis_token');
}

function getUser() {
  const u = localStorage.getItem('oasis_user');
  return u ? JSON.parse(u) : null;
}

function saveAuth(token, user) {
  localStorage.setItem('oasis_token', token);
  localStorage.setItem('oasis_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('oasis_token');
  localStorage.removeItem('oasis_user');
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (res.status === 401 || res.status === 403) {
    clearAuth();
    window.location.href = '/index.html';
    throw new Error('Session expired');
  }

  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(30px)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

function renderNavbar(activePage) {
  const user = getUser();
  const initials = user ? user.name.split(' ').map(w => w[0]).join('').toUpperCase() : '?';
  return `
    <header class="navbar">
      <a href="/dashboard.html" class="logo"><span class="icon">🚂</span> OASIS</a>
      <nav>
        <a href="/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" id="nav-dashboard">Dashboard</a>
        <a href="/reservation.html" class="nav-link ${activePage === 'reservation' ? 'active' : ''}" id="nav-reservation">Book Ticket</a>
        <a href="/cancellation.html" class="nav-link ${activePage === 'cancellation' ? 'active' : ''}" id="nav-cancel">Cancel Ticket</a>
        <div class="nav-user"><div class="avatar">${initials}</div>${user ? user.name : ''}</div>
        <button class="btn-logout" id="btn-logout" onclick="clearAuth(); window.location.href='/index.html';">Logout</button>
      </nav>
    </header>`;
}
