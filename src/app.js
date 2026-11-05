// The screens: home, practice setup, test sign-in, the question runner, and results,
// plus teacher settings for the offline copy. (Online, the Google Sheet is the teacher's
// control panel.)
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const { h, Store } = CC;
  const ACTIVE_KEY = 'cc.active';
  const PENDING_KEY = 'cc.pending';
  const backend = CC.backend();
  const root = () => document.getElementById('app');

  let config = null;
  let run = null;

  // Screens with a colored band keep the display controls there. All others get a top bar.
  function show(...nodes) {
    const list = nodes.flat(Infinity).filter(Boolean);
    const hasBand = list.some((node) => node.classList && node.classList.contains('band'));
    if (!hasBand) list.unshift(h('div', { class: 'top-bar' }, CC.displayControls()));
    root().replaceChildren(...list);
    window.scrollTo(0, 0);
  }

  const pageHeader = (title, onBack) => h('header', { class: 'page-header' },
    onBack ? h('button', { type: 'button', class: 'btn btn-quiet', onclick: onBack }, '← Back') : null,
    h('h1', {}, title));

  const field = (label, control, help) => h('label', { class: 'field' },
    h('span', { class: 'field-label' }, label),
    control,
    help ? h('span', { class: 'field-help' }, help) : null);

  // Shown on every test and results screen, so the student and teacher can check the lesson.
  const lessonName = (test) => `${test.lessonId}: ${test.title}`;

  const formatClock = (seconds) => {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // A lesson can be listed in the Sheet before this page has questions for it, so only
  // lessons the page knows are offered. Without a connection, practice still works.
  // An updated Sheet can list them out of order, so they are shown in course order.
  const knownLessons = () => config.lessons
    .filter((l) => CC.lessons[l.id])
    .sort((a, b) => CC.lessonOrder.indexOf(a.id) - CC.lessonOrder.indexOf(b.id));

  async function loadConfig() {
    try {
      config = await backend.getConfig();
    } catch (err) {
      // After a dropped connection, what was loaded earlier is still worth using.
      if (!config || config.loadError) {
        config = { loadError: 'Practice still works, but the test could not connect. Try reloading.', lessons: [], classes: [] };
      }
    }
  }

  const practiceLessons = () => (config && !config.loadError
    ? knownLessons().filter((l) => l.practice)
    : CC.lessonOrder.map((id) => ({
      id, title: CC.lessons[id].title, open: false, practice: true,
    })));

  // ---- Home ----

  function showHome() {
    run = null;
    const offline = backend.mode === 'offline';
    // The public practice site has no tests, so students can't take one where nobody records it.
    const practiceOnly = !!CC.practiceOnly;
    show(
      h('main', { class: 'home' },
        h('h1', { class: 'brand' }, practiceOnly ? 'ICM Code Check Practice' : 'ICM Code Check'),
        h('p', { class: 'lede' }, 'Show what you understand about the code we have been writing.'),
        h('div', { class: 'home-cards' },
          h('button', { type: 'button', class: 'home-card card-practice', onclick: showPracticeSetup },
            h('strong', {}, 'Practice'),
            h('span', {}, 'A new random test every time, with answers explained. Nothing is graded.')),
          practiceOnly ? null : h('button', { type: 'button', class: 'home-card card-test', onclick: showTestSetup },
            h('strong', {}, 'Take the test'),
            h('span', {}, 'Timed and graded. You need a start code from your teacher.'))),
        practiceOnly ? h('p', { class: 'notice' }, 'This page is for practice only. Tests happen in class, on the link your teacher gives you. Practice here includes every lesson, so pick the one your class is on.') : null,
        config && config.loadError ? h('p', { class: 'notice notice-warn' }, config.loadError) : null,
        h('section', { class: 'rules home-tips' },
          h('h2', {}, 'Tips'),
          h('ul', {},
            h('li', {}, 'You may use AI for your work, but not on a test. If AI helps you, change the code and test it until you can explain how it works.'),
            h('li', {}, 'Practice until you can explain why an answer is right. Practice gives you new questions each time.'),
            h('li', {}, 'On a test, check that the lesson and your name at the top of the screen are right.'),
            h('li', {}, 'Questions come in a mixed order, and your test is different from your neighbors\' tests. If a question is slowing you down, mark it for review and move on.'),
            h('li', {}, 'After a test, practice the concepts it says to review. If you have a retake, your higher score counts.'))),
        offline && !practiceOnly ? h('button', { type: 'button', class: 'btn btn-quiet teacher-link', onclick: showTeacherGate }, 'Teacher settings') : null),
    );
  }

  // ---- Practice setup ----

  function showPracticeSetup() {
    const lessons = practiceLessons();
    if (!lessons.length) {
      show(pageHeader('Practice', showHome), h('p', { class: 'notice' }, 'No practice is available yet.'));
      return;
    }
    const lessonSelect = h('select', {}, lessons.map((l) => h('option', { value: l.id }, `${l.id}: ${l.title}`)));
    const focusSelect = h('select', {});
    const fillFocus = () => {
      const lesson = CC.lessons[lessonSelect.value];
      focusSelect.replaceChildren(
        h('option', { value: '' }, `A full practice test (${lesson.defaults.questions} questions)`),
        ...lesson.slots.map((s) => h('option', { value: s.id }, `Only: ${s.concept}`)),
      );
    };
    lessonSelect.addEventListener('change', fillFocus);
    fillFocus();

    const timing = (value, label, help, checked) => h('label', { class: 'option' },
      h('input', { type: 'radio', name: 'practice-timing', value, checked }),
      h('span', { class: 'option-text' }, h('strong', {}, label), h('br'), help));

    const feedbackChoice = h('div', { class: 'options' },
      timing('now', 'Check each answer as I go', 'See the right answer and why after each question.', true),
      timing('end', 'Check at the end, like the real test', 'Uses the timer from the real test.', false));

    show(
      pageHeader('Practice', showHome),
      h('form', {
        class: 'panel stack',
        onsubmit: (e) => {
          e.preventDefault();
          const lesson = CC.lessons[lessonSelect.value];
          const slotId = focusSelect.value || undefined;
          const instant = feedbackChoice.querySelector('input:checked').value === 'now';
          startPractice({
            lessonId: lesson.id, slotId, instant, count: slotId ? 5 : lesson.defaults.questions,
          });
        },
      },
      field('Lesson', lessonSelect),
      field('What to practice', focusSelect),
      h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'When to see answers'), feedbackChoice),
      h('button', { type: 'submit', class: 'btn btn-primary' }, 'Start practice')),
    );
  }

  function startPractice(options) {
    const test = CC.buildTest({ ...options, seed: CC.newSeed() });
    const lesson = CC.lessons[options.lessonId];
    startRunner({
      mode: 'practice',
      test,
      instant: options.instant,
      options,
      durationSec: options.instant ? null : lesson.defaults.minutes * 60,
    });
  }

  // ---- Test sign-in ----

  async function showTestSetup() {
    // A test may have opened since this page loaded, so check again each time.
    const checking = h('p', { class: 'notice' }, 'Checking for open tests…');
    show(pageHeader('Take the test', showHome), checking);
    await loadConfig();
    // The student may have gone back while this was loading.
    if (!checking.isConnected) return;
    if (config.loadError) {
      show(pageHeader('Take the test', showHome), h('p', { class: 'notice notice-warn' }, 'The test could not load. Try reloading this page, or tell your teacher.'));
      return;
    }
    const open = knownLessons().filter((l) => l.open);
    if (!open.length) {
      show(
        pageHeader('Take the test', showHome),
        h('p', { class: 'notice' }, 'No test is open right now. Your teacher will tell you when one is ready.'),
        h('button', { type: 'button', class: 'btn', onclick: showTestSetup }, 'Check again'),
      );
      return;
    }
    if (!config.classes.length) {
      show(pageHeader('Take the test', showHome), h('p', { class: 'notice' }, 'The class list has not been set up yet. Let your teacher know.'));
      return;
    }

    const lessonSelect = h('select', {}, open.map((l) => h('option', { value: l.id }, `${l.id}: ${l.title}`)));
    const classSelect = h('select', {}, config.classes.map((c) => h('option', { value: c.name }, c.name)));
    const nameSelect = h('select', { required: true });
    const fillNames = () => {
      const klass = config.classes.find((c) => c.name === classSelect.value);
      nameSelect.replaceChildren(
        h('option', { value: '' }, 'Choose your name'),
        ...klass.students.map((name) => h('option', { value: name }, name)),
      );
    };
    classSelect.addEventListener('change', fillNames);
    fillNames();

    const codeInput = h('input', {
      type: 'text', required: true, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', class: 'code-entry',
    });
    const errorBox = h('p', { class: 'notice notice-warn', role: 'alert', hidden: true });
    const startButton = h('button', { type: 'submit', class: 'btn btn-primary' }, 'Start the test');

    show(
      pageHeader('Take the test', showHome),
      h('form', {
        class: 'panel stack',
        onsubmit: async (e) => {
          e.preventDefault();
          errorBox.hidden = true;
          startButton.disabled = true;
          startButton.textContent = 'Starting…';
          let problem;
          try {
            const reply = await backend.start({
              lessonId: lessonSelect.value, klass: classSelect.value, student: nameSelect.value, code: codeInput.value,
            });
            if (reply.ok) {
              beginAttempt(reply.attempt, {});
              return;
            }
            problem = reply.error;
          } catch (err) {
            problem = 'The test could not connect. Check the internet connection and try again.';
          }
          errorBox.textContent = problem;
          errorBox.hidden = false;
          startButton.disabled = false;
          startButton.textContent = 'Start the test';
        },
      },
      open.length > 1 ? field('Test', lessonSelect) : h('p', { class: 'test-title' }, `${open[0].id}: ${open[0].title}`),
      config.classes.length > 1 ? field('Class', classSelect) : null,
      field('Your name', nameSelect),
      field('Start code', codeInput, 'Your teacher will give you this.'),
      h('div', { class: 'rules' },
        h('strong', {}, 'Before you start'),
        h('ul', {},
          h('li', {}, 'Check that you chose the right test and your own name. Both will stay at the top of the screen.'),
          h('li', {}, 'The timer starts as soon as you press Start.'),
          h('li', {}, 'Questions come in a mixed order. If one is slowing you down, mark it for review and move on.'),
          h('li', {}, 'No notes, no other tabs, and no AI. Leaving this screen gets recorded.'),
          h('li', {}, 'Your answers save as you go. You can go back and change them until time runs out.'),
          h('li', {}, 'When time runs out, the test turns itself in.'))),
      errorBox,
      startButton),
    );
  }

  function beginAttempt(attempt, saved) {
    const test = CC.buildTest({ lessonId: attempt.lessonId, seed: attempt.seed, count: attempt.questions });
    startRunner({
      mode: 'test',
      test,
      attempt,
      instant: false,
      durationSec: attempt.remainingSec,
      answers: saved.answers,
      flags: saved.flags,
      index: saved.index,
      events: saved.events,
    });
  }

  // ---- The question runner ----

  function startRunner(options) {
    run = {
      mode: options.mode,
      test: options.test,
      attempt: options.attempt || null,
      options: options.options || null,
      instant: options.instant,
      answers: options.answers || {},
      flags: options.flags || {},
      checked: {},
      index: options.index || 0,
      events: options.events || {
        left: 0, awayMs: 0, reloads: 0, copies: 0, shrunk: 0,
      },
      deadline: options.durationSec ? Date.now() + options.durationSec * 1000 : null,
      startedAt: Date.now(),
      finishing: false,
      timer: null,
      stopMonitoring: null,
      els: {},
    };
    drawRunnerShell();
    drawQuestion();
    if (run.deadline) {
      tick();
      run.timer = setInterval(tick, 250);
    }
    if (run.mode === 'test') {
      saveActive();
      run.stopMonitoring = startMonitoring();
    }
  }

  function saveActive() {
    if (!run || run.mode !== 'test') return;
    Store.set(ACTIVE_KEY, {
      attemptId: run.attempt.id,
      answers: run.answers,
      flags: run.flags,
      index: run.index,
      events: run.events,
    });
  }

  function drawRunnerShell() {
    const isTest = run.mode === 'test';
    const els = run.els;
    els.clock = run.deadline ? h('span', { class: 'clock', role: 'timer', 'aria-label': 'Time left' }) : null;
    els.alert = h('div', { class: 'sr-only', 'aria-live': 'assertive' });
    els.nav = h('nav', { class: 'q-nav', 'aria-label': 'Questions' });
    els.body = h('section', { class: 'q-body', tabindex: -1 });
    els.actions = h('div', { class: 'q-actions' });
    els.notice = h('p', { class: 'notice notice-warn', role: 'alert', hidden: true });

    const who = isTest ? `${run.attempt.student}` : 'Not graded';
    show(
      h('div', { class: `band ${isTest ? 'band-test' : 'band-practice'}` },
        h('div', { class: 'band-left' },
          h('strong', { class: 'band-mode' }, isTest ? 'TEST' : 'PRACTICE'),
          h('strong', { class: 'band-lesson' }, lessonName(run.test)),
          isTest ? h('strong', { class: 'band-student' }, who) : h('span', { class: 'band-detail' }, who)),
        h('div', { class: 'band-right' }, CC.displayControls(), els.clock)),
      h('main', { class: 'runner' }, els.notice, els.nav, els.body, els.actions),
      els.alert,
    );
  }

  function drawNav() {
    run.els.nav.replaceChildren(...run.test.questions.map((q, i) => {
      const answered = CC.isAnswered(q, run.answers[q.uid]) && (q.type !== 'parsons' || run.answers[q.uid] !== undefined);
      const label = `Question ${i + 1}${answered ? ', answered' : ', not answered'}${run.flags[q.uid] ? ', marked for review' : ''}`;
      return h('button', {
        type: 'button',
        class: `nav-dot ${answered ? 'answered' : ''} ${i === run.index ? 'current' : ''} ${run.flags[q.uid] ? 'flagged' : ''}`,
        'aria-label': label,
        'aria-current': i === run.index ? 'step' : null,
        onclick: () => goTo(i),
      }, i + 1);
    }));
  }

  function goTo(index) {
    run.index = index;
    saveActive();
    drawQuestion();
    run.els.body.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function drawQuestion() {
    const q = run.test.questions[run.index];
    const checked = !!run.checked[q.uid];
    const heading = h('p', { class: 'q-count' }, `Question ${run.index + 1} of ${run.test.questions.length}`);
    const parts = [
      heading,
      CC.renderQuestion(q, {
        answer: run.answers[q.uid],
        locked: checked,
        review: checked,
        onChange: (value) => {
          run.answers[q.uid] = value;
          saveActive();
          drawNav();
          if (run.instant) drawActions();
        },
      }),
    ];
    if (checked) parts.push(CC.renderFeedback(q, run.answers[q.uid]));
    run.els.body.replaceChildren(...parts);
    drawNav();
    drawActions();
  }

  function drawActions() {
    const q = run.test.questions[run.index];
    const last = run.index === run.test.questions.length - 1;
    const checked = !!run.checked[q.uid];
    const buttons = [];
    if (run.index > 0) {
      buttons.push(h('button', { type: 'button', class: 'btn', onclick: () => goTo(run.index - 1) }, '← Back'));
    }
    if (!run.instant) {
      buttons.push(h('button', {
        type: 'button',
        class: `btn btn-quiet ${run.flags[q.uid] ? 'is-flagged' : ''}`,
        'aria-pressed': run.flags[q.uid] ? 'true' : 'false',
        onclick: () => {
          run.flags[q.uid] = !run.flags[q.uid];
          saveActive();
          drawNav();
          drawActions();
        },
      }, run.flags[q.uid] ? '⚑ Marked for review' : '⚐ Mark for review'));
    }
    buttons.push(h('span', { class: 'spacer' }));
    if (run.instant && !checked) {
      buttons.push(h('button', {
        type: 'button',
        class: 'btn btn-primary',
        onclick: () => {
          run.checked[q.uid] = true;
          drawQuestion();
        },
      }, 'Check answer'));
    } else if (last) {
      buttons.push(h('button', {
        type: 'button',
        class: 'btn btn-primary',
        onclick: run.instant ? () => finish(false) : confirmSubmit,
      }, run.instant ? 'See my results' : 'Review and turn in'));
    } else {
      buttons.push(h('button', { type: 'button', class: 'btn btn-primary', onclick: () => goTo(run.index + 1) }, 'Next →'));
    }
    run.els.actions.replaceChildren(...buttons);
  }

  function confirmSubmit() {
    const questions = run.test.questions;
    const isDone = (q) => CC.isAnswered(q, run.answers[q.uid]) && run.answers[q.uid] !== undefined;
    const blank = questions.filter((q) => !isDone(q)).length;
    const flagged = questions.filter((q) => run.flags[q.uid]).length;
    const closeDialog = () => dialog.remove();
    const dialog = h('div', { class: 'dialog-backdrop' },
      h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'turn-in-title' },
        h('h2', { id: 'turn-in-title' }, run.mode === 'test' ? 'Turn in your test?' : 'Finish this practice test?'),
        run.mode === 'test' ? h('p', {}, h('strong', {}, run.attempt.student)) : null,
        h('p', {}, h('strong', {}, lessonName(run.test))),
        h('p', {}, blank === 0 ? 'You have answered every question.' : `${blank} question${blank === 1 ? ' is' : 's are'} not finished yet.`),
        flagged ? h('p', {}, `${flagged} question${flagged === 1 ? ' is' : 's are'} marked for review.`) : null,
        run.mode === 'test' ? h('p', {}, 'You cannot change your answers after turning in.') : null,
        h('div', { class: 'dialog-actions' },
          h('button', { type: 'button', class: 'btn', onclick: closeDialog }, 'Keep working'),
          h('button', {
            type: 'button',
            class: 'btn btn-primary',
            onclick: () => {
              closeDialog();
              finish(false);
            },
          }, 'Turn in'))));
    root().append(dialog);
    dialog.querySelector('.btn-primary').focus();
  }

  function tick() {
    if (!run || !run.deadline || run.finishing) return;
    const left = (run.deadline - Date.now()) / 1000;
    const { clock, alert } = run.els;
    clock.textContent = formatClock(left);
    clock.classList.toggle('clock-soon', left <= 300 && left > 60);
    clock.classList.toggle('clock-now', left <= 60);
    if (left <= 300 && !run.warned5) {
      run.warned5 = true;
      alert.textContent = 'Five minutes left.';
    }
    if (left <= 60 && !run.warned1) {
      run.warned1 = true;
      alert.textContent = 'One minute left.';
    }
    if (left <= 0) finish(true);
  }

  // ---- Watching for leaving the test. It only records; a teacher decides what it means ----

  function startMonitoring() {
    let awaySince = null;
    let shrunk = false;
    let noticeTimer = null;
    const baseWidth = window.innerWidth;
    const report = () => {
      saveActive();
      backend.event(run.attempt.id, run.events);
    };
    const leave = () => {
      if (awaySince === null) awaySince = Date.now();
    };
    const comeBack = () => {
      if (awaySince === null || !run) return;
      const away = Date.now() - awaySince;
      awaySince = null;
      // Brief blips, such as a system notification taking focus, are not counted.
      if (away < 1000) return;
      run.events.left += 1;
      run.events.awayMs += away;
      run.els.notice.textContent = 'You left the test screen. This was recorded for your teacher.';
      run.els.notice.hidden = false;
      clearTimeout(noticeTimer);
      const { notice } = run.els;
      noticeTimer = setTimeout(() => { notice.hidden = true; }, 8000);
      report();
    };
    const onVisibility = () => (document.hidden ? leave() : comeBack());
    const onCopy = (e) => {
      e.preventDefault();
      run.events.copies += 1;
      report();
    };
    const onResize = () => {
      // A much narrower window can mean a side panel or split screen was opened.
      const isShrunk = window.innerWidth < baseWidth * 0.85;
      if (isShrunk && !shrunk) {
        run.events.shrunk += 1;
        report();
      }
      shrunk = isShrunk;
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', leave);
    window.addEventListener('focus', comeBack);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCopy);
    window.addEventListener('resize', onResize);
    document.body.classList.add('no-select');
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', leave);
      window.removeEventListener('focus', comeBack);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCopy);
      window.removeEventListener('resize', onResize);
      document.body.classList.remove('no-select');
    };
  }

  // ---- Finishing ----

  function stopRunner() {
    if (run.timer) clearInterval(run.timer);
    if (run.stopMonitoring) run.stopMonitoring();
  }

  function finish(timedOut) {
    if (run.finishing) return;
    run.finishing = true;
    stopRunner();
    const backdrop = document.querySelector('.dialog-backdrop');
    if (backdrop) backdrop.remove();
    const score = CC.scoreTest(run.test, run.answers);
    if (run.mode === 'practice') {
      showPracticeResults(score, timedOut);
      return;
    }
    const finished = run;
    const detail = CC.detailRecords(finished.test, finished.answers, score);
    const usedSec = finished.attempt.durationSec - Math.max(0, (finished.deadline - Date.now()) / 1000);
    const payload = {
      percent: score.percent,
      points: score.points,
      max: score.max,
      concepts: score.skills.concepts.percent,
      flow: score.skills.flow.percent,
      build: score.skills.build.percent,
      minutes: Math.round((usedSec / 60) * 10) / 10,
      timedOut,
      left: finished.events.left,
      awaySec: Math.round(finished.events.awayMs / 1000),
      reloads: finished.events.reloads,
      copies: finished.events.copies,
      shrunk: finished.events.shrunk,
      missed: score.missed.join('; '),
      version: finished.test.seed,
      detail: JSON.stringify(detail),
    };
    sendResults(finished, payload, score, timedOut);
  }

  async function sendResults(finished, payload, score, timedOut) {
    show(h('main', { class: 'panel center' }, h('h1', {}, timedOut ? 'Time is up' : 'Turning in…'), h('p', {}, h('strong', {}, finished.attempt.student), h('br'), lessonName(finished.test)), h('p', {}, 'Saving your answers. Please stay on this page.')));
    try {
      const reply = await backend.submit(finished.attempt.id, payload);
      if (!reply.ok) throw new Error(reply.error || 'The test could not be saved.');
      Store.remove(ACTIVE_KEY);
      Store.remove(PENDING_KEY);
      showTestResults(finished, score, reply, timedOut);
    } catch (err) {
      // Keep the answers, and let the student retry. The teacher can see this screen.
      Store.set(PENDING_KEY, { attemptId: finished.attempt.id, payload });
      Store.remove(ACTIVE_KEY);
      show(h('main', { class: 'panel center stack' },
        h('h1', {}, 'Your test has not saved yet'),
        h('p', {}, 'Your answers are safe on this device, but they could not reach your teacher. Show this screen to your teacher.'),
        h('p', {}, h('strong', {}, `${finished.attempt.student}: ${payload.percent}%`), h('br'), lessonName(finished.test), h('br'), `Version ${payload.version}`),
        h('button', { type: 'button', class: 'btn btn-primary', onclick: () => sendResults(finished, payload, score, timedOut) }, 'Try saving again')));
    }
  }

  const skillBars = (score) => h('div', { class: 'skills' }, CC.SKILLS.map((skill) => {
    const s = score.skills[skill.id];
    if (!s.max) return null;
    return h('div', { class: 'skill' },
      h('div', { class: 'skill-top' }, h('span', {}, skill.label), h('span', {}, `${s.got} of ${s.max} points`)),
      h('div', { class: 'skill-bar' }, h('span', { style: `width:${s.percent}%` })));
  }));

  const missedList = (score) => (score.missed.length
    ? h('div', { class: 'missed' }, h('h2', {}, 'Worth reviewing'), h('ul', {}, score.missed.map((m) => h('li', {}, m))))
    : h('p', { class: 'all-right' }, 'You got full credit on everything.'));

  function showTestResults(finished, score, reply, timedOut) {
    const left = reply.attemptsLeft;
    const student = finished.attempt.student;
    show(h('main', { class: 'panel results stack' },
      h('h1', { class: 'results-lesson' }, lessonName(finished.test)),
      h('p', { class: 'results-for' }, `${student}${timedOut ? ' · time ran out' : ''}`),
      h('div', { class: 'score' }, h('span', { class: 'score-number' }, `${score.percent}%`), h('span', {}, `${score.points} of ${score.max} points`)),
      skillBars(score),
      missedList(score),
      left > 0
        ? h('p', { class: 'notice' }, `You can retake this test ${left === 1 ? 'one more time' : `${left} more times`} on a new version. Your higher score counts. Ask your teacher when.`)
        : null,
      h('button', { type: 'button', class: 'btn btn-primary', onclick: showHome }, 'Done')));
  }

  function showPracticeResults(score, timedOut) {
    const finished = run;
    const review = finished.test.questions.map((q, i) => {
      const credit = CC.grade(q, finished.answers[q.uid]).credit;
      return h('details', { class: 'review-item', open: credit < 1 },
        h('summary', {}, h('span', {}, `Question ${i + 1}`), h('span', { class: `review-credit credit-${credit === 1 ? 'full' : credit === 0.5 ? 'half' : 'none'}` }, credit === 1 ? '✓ full credit' : credit === 0.5 ? '½ half credit' : '✗ no credit')),
        CC.renderQuestion(q, { answer: finished.answers[q.uid], locked: true, review: true, onChange: () => {} }),
        CC.renderFeedback(q, finished.answers[q.uid]));
    });
    show(h('div', { class: 'band band-practice' },
      h('div', { class: 'band-left' }, h('strong', { class: 'band-mode' }, 'PRACTICE'), h('span', { class: 'band-detail' }, 'Results (not graded)')),
      h('div', { class: 'band-right' }, CC.displayControls())),
      h('main', { class: 'panel results stack' },
        h('h1', { class: 'results-lesson' }, lessonName(finished.test)),
        timedOut ? h('p', { class: 'notice' }, 'Time ran out, the same as it would on the real test.') : null,
        h('div', { class: 'score' }, h('span', { class: 'score-number' }, `${score.percent}%`), h('span', {}, `${score.points} of ${score.max} points`)),
        skillBars(score),
        missedList(score),
        h('div', { class: 'row-actions' },
          h('button', { type: 'button', class: 'btn btn-primary', onclick: () => startPractice(finished.options) }, 'Practice again with new questions'),
          h('button', { type: 'button', class: 'btn', onclick: showHome }, 'Done')),
        h('h2', {}, 'Go over your answers'),
        review));
  }

  // ---- Teacher settings for the offline copy ----

  function simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = Math.imul(31, hash) + text.charCodeAt(i) | 0;
    return String(hash);
  }

  function showTeacherGate() {
    const settings = backend.settings();
    const pinInput = h('input', { type: 'password', required: true, autocomplete: 'off' });
    const errorBox = h('p', { class: 'notice notice-warn', role: 'alert', hidden: true });
    const isNew = !settings.pin;
    show(
      pageHeader('Teacher settings', showHome),
      h('form', {
        class: 'panel stack',
        onsubmit: (e) => {
          e.preventDefault();
          if (isNew) {
            settings.pin = simpleHash(pinInput.value);
            backend.saveSettings(settings);
            showTeacherPanel();
          } else if (simpleHash(pinInput.value) === settings.pin) {
            showTeacherPanel();
          } else {
            errorBox.textContent = 'That PIN is not right.';
            errorBox.hidden = false;
          }
        },
      },
      field(isNew ? 'Choose a teacher PIN' : 'Teacher PIN', pinInput, isNew ? 'This keeps students out of the settings on this device.' : null),
      errorBox,
      h('button', { type: 'submit', class: 'btn btn-primary' }, isNew ? 'Set PIN' : 'Open settings')),
    );
  }

  function showTeacherPanel() {
    const settings = backend.settings();
    const save = () => backend.saveSettings(settings);

    const testRows = CC.lessonOrder.map((id) => {
      const t = settings.tests[id];
      const number = (key, min) => h('input', {
        type: 'number',
        min,
        value: t[key],
        class: 'number-input',
        'aria-label': `${key} for ${id}`,
        onchange: (e) => {
          t[key] = Math.max(min, Number(e.target.value) || min);
          save();
        },
      });
      const codeText = h('code', { class: 'start-code' }, t.code);
      return h('tr', {},
        h('td', {}, h('strong', {}, id), h('br'), CC.lessons[id].title),
        h('td', {}, h('input', {
          type: 'checkbox',
          checked: t.open,
          'aria-label': `Open ${id}`,
          onchange: (e) => {
            t.open = e.target.checked;
            save();
          },
        })),
        h('td', {}, number('minutes', 1)),
        h('td', {}, number('questions', 1)),
        h('td', {}, number('attempts', 1)),
        h('td', {}, codeText, ' ', h('button', {
          type: 'button',
          class: 'btn btn-small',
          onclick: () => {
            t.code = CC.newStartCode();
            codeText.textContent = t.code;
            save();
          },
        }, 'New code')));
    });

    const rosterBox = h('textarea', {
      rows: 8,
      class: 'roster-box',
      spellcheck: 'false',
      onchange: (e) => {
        settings.roster = e.target.value;
        save();
      },
    });
    rosterBox.value = settings.roster;

    const results = backend.results();
    const COLUMNS = [
      ['when', 'Turned in'], ['lesson', 'Lesson'], ['klass', 'Class'], ['student', 'Student'], ['attempt', 'Try'],
      ['percent', 'Score %'], ['points', 'Points'], ['max', 'Out of'], ['concepts', 'Concepts %'], ['flow', 'Code flow %'],
      ['build', 'Writing code %'], ['minutes', 'Minutes'], ['left', 'Left screen'], ['awaySec', 'Seconds away'],
      ['reloads', 'Reloads'], ['copies', 'Copy tries'], ['shrunk', 'Window shrunk'], ['late', 'Late'], ['missed', 'Missed'], ['version', 'Version'],
    ];
    const shownColumns = COLUMNS.filter(([key]) => !['max', 'reloads', 'copies', 'shrunk', 'late', 'version', 'when', 'points'].includes(key));

    const downloadCsv = () => {
      const quote = (value) => `"${String(value === undefined || value === null ? '' : value).replace(/"/g, '""')}"`;
      const lines = [COLUMNS.concat([['detail', 'Detail']]).map(([, label]) => quote(label)).join(',')];
      results.forEach((row) => lines.push(COLUMNS.concat([['detail', 'Detail']]).map(([key]) => quote(row[key])).join(',')));
      const link = h('a', {
        href: URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv' })),
        download: `code-check-results-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      document.body.append(link);
      link.click();
      link.remove();
    };

    const clearAll = () => {
      const close = () => dialog.remove();
      const dialog = h('div', { class: 'dialog-backdrop' }, h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true' },
        h('h2', {}, 'Delete all scores on this device?'),
        h('p', {}, `This deletes ${results.length} saved result${results.length === 1 ? '' : 's'} and all attempt counts. Download the CSV first if you need them. This cannot be undone.`),
        h('div', { class: 'dialog-actions' },
          h('button', { type: 'button', class: 'btn', onclick: close }, 'Keep them'),
          h('button', {
            type: 'button',
            class: 'btn btn-danger',
            onclick: () => {
              backend.clearResults();
              close();
              showTeacherPanel();
            },
          }, 'Delete them'))));
      root().append(dialog);
    };

    show(
      pageHeader('Teacher settings', showHome),
      h('main', { class: 'teacher stack' },
        h('section', { class: 'panel stack' },
          h('h2', {}, 'Tests'),
          h('p', { class: 'field-help' }, 'Tick Open for this week\'s test. Give students the start code when they should begin. Changes save by themselves.'),
          h('div', { class: 'table-wrap' }, h('table', { class: 'teacher-table' },
            h('thead', {}, h('tr', {}, ['Lesson', 'Open', 'Minutes', 'Questions', 'Tries allowed', 'Start code'].map((c) => h('th', { scope: 'col' }, c)))),
            h('tbody', {}, testRows)))),
        h('section', { class: 'panel stack' },
          h('h2', {}, 'Class list'),
          h('p', { class: 'field-help' }, 'One student per line: Class, Student, extra time %, extra tries. The last two are optional. For example: Period 3, Ana L., 50, 1'),
          rosterBox),
        h('section', { class: 'panel stack' },
          h('h2', {}, `Results (${results.length})`),
          results.length ? h('div', { class: 'table-wrap' }, h('table', { class: 'teacher-table' },
            h('thead', {}, h('tr', {}, shownColumns.map(([, label]) => h('th', { scope: 'col' }, label)))),
            h('tbody', {}, results.slice().reverse().map((row) => h('tr', {}, shownColumns.map(([key]) => h('td', {}, row[key]))))))) : h('p', {}, 'No results on this device yet.'),
          h('div', { class: 'row-actions' },
            h('button', { type: 'button', class: 'btn btn-primary', disabled: !results.length, onclick: downloadCsv }, 'Download CSV'),
            h('button', { type: 'button', class: 'btn', disabled: !results.length, onclick: clearAll }, 'Delete all scores')))),
    );
  }

  // ---- Starting up ----

  async function resumeIfNeeded() {
    const pending = Store.get(PENDING_KEY, null);
    if (pending) {
      try {
        const reply = await backend.submit(pending.attemptId, pending.payload);
        if (reply.ok) Store.remove(PENDING_KEY);
      } catch (err) {
        // It stays pending for the next time the page loads.
      }
    }
    const saved = Store.get(ACTIVE_KEY, null);
    if (!saved) return false;
    let reply;
    try {
      reply = await backend.resume(saved.attemptId);
    } catch (err) {
      show(h('main', { class: 'panel center stack' },
        h('h1', {}, 'Reconnecting to your test'),
        h('p', {}, 'Your answers are safe. Check the internet connection, then try again.'),
        h('button', { type: 'button', class: 'btn btn-primary', onclick: () => window.location.reload() }, 'Try again')));
      return true;
    }
    if (!reply.ok) {
      Store.remove(ACTIVE_KEY);
      return false;
    }
    const events = saved.events || {
      left: 0, awayMs: 0, reloads: 0, copies: 0, shrunk: 0,
    };
    events.reloads += 1;
    beginAttempt(reply.attempt, { ...saved, events });
    backend.event(reply.attempt.id, events);
    return true;
  }

  CC.startApp = async function () {
    show(h('main', { class: 'panel center' }, h('p', {}, 'Loading…')));
    await loadConfig();
    if (!CC.practiceOnly && await resumeIfNeeded()) return;
    showHome();
  };
})(CodeCheck);
