// Simulates classes for every lesson and checks that students' tests stay very different,
// so passing answers along doesn't help. tools/measure-differences.js prints the details.
const test = require('node:test');
const assert = require('node:assert');
const { loadCodeCheck } = require('./load');
const { compareTests } = require('../tools/measure-differences');

const CC = loadCodeCheck();

CC.lessonOrder.forEach((lessonId) => {
  test(`${lessonId}: two students rarely share a question or an answer`, () => {
    const result = compareTests(CC, lessonId, 25, 4);
    assert.ok(result.averageShared < Math.max(1.2, result.count * 0.2), `Students share ${result.averageShared.toFixed(2)} answers on average`);
    Object.keys(result.bySlot).forEach((slot) => {
      const rate = result.bySlot[slot].sameQuestion / result.bySlot[slot].pairs;
      assert.ok(rate < 0.06, `${slot}: ${(rate * 100).toFixed(1)}% of pairs got the identical question`);
    });
  });
});
