/* ============================================================
   FEEDIFISH — Dashboard Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initThemeToggle();
});

function initDashboard() {
  // Simulated realtime data updates
  simulateData();
  setInterval(simulateData, 5000);

  // Manual feed button
  const manualBtn = document.getElementById('btn-manual-feed');
  if (manualBtn) {
    manualBtn.addEventListener('click', () => {
      manualBtn.classList.add('feeding');
      manualBtn.textContent = 'FEEDING...';
      manualBtn.disabled = true;

      setTimeout(() => {
        manualBtn.classList.remove('feeding');
        manualBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">check</span> DONE';

        setTimeout(() => {
          manualBtn.disabled = false;
          manualBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">play_arrow</span> MANUAL FEED';
        }, 2000);
      }, 3000);
    });
  }
}

function simulateData() {
  // Slight temperature variation
  const baseTemp = 24.5;
  const tempVariation = (Math.random() - 0.5) * 0.6;
  const newTemp = (baseTemp + tempVariation).toFixed(1);

  const tempEl = document.getElementById('water-temp-value');
  if (tempEl) tempEl.textContent = newTemp;

  // Feed remaining slowly decreases
  const feedEl = document.getElementById('feed-remaining-value');
  const feedProgress = document.getElementById('feed-progress');
  if (feedEl && feedProgress) {
    const currentFeed = parseInt(feedEl.textContent) || 85;
    const newFeed = Math.max(0, Math.min(100, currentFeed + (Math.random() > 0.7 ? -1 : 0)));
    feedEl.textContent = newFeed;
    feedProgress.style.width = newFeed + '%';
  }
}

function initThemeToggle() {
  const btn = document.getElementById('btn-theme-toggle');
  const icon = document.getElementById('theme-icon');

  if (btn && icon) {
    // Set initial icon
    icon.textContent = FeediFish.settings.darkMode ? 'light_mode' : 'dark_mode';

    btn.addEventListener('click', () => {
      const isDark = FeediFish.toggleTheme();
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
  }
}
