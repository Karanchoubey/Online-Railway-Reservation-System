// Cancellation page logic
(function () {
  if (!requireAuth()) return;

  document.getElementById('app').insertAdjacentHTML('afterbegin', renderNavbar('cancel'));

  const alertBox = document.getElementById('cancel-alert');
  const pnrInput = document.getElementById('pnr-input');
  const lookupBtn = document.getElementById('btn-lookup');
  const resultArea = document.getElementById('pnr-result-area');

  lookupBtn.addEventListener('click', lookupPNR);
  pnrInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') lookupPNR(); });

  async function lookupPNR() {
    const pnr = pnrInput.value.trim();
    alertBox.innerHTML = '';
    resultArea.innerHTML = '';

    if (!pnr || pnr.length < 5) {
      alertBox.innerHTML = '<div class="alert alert-error">⚠️ Please enter a valid PNR number.</div>';
      return;
    }

    lookupBtn.disabled = true;
    lookupBtn.innerHTML = '<span class="spinner"></span>';

    try {
      const ticket = await apiFetch(`/reservations/pnr/${pnr}`);
      renderTicket(ticket);
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">⚠️ ${err.message}</div>`;
    } finally {
      lookupBtn.disabled = false;
      lookupBtn.innerHTML = 'Search';
    }
  }

  function renderTicket(ticket) {
    const isCancelled = ticket.status === 'cancelled';
    resultArea.innerHTML = `
      <div class="pnr-result">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3 style="font-size:1.1rem">Ticket Details</h3>
          <span class="badge badge-${ticket.status}">${ticket.status}</span>
        </div>
        <div class="pnr-result-grid">
          <div class="pnr-field"><label>PNR Number</label><div class="value" style="color:var(--primary-300);letter-spacing:.1em">${ticket.pnr}</div></div>
          <div class="pnr-field"><label>Passenger Name</label><div class="value">${ticket.passenger_name}</div></div>
          <div class="pnr-field"><label>Train</label><div class="value">${ticket.train_number} — ${ticket.train_name}</div></div>
          <div class="pnr-field"><label>Class</label><div class="value">${ticket.class_type}</div></div>
          <div class="pnr-field"><label>Route</label><div class="value">${ticket.source} → ${ticket.destination}</div></div>
          <div class="pnr-field"><label>Journey Date</label><div class="value">${ticket.journey_date}</div></div>
          <div class="pnr-field"><label>Booked On</label><div class="value">${new Date(ticket.created_at).toLocaleString()}</div></div>
        </div>
        ${isCancelled ? '<div class="alert alert-info" style="margin-top:1rem">ℹ️ This ticket has already been cancelled.</div>' : `
          <div style="margin-top:1.5rem;display:flex;gap:.75rem">
            <button class="btn btn-danger" id="btn-confirm-cancel">❌ Cancel This Ticket</button>
            <button class="btn btn-secondary" id="btn-dismiss">Keep Booking</button>
          </div>
        `}
      </div>
    `;

    if (!isCancelled) {
      document.getElementById('btn-confirm-cancel').addEventListener('click', () => cancelTicket(ticket.pnr));
      document.getElementById('btn-dismiss').addEventListener('click', () => { resultArea.innerHTML = ''; });
    }
  }

  async function cancelTicket(pnr) {
    const cancelBtn = document.getElementById('btn-confirm-cancel');
    cancelBtn.disabled = true;
    cancelBtn.innerHTML = '<span class="spinner"></span> Cancelling...';

    try {
      await apiFetch('/reservations/cancel', {
        method: 'POST',
        body: JSON.stringify({ pnr }),
      });

      alertBox.innerHTML = '<div class="alert alert-success">✅ Ticket cancelled successfully.</div>';
      showToast('Ticket cancelled successfully', 'success');
      resultArea.innerHTML = '';
      pnrInput.value = '';
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">⚠️ ${err.message}</div>`;
      cancelBtn.disabled = false;
      cancelBtn.innerHTML = '❌ Cancel This Ticket';
    }
  }
})();
