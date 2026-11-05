// Builds every question pattern many more times than the regular tests do, because a rare
// bad combination of random values would stop a student's test from loading.
// Usage: node tools/stress-patterns.js [seedsPerPattern]
const { loadCodeCheck } = require('../tests/load');

const CC = loadCodeCheck();
const seeds = Number(process.argv[2] || 400);
const failures = new Map();
let built = 0;

CC.lessonOrder.filter((id) => !CC.lessons[id].composite).forEach((id) => {
  CC.lessons[id].slots.forEach((slot) => slot.patterns.forEach((pattern) => {
    for (let s = 0; s < seeds; s++) {
      try {
        pattern.make(CC.makeRng(`stress/${id}/${slot.id}/${pattern.id}/${s}`));
        built += 1;
      } catch (err) {
        const key = `${id} ${slot.id}/${pattern.id}`;
        if (!failures.has(key)) failures.set(key, { count: 0, message: err.message.split('\n')[0].slice(0, 120) });
        failures.get(key).count += 1;
      }
    }
  }));
});

console.log(`Built ${built} questions.`);
failures.forEach((value, key) => console.log(`${key}: failed ${value.count} of ${seeds}. ${value.message}`));
process.exitCode = failures.size ? 1 : 0;
