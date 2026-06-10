document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // HELPER: Generic Modal
  // ==========================================
  function setupModal(modalId, triggerId, closeId) {
    const modal   = document.getElementById(modalId);
    if (!modal) return;
    const trigger = triggerId ? document.getElementById(triggerId) : null;
    const closeBtn = closeId  ? document.getElementById(closeId)   : null;

    const open  = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); };
    const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };

    if (trigger) {
      trigger.addEventListener('click', open);
      trigger.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
  }


  // ==========================================
  // 1. RENOVATION MENU (6-THEME SWITCHER)
  // ==========================================
  const settingsTrigger = document.getElementById('settings-trigger');
  const renovationMenu  = document.getElementById('renovation-menu');
  const settingsClose   = document.getElementById('settings-close');
  const themeSwatches   = document.querySelectorAll('.theme-swatch');

  settingsTrigger.addEventListener('click', () => renovationMenu.classList.add('open'));
  settingsClose.addEventListener('click',   () => renovationMenu.classList.remove('open'));
  document.addEventListener('click', e => {
    if (!renovationMenu.contains(e.target) && !settingsTrigger.contains(e.target) && renovationMenu.classList.contains('open')) {
      renovationMenu.classList.remove('open');
    }
  });

  // Restore saved theme
  const savedTheme = localStorage.getItem('couple-theme');
  if (savedTheme) {
    document.body.className = savedTheme !== 'default' ? savedTheme : '';
    themeSwatches.forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-theme') === savedTheme);
    });
  }

  themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      themeSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const selected = swatch.getAttribute('data-theme');
      document.body.className = selected !== 'default' ? selected : '';
      localStorage.setItem('couple-theme', selected);
    });
  });


  // ==========================================
  // 2. TOGETHER SINCE LIVE COUNTER
  // ==========================================
  const anniversaryDate = new Date('2025-12-27T00:00:00');
  const togetherCounter = document.getElementById('together-counter');

  function updateCounter() {
    const diff = Date.now() - anniversaryDate.getTime();
    if (diff < 0) { togetherCounter.textContent = '0d 0h 0m 0s'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    togetherCounter.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }
  updateCounter();
  setInterval(updateCounter, 1000);


  // ==========================================
  // 3. WEATHER (Open-Meteo API)
  // ==========================================
  async function fetchWeather(lat, lon, paneId) {
    try {
      const res  = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      const temp  = Math.round(data.current_weather.temperature);
      const isDay = data.current_weather.is_day;
      const pane  = document.getElementById(paneId);
      if (!pane) return;
      const iconTemp = pane.querySelector('.weather-icon-temp');
      const layer    = pane.querySelector('.weather-layer');

      if (isDay) {
        iconTemp.innerHTML = `<i class="fa-solid fa-sun" style="color:#f1c40f;"></i> ${temp}°C`;
        layer.style.background = 'linear-gradient(to bottom, #5ba3d9, #b8ddf5)';
      } else {
        iconTemp.innerHTML = `<i class="fa-solid fa-moon" style="color:#fdf5e6;"></i> ${temp}°C`;
        layer.style.background = 'linear-gradient(to bottom, #070d1e, #141e38)';
        layer.innerHTML = '';
        for (let i = 0; i < 20; i++) {
          const star = document.createElement('div');
          star.style.cssText = `position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;opacity:${(Math.random()*0.6+0.4).toFixed(2)};left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*100).toFixed(1)}%;`;
          layer.appendChild(star);
        }
      }
    } catch (e) { console.warn('Weather error', paneId, e); }
  }

  fetchWeather(20.9374, 77.7796, 'pane-aditi');
  fetchWeather(12.9716, 77.5946, 'pane-ashwin');


  // ==========================================
  // 4. TV WATCHLIST — Stored, Editable, TVMaze Posters
  // ==========================================
  setupModal('tv-modal', 'room-tv', 'tv-close');

  const watchlistForm    = document.getElementById('watchlist-form');
  const titleInput       = document.getElementById('watch-title-input');
  const tvActivePoster   = document.getElementById('tv-active-poster');
  const loadingIndicator = document.getElementById('loading-indicator');
  const tvErrorMsg       = document.getElementById('tv-error-msg');
  const watchlistItems   = document.getElementById('watchlist-items');
  const watchlistCount   = document.getElementById('watchlist-count');
  const watchlistEmpty   = document.getElementById('watchlist-empty');

  // Watchlist stored in localStorage
  // Each entry: { id, title, poster, watched }
  let watchlist = JSON.parse(localStorage.getItem('couple-watchlist') || '[]');

  function saveWatchlist() {
    localStorage.setItem('couple-watchlist', JSON.stringify(watchlist));
  }

  function renderWatchlist() {
    watchlistItems.innerHTML = '';
    watchlistCount.textContent = watchlist.length ? `(${watchlist.length})` : '';

    if (watchlist.length === 0) {
      watchlistItems.appendChild(watchlistEmpty);
      watchlistEmpty.style.display = 'block';
      return;
    }
    watchlistEmpty.style.display = 'none';

    watchlist.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'watchlist-row';
      row.innerHTML = `
        <img class="watchlist-poster-thumb" src="${item.poster}" alt="${item.title}" onerror="this.style.display='none'">
        <div style="flex:1;min-width:0;">
          <div class="watchlist-title">${item.title}</div>
          <div class="watchlist-status">
            <input type="checkbox" id="wl-chk-${idx}" ${item.watched ? 'checked' : ''} title="Mark as watched">
            <label for="wl-chk-${idx}" style="font-size:0.8rem;cursor:pointer;color:var(--text-muted);margin-left:4px;">${item.watched ? '<span class="watched-badge">✓ Watched</span>' : 'Mark watched'}</label>
          </div>
        </div>
        <div class="watchlist-actions">
          <button class="btn-cast" title="Cast to TV">▶ Cast</button>
          <button class="btn-wl-delete" title="Remove">&times;</button>
        </div>
      `;

      // Cast to TV
      row.querySelector('.btn-cast').addEventListener('click', () => {
        tvActivePoster.src = item.poster;
        document.getElementById('tv-close').click();
      });

      // Delete
      row.querySelector('.btn-wl-delete').addEventListener('click', () => {
        watchlist.splice(idx, 1);
        saveWatchlist();
        renderWatchlist();
      });

      // Watched toggle
      row.querySelector(`#wl-chk-${idx}`).addEventListener('change', (e) => {
        watchlist[idx].watched = e.target.checked;
        saveWatchlist();
        renderWatchlist();
      });

      watchlistItems.appendChild(row);
    });
  }

  // Fetch poster from TVMaze, fall back to a placeholder
  async function fetchPoster(title) {
    // Try TVMaze (TV shows)
    try {
      const res  = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data[0]?.show?.image?.original) {
        return { url: data[0].show.image.original, source: 'tvmaze' };
      }
    } catch (_) {}

    // Fallback: Pollinations AI generated poster art
    const prompt = encodeURIComponent(`Cinematic movie poster for "${title}", dramatic lighting, photorealistic`);
    return {
      url: `https://image.pollinations.ai/prompt/${prompt}?width=400&height=600&nologo=true&seed=${Date.now()}`,
      source: 'pollinations'
    };
  }

  watchlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;

    loadingIndicator.style.display = 'block';
    tvErrorMsg.style.display = 'none';

    try {
      const { url } = await fetchPoster(title);

      // Add to watchlist
      watchlist.unshift({ id: Date.now(), title, poster: url, watched: false });
      saveWatchlist();
      renderWatchlist();
      titleInput.value = '';
      loadingIndicator.style.display = 'none';
    } catch (err) {
      loadingIndicator.style.display = 'none';
      tvErrorMsg.textContent = 'Could not fetch poster. Entry saved without image.';
      tvErrorMsg.style.display = 'block';
      watchlist.unshift({ id: Date.now(), title, poster: '', watched: false });
      saveWatchlist();
      renderWatchlist();
      titleInput.value = '';
    }
  });

  renderWatchlist();


  // ==========================================
  // 5. DESK INTERACTIVITY
  // ==========================================
  const deskLamp = document.getElementById('desk-lamp');
  deskLamp.addEventListener('click', () => deskLamp.classList.toggle('lamp-on'));
  deskLamp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); deskLamp.click(); } });

  setupModal('notebook-modal', 'open-letters', 'notebook-close');
  setupModal('jukebox-modal',  'open-radio',   'jukebox-close');


  // ==========================================
  // 6. OPEN WHEN LETTERS — EXPAND/COLLAPSE
  // ==========================================
  const envelopeWrappers = document.querySelectorAll('.envelope-wrapper');
  envelopeWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const isOpen = wrapper.classList.contains('open');
      // Close all others
      envelopeWrappers.forEach(w => w.classList.remove('open'));
      // Toggle current
      if (!isOpen) wrapper.classList.add('open');
    });
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wrapper.click(); }
    });
  });


  // ==========================================
  // 7. MEMORY GALLERY MODAL
  // ==========================================
  setupModal('gallery-modal', 'open-gallery', 'gallery-close');


  // ==========================================
  // 8. FUTURE TRAVEL PLANNER
  // ==========================================
  setupModal('suitcase-modal', 'travel-suitcase', 'suitcase-close');

  const travelChecklist = document.getElementById('travel-checklist');
  const addTravelForm   = document.getElementById('add-travel-item-form');
  const newTravelInput  = document.getElementById('new-travel-item');

  let travelList = JSON.parse(localStorage.getItem('couple-travel') || 'null') || [
    { text: 'Café Clover, Pune', checked: true },
    { text: 'Nandi Hills, Bangalore', checked: false },
    { text: 'Coorg hill station, Karnataka', checked: false },
    { text: 'Marine Drive at sunset, Mumbai', checked: false },
    { text: 'Pondicherry French quarter', checked: false },
  ];

  function saveTravelList() { localStorage.setItem('couple-travel', JSON.stringify(travelList)); }

  function buildMapsUrl(loc) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`; }

  function renderTravelList() {
    travelChecklist.innerHTML = '';
    travelList.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'checklist-item';
      div.innerHTML = `
        <div class="checklist-left">
          <input type="checkbox" id="chk-${idx}" ${item.checked ? 'checked' : ''}>
          <label for="chk-${idx}" style="${item.checked ? 'text-decoration:line-through;opacity:0.55;' : ''}">${item.text}</label>
        </div>
        <div style="display:flex;align-items:center;">
          <a href="${buildMapsUrl(item.text)}" class="btn-map-link" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Maps</a>
          <button class="btn-delete">&times;</button>
        </div>
      `;
      div.querySelector('input').addEventListener('change', e => { item.checked = e.target.checked; saveTravelList(); renderTravelList(); });
      div.querySelector('.btn-delete').addEventListener('click', () => { travelList.splice(idx, 1); saveTravelList(); renderTravelList(); });
      travelChecklist.appendChild(div);
    });
  }

  addTravelForm.addEventListener('submit', e => {
    e.preventDefault();
    const val = newTravelInput.value.trim();
    if (val) { travelList.push({ text: val, checked: false }); newTravelInput.value = ''; saveTravelList(); renderTravelList(); }
  });

  renderTravelList();


  // ==========================================
  // 9. CANVAS SPINNER WHEEL — SYNCHRONIZED MATH
  // ==========================================
  // Open takeout modal from kitchen card
  const kitchenCard   = document.getElementById('kitchen-pizza');
  const spinPreviewBtn = kitchenCard ? kitchenCard.querySelector('.btn-spin-preview') : null;
  const takeoutModal  = document.getElementById('takeout-modal');

  function openTakeout() {
    if (takeoutModal) { takeoutModal.classList.add('open'); takeoutModal.setAttribute('aria-hidden', 'false'); }
  }
  if (kitchenCard)  { kitchenCard.addEventListener('click', openTakeout); kitchenCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTakeout(); } }); }
  if (spinPreviewBtn) { spinPreviewBtn.addEventListener('click', e => { e.stopPropagation(); openTakeout(); }); }
  document.getElementById('takeout-close')?.addEventListener('click', () => { takeoutModal.classList.remove('open'); takeoutModal.setAttribute('aria-hidden', 'true'); });
  takeoutModal?.addEventListener('click', e => { if (e.target === takeoutModal) { takeoutModal.classList.remove('open'); } });

  const canvas = document.getElementById('modal-spinner-canvas');
  const ctx    = canvas ? canvas.getContext('2d') : null;

  const cuisines = [
    { text: 'Pizza 🍕',        color: '#e74c3c' },
    { text: 'Chinese 🍜',      color: '#f39c12' },
    { text: 'Burgers 🍔',      color: '#27ae60' },
    { text: 'Sushi 🍣',        color: '#2980b9' },
    { text: 'Desserts 🍩',     color: '#9b59b6' },
    { text: 'Indian Thali 🍛', color: '#16a085' },
  ];

  const SLICE_COUNT = cuisines.length;
  const SLICE_ANGLE = (2 * Math.PI) / SLICE_COUNT;
  const POINTER_ANGLE = (3 * Math.PI) / 2; // top of canvas = 270°

  let currentAngle = 0;
  let isSpinning   = false;
  let spinVelocity = 0;

  const btnSpin       = document.getElementById('btn-spin');
  const spinResultText = document.getElementById('spin-result-text');

  function drawWheel() {
    if (!ctx) return;
    const size   = canvas.width;
    const center = size / 2;
    const radius = center - 3;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < SLICE_COUNT; i++) {
      const startAngle = currentAngle + i * SLICE_ANGLE;
      const endAngle   = startAngle + SLICE_ANGLE;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = cuisines[i].color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + SLICE_ANGLE / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold 13px 'Nunito', sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur  = 4;
      ctx.fillText(cuisines[i].text, radius - 12, 5);
      ctx.restore();
    }

    // Centre disc
    ctx.beginPath();
    ctx.arc(center, center, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur  = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawWheel();

  function resolveWinner() {
    const norm    = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let   relative = POINTER_ANGLE - norm;
    relative       = ((relative % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(relative / SLICE_ANGLE) % SLICE_COUNT;
  }

  function animateSpin() {
    if (spinVelocity <= 0.0012) {
      isSpinning = false;
      if (btnSpin) btnSpin.disabled = false;
      const winner = resolveWinner();
      spinResultText.textContent = cuisines[winner].text + '!';
      return;
    }
    currentAngle += spinVelocity;
    spinVelocity *= 0.983;
    drawWheel();
    requestAnimationFrame(animateSpin);
  }

  if (btnSpin) {
    btnSpin.addEventListener('click', () => {
      if (isSpinning) return;
      isSpinning = true;
      btnSpin.disabled = true;
      spinResultText.textContent = 'Spinning… 🎡';
      spinVelocity = Math.random() * 0.30 + 0.28;
      requestAnimationFrame(animateSpin);
    });
  }

});
