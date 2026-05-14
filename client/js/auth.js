// Tab switching
function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const alert = document.getElementById('auth-alert');
  alert.innerHTML = '';

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
}

// Auth logic
(function () {
  if (getToken()) { window.location.href = '/dashboard.html'; return; }

  const alertBox = document.getElementById('auth-alert');

  // Load saved credentials
  const saved = localStorage.getItem('oasis_remember');
  if (saved) {
    const { username } = JSON.parse(saved);
    const el = document.getElementById('login-username');
    if (el) el.value = username;
  }

  // ── LOGIN ──
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';
    const btn = document.getElementById('btn-login');
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      alertBox.innerHTML = '<div class="alert alert-error">⚠️ Please fill in both fields.</div>';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in...';

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      saveAuth(data.token, data.user);

      // Remember me
      if (document.getElementById('remember-me').checked) {
        localStorage.setItem('oasis_remember', JSON.stringify({ username }));
      } else {
        localStorage.removeItem('oasis_remember');
      }

      alertBox.innerHTML = '<div class="alert alert-success">✅ Login successful! Redirecting...</div>';
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 500);
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">⚠️ ${err.message}</div>`;
      btn.disabled = false;
      btn.innerHTML = '🔐 Sign In';
    }
  });

  // ── REGISTER ──
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';
    const btn = document.getElementById('btn-register');

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!name || !email || !username || !password) {
      alertBox.innerHTML = '<div class="alert alert-error">⚠️ Please fill in all fields.</div>';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, username, password }),
      });

      saveAuth(data.token, data.user);
      localStorage.setItem('oasis_remember', JSON.stringify({ username }));

      alertBox.innerHTML = '<div class="alert alert-success">✅ Account created! Redirecting...</div>';
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 500);
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">⚠️ ${err.message}</div>`;
      btn.disabled = false;
      btn.innerHTML = '✨ Create Account';
    }
  });
})();
