// Generates thousands of questions and checks they are fair: the key is right, wrong
// answers lose credit, options are distinct, and code only uses what students have seen.
const test = require('node:test');
const assert = require('node:assert');
const { loadCodeCheck, makeRealRunner, auditAgainstJavaScript } = require('./load');

const CC = loadCodeCheck();
const runReal = makeRealRunner(CC);
const SEEDS_PER_PATTERN = 40;

// Everything below reuses this one batch, which is built with the audit on: every program
// and condition used to work out a key is also run as real JavaScript.
const audit = auditAgainstJavaScript(CC);
const GENERATED = [];
const realLessons = () => CC.lessonOrder.map((id) => CC.lessons[id]).filter((lesson) => !lesson.composite);
realLessons().forEach((lesson) => {
  lesson.slots.forEach((slot) => {
    slot.patterns.forEach((pattern) => {
      for (let i = 0; i < SEEDS_PER_PATTERN; i++) {
        const r = CC.makeRng(`${lesson.id}/${slot.id}/${pattern.id}/${i}`);
        GENERATED.push({
          q: { ...pattern.make(r), slot: slot.id, pattern: pattern.id },
          r,
          lesson,
          label: `${lesson.id}/${slot.id}/${pattern.id}/${i}`,
        });
      }
    });
  });
});

const each = (type, fn) => GENERATED.forEach((item) => {
  if (!type || item.q.type === type) fn(item.q, item.r, item.label, item.lesson);
});

function correctAnswer(q) {
  switch (q.type) {
    case 'choice': return q.answer;
    case 'number': return String(q.answer);
    case 'rows': return Object.fromEntries(q.rows.map((row, i) => [i, row.answer]));
    case 'region': {
      const on = [];
      q.cells.forEach((row, y) => row.forEach((v, x) => { if (v) on.push(`${y},${x}`); }));
      return on;
    }
    case 'lines': return q.hits.slice();
    case 'bug': return { line: q.bugLines[0], why: q.why };
    case 'blanks': return Object.fromEntries(q.blanks.map((b, i) => [i, b.answer]));
    case 'parsons': return q.solution.slice();
    default: throw new Error(q.type);
  }
}

function allCodeLines(q) {
  if (q.type === 'parsons') return q.prefix.concat(q.lines, q.suffix).map((l) => l.text);
  if (q.type === 'blanks') return CC.blanksDisplayLines(q, CC.blanksKey(q));
  if (q.type === 'choice' && q.codeOptions) return q.options.flatMap((o) => o.text.split('\n')).concat(q.code || []);
  return q.code || [];
}

test(`the batch ran real JavaScript alongside the interpreter (${GENERATED.length} questions)`, () => {
  assert.ok(GENERATED.length > 1000);
  assert.ok(audit.programs + audit.conditions > 1000);
});

test('every question gives full credit to its own answer key', () => {
  each(null, (q, r, label) => {
    assert.strictEqual(CC.grade(q, correctAnswer(q)).credit, 1, `Key fails for ${label}`);
  });
});

test('every question gives no credit when left blank', () => {
  each(null, (q, r, label) => {
    assert.strictEqual(CC.grade(q, undefined).credit, 0, `Blank earns credit for ${label}`);
  });
});

test('every question explains its answer and has a prompt', () => {
  each(null, (q, r, label) => {
    assert.ok(q.prompt && q.prompt.length > 5, `No prompt for ${label}`);
    assert.ok(q.explain && q.explain.length > 5, `No explanation for ${label}`);
  });
});

test('choice questions have distinct options and one answer', () => {
  each('choice', (q, r, label) => {
    const texts = q.options.map((o) => o.text);
    assert.strictEqual(new Set(texts).size, texts.length, `Duplicate options for ${label}`);
    assert.ok(q.options[q.answer], `Answer out of range for ${label}`);
    assert.ok(q.options.length >= 2, `Too few options for ${label}`);
  });
});

test('condition options each mean something different from the right answer', () => {
  each('choice', (q, r, label) => {
    if (!q.exprOptions) return;
    const names = new Set();
    const numbers = new Set();
    q.options.forEach((o) => {
      (o.text.match(/[A-Za-z_]\w*/g) || []).forEach((n) => names.add(n));
      (o.text.match(/\d+/g) || []).forEach((n) => [-1, 0, 1].forEach((d) => numbers.add(Number(n) + d)));
    });
    const values = Array.from(numbers);
    const correct = q.options[q.answer].text;
    const samples = [];
    for (let i = 0; i < 300; i++) {
      const vars = {};
      names.forEach((n) => { vars[n] = r.pick(values); });
      samples.push(vars);
    }
    q.options.forEach((o, i) => {
      if (i === q.answer) return;
      const differs = samples.some((vars) => !!CC.Mini.evalExpression(o.text, vars) !== !!CC.Mini.evalExpression(correct, vars));
      assert.ok(differs, `"${o.text}" means the same as "${correct}" for ${label}`);
    });
  });
});

test('typed number answers are whole numbers students can work out by hand', () => {
  each('number', (q, r, label) => {
    assert.ok(Number.isInteger(q.answer), `Answer ${q.answer} is not a whole number for ${label}`);
    assert.ok(Math.abs(q.answer) < 100000, `Answer ${q.answer} is unreasonably large for ${label}`);
    assert.strictEqual(CC.grade(q, ` ${q.answer} `).credit, 1, 'Spaces should not matter');
    assert.strictEqual(CC.grade(q, String(q.answer + 1)).credit, 0, 'A wrong number earned credit');
    assert.strictEqual(CC.grade(q, 'abc').credit, 0, 'Words earned credit');
    assert.strictEqual(CC.grade(q, '').credit, 0, 'An empty answer earned credit');
  });
});

test('rows have at least two different answers and no repeated rows', () => {
  each('rows', (q, r, label) => {
    assert.ok(new Set(q.rows.map((row) => row.answer)).size >= 2, `All rows match for ${label}`);
    assert.ok(q.rows.length >= 3, `Too few rows for ${label}`);
    const seen = new Set(q.rows.map((row) => row.cells.join(',')));
    assert.strictEqual(seen.size, q.rows.length, `Duplicate rows for ${label}`);
    q.rows.forEach((row) => assert.ok(q.options[row.answer], `Row answer out of range for ${label}`));
  });
});

test('canvas questions have a mix of true and false parts', () => {
  each('region', (q, r, label) => {
    const flat = q.cells.flat();
    assert.ok(flat.includes(true) && flat.includes(false), `One-sided region for ${label}`);
    assert.ok(flat.length >= 2, `Too few cells for ${label}`);
  });
});

test('half credit needs real work: tapping nothing or everything earns nothing', () => {
  each('region', (q, r, label) => {
    const every = [];
    q.cells.forEach((row, y) => row.forEach((_, x) => every.push(`${y},${x}`)));
    assert.strictEqual(CC.grade(q, []).credit, 0, `Empty region earns credit for ${label}`);
    if (every.length < 6) assert.strictEqual(CC.grade(q, every).credit, 0, `Tapping all earns credit for ${label}`);
  });
  each('lines', (q, r, label) => {
    assert.strictEqual(CC.grade(q, []).credit, 0, `Empty flow earns credit for ${label}`);
    assert.strictEqual(CC.grade(q, q.selectable).credit, 0, `Tapping all earns credit for ${label}`);
  });
});

test('flow questions match which lines real JavaScript runs', () => {
  each('lines', (q, r, label) => {
    assert.ok(q.hits.length >= 1, `Nothing runs for ${label}`);
    assert.ok(q.hits.length < q.selectable.length, `Everything runs for ${label}`);
    // Each tappable line announces itself, then real JavaScript shows which ones ran.
    const marked = q.code.map((line, i) => (q.selectable.includes(i) ? `console.log("__HIT${i}");${line}` : line)).join('\n');
    const real = runReal(marked, q.runVec, q.runKind);
    assert.strictEqual(real.error, false, `Code fails in JavaScript for ${label}\n${marked}`);
    const ran = new Set(real.logs.filter((l) => l.startsWith('__HIT')).map((l) => Number(l.slice(5))));
    assert.deepStrictEqual(Array.from(ran).sort((a, b) => a - b), Array.from(q.hits).sort((a, b) => a - b), `Wrong lines for ${label}\n${marked}`);
  });
});

test('fill-in code works, the bank is fair, and every blank matters', () => {
  each('blanks', (q, r, label) => {
    assert.ok(q.blanks.length >= 2, `Too few blanks for ${label}`);
    q.blanks.forEach((b) => assert.ok(q.bank.includes(b.answer), `Answer missing from bank for ${label}`));
    assert.ok(q.bank.length > new Set(q.blanks.map((b) => b.answer)).size, `No wrong options in bank for ${label}`);
    assert.strictEqual(new Set(q.bank).size, q.bank.length, `Duplicate bank entries for ${label}`);

    const key = CC.blanksKey(q);
    const canonical = CC.blanksCode(q, key);
    q.spec.vectors.forEach((vec) => {
      assert.strictEqual(CC.runCode(canonical, vec, q.spec.kind).error, null, `Key errors for ${label}\n${canonical}`);
    });
    const asTokens = Object.fromEntries(key.map((t, i) => [i, t]));
    q.blanks.forEach((blank, i) => {
      const matters = q.bank.some((token) => token !== blank.answer && CC.grade(q, { ...asTokens, [i]: token }).credit < 1);
      assert.ok(matters, `Blank ${i} (${blank.answer}) doesn't matter for ${label}\n${canonical}`);
    });
  });
});

test('scrambled code starts out wrong and far from the answer', () => {
  each('parsons', (q, r, label) => {
    q.lines.forEach((l) => assert.strictEqual(l.text, l.text.trim(), `Indentation gives away the answer for ${label}`));
    assert.ok(q.lines.length >= 5 && q.lines.length <= 12, `Odd line count ${q.lines.length} for ${label}`);
    assert.strictEqual(CC.grade(q, q.order).credit, 0, `Scramble earns credit for ${label}`);
    assert.deepStrictEqual(Array.from(q.order).sort((a, b) => a - b), Array.from(q.solution), `Lost lines for ${label}`);
  });
});

test('scrambled answers: the solution runs, and moving one line earns half or full credit', () => {
  each('parsons', (q, r, label) => {
    const canonical = CC.parsonsCode(q, q.solution);
    q.spec.vectors.forEach((vec) => {
      assert.strictEqual(CC.runCode(canonical, vec, q.spec.kind).error, null, `Solution fails for ${label}\n${canonical}`);
    });
    const order = q.solution.slice();
    const moved = order.splice(r.int(0, order.length - 1), 1)[0];
    order.splice(r.int(0, order.length), 0, moved);
    const credit = CC.grade(q, order).credit;
    assert.ok(credit === 1 || credit === 0.5, `One move earned ${credit} for ${label}`);
  });
});

test('test inputs reach every message and color in scrambled and fill-in code', () => {
  GENERATED.forEach(({ q, label }) => {
    if (q.type !== 'parsons' && q.type !== 'blanks') return;
    const code = q.type === 'parsons' ? CC.parsonsCode(q, q.solution) : CC.blanksCode(q, CC.blanksKey(q));
    const everything = q.spec.vectors.map((vec) => JSON.stringify(CC.runCode(code, vec, q.spec.kind))).join(' ');
    (code.match(/console\.log\("[^"]+"\)/g) || []).forEach((call) => {
      const message = call.slice(13, -2);
      assert.ok(everything.includes(message), `"${message}" can never print for ${label}\n${code}`);
    });
    (code.match(/= color\([^)]*\) \/\//g) || []).forEach((call) => {
      const rgb = `rgb(${call.slice(8, -4).replace(/\s/g, '')})`;
      assert.ok(everything.includes(rgb), `${rgb} is never used for ${label}\n${code}`);
    });
  });
});

test('the interpreter agrees with JavaScript on scrambled arrangements too', () => {
  each('parsons', (q, r) => {
    const vec = r.pick(q.spec.vectors);
    for (let i = 0; i < 3; i++) {
      // The audit compares both, and fails if they disagree.
      CC.runCode(CC.parsonsCode(q, i === 0 ? q.order : r.shuffle(q.solution)), vec, q.spec.kind);
    }
  });
});

test('bugs are real: the buggy code misbehaves and the fixed code works', () => {
  each('bug', (q, r, label) => {
    q.spec.vectors.forEach((vec) => {
      const result = CC.runCode(q.fixedRun, vec, q.spec.kind);
      assert.strictEqual(result.error, null, `Fixed code fails (${result.error}) for ${label}\n${q.fixedRun}`);
    });
    assert.ok(!CC.sameBehavior(q.spec, q.fixedRun, q.buggyRun), `Buggy code behaves correctly for ${label}\n${q.buggyRun}`);
    q.bugLines.forEach((i) => {
      assert.ok(q.selectable.includes(i), `Bug line ${i} cannot be tapped for ${label}\n${q.code.join('\n')}`);
    });
    assert.ok(q.whyOptions[q.why], `Reason out of range for ${label}`);
    assert.strictEqual(new Set(q.whyOptions).size, q.whyOptions.length, `Duplicate reasons for ${label}`);
    assert.ok(q.whyOptions.length >= 3, `Too few reasons for ${label}`);
  });
});

test('code follows the course style and only uses what students have been taught', () => {
  const always = [
    [/===|!==/, 'strict equality'],
    [/;\s*$/, 'semicolons'],
    [/\bvar\b/, 'var'],
    [/\) \{/, 'a space before { (the course writes "){")'],
  ];
  each(null, (q, r, label, lesson) => {
    const banned = always.concat(lesson.notYetTaught || []);
    allCodeLines(q).forEach((line) => {
      banned.forEach(([pattern, name]) => {
        assert.ok(!pattern.test(line), `${name} in "${line}" for ${label}`);
      });
      assert.ok(!(line.includes('&&') && line.includes('||')), `Mixes && and || in "${line}" for ${label}`);
    });
  });
});

test('every lesson is set up correctly', () => {
  CC.lessonOrder.forEach((id) => {
    const lesson = CC.lessons[id];
    assert.ok(lesson.title, `${id} has no title`);
    ['minutes', 'questions', 'attempts'].forEach((key) => {
      assert.ok(lesson.defaults[key] > 0, `${id} has no default ${key}`);
    });
    const covered = new Set(lesson.slots.map((s) => s.skill));
    ['concepts', 'flow', 'build'].forEach((skill) => assert.ok(covered.has(skill), `${id} never tests ${skill}`));
    lesson.slots.forEach((slot) => {
      assert.ok(slot.patterns.length >= 3, `${id}/${slot.id} has only ${slot.patterns.length} patterns`);
      assert.ok(slot.concept && slot.concept.length > 5, `${id}/${slot.id} has no concept label`);
      assert.ok(lesson.priority.includes(slot.id), `${id} priority is missing ${slot.id}`);
    });
  });
});

test('tests build at any length, repeat slots with new patterns, and rebuild from a seed', () => {
  CC.lessonOrder.forEach((lessonId) => {
    [1, 5, 8, 12, 15].forEach((count) => {
      const t = CC.buildTest({ lessonId, seed: `count-${count}`, count });
      assert.strictEqual(t.questions.length, count);
      assert.strictEqual(new Set(t.questions.map((q) => q.uid)).size, count);
      const again = CC.buildTest({ lessonId, seed: `count-${count}`, count });
      assert.strictEqual(JSON.stringify(again), JSON.stringify(t), `${lessonId} did not rebuild the same from its seed`);
    });
  });
});

test('questions are shuffled across skills, so neighbors rarely match by position', () => {
  CC.lessonOrder.forEach((lessonId) => {
    const students = [];
    for (let s = 0; s < 200; s++) students.push(CC.buildTest({ lessonId, seed: `order-${s}` }).questions);
    const firstSkills = new Set(students.map((questions) => questions[0].skill));
    assert.strictEqual(firstSkills.size, 3, `${lessonId} does not start on every skill`);
    let matches = 0;
    for (let s = 0; s + 1 < students.length; s++) {
      students[s].forEach((q, i) => { if (q.uid === students[s + 1][i].uid) matches += 1; });
    }
    const average = matches / (students.length - 1);
    assert.ok(average < 1.5, `${lessonId} neighbors match on ${average} positions`);
  });
});

test('scoring adds up and lists missed concepts', () => {
  CC.lessonOrder.forEach((lessonId) => {
    const t = CC.buildTest({ lessonId, seed: 'score-check', count: 12 });
    const all = {};
    t.questions.forEach((q) => { all[q.uid] = correctAnswer(q); });
    const perfect = CC.scoreTest(t, all);
    assert.strictEqual(perfect.points, 12);
    assert.strictEqual(perfect.percent, 100);
    assert.deepStrictEqual(Array.from(perfect.missed), []);

    const empty = CC.scoreTest(t, {});
    assert.strictEqual(empty.points, 0);

    const detail = CC.detailRecords(t, {}, empty);
    assert.strictEqual(detail.length, 12);
    detail.forEach((d) => assert.ok(typeof d.key === 'string' && d.key.length > 0));
    const full = CC.detailRecords(t, all, perfect);
    assert.ok(JSON.stringify(full).length < 45000, 'Detail must fit in one spreadsheet cell');
  });
});
