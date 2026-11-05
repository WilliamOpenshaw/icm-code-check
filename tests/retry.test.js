// A rare bad mix of random values must not stop a student's test from loading.
const test = require('node:test');
const assert = require('node:assert');
const { loadCodeCheck } = require('./load');

test('a question that fails to build is drawn again, the same way each time', () => {
  const CC = loadCodeCheck();
  const build = () => {
    let calls = 0;
    const lesson = CC.lessons['U2LA4.1'];
    const pattern = { id: 'flaky', make(r) { calls += 1; if (calls < 3) throw new Error('Duplicate options'); return { type: 'number', answer: r.int(1, 1000000) }; } };
    const slot = lesson.slots[0];
    const saved = slot.patterns;
    slot.patterns = [pattern];
    try {
      return CC.buildTest({ lessonId: 'U2LA4.1', seed: 'same', count: 1, slotId: slot.id }).questions[0].answer;
    } finally {
      slot.patterns = saved;
    }
  };
  assert.strictEqual(build(), build());
});
