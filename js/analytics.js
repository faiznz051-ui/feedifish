/* ============================================================
   FEEDIFISH — Analytics Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAnalytics();
  initThemeToggle();
});

function initAnalytics() {
  // Time range selector
  const timeRange = document.getElementById('time-range');
  if (timeRange) {
    timeRange.addEventListener('click', (e) => {
      const option = e.target.closest('.pill-option');
      if (option) {
        timeRange.querySelectorAll('.pill-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        updateAnalyticsData(option.dataset.range);
      }
    });
  }
}

function updateAnalyticsData(range) {
  // Simulated data per range
  const data = {
    day: { temp: '24.5', feed: '18', feedings: '3', quality: '99' },
    week: { temp: '24.8', feed: '124', feedings: '14', quality: '98' },
    month: { temp: '25.1', feed: '520', feedings: '62', quality: '96' },
    year: { temp: '24.9', feed: '6240', feedings: '744', quality: '97' }
  };

  const d = data[range] || data.week;

  // Animate number changes
  animateValue('stat-temp', parseFloat(d.temp));
  animateValue('stat-feed', parseInt(d.feed));
  animateValue('stat-feedings', parseInt(d.feedings));
  animateValue('stat-quality', parseInt(d.quality));
}

function animateValue(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const current = parseFloat(el.textContent) || 0;
  const diff = target - current;
  const duration = 600;
  const startTime = performance.now();
  const isFloat = target % 1 !== 0;

  function step(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = current + diff * eased;

    el.textContent = isFloat ? value.toFixed(1) : Math.round(value);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function initThemeToggle() {
  const btn = document.getElementById('btn-theme-toggle');
  const icon = document.getElementById('theme-icon');

  if (btn && icon) {
    icon.textContent = FeediFish.settings.darkMode ? 'light_mode' : 'dark_mode';
    btn.addEventListener('click', () => {
      const isDark = FeediFish.toggleTheme();
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
  }
}
