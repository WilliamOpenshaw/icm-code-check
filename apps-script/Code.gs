// ICM Code Check: Google Sheet backend.
// Paste this file into Extensions > Apps Script in your Google Sheet as Code.gs.
// README.md has the step-by-step setup. This file is built from src/server/Code.gs,
// so make changes there and run `node tools/build.js`.

/** @OnlyCurrentDoc */

var CATALOG = [
  {
    "id": "U1LA1.1",
    "title": "p5.js Introduction & Deconstruction",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA1.2",
    "title": "Line Functions and Parameters",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA1.3",
    "title": "Rectangles, Ellipses, and Layering",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA1.4",
    "title": "Other Shapes & Styling",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA2.1",
    "title": "Intro to Color with RGB && HSB",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA3.1",
    "title": "Introducing Variables",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA3.2",
    "title": "Creating Custom Variables",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA4.1",
    "title": "What is Abstraction?",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA4.2",
    "title": "Intro to Functions && Function Calls",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA4.3",
    "title": "Draw with Functions",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA4.4",
    "title": "Using the Random Function",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U1LA5.1",
    "title": "Your Custom Function Library",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "Unit 1 Review",
    "title": "End of Unit 1",
    "minutes": 30,
    "questions": 16,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U2LA1.1",
    "title": "Conditionals and If Statements",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U2LA1.2",
    "title": "Conditionals and if, else if, and else",
    "minutes": 20,
    "questions": 11,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U2LA1.3",
    "title": "Logical Operators And/Or",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": true
  },
  {
    "id": "U2LA2.1",
    "title": "Draw with Mouse",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U2LA2.2",
    "title": "The Map Function",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U2LA3.1",
    "title": "Data Type Scavenger Hunt",
    "minutes": 12,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U2LA3.2",
    "title": "Functions that Return Values",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U2LA3.3",
    "title": "Functions with Purpose",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U2LA4.1",
    "title": "Collision Functions && Collide2D",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U2LA4.2",
    "title": "Mouse Clicks && Shapes as Buttons",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U2LA5.1",
    "title": "Key Presses && Nested Conditionals",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "Unit 2 Review",
    "title": "End of Unit 2",
    "minutes": 30,
    "questions": 16,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA1.1",
    "title": "While Loops",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA1.2",
    "title": "For Loops Pt 1",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA1.3",
    "title": "Nested For Loops",
    "minutes": 20,
    "questions": 10,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA2.1",
    "title": "Introduction to Arrays",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA2.2",
    "title": "Arrays with floor() and random()",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA2.3",
    "title": "Loops and Arrays",
    "minutes": 20,
    "questions": 12,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA2.4",
    "title": "Updating and Deleting from Arrays",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA3.1",
    "title": "Preload, Images, Tint",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA3.2",
    "title": "Images and Arrays with ml5",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA3.3",
    "title": "Fonts && Text Styling",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U3LA4.1",
    "title": "Loading & Playing Sound Files",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "Unit 3 Review",
    "title": "End of Unit 3",
    "minutes": 30,
    "questions": 16,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA1.1",
    "title": "Intro to Motion with Flipbooks",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA1.2",
    "title": "Move in All Directions && Make it Bounce",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA2.1",
    "title": "Introduction to Classes and Objects",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA2.2",
    "title": "Reading and Updating Object Properties",
    "minutes": 12,
    "questions": 8,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA2.3",
    "title": "Methods Off Canvas",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA2.4",
    "title": "Objects on Canvas",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA3.1",
    "title": "Creating Many Objects",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA4.1",
    "title": "Translation Battleship",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA4.2",
    "title": "Rotations",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA5.1",
    "title": "Sine && Oscillating Motion",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "U4LA5.2",
    "title": "Cosine && Circular Motion",
    "minutes": 15,
    "questions": 9,
    "attempts": 2,
    "practice": false
  },
  {
    "id": "Unit 4 Review",
    "title": "End of Unit 4",
    "minutes": 30,
    "questions": 16,
    "attempts": 2,
    "practice": false
  }
];

var TABS = {
  TESTS: 'Tests',
  ROSTER: 'Roster',
  ATTEMPTS: 'Attempts',
  RESULTS: 'Results',
  GRADEBOOK: 'Gradebook',
  SUMMARY: 'Class Summary',
};

var TEST_HEADERS = ['Lesson', 'Title', 'Open', 'Practice', 'Minutes', 'Questions', 'Attempts allowed', 'Start code'];
var ROSTER_HEADERS = ['Class', 'Student', 'Extra time %', 'Extra attempts'];
var ATTEMPT_HEADERS = ['Attempt ID', 'Lesson', 'Class', 'Student', 'Try', 'Started', 'Deadline', 'Status', 'Score %',
  'Left screen', 'Seconds away', 'Reloads', 'Copy tries', 'Window shrunk', 'Version', 'Questions', 'Allowed', 'Duration (sec)'];
var RESULT_HEADERS = ['Turned in', 'Lesson', 'Class', 'Student', 'Try', 'Score %', 'Points', 'Out of', 'Concepts %',
  'Code flow %', 'Writing code %', 'Minutes used', 'Late', 'Left screen', 'Seconds away', 'Reloads', 'Copy tries',
  'Window shrunk', 'Missed', 'Version', 'Detail'];

// Column positions in Attempts, counted from 0.
var A = {
  ID: 0, LESSON: 1, CLASS: 2, STUDENT: 3, TRY: 4, STARTED: 5, DEADLINE: 6, STATUS: 7, SCORE: 8, LEFT: 9, AWAY: 10,
  RELOADS: 11, COPIES: 12, SHRUNK: 13, VERSION: 14, QUESTIONS: 15, ALLOWED: 16, DURATION: 17,
};

var STATUS_RUNNING = 'in progress';
var STATUS_DONE = 'submitted';
var MAX_CELL = 45000;
var LATE_GRACE_MS = 60000;
var CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// ---- Web app ----

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ICM Code Check')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ---- Teacher menu and setup ----

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Code Check')
    .addItem('Set up or update tabs', 'setup')
    .addItem('New start codes for open tests', 'newStartCodes')
    .addToUi();
}

// A web page can call any function here whose name does not end in an underscore, so
// teacher-only functions must check who is asking. In the web app the visitor is never
// the effective user (unless it is the teacher, who owns the sheet anyway).
function requireOwner_() {
  var visitor = Session.getActiveUser().getEmail();
  if (visitor !== Session.getEffectiveUser().getEmail()) {
    throw new Error('Only the teacher can do this, from the Google Sheet.');
  }
}

// Safe to run more than once: it only adds what is missing and never removes data.
function setup() {
  requireOwner_();
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var tests = ensureTab_(book, TABS.TESTS, TEST_HEADERS);
  var roster = ensureTab_(book, TABS.ROSTER, ROSTER_HEADERS);
  var attempts = ensureTab_(book, TABS.ATTEMPTS, ATTEMPT_HEADERS);
  var results = ensureTab_(book, TABS.RESULTS, RESULT_HEADERS);

  var known = rows_(tests).map(function (row) { return String(row[0]); });
  CATALOG.forEach(function (lesson) {
    if (known.indexOf(lesson.id) >= 0) return;
    tests.appendRow([lesson.id, lesson.title, false, lesson.practice !== false, lesson.minutes, lesson.questions, lesson.attempts, newCode_()]);
  });
  formatTests_(tests);

  if (roster.getLastRow() === 1) {
    roster.getRange(2, 1, 3, 2).setValues([
      ['Period 1', 'Sample Student A'],
      ['Period 1', 'Sample Student B'],
      ['Period 2', 'Sample Student C'],
    ]);
  }
  formatAttemptWarnings_(attempts);
  attempts.hideColumns(A.ID + 1);
  results.getRange('F:F').setNumberFormat('0.0');
  // Keeps rows short: the long answer record stays in one line until you click on it.
  results.getRange('S:U').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  ensureReports_(book);
}

function newStartCodes() {
  requireOwner_();
  var tests = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABS.TESTS);
  var data = rows_(tests);
  data.forEach(function (row, i) {
    if (row[2] === true) tests.getRange(i + 2, 8).setValue(newCode_());
  });
}

function ensureTab_(book, name, headers) {
  var sheet = book.getSheetByName(name) || book.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatTests_(tests) {
  var count = Math.max(tests.getLastRow() - 1, 1);
  // insertCheckboxes resets every cell to unchecked, so put the current values back.
  var boxes = tests.getRange(2, 3, count, 2);
  var checked = boxes.getValues();
  boxes.insertCheckboxes();
  boxes.setValues(checked);
  tests.getRange(2, 8, count, 1).setNumberFormat('@');
  tests.autoResizeColumns(1, TEST_HEADERS.length);
}

// Turns a student's "Left screen" and related counts red so they stand out while watching.
function formatAttemptWarnings_(attempts) {
  var range = attempts.getRange(2, A.LEFT + 1, attempts.getMaxRows() - 1, 1);
  var copies = attempts.getRange(2, A.COPIES + 1, attempts.getMaxRows() - 1, 2);
  var rules = attempts.getConditionalFormatRules().filter(function (rule) {
    return rule.getRanges().every(function (r) { return r.getColumn() !== A.LEFT + 1 && r.getColumn() !== A.COPIES + 1; });
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#f8b4b4').setRanges([range]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#f8b4b4').setRanges([copies]).build());
  attempts.setConditionalFormatRules(rules);
}

// Reports are formulas, so they stay current as results come in.
function ensureReports_(book) {
  var gradebook = book.getSheetByName(TABS.GRADEBOOK) || book.insertSheet(TABS.GRADEBOOK);
  gradebook.getRange('A1').setFormula('=IFERROR(QUERY(Results!A:T,"select C, D, B, max(F), count(F) where D is not null group by C, D, B order by C, D, B label C \'Class\', D \'Student\', B \'Lesson\', max(F) \'Best score %\', count(F) \'Tries\'",1),"No results yet")');
  var summary = book.getSheetByName(TABS.SUMMARY) || book.insertSheet(TABS.SUMMARY);
  summary.getRange('A1').setFormula('=IFERROR(QUERY(Results!A:T,"select B, C, count(F), avg(F), avg(I), avg(J), avg(K) where D is not null group by B, C order by B, C label B \'Lesson\', C \'Class\', count(F) \'Tries\', avg(F) \'Average score %\', avg(I) \'Concepts %\', avg(J) \'Code flow %\', avg(K) \'Writing code %\' format avg(F) \'0.0\', avg(I) \'0.0\', avg(J) \'0.0\', avg(K) \'0.0\'",1),"No results yet")');
}

// ---- Reading the sheet ----

function tab_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('The ' + name + ' tab is missing. Choose Code Check > Set up or update tabs.');
  return sheet;
}

function rows_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
}

function isChecked_(value) {
  return value === true || String(value).toUpperCase() === 'TRUE';
}

function readTests_() {
  return rows_(tab_(TABS.TESTS)).map(function (row) {
    return {
      id: String(row[0]).trim(),
      title: String(row[1]),
      open: isChecked_(row[2]),
      practice: isChecked_(row[3]),
      minutes: Number(row[4]) || 20,
      questions: Number(row[5]) || 12,
      attempts: Number(row[6]) || 1,
      code: String(row[7]),
    };
  }).filter(function (t) { return t.id; });
}

function readRoster_() {
  return rows_(tab_(TABS.ROSTER)).map(function (row) {
    return {
      klass: String(row[0]).trim(),
      student: String(row[1]).trim(),
      extraPercent: Number(row[2]) || 0,
      extraAttempts: Number(row[3]) || 0,
    };
  }).filter(function (r) { return r.student; });
}

function normalizeCode_(code) {
  return String(code === undefined || code === null ? '' : code).trim().toUpperCase();
}

function newCode_() {
  var out = '';
  for (var i = 0; i < 5; i++) out += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
  return out;
}

function newVersion_() {
  var out = '';
  for (var i = 0; i < 8; i++) {
    if (i === 4) out += '-';
    out += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
  }
  return out;
}

// Anything text-like that goes in a cell must not turn into a live formula.
function safeText_(value) {
  var text = String(value === undefined || value === null ? '' : value).slice(0, MAX_CELL);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function safeNumber_(value) {
  var n = Number(value);
  return isFinite(n) ? n : 0;
}

function withLock_(work) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var result = work();
    SpreadsheetApp.flush();
    return result;
  } finally {
    lock.releaseLock();
  }
}

function describeAttempt_(row, now) {
  var deadline = new Date(row[A.DEADLINE]).getTime();
  return {
    id: String(row[A.ID]),
    lessonId: String(row[A.LESSON]),
    klass: String(row[A.CLASS]),
    student: String(row[A.STUDENT]),
    seed: String(row[A.VERSION]),
    questions: Number(row[A.QUESTIONS]),
    durationSec: Number(row[A.DURATION]),
    remainingSec: Math.max(0, Math.round((deadline - now) / 1000)),
    number: Number(row[A.TRY]),
    allowed: Number(row[A.ALLOWED]),
  };
}

function findAttempt_(sheet, attemptId) {
  var data = rows_(sheet);
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][A.ID]) === String(attemptId)) return { row: data[i], index: i + 2 };
  }
  return null;
}

// ---- Called by the page ----

// Student names and test titles only. Start codes never leave the sheet.
function apiConfig() {
  var roster = readRoster_();
  var names = [];
  roster.forEach(function (r) { if (names.indexOf(r.klass) < 0) names.push(r.klass); });
  return {
    mode: 'online',
    lessons: readTests_().map(function (t) {
      return {
        id: t.id, title: t.title, open: t.open, practice: t.practice,
      };
    }),
    classes: names.map(function (name) {
      return {
        name: name,
        students: roster.filter(function (r) { return r.klass === name; }).map(function (r) { return r.student; }),
      };
    }),
  };
}

function apiStart(req) {
  req = req || {};
  var test = readTests_().filter(function (t) { return t.id === String(req.lessonId); })[0];
  if (!test || !test.open) return { ok: false, error: 'That test is not open right now.' };
  if (normalizeCode_(req.code) !== normalizeCode_(test.code)) {
    return { ok: false, error: 'That start code is not right. Check with your teacher.' };
  }
  var entry = readRoster_().filter(function (r) {
    return r.klass === String(req.klass) && r.student === String(req.student);
  })[0];
  if (!entry) return { ok: false, error: 'That name is not on the class list.' };

  return withLock_(function () {
    var sheet = tab_(TABS.ATTEMPTS);
    var now = Date.now();
    var mine = rows_(sheet).filter(function (row) {
      return String(row[A.LESSON]) === test.id && String(row[A.CLASS]) === entry.klass && String(row[A.STUDENT]) === entry.student;
    });
    var running = mine.filter(function (row) {
      return row[A.STATUS] === STATUS_RUNNING && new Date(row[A.DEADLINE]).getTime() > now;
    })[0];
    // Reopening on any device continues the same test with the same time left.
    if (running) return { ok: true, attempt: describeAttempt_(running, now) };

    var allowed = test.attempts + entry.extraAttempts;
    if (mine.length >= allowed) {
      return { ok: false, error: 'You have used all of your attempts for this test. Talk to your teacher.' };
    }
    var durationSec = Math.round(test.minutes * 60 * (1 + entry.extraPercent / 100));
    var row = [];
    row[A.ID] = Utilities.getUuid();
    row[A.LESSON] = test.id;
    row[A.CLASS] = safeText_(entry.klass);
    row[A.STUDENT] = safeText_(entry.student);
    row[A.TRY] = mine.length + 1;
    row[A.STARTED] = new Date(now);
    row[A.DEADLINE] = new Date(now + durationSec * 1000);
    row[A.STATUS] = STATUS_RUNNING;
    row[A.SCORE] = '';
    row[A.LEFT] = 0;
    row[A.AWAY] = 0;
    row[A.RELOADS] = 0;
    row[A.COPIES] = 0;
    row[A.SHRUNK] = 0;
    row[A.VERSION] = newVersion_();
    row[A.QUESTIONS] = test.questions;
    row[A.ALLOWED] = allowed;
    row[A.DURATION] = durationSec;
    sheet.appendRow(row);
    return { ok: true, attempt: describeAttempt_(row, now) };
  });
}

function apiResume(attemptId) {
  var found = findAttempt_(tab_(TABS.ATTEMPTS), attemptId);
  if (!found) return { ok: false, code: 'not_found' };
  if (found.row[A.STATUS] !== STATUS_RUNNING) return { ok: false, code: 'submitted' };
  return { ok: true, attempt: describeAttempt_(found.row, Date.now()) };
}

function writeEventTotals_(sheet, index, totals) {
  sheet.getRange(index, A.LEFT + 1, 1, 5).setValues([[
    safeNumber_(totals.left),
    Math.round(safeNumber_(totals.awayMs) / 1000),
    safeNumber_(totals.reloads),
    safeNumber_(totals.copies),
    safeNumber_(totals.shrunk),
  ]]);
}

// Updates the live Attempts tab when a student leaves the screen.
function apiEvent(attemptId, totals) {
  return withLock_(function () {
    var sheet = tab_(TABS.ATTEMPTS);
    var found = findAttempt_(sheet, attemptId);
    if (found && found.row[A.STATUS] === STATUS_RUNNING) writeEventTotals_(sheet, found.index, totals || {});
    return true;
  });
}

function apiSubmit(attemptId, payload) {
  var p = payload || {};
  return withLock_(function () {
    var sheet = tab_(TABS.ATTEMPTS);
    var found = findAttempt_(sheet, attemptId);
    if (!found) return { ok: false, error: 'This attempt could not be found.' };
    var row = found.row;
    var used = rows_(sheet).filter(function (r) {
      return String(r[A.LESSON]) === String(row[A.LESSON]) && String(r[A.CLASS]) === String(row[A.CLASS])
        && String(r[A.STUDENT]) === String(row[A.STUDENT]);
    }).length;
    var reply = { ok: true, attemptsLeft: Math.max(0, Number(row[A.ALLOWED]) - used), number: Number(row[A.TRY]) };
    // A repeat of a submission that already saved, for example after a dropped connection.
    if (row[A.STATUS] === STATUS_DONE) return reply;

    var now = Date.now();
    var late = now > new Date(row[A.DEADLINE]).getTime() + LATE_GRACE_MS;
    var percent = safeNumber_(p.percent);
    tab_(TABS.RESULTS).appendRow([
      new Date(now),
      safeText_(row[A.LESSON]),
      safeText_(row[A.CLASS]),
      safeText_(row[A.STUDENT]),
      Number(row[A.TRY]),
      percent,
      safeNumber_(p.points),
      safeNumber_(p.max),
      safeNumber_(p.concepts),
      safeNumber_(p.flow),
      safeNumber_(p.build),
      safeNumber_(p.minutes),
      late ? 'LATE' : '',
      safeNumber_(p.left),
      safeNumber_(p.awaySec),
      safeNumber_(p.reloads),
      safeNumber_(p.copies),
      safeNumber_(p.shrunk),
      safeText_(p.missed),
      safeText_(row[A.VERSION]),
      safeText_(p.detail),
    ]);
    sheet.getRange(found.index, A.STATUS + 1, 1, 2).setValues([[STATUS_DONE, percent]]);
    writeEventTotals_(sheet, found.index, {
      left: p.left, awayMs: safeNumber_(p.awaySec) * 1000, reloads: p.reloads, copies: p.copies, shrunk: p.shrunk,
    });
    return reply;
  });
}
