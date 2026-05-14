// Dashboard logic
(function () {
  if (!requireAuth()) return;

  const user = getUser();

  // Inject navbar
  document.getElementById('app').insertAdjacentHTML('afterbegin', renderNavbar('dashboard'));

  // Greeting
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = `${greet}, ${user.name}! 👋`;

  loadDashboard();

  async function loadDashboard() {
    try {
      const reservations = await apiFetch('/reservations');

      const total = reservations.length;
      const confirmed = reservations.filter(r => r.status === 'confirmed').length;
      const cancelled = reservations.filter(r => r.status === 'cancelled').length;

      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-confirmed').textContent = confirmed;
      document.getElementById('stat-cancelled').textContent = cancelled;

      const listEl = document.getElementById('ticket-list');

      if (total === 0) {
        listEl.innerHTML = `
          <div class="empty-state">
            <span class="icon">🎫</span>
            <p>No reservations yet. <a href="/reservation.html">Book your first ticket!</a></p>
          </div>`;
        return;
      }

      listEl.innerHTML = reservations.map(r => `
        <div class="ticket-card">
          <div class="ticket-info">
            <span class="ticket-pnr">PNR: ${r.pnr}</span>
            <span class="ticket-route">${r.source} <span class="arrow">→</span> ${r.destination}</span>
            <div class="ticket-details">
              <span>🚂 ${r.train_number} — ${r.train_name}</span>
              <span>👤 ${r.passenger_name}</span>
              <span>🎟️ ${r.class_type}</span>
              <span>📅 ${r.journey_date}</span>
            </div>
          </div>
          <span class="badge badge-${r.status}">${r.status}</span>
        </div>
      `).join('');
    } catch (err) {
      document.getElementById('ticket-list').innerHTML = `
        <div class="alert alert-error">⚠️ ${err.message}</div>`;
    }
  }
})();
