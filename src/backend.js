// Where rosters, settings, attempts, and scores live. The app talks to one interface
// with two versions: the Google Sheet (when running as an Apps Script web app) and this
// device's browser storage (when opened as a plain file).
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  // ---- Browser storage. Some sandboxes block it, so fall back to memory ----

  const memory = new Map();
  const Store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) return JSON.parse(raw);
      } catch (err) {
        if (memory.has(key)) return memory.get(key);
        return fallback;
      }
      return memory.has(key) ? memory.get(key) : fallback;
    },
    set(key, value) {
      memory.set(key, value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        // Memory still holds it for this page.
      }
    },
    remove(key) {
      memory.delete(key);
      try {
        localStorage.removeItem(key);
      } catch (err) {
        // Nothing more to do.
      }
    },
  };
  CC.Store = Store;

  const normalizeCode = (code) => String(code || '').trim().toUpperCase();

  // ---- Offline: everything stays on this device ----

  const SETTINGS_KEY = 'cc.settings';
  const ATTEMPTS_KEY = 'cc.attempts';
  const RESULTS_KEY = 'cc.results';

  CC.newStartCode = function () {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const seed = CC.newSeed().replace('-', '');
    for (let i = 0; i < 5; i++) code += alphabet[alphabet.indexOf(seed[i])];
    return code;
  };

  CC.parseRoster = function (text) {
    const entries = [];
    String(text || '').split(/\r?\n/).forEach((line) => {
      if (!line.trim()) return;
      const parts = line.split(line.includes('\t') ? '\t' : ',').map((p) => p.trim());
      if (parts.length === 1) parts.unshift('My class');
      entries.push({
        klass: parts[0],
        student: parts[1],
        extraPercent: Number(parts[2]) || 0,
        extraAttempts: Number(parts[3]) || 0,
      });
    });
    return entries.filter((e) => e.student);
  };

  const classesFrom = (entries) => {
    const names = [];
    entries.forEach((e) => { if (!names.includes(e.klass)) names.push(e.klass); });
    return names.map((name) => ({
      name,
      students: entries.filter((e) => e.klass === name).map((e) => e.student),
    }));
  };

  function loadSettings() {
    const settings = Store.get(SETTINGS_KEY, null) || {
      pin: null,
      roster: 'My class, Sample Student A\nMy class, Sample Student B\nMy class, Sample Student C, 50',
      tests: {},
    };
    CC.lessonOrder.forEach((id) => {
      if (!settings.tests[id]) {
        const d = CC.lessons[id].defaults;
        settings.tests[id] = {
          open: false, minutes: d.minutes, questions: d.questions, attempts: d.attempts, code: CC.newStartCode(),
        };
      }
    });
    return settings;
  }

  CC.LocalBackend = {
    mode: 'offline',
    settings: loadSettings,
    saveSettings(settings) { Store.set(SETTINGS_KEY, settings); },
    results() { return Store.get(RESULTS_KEY, []); },
    clearResults() {
      Store.remove(RESULTS_KEY);
      Store.remove(ATTEMPTS_KEY);
    },

    async getConfig() {
      const settings = loadSettings();
      return {
        mode: 'offline',
        lessons: CC.lessonOrder.map((id) => ({
          id, title: CC.lessons[id].title, open: !!settings.tests[id].open, practice: true,
        })),
        classes: classesFrom(CC.parseRoster(settings.roster)),
      };
    },

    async start(req) {
      const settings = loadSettings();
      const test = settings.tests[req.lessonId];
      if (!test || !test.open) return { ok: false, error: 'That test is not open right now.' };
      if (normalizeCode(req.code) !== normalizeCode(test.code)) {
        return { ok: false, error: 'That start code is not right. Check with your teacher.' };
      }
      const entry = CC.parseRoster(settings.roster)
        .find((e) => e.klass === req.klass && e.student === req.student);
      if (!entry) return { ok: false, error: 'That name is not on the class list.' };

      const attempts = Store.get(ATTEMPTS_KEY, []);
      const mine = attempts.filter((a) => a.lessonId === req.lessonId
        && a.klass === req.klass && a.student === req.student);
      const now = Date.now();
      const running = mine.find((a) => a.status === 'in progress' && a.deadline > now);
      if (running) return { ok: true, attempt: describeAttempt(running, now) };

      const allowed = test.attempts + entry.extraAttempts;
      if (mine.length >= allowed) {
        return { ok: false, error: 'You have used all of your attempts for this test. Talk to your teacher.' };
      }
      const durationSec = Math.round(test.minutes * 60 * (1 + entry.extraPercent / 100));
      const attempt = {
        id: `local-${now}-${CC.newSeed()}`,
        lessonId: req.lessonId,
        klass: req.klass,
        student: req.student,
        seed: CC.newSeed(),
        questions: test.questions,
        durationSec,
        deadline: now + durationSec * 1000,
        number: mine.length + 1,
        allowed,
        status: 'in progress',
      };
      attempts.push(attempt);
      Store.set(ATTEMPTS_KEY, attempts);
      return { ok: true, attempt: describeAttempt(attempt, now) };
    },

    async resume(attemptId) {
      const attempt = Store.get(ATTEMPTS_KEY, []).find((a) => a.id === attemptId);
      if (!attempt) return { ok: false, code: 'not_found' };
      if (attempt.status !== 'in progress') return { ok: false, code: 'submitted' };
      return { ok: true, attempt: describeAttempt(attempt, Date.now()) };
    },

    async event() {
      // Offline, the totals are saved with the attempt when it is submitted.
    },

    async submit(attemptId, payload) {
      const attempts = Store.get(ATTEMPTS_KEY, []);
      const attempt = attempts.find((a) => a.id === attemptId);
      if (!attempt) return { ok: false, error: 'This attempt could not be found.' };
      const results = Store.get(RESULTS_KEY, []);
      if (attempt.status !== 'submitted') {
        attempt.status = 'submitted';
        Store.set(ATTEMPTS_KEY, attempts);
        results.push({
          when: new Date().toLocaleString(),
          lesson: attempt.lessonId,
          klass: attempt.klass,
          student: attempt.student,
          attempt: attempt.number,
          late: Date.now() > attempt.deadline + 60000,
          ...payload,
        });
        Store.set(RESULTS_KEY, results);
      }
      const used = attempts.filter((a) => a.lessonId === attempt.lessonId
        && a.klass === attempt.klass && a.student === attempt.student).length;
      return { ok: true, attemptsLeft: Math.max(0, attempt.allowed - used), number: attempt.number };
    },
  };

  function describeAttempt(a, now) {
    return {
      id: a.id,
      lessonId: a.lessonId,
      klass: a.klass,
      student: a.student,
      seed: a.seed,
      questions: a.questions,
      durationSec: a.durationSec,
      remainingSec: Math.max(0, Math.round((a.deadline - now) / 1000)),
      number: a.number,
      allowed: a.allowed,
    };
  }

  // ---- Online: everything goes to the Google Sheet through Apps Script ----

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function callServer(name, args) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler((err) => reject(err instanceof Error ? err : new Error(String(err && err.message ? err.message : err))))[name](...args);
    });
  }

  // Apps Script allows 30 simultaneous runs, so a whole class pressing Start together can
  // briefly hit that limit. Waiting a varied amount and trying again clears it.
  async function callWithRetry(name, args, tries) {
    let lastError;
    for (let i = 0; i < tries; i++) {
      try {
        return await callServer(name, args);
      } catch (err) {
        lastError = err;
        if (i < tries - 1) await wait(1000 * 2 ** i + Math.random() * 1500);
      }
    }
    throw lastError;
  }

  CC.SheetBackend = {
    mode: 'online',
    getConfig: () => callWithRetry('apiConfig', [], 4),
    start: (req) => callWithRetry('apiStart', [req], 5),
    resume: (attemptId) => callWithRetry('apiResume', [attemptId], 4),
    // Fire and forget: the totals are sent again with the submission anyway.
    event: (attemptId, totals) => callServer('apiEvent', [attemptId, totals]).catch(() => {}),
    submit: (attemptId, payload) => callWithRetry('apiSubmit', [attemptId, payload], 6),
  };

  CC.backend = function () {
    return typeof google !== 'undefined' && google.script && google.script.run ? CC.SheetBackend : CC.LocalBackend;
  };
})(CodeCheck);
