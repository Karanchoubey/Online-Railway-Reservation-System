// Reservation form logic with train name search + route search
(function () {
  if (!requireAuth()) return;
  document.getElementById('app').insertAdjacentHTML('afterbegin', renderNavbar('reservation'));

  const form = document.getElementById('reservation-form');
  const alertBox = document.getElementById('reservation-alert');
  const trainNameInput = document.getElementById('train_name');
  const trainNumberInput = document.getElementById('train_number');
  const classSelect = document.getElementById('class_type');
  const sourceInput = document.getElementById('source');
  const destInput = document.getElementById('destination');
  const dateInput = document.getElementById('journey_date');
  const btn = document.getElementById('btn-book');
  const routeResults = document.getElementById('route-results');

  // Dropdowns
  const trainNameDD = document.getElementById('train-name-dropdown');
  const trainNumDD = document.getElementById('train-number-dropdown');
  const sourceDD = document.getElementById('source-dropdown');
  const destDD = document.getElementById('dest-dropdown');

  // Set min date
  dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);

  let stations = [];
  let debounce = {};
  let selectedTrain = null;

  // Load stations for autocomplete
  apiFetch('/trains/stations').then(s => { stations = s; }).catch(() => {});

  // ── HELPER: Show autocomplete ──
  function showDropdown(dd, items, onSelect) {
    if (!items.length) { dd.classList.remove('show'); dd.innerHTML = ''; return; }
    dd.innerHTML = items.map((item, i) =>
      `<div class="autocomplete-item" data-index="${i}">${item.html || item.label}</div>`
    ).join('');
    dd.classList.add('show');
    dd.querySelectorAll('.autocomplete-item').forEach((el, i) => {
      el.addEventListener('click', () => { onSelect(items[i]); dd.classList.remove('show'); });
    });
  }

  function hideAllDropdowns() {
    [trainNameDD, trainNumDD, sourceDD, destDD].forEach(d => d.classList.remove('show'));
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) hideAllDropdowns();
  });

  // ── TRAIN NAME AUTOCOMPLETE ──
  trainNameInput.addEventListener('input', () => {
    clearTimeout(debounce.name);
    const q = trainNameInput.value.trim();
    if (q.length < 2) { trainNameDD.classList.remove('show'); return; }
    debounce.name = setTimeout(async () => {
      try {
        const trains = await apiFetch(`/trains/search?q=${encodeURIComponent(q)}`);
        const items = trains.map(t => ({
          label: t.train_name,
          html: `<span>${highlight(t.train_name, q)}</span><span class="sub">#${t.train_number} · ${t.source} → ${t.destination} · 🕐 ${t.departure_time}–${t.arrival_time} (${t.duration})</span>`,
          train: t
        }));
        showDropdown(trainNameDD, items, (item) => {
          selectTrain(item.train);
        });
      } catch (e) { trainNameDD.classList.remove('show'); }
    }, 300);
  });

  // ── TRAIN NUMBER AUTOCOMPLETE ──
  trainNumberInput.addEventListener('input', () => {
    clearTimeout(debounce.num);
    const q = trainNumberInput.value.trim();
    if (q.length < 2) { trainNumDD.classList.remove('show'); return; }
    debounce.num = setTimeout(async () => {
      try {
        const trains = await apiFetch(`/trains/search?q=${encodeURIComponent(q)}`);
        const items = trains.map(t => ({
          label: t.train_number,
          html: `<span>${highlight(t.train_number, q)} — ${t.train_name}</span><span class="sub">${t.source} → ${t.destination} · 🕐 ${t.departure_time}–${t.arrival_time} (${t.duration})</span>`,
          train: t
        }));
        showDropdown(trainNumDD, items, (item) => {
          selectTrain(item.train);
        });
      } catch (e) { trainNumDD.classList.remove('show'); }
    }, 300);
  });

  // ── STATION AUTOCOMPLETE ──
  function setupStationAutocomplete(input, dd) {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 1) { dd.classList.remove('show'); return; }
      const matches = stations.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
      const items = matches.map(s => ({
        label: s,
        html: `<span>${highlight(s, q)}</span>`
      }));
      showDropdown(dd, items, (item) => {
        input.value = item.label;
      });
    });
  }
  setupStationAutocomplete(sourceInput, sourceDD);
  setupStationAutocomplete(destInput, destDD);

  // ── SELECT TRAIN ──
  function selectTrain(train) {
    selectedTrain = train;
    trainNameInput.value = train.train_name;
    trainNumberInput.value = train.train_number;
    sourceInput.value = train.source;
    destInput.value = train.destination;
    classSelect.innerHTML = train.classes.map(c => `<option value="${c}">${c}</option>`).join('');
    classSelect.disabled = false;
    hideAllDropdowns();

    // Show timing info bar
    let timingBar = document.getElementById('timing-info');
    if (!timingBar) {
      timingBar = document.createElement('div');
      timingBar.id = 'timing-info';
      document.getElementById('reservation-form').insertBefore(timingBar, document.getElementById('btn-find-trains'));
    }
    timingBar.className = 'timing-bar';
    timingBar.innerHTML = `
      <div class="timing-dep"><span class="timing-label">DEPARTS</span><span class="timing-time">${train.departure_time}</span><span class="timing-stn">${train.source}</span></div>
      <div class="timing-mid"><span class="timing-duration">${train.duration}</span><div class="timing-line"><div class="timing-dot"></div><div class="timing-track"></div><div class="timing-dot"></div></div><span class="timing-days">${train.days_of_run || ''}</span></div>
      <div class="timing-arr"><span class="timing-label">ARRIVES</span><span class="timing-time">${train.arrival_time}</span><span class="timing-stn">${train.destination}</span></div>
    `;
  }

  // ── FIND TRAINS BETWEEN STATIONS ──
  document.getElementById('btn-find-trains').addEventListener('click', async () => {
    const src = sourceInput.value.trim();
    const dst = destInput.value.trim();
    routeResults.innerHTML = '';

    if (!src && !dst) {
      alertBox.innerHTML = '<div class="alert alert-error">⚠️ Enter at least source or destination station.</div>';
      return;
    }

    alertBox.innerHTML = '';
    const params = new URLSearchParams();
    if (src) params.set('source', src);
    if (dst) params.set('destination', dst);

    try {
      const trains = await apiFetch(`/trains/search?${params.toString()}`);
      if (!trains.length) {
        routeResults.innerHTML = '<div class="alert alert-info">ℹ️ No trains found for this route. Try different station names.</div>';
        return;
      }

      routeResults.innerHTML = `
        <div class="train-results">
          <h3>🚂 ${trains.length} train${trains.length > 1 ? 's' : ''} found — click to select</h3>
          ${trains.map(t => `
            <div class="train-result-card" data-id="${t.id}" onclick="window._selectRouteResult(${t.id})">
              <div class="train-info">
                <h4>${t.train_name} <span class="train-num">#${t.train_number}</span></h4>
                <p>${t.source} → ${t.destination}</p>
                <p class="train-timing">🕐 ${t.departure_time} — ${t.arrival_time} · ⏱️ ${t.duration} · Classes: ${t.classes.join(', ')}</p>
              </div>
              <div class="train-time-badge"><span class="dep-time">${t.departure_time}</span><span class="arr-time">${t.arrival_time}</span></div>
            </div>
          `).join('')}
        </div>`;

      // Store for selection
      window._routeTrains = trains;
    } catch (err) {
      routeResults.innerHTML = `<div class="alert alert-error">⚠️ ${err.message}</div>`;
    }
  });

  window._selectRouteResult = function (id) {
    const train = window._routeTrains.find(t => t.id === id);
    if (train) {
      selectTrain(train);
      document.querySelectorAll('.train-result-card').forEach(c => c.classList.remove('selected'));
      document.querySelector(`.train-result-card[data-id="${id}"]`).classList.add('selected');
    }
  };

  // ── SUBMIT BOOKING ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';

    const payload = {
      passenger_name: document.getElementById('passenger_name').value.trim(),
      train_number: trainNumberInput.value.trim(),
      class_type: classSelect.value,
      journey_date: dateInput.value,
      source: sourceInput.value.trim(),
      destination: destInput.value.trim(),
    };

    if (!payload.passenger_name || !payload.train_number || !payload.class_type || !payload.journey_date || !payload.source || !payload.destination) {
      alertBox.innerHTML = '<div class="alert alert-error">⚠️ Please fill in all fields.</div>';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Booking...';

    try {
      const data = await apiFetch('/reservations', {
        method: 'POST', body: JSON.stringify(payload),
      });
      alertBox.innerHTML = `<div class="alert alert-success">✅ Ticket booked! PNR: <strong>${data.reservation.pnr}</strong></div>`;
      showToast(`Ticket booked! PNR: ${data.reservation.pnr}`, 'success');
      form.reset();
      classSelect.innerHTML = '<option value="">Select a train first</option>';
      classSelect.disabled = true;
      routeResults.innerHTML = '';
      selectedTrain = null;
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">⚠️ ${err.message}</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = '🎫 Confirm Reservation';
    }
  });

  // ── Highlight helper ──
  function highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }
})();
