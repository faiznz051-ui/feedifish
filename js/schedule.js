/* ============================================================
   FEEDIFISH — Schedule Page Logic
   ============================================================ */

let editingScheduleId = null;
let deletingScheduleId = null;

document.addEventListener('DOMContentLoaded', () => {
  initSchedulePage();
  initThemeToggle();
});

function initSchedulePage() {
  // Populate time picker
  populateTimePicker();

  // Render schedules
  renderSchedules();

  // Modal triggers
  const addBtnMobile = document.getElementById('btn-add-schedule-mobile');
  const addBtnDesktop = document.getElementById('btn-add-schedule-desktop');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');

  if (addBtnMobile) addBtnMobile.addEventListener('click', () => openModal());
  if (addBtnDesktop) addBtnDesktop.addEventListener('click', () => openModal());
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  // Close modal on overlay click
  const overlay = document.getElementById('schedule-modal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Form submit
  const form = document.getElementById('schedule-form');
  if (form) form.addEventListener('submit', handleSaveSchedule);

  // Servo slider
  const slider = document.getElementById('servo-slider');
  const valueDisplay = document.getElementById('servo-value');
  if (slider && valueDisplay) {
    slider.addEventListener('input', () => {
      valueDisplay.textContent = slider.value;
      updateSliderFill(slider);
    });
    updateSliderFill(slider);
  }

  // Chip selection
  const chipGroup = document.getElementById('repeat-chips');
  if (chipGroup) {
    chipGroup.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        chipGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      }
    });
  }

  // Delete modal
  const deleteCancel = document.getElementById('delete-cancel');
  const deleteConfirm = document.getElementById('delete-confirm');
  if (deleteCancel) deleteCancel.addEventListener('click', closeDeleteModal);
  if (deleteConfirm) deleteConfirm.addEventListener('click', confirmDelete);

  const deleteOverlay = document.getElementById('delete-modal');
  if (deleteOverlay) {
    deleteOverlay.addEventListener('click', (e) => {
      if (e.target === deleteOverlay) closeDeleteModal();
    });
  }
}

function populateTimePicker() {
  const hourSelect = document.getElementById('time-hour');
  const minuteSelect = document.getElementById('time-minute');

  if (hourSelect) {
    for (let h = 1; h <= 12; h++) {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h.toString().padStart(2, '0');
      hourSelect.appendChild(opt);
    }
  }

  if (minuteSelect) {
    for (let m = 0; m < 60; m += 5) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m.toString().padStart(2, '0');
      minuteSelect.appendChild(opt);
    }
  }
}

function renderSchedules() {
  const list = document.getElementById('schedule-list');
  const emptyState = document.getElementById('empty-state');

  if (!list) return;

  if (FeediFish.schedules.length === 0) {
    list.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  list.innerHTML = FeediFish.schedules.map((schedule, index) => {
    const { time, ampm } = FeediFish.formatTime(schedule.hour, schedule.minute);
    const repeatLabel = FeediFish.getRepeatLabel(schedule.repeat);
    const servoPct = (schedule.servoDuration / 5) * 100;
    const enabledClass = schedule.enabled ? '' : ' disabled';
    const checkedAttr = schedule.enabled ? 'checked' : '';

    return `
      <article class="glass-card schedule-card${enabledClass} animate-fade-in stagger-${Math.min(index + 1, 6)}" data-id="${schedule.id}">
        <div class="schedule-card-header">
          <div>
            <span class="schedule-time">${time} <span class="schedule-ampm">${ampm}</span></span>
            <div class="schedule-repeat text-body-sm">
              <span class="material-symbols-outlined">sync</span>
              ${repeatLabel}
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${checkedAttr} onchange="handleToggle(${schedule.id})" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="schedule-divider"></div>
        <div class="schedule-footer">
          <div class="servo-info">
            <div class="text-label-caps color-variant servo-label">SERVO DURATION (${schedule.servoDuration}S)</div>
            <div class="servo-bar">
              <div class="servo-bar-fill" style="width: ${servoPct}%;"></div>
            </div>
          </div>
          <div class="schedule-actions">
            <button class="btn-text" onclick="openEditModal(${schedule.id})">Edit</button>
            <button class="btn-danger" onclick="openDeleteModal(${schedule.id})">Delete</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ── Modal Logic ──────────────────────────────────────────────
function openModal(schedule = null) {
  const modal = document.getElementById('schedule-modal');
  const title = document.getElementById('modal-title');
  const saveBtn = document.getElementById('modal-save');
  const idInput = document.getElementById('schedule-id');

  if (schedule) {
    editingScheduleId = schedule.id;
    title.textContent = 'Edit Schedule';
    saveBtn.textContent = 'Update Schedule';
    idInput.value = schedule.id;

    // Populate fields
    const h = schedule.hour % 12 || 12;
    const ampm = schedule.hour >= 12 ? 'PM' : 'AM';
    document.getElementById('time-hour').value = h;
    document.getElementById('time-minute').value = schedule.minute;
    document.getElementById('time-ampm').value = ampm;
    document.getElementById('servo-slider').value = schedule.servoDuration;
    document.getElementById('servo-value').textContent = schedule.servoDuration;

    // Set repeat chip
    document.querySelectorAll('#repeat-chips .chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.value === schedule.repeat);
    });
  } else {
    editingScheduleId = null;
    title.textContent = 'Add Schedule';
    saveBtn.textContent = 'Save Schedule';
    idInput.value = '';

    // Reset form
    document.getElementById('time-hour').value = 7;
    document.getElementById('time-minute').value = 0;
    document.getElementById('time-ampm').value = 'AM';
    document.getElementById('servo-slider').value = 2;
    document.getElementById('servo-value').textContent = '2';

    document.querySelectorAll('#repeat-chips .chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.value === 'everyday');
    });
  }

  updateSliderFill(document.getElementById('servo-slider'));
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('schedule-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  editingScheduleId = null;
}

function openEditModal(id) {
  const schedule = FeediFish.schedules.find(s => s.id === id);
  if (schedule) openModal(schedule);
}

function handleSaveSchedule(e) {
  e.preventDefault();

  let hour = parseInt(document.getElementById('time-hour').value);
  const minute = parseInt(document.getElementById('time-minute').value);
  const ampm = document.getElementById('time-ampm').value;
  const servoDuration = parseInt(document.getElementById('servo-slider').value);
  const repeat = document.querySelector('#repeat-chips .chip.active')?.dataset.value || 'everyday';

  // Convert to 24h
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  if (editingScheduleId) {
    FeediFish.updateSchedule(editingScheduleId, { hour, minute, servoDuration, repeat });
  } else {
    FeediFish.addSchedule({ hour, minute, servoDuration, repeat, enabled: true });
  }

  closeModal();
  renderSchedules();
}

// ── Toggle ───────────────────────────────────────────────────
function handleToggle(id) {
  FeediFish.toggleSchedule(id);
  // Update card opacity
  const card = document.querySelector(`.schedule-card[data-id="${id}"]`);
  if (card) {
    const schedule = FeediFish.schedules.find(s => s.id === id);
    card.classList.toggle('disabled', !schedule?.enabled);
  }
}

// ── Delete ───────────────────────────────────────────────────
function openDeleteModal(id) {
  deletingScheduleId = id;
  document.getElementById('delete-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.remove('active');
  document.body.style.overflow = '';
  deletingScheduleId = null;
}

function confirmDelete() {
  if (deletingScheduleId) {
    const card = document.querySelector(`.schedule-card[data-id="${deletingScheduleId}"]`);
    if (card) {
      card.classList.add('deleting');
      setTimeout(() => {
        FeediFish.deleteSchedule(deletingScheduleId);
        renderSchedules();
        closeDeleteModal();
      }, 400);
    } else {
      FeediFish.deleteSchedule(deletingScheduleId);
      renderSchedules();
      closeDeleteModal();
    }
  }
}

// ── Slider Fill ──────────────────────────────────────────────
function updateSliderFill(slider) {
  if (!slider) return;
  const min = parseInt(slider.min);
  const max = parseInt(slider.max);
  const val = parseInt(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, var(--color-primary) ${pct}%, var(--color-surface-container-highest) ${pct}%)`;
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
    });
  }
}
