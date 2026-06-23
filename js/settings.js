/* ============================================================
   FEEDIFISH — Settings Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSettingsPage();
  initThemeToggle();
});

function initSettingsPage() {
  // Load current settings into display
  updateDisplayValues();

  // Wi-Fi button
  const wifiBtn = document.getElementById('btn-wifi');
  if (wifiBtn) wifiBtn.addEventListener('click', () => openSettingsModal('wifi-modal'));

  // Device Name button
  const deviceBtn = document.getElementById('btn-device-name');
  if (deviceBtn) deviceBtn.addEventListener('click', () => openSettingsModal('device-name-modal'));

  // Appearance button
  const appearanceBtn = document.getElementById('btn-appearance');
  if (appearanceBtn) appearanceBtn.addEventListener('click', () => {
    openSettingsModal('appearance-modal');
    updateAppearanceSelection();
  });

  // Notifications toggle
  const notifToggle = document.getElementById('toggle-notifications');
  if (notifToggle) {
    notifToggle.checked = FeediFish.settings.notifications;
    notifToggle.addEventListener('change', () => {
      FeediFish.settings.notifications = notifToggle.checked;
      FeediFish.saveSettings();
      showToast(notifToggle.checked ? 'Notifications enabled' : 'Notifications disabled');
    });
  }

  // Servo Calibration
  const servoBtn = document.getElementById('btn-servo-cal');
  if (servoBtn) servoBtn.addEventListener('click', () => {
    showToast('Servo calibration started...');
    setTimeout(() => showToast('Servo calibration complete ✓'), 2000);
  });

  // System actions
  const resetScheduleBtn = document.getElementById('btn-reset-schedule');
  if (resetScheduleBtn) {
    resetScheduleBtn.addEventListener('click', () => {
      showConfirm(
        'Reset All Schedules?',
        'All feeding schedules will be deleted. This cannot be undone.',
        'delete_forever',
        () => {
          FeediFish.schedules = [];
          FeediFish.saveSchedules();
          showToast('All schedules have been reset');
        }
      );
    });
  }

  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      showConfirm(
        'Restart Device?',
        'The device will restart and reconnect automatically.',
        'restart_alt',
        () => {
          showToast('Device restarting...');
        }
      );
    });
  }

  const factoryBtn = document.getElementById('btn-factory-reset');
  if (factoryBtn) {
    factoryBtn.addEventListener('click', () => {
      showConfirm(
        'Factory Reset?',
        'All data including schedules, settings, and WiFi configuration will be erased permanently.',
        'warning',
        () => {
          localStorage.clear();
          showToast('Factory reset complete. Reloading...');
          setTimeout(() => window.location.reload(), 1500);
        }
      );
    });
  }

  // Appearance option selection
  document.querySelectorAll('.appearance-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const mode = opt.dataset.mode;
      const isDark = mode === 'dark';

      FeediFish.settings.darkMode = isDark;
      FeediFish.saveSettings();
      FeediFish.initTheme();

      updateAppearanceSelection();
      updateDisplayValues();

      // Update theme toggle icon
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';

      closeAllModals();
      showToast(`Appearance: ${isDark ? 'Dark' : 'Light'} mode`);
    });
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });
}

function updateDisplayValues() {
  const wifiDisplay = document.getElementById('wifi-display');
  const deviceDisplay = document.getElementById('device-name-display');
  const appearanceDisplay = document.getElementById('appearance-display');

  if (wifiDisplay) wifiDisplay.textContent = FeediFish.settings.wifiNetwork;
  if (deviceDisplay) deviceDisplay.textContent = FeediFish.settings.deviceName;
  if (appearanceDisplay) appearanceDisplay.textContent = FeediFish.settings.darkMode ? 'Dark' : 'Light';
}

function updateAppearanceSelection() {
  document.querySelectorAll('.appearance-option').forEach(opt => {
    const isActive = (opt.dataset.mode === 'dark') === FeediFish.settings.darkMode;
    opt.classList.toggle('active', isActive);
  });
}

// ── Modal Functions ──────────────────────────────────────────
function openSettingsModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  document.body.style.overflow = '';
}

// ── Save Functions ───────────────────────────────────────────
function saveWifi() {
  const ssid = document.getElementById('wifi-ssid').value.trim();
  if (ssid) {
    FeediFish.settings.wifiNetwork = ssid;
    FeediFish.saveSettings();
    updateDisplayValues();
    closeAllModals();
    showToast(`Connected to ${ssid}`);
  }
}

function saveDeviceName() {
  const name = document.getElementById('device-name-input').value.trim();
  if (name) {
    FeediFish.settings.deviceName = name;
    FeediFish.saveSettings();
    updateDisplayValues();
    closeAllModals();
    showToast(`Device renamed to "${name}"`);
  }
}

// ── Confirm Dialog ───────────────────────────────────────────
let confirmCallback = null;

function showConfirm(title, message, icon, callback) {
  confirmCallback = callback;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-icon').textContent = icon;

  const actionBtn = document.getElementById('confirm-action');
  actionBtn.onclick = () => {
    if (confirmCallback) confirmCallback();
    closeAllModals();
  };

  openSettingsModal('confirm-modal');
}

// ── Toast ────────────────────────────────────────────────────
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger show
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-hide
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── Theme Toggle ─────────────────────────────────────────────
function initThemeToggle() {
  const btn = document.getElementById('btn-theme-toggle');
  const icon = document.getElementById('theme-icon');

  if (btn && icon) {
    icon.textContent = FeediFish.settings.darkMode ? 'light_mode' : 'dark_mode';
    btn.addEventListener('click', () => {
      const isDark = FeediFish.toggleTheme();
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
      updateDisplayValues();
      showToast(`${isDark ? 'Dark' : 'Light'} mode activated`);
    });
  }
}
