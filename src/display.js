// The on-screen text size and dark mode controls. Choices are remembered on this device,
// and changing them never touches a student's answers, timer, or test flags.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const { h, Store } = CC;
  const KEY = 'cc.display';
  const SIZES = [0.9, 1, 1.15, 1.3, 1.5, 1.75, 2];

  const systemTheme = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // theme stays empty until a student picks one, so the device's own setting is the default.
  const saved = Store.get(KEY, {}) || {};
  const state = {
    scale: SIZES.includes(saved.scale) ? saved.scale : 1,
    theme: saved.theme === 'dark' || saved.theme === 'light' ? saved.theme : null,
  };

  function apply() {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.theme || systemTheme());
    root.style.setProperty('--text-scale', String(state.scale));
  }

  function save() {
    const toSave = { scale: state.scale };
    if (state.theme) toSave.theme = state.theme;
    Store.set(KEY, toSave);
  }

  apply();

  // Controls are redrawn with each screen, so every copy reads the current state.
  CC.displayControls = function () {
    const percent = h('button', {
      type: 'button',
      class: 'display-btn display-size',
      onclick: () => setScale(1),
    });
    const smaller = h('button', {
      type: 'button',
      class: 'display-btn',
      'aria-label': 'Make text smaller',
      title: 'Make text smaller',
      onclick: () => setScale(SIZES[SIZES.indexOf(state.scale) - 1]),
    }, 'A−');
    const bigger = h('button', {
      type: 'button',
      class: 'display-btn',
      'aria-label': 'Make text bigger',
      title: 'Make text bigger',
      onclick: () => setScale(SIZES[SIZES.indexOf(state.scale) + 1]),
    }, 'A+');
    const theme = h('button', {
      type: 'button',
      class: 'display-btn display-theme',
      onclick: () => {
        state.theme = currentTheme() === 'dark' ? 'light' : 'dark';
        apply();
        save();
        refresh();
      },
    });
    const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });

    function currentTheme() {
      return document.documentElement.getAttribute('data-theme');
    }

    function setScale(scale) {
      state.scale = scale;
      apply();
      save();
      refresh();
      live.textContent = `Text size ${Math.round(scale * 100)} percent.`;
    }

    function refresh() {
      const index = SIZES.indexOf(state.scale);
      const label = `${Math.round(state.scale * 100)}%`;
      percent.textContent = label;
      percent.setAttribute('aria-label', `Text size is ${label}. Reset to 100%.`);
      percent.title = 'Reset text size to 100%';
      smaller.disabled = index === 0;
      bigger.disabled = index === SIZES.length - 1;
      const isDark = currentTheme() === 'dark';
      theme.textContent = isDark ? '☀ Light' : '☾ Dark';
      theme.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    refresh();
    return h('div', { class: 'display-controls', role: 'group', 'aria-label': 'Text size and color mode' },
      smaller, percent, bigger, theme, live);
  };
})(CodeCheck);
