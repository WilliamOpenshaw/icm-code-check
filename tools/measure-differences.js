// Simulates a class and reports how different students' tests really are.
// Usage: node tools/measure-differences.js            (every test)
//        node tools/measure-differences.js U2LA4.1 [students] [classes]

// What one student would have to say out loud to pass on an answer.
function answerSpoken(CC, q) {
  switch (q.type) {
    case 'choice': return q.options[q.answer].text;
    case 'number': return String(q.answer);
    case 'rows': return q.rows.map((row) => `${row.cells.join(',')}=${q.options[row.answer].text}`).join(';');
    case 'region': return `${q.code[0]}:${JSON.stringify(q.cells)}`;
    case 'lines': return q.hits.map((i) => q.code[i].trim()).join(';');
    case 'bug': return `${q.code[q.bugLines[0]].trim()}:${q.whyOptions[q.why]}`;
    case 'blanks': return CC.blanksKey(q).join(';');
    case 'parsons': return q.solution.map((id) => q.lines[id].text).join(';');
    default: return '';
  }
}

const body = (q) => JSON.stringify({
  prompt: q.prompt, code: q.code, rule: q.rule, rows: q.rows, lines: q.lines, order: q.order, options: q.options, bank: q.bank,
});

function compareTests(CC, lessonId, students, classes) {
  const lesson = CC.lessons[lessonId];
  const count = lesson.priority.length;
  const bySlot = {};
  lesson.priority.forEach((slot) => {
    bySlot[slot] = {
      pairs: 0, samePattern: 0, sameQuestion: 0, sameAnswer: 0,
    };
  });
  let pairs = 0;
  let shared = 0;
  let mostShared = 0;

  for (let c = 0; c < classes; c++) {
    const tests = [];
    for (let s = 0; s < students; s++) {
      const test = CC.buildTest({ lessonId, seed: `class${c}-student${s}`, count });
      const questions = {};
      test.questions.forEach((q) => { questions[q.slot] = q; });
      tests.push(questions);
    }
    for (let i = 0; i < students; i++) {
      for (let j = i + 1; j < students; j++) {
        let sameAnswers = 0;
        lesson.priority.forEach((slot) => {
          const a = tests[i][slot];
          const b = tests[j][slot];
          const row = bySlot[slot];
          row.pairs += 1;
          if (a.pattern === b.pattern) row.samePattern += 1;
          if (body(a) === body(b)) row.sameQuestion += 1;
          if (answerSpoken(CC, a) === answerSpoken(CC, b)) {
            row.sameAnswer += 1;
            sameAnswers += 1;
          }
        });
        pairs += 1;
        shared += sameAnswers;
        mostShared = Math.max(mostShared, sameAnswers);
      }
    }
  }
  return {
    bySlot, pairs, count, averageShared: shared / pairs, mostShared,
  };
}

module.exports = { compareTests };

if (require.main === module) {
  // eslint-disable-next-line global-require
  const { loadCodeCheck } = require('../tests/load');
  const CC = loadCodeCheck();
  const pct = (n, d) => `${((n / d) * 100).toFixed(2)}%`;
  const which = process.argv[2] || 'all';
  const students = Number(process.argv[3] || 30);
  const classes = Number(process.argv[4] || 50);

  if (which === 'all') {
    console.log(`${classes} simulated classes of ${students} students\n`);
    console.log('Lesson            Questions  Average shared  Most shared');
    CC.lessonOrder.forEach((id) => {
      const result = compareTests(CC, id, students, classes);
      console.log(`${id.padEnd(17)} ${String(result.count).padStart(9)}  ${result.averageShared.toFixed(3).padStart(14)}  ${String(result.mostShared).padStart(11)}`);
    });
  } else {
    const result = compareTests(CC, which, students, classes);
    console.log(`${classes} simulated classes of ${students} students (${result.pairs.toLocaleString()} student pairs)\n`);
    console.log('Question slot     Same pattern  Identical question  Identical answer');
    Object.keys(result.bySlot).forEach((slot) => {
      const row = result.bySlot[slot];
      console.log(`${slot.padEnd(17)} ${pct(row.samePattern, row.pairs).padStart(11)}  ${pct(row.sameQuestion, row.pairs).padStart(18)}  ${pct(row.sameAnswer, row.pairs).padStart(16)}`);
    });
    console.log(`\nAverage answers two students share, out of ${result.count}: ${result.averageShared.toFixed(3)}`);
    console.log(`Most answers any two students shared: ${result.mostShared}`);
  }
}
