/* ============================================================
   FEEDIFISH — Application State & Shared Logic
   ============================================================ */

// ── State Management ─────────────────────────────────────────
const FeediFish = {
  // Schedule data (persisted in localStorage)
  schedules: [],

  // App settings
  settings: {
    darkMode: false,
    notifications: true,
    deviceName: 'Feeder 01',
    wifiNetwork: 'HomeNet_5G'
  },

  // Dashboard data (simulated IoT)
  dashboard: {
    waterTemp: 24.5,
    feedRemaining: 85,
    deviceStatus: 'Active',
    servoStatus: 'Ready',
    feedingsToday: 3,
    feedingsTotal: 3
  },

  // Analytics data
  analytics: {
    avgTemp: 24.8,
    totalFeed: 124,
    totalFeedings: 14,
    waterQuality: 98
  },

  // Initialize
  init() {
    this.loadState();
    this.initTheme();
    this.startClock();
    this.updateNavActive();
  },

  // ── Persistence ──────────────────────────────────────────
  loadState() {
    try {
      const saved = localStorage.getItem('feedifish_schedules');
      if (saved) {
        this.schedules = JSON.parse(saved);
      } else {
        // Default schedules
        this.schedules = [
          { id: 1, hour: 7, minute: 0, servoDuration: 1, repeat: 'everyday', enabled: true },
          { id: 2, hour: 14, minute: 0, servoDuration: 2, repeat: 'everyday', enabled: true },
          { id: 3, hour: 18, minute: 0, servoDuration: 3, repeat: 'everyday', enabled: false }
        ];
        this.saveSchedules();
      }

      const settings = localStorage.getItem('feedifish_settings');
      if (settings) {
        this.settings = { ...this.settings, ...JSON.parse(settings) };
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
  },

  saveSchedules() {
    try {
      localStorage.setItem('feedifish_schedules', JSON.stringify(this.schedules));
    } catch (e) {
      console.warn('Failed to save schedules:', e);
    }
  },

  saveSettings() {
    try {
      localStorage.setItem('feedifish_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  // ── Schedule CRUD ────────────────────────────────────────
  addSchedule(schedule) {
    schedule.id = Date.now();
    this.schedules.push(schedule);
    this.saveSchedules();
    return schedule;
  },

  updateSchedule(id, updates) {
    const idx = this.schedules.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.schedules[idx] = { ...this.schedules[idx], ...updates };
      this.saveSchedules();
      return this.schedules[idx];
    }
    return null;
  },

  deleteSchedule(id) {
    this.schedules = this.schedules.filter(s => s.id !== id);
    this.saveSchedules();
  },

  toggleSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (schedule) {
      schedule.enabled = !schedule.enabled;
      this.saveSchedules();
      return schedule;
    }
    return null;
  },

  // ── Theme ────────────────────────────────────────────────
  initTheme() {
    if (this.settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  },

  toggleTheme() {
    this.settings.darkMode = !this.settings.darkMode;
    this.saveSettings();
    this.initTheme();
    return this.settings.darkMode;
  },

  // ── Clock ────────────────────────────────────────────────
  startClock() {
    const updateClock = () => {
      const now = new Date();
      const clockEl = document.getElementById('realtime-clock');
      const dateEl = document.getElementById('realtime-date');
      const ampmEl = document.getElementById('realtime-ampm');

      if (clockEl) {
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        clockEl.textContent = `${hours}:${minutes}`;
        if (ampmEl) ampmEl.textContent = ampm;
      }

      if (dateEl) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
      }
    };

    updateClock();
    setInterval(updateClock, 1000);
  },

  // ── Navigation ───────────────────────────────────────────
  updateNavActive() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';

    // Desktop nav
    document.querySelectorAll('.top-nav-link').forEach(link => {
      const href = link.getAttribute('href').replace('.html', '').replace('./', '');
      const linkPage = href === 'index' || href === './' || href === '' ? 'index' : href;
      link.classList.toggle('active', linkPage === page || (page === 'index' && href === 'index.html'));
    });

    // Bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(link => {
      const href = link.getAttribute('href').replace('.html', '').replace('./', '');
      const linkPage = href === 'index' || href === './' || href === '' ? 'index' : href;
      link.classList.toggle('active', linkPage === page || (page === 'index' && href === 'index.html'));
    });
  },

  // ── Utilities ────────────────────────────────────────────
  formatTime(hour, minute) {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return { time: `${h}:${m}`, ampm };
  },

  getRepeatLabel(repeat) {
    const labels = {
      'everyday': 'Everyday',
      'weekdays': 'Weekdays',
      'weekends': 'Weekends',
      'once': 'Once',
      'custom': 'Custom'
    };
    return labels[repeat] || repeat;
  }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => FeediFish.init());
