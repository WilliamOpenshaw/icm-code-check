// U2LA5.1: Key Presses && Nested Conditionals
// curriculum/02-unit-2/14-U2LA5.1-Key-Presses-and-Nested-Conditionals.md
//
// Students at this point have seen: everything through U2LA4.2, plus keyIsPressed, key, nesting
// a specific key check inside a keyIsPressed check, += and -=, and using && to keep a value
// from getting too big or too small.
// They have NOT seen: loops or arrays. keyCode and keyPressed() are optional extras, so they
// are left out here.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const { tok, log, numberedRules, WHY } = kit;

  const LETTERS = ['b', 's', 'r', 'g', 'c', 'x', 'p', 'w'];
  const OBJECT_NAMES = ['theCircle', 'myCircle', 'dot'];
  const report = (expr) => `function __report(){\n  console.log(${expr})\n}`;
  const q = (letter) => `'${letter}'`;
  const down = (letter) => ({ keyIsPressed: true, key: letter });
  // key keeps holding the last letter after it is let go, as p5's key variable does.
  const up = { keyIsPressed: false };
  const repeat = (frame, n) => Array.from({ length: n }, () => frame);
  const framesWord = (n) => `${n} frame${n === 1 ? '' : 's'}`;

  // ---- Which key does what ----

  function keyRows(r, {
    code, varName, colors, cases, explain,
  }) {
    const program = `let ${varName}\n${code.join('\n')}\nconsole.log(${varName})`;
    const keys = colors.map(kit.colorKey);
    return kit.rowsQuestion({
      prompt: `Pick the color ${varName} ends up with in each case.`,
      code,
      columns: ['keyIsPressed', 'key'],
      rows: r.shuffle(cases).map(([pressed, letter]) => ({
        cells: [String(pressed), q(letter)],
        answer: keys.indexOf(kit.printed(program, { keyIsPressed: pressed, key: letter })[0]),
      })),
      options: colors.map((c) => ({ text: c.name, swatch: kit.colorCss(c) })),
      explain,
    });
  }

  const keysSlot = {
    id: 'keyRows',
    skill: 'flow',
    concept: 'Predicting what nested key checks do',
    patterns: [
      {
        id: 'two-keys-and-nothing-pressed',
        make(r) {
          const [a, b, other] = r.sample(LETTERS, 3);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          return keyRows(r, {
            code: ['if(keyIsPressed){', `  if(key == ${q(a)}){`, `    ${kit.setColor(V, colors[0])}`, '  }', `  else if(key == ${q(b)}){`, `    ${kit.setColor(V, colors[1])}`, '  }', '}', 'else{', `  ${kit.setColor(V, colors[2])}`, '}'],
            varName: V,
            colors,
            cases: [[true, a], [true, b], [false, a], [false, other]],
            explain: 'The inner checks only run when keyIsPressed is true. key still holds the last letter after it is let go, so the outer check matters.',
          });
        },
      },
      {
        id: 'any-other-key',
        make(r) {
          const [a, other] = r.sample(LETTERS, 2);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          return keyRows(r, {
            code: ['if(keyIsPressed){', `  if(key == ${q(a)}){`, `    ${kit.setColor(V, colors[0])}`, '  }', '  else{', `    ${kit.setColor(V, colors[1])}`, '  }', '}', 'else{', `  ${kit.setColor(V, colors[2])}`, '}'],
            varName: V,
            colors,
            cases: [[true, a], [true, other], [false, a]],
            explain: 'There are two different elses. The inner else is for any other key. The outer else is for no key at all.',
          });
        },
      },
      {
        id: 'capital-letters-count',
        make(r) {
          const [a, b] = r.sample(LETTERS, 2);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          return keyRows(r, {
            code: ['if(keyIsPressed){', `  if(key == ${q(a)}){`, `    ${kit.setColor(V, colors[0])}`, '  }', `  else if(key == ${q(b.toUpperCase())}){`, `    ${kit.setColor(V, colors[1])}`, '  }', '  else{', `    ${kit.setColor(V, colors[2])}`, '  }', '}'],
            varName: V,
            colors,
            cases: [[true, a], [true, a.toUpperCase()], [true, b.toUpperCase()], [true, b]],
            explain: `Capital letters count, so ${q(a)} and ${q(a.toUpperCase())} are different keys.`,
          });
        },
      },
      {
        id: 'and-instead-of-nesting',
        make(r) {
          const [a, b] = r.sample(LETTERS, 2);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          return keyRows(r, {
            code: kit.chainLines(
              [{ cond: `keyIsPressed && key == ${q(a)}`, body: kit.setColor(V, colors[0]) },
                { cond: `keyIsPressed && key == ${q(b)}`, body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            cases: [[true, a], [true, b], [false, a], [false, b]],
            explain: 'With &&, both have to be true. A letter only counts while a key is being pressed.',
          });
        },
      },
    ],
  };

  // ---- Growing and shrinking ----

  function sizeCode(name, start, grow, shrink, a, b, withParent = true) {
    const inner = [`if(key == ${q(a)}){`, `  ${name}.size += ${grow}`, '}', `else if(key == ${q(b)}){`, `  ${name}.size -= ${shrink}`, '}'];
    const body = withParent
      ? ['  if(keyIsPressed){'].concat(inner.map((l) => `    ${l}`), ['  }'])
      : inner.map((l) => `  ${l}`);
    return [`let ${name} = {`, `  size: ${start}`, '}', '', 'function draw(){'].concat(body, ['}']);
  }

  const sizeSlot = {
    id: 'sizeTrace',
    skill: 'flow',
    concept: 'Working out a value that changes while keys are held',
    patterns: [
      {
        id: 'hold-one-key',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b] = r.sample(LETTERS, 2);
          const start = 10 * r.int(2, 10);
          const grow = 5 * r.int(1, 3);
          const shrink = 5 * r.int(1, 3);
          const n = r.int(2, 5);
          const code = sizeCode(name, start, grow, shrink, a, b);
          return kit.printedNumber({
            prompt: `The ${a} key is held down for ${framesWord(n)}. What does ${name}.size hold now?`,
            code,
            run: `${code.join('\n')}\n${report(`${name}.size`)}`,
            vec: { frames: repeat(down(a), n) },
            kind: 'sketch',
            explain: `draw() runs once per frame, so += ${grow} happens ${n} times.`,
          });
        },
      },
      {
        id: 'hold-one-then-the-other',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b] = r.sample(LETTERS, 2);
          const start = 10 * r.int(5, 12);
          const grow = 5 * r.int(1, 3);
          const shrink = 5 * r.int(1, 3);
          const n = r.int(2, 4);
          const m = r.int(1, 3);
          const code = sizeCode(name, start, grow, shrink, a, b);
          return kit.printedNumber({
            prompt: `The ${a} key is held down for ${framesWord(n)}, and then the ${b} key is held down for ${framesWord(m)}. What does ${name}.size hold now?`,
            code,
            run: `${code.join('\n')}\n${report(`${name}.size`)}`,
            vec: { frames: repeat(down(a), n).concat(repeat(down(b), m)) },
            kind: 'sketch',
            explain: `Start at ${start}. Add ${grow} on each of ${framesWord(n)}, then subtract ${shrink} on each of ${framesWord(m)}.`,
          });
        },
      },
      {
        id: 'let-go-for-a-while',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b] = r.sample(LETTERS, 2);
          const start = 10 * r.int(2, 10);
          const grow = 5 * r.int(1, 3);
          const n = r.int(2, 4);
          const rest = r.int(2, 4);
          const code = sizeCode(name, start, grow, 5, a, b);
          return kit.printedNumber({
            prompt: `The ${a} key is held down for ${framesWord(n)}, and then no keys are pressed for ${framesWord(rest)}. What does ${name}.size hold now?`,
            code,
            run: `${code.join('\n')}\n${report(`${name}.size`)}`,
            vec: { frames: repeat(down(a), n).concat(repeat(up, rest)) },
            kind: 'sketch',
            explain: 'keyIsPressed is false once the key is let go, so nothing inside the outer if runs anymore.',
          });
        },
      },
      {
        id: 'stopped-by-a-limit',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a] = r.sample(LETTERS, 1);
          const limit = 10 * r.int(10, 20);
          const grow = 10;
          const start = limit - grow * r.int(1, 2);
          const n = r.int(4, 6);
          const code = [`let ${name} = {`, `  size: ${start}`, '}', '', 'function draw(){', '  if(keyIsPressed){', `    if(key == ${q(a)} && ${name}.size < ${limit}){`, `      ${name}.size += ${grow}`, '    }', '  }', '}'];
          return kit.printedNumber({
            prompt: `The ${a} key is held down for ${framesWord(n)}. What does ${name}.size hold now?`,
            code,
            run: `${code.join('\n')}\n${report(`${name}.size`)}`,
            vec: { frames: repeat(down(a), n) },
            kind: 'sketch',
            explain: `Once ${name}.size reaches ${limit}, the && is false, so it stops growing.`,
          });
        },
      },
    ],
  };

  const parentSlot = {
    id: 'whyTheOuterIf',
    skill: 'flow',
    concept: 'Seeing why key checks go inside keyIsPressed',
    patterns: [
      {
        id: 'no-outer-if-keeps-going',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b] = r.sample(LETTERS, 2);
          const start = 10 * r.int(2, 8);
          const grow = 5 * r.int(1, 3);
          const n = r.int(1, 3);
          const rest = r.int(2, 4);
          const code = sizeCode(name, start, grow, 5, a, b, false);
          return kit.printedNumber({
            prompt: `The ${a} key is held down for ${framesWord(n)}, and then no keys are pressed for ${framesWord(rest)}. What does ${name}.size hold now?`,
            code,
            run: `${code.join('\n')}\n${report(`${name}.size`)}`,
            vec: { frames: repeat(down(a), n).concat(repeat(up, rest)) },
            kind: 'sketch',
            explain: `key keeps the last letter pressed, even after it is let go. With no keyIsPressed check, the size grows on all ${n + rest} frames.`,
          });
        },
      },
      {
        id: 'with-the-outer-if',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b] = r.sample(LETTERS, 2);
          const start = 10 * r.int(2, 8);
          const grow = 5 * r.int(1, 3);
          const n = r.int(1, 3);
          const rest = r.int(2, 4);
          const code = sizeCode(name, start, grow, 5, a, b, true);
          return kit.printedNumber({
            prompt: `The ${a} key is held down for ${framesWord(n)}, and then no keys are pressed for ${framesWord(rest)}. What does ${name}.size hold now?`,
            code,
            run: `${code.join('\n')}\n${report(`${name}.size`)}`,
            vec: { frames: repeat(down(a), n).concat(repeat(up, rest)) },
            kind: 'sketch',
            explain: 'The outer if only lets the inner code run while a key is down.',
          });
        },
      },
      {
        id: 'what-key-holds',
        make(r) {
          const [a, b] = r.sample(LETTERS, 2);
          return kit.traceChoice(r, {
            prompt: `The ${a} key is pressed and let go, and then the ${b} key is pressed and let go. No key is down now. What does this line print?`,
            code: ['console.log(key, keyIsPressed)'],
            vec: { frames: [down(a), up, down(b), up] },
            kind: 'sketch',
            run: `let last\nfunction draw(){\n  last = key + " " + keyIsPressed\n}\n${report('last')}`,
            wrong: [[`${a} false`], [`${b} false`], [`${b} true`], ['false']],
            explain: 'key holds the most recently pressed key, even after it is let go. keyIsPressed says whether a key is down right now.',
          });
        },
      },
    ],
  };

  const conceptSlot = {
    id: 'whyNest',
    skill: 'concepts',
    concept: 'Explaining nested conditionals and limits',
    patterns: [
      {
        id: 'means-the-same',
        make(r) {
          const a = r.pick(LETTERS);
          const name = r.pick(OBJECT_NAMES);
          const grow = 5 * r.int(1, 3);
          return kit.choiceQuestion(r, {
            prompt: 'Which condition could replace these two nested ifs and work the same way?',
            code: ['if(keyIsPressed){', `  if(key == ${q(a)}){`, `    ${name}.size += ${grow}`, '  }', '}'],
            correct: `if(keyIsPressed && key == ${q(a)}){`,
            wrong: [`if(keyIsPressed || key == ${q(a)}){`, `if(key == ${q(a)}){`, 'if(keyIsPressed){'],
            codeOptions: true,
            explain: 'Nested ifs and && both need the two things to be true.',
          });
        },
      },
      {
        id: 'why-one-outer-if',
        make(r) {
          const [a, b, c] = r.sample(LETTERS, 3);
          return kit.choiceQuestion(r, {
            prompt: `A program checks the ${a}, ${b}, and ${c} keys. Why put all those checks inside one if(keyIsPressed)?`,
            code: ['if(keyIsPressed){', `  if(key == ${q(a)}){`, '  }', `  else if(key == ${q(b)}){`, '  }', `  else if(key == ${q(c)}){`, '  }', '}'],
            correct: 'keyIsPressed only has to be written once, and no letter does anything unless a key is down',
            wrong: ['It makes the program check each letter more than once', 'key only works inside an if statement', 'It lets two different keys count as pressed on the same frame'],
            explain: 'Writing keyIsPressed in every if gets messy. One parent conditional keeps it clean.',
          });
        },
      },
      {
        id: 'what-the-limit-does',
        make(r) {
          const a = r.pick(LETTERS);
          const name = r.pick(OBJECT_NAMES);
          const grow = 5 * r.int(1, 3);
          return kit.choiceQuestion(r, {
            prompt: `What does the part after && do in this code?`,
            code: ['if(keyIsPressed){', `  if(key == ${q(a)} && ${name}.size < width){`, `    ${name}.size += ${grow}`, '  }', '}'],
            correct: 'It stops the circle from growing once its size reaches the width of the canvas',
            wrong: ['It makes the circle grow faster when it is small', 'It only lets the circle grow when the mouse is on the canvas', 'It sets the size of the circle to the width of the canvas'],
            explain: 'Once the size is no longer less than the width, the && is false and the code inside stops running.',
          });
        },
      },
      {
        id: 'which-limit-for-shrinking',
        make(r) {
          const a = r.pick(LETTERS);
          const name = r.pick(OBJECT_NAMES);
          const shrink = 5 * r.int(1, 3);
          return kit.choiceQuestion(r, {
            prompt: `Holding ${a} should shrink the circle, but its size should never go below 0. Which condition goes in the blank?`,
            code: ['if(keyIsPressed){', '  if(____){', `    ${name}.size -= ${shrink}`, '  }', '}'],
            correct: `key == ${q(a)} && ${name}.size > 0`,
            wrong: [`key == ${q(a)} && ${name}.size < 0`, `key == ${q(a)} || ${name}.size > 0`, `${name}.size > 0`],
            codeOptions: true,
            explain: 'It should only shrink while the key is the right one and the size is still above 0.',
          });
        },
      },
    ],
  };

  const flowSlot = {
    id: 'lines',
    skill: 'flow',
    concept: 'Seeing which lines run for a key press',
    patterns: [
      {
        id: 'nested-with-a-key-down',
        make(r) {
          const [a, b, other] = r.sample(LETTERS, 3);
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          const pressed = r.pick([a, b, other]);
          return kit.buildFlow(r, () => ['function draw(){', '  if(keyIsPressed){', `    if(key == ${q(a)}){`, `      ${log(m1)}`, '    }', `    else if(key == ${q(b)}){`, `      ${log(m2)}`, '    }', `    ${log(m3)}`, '  }', `  ${log('Done')}`, '}'],
            'The inner chain picks at most one branch. The line after it is still inside the outer if.', {
              prompt: `The ${pressed} key is being held down. Tap every highlighted line that runs on this frame.`,
              vec: { frames: [down(pressed)] },
              kind: 'sketch',
            });
        },
      },
      {
        id: 'nothing-pressed',
        make(r) {
          const a = r.pick(LETTERS);
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          return kit.buildFlow(r, () => ['function draw(){', '  if(keyIsPressed){', `    if(key == ${q(a)}){`, `      ${log(m1)}`, '    }', `    ${log(m2)}`, '  }', '  else{', `    ${log(m3)}`, '  }', '}'],
            'Nothing inside the outer if runs when no key is down, so only the outer else runs.', {
              prompt: `The ${a} key was pressed a moment ago, and it has been let go. Tap every highlighted line that runs on this frame.`,
              vec: { key: a, frames: [{}] },
              kind: 'sketch',
              minHits: 1,
            });
        },
      },
      {
        id: 'two-separate-checks',
        make(r) {
          const [a, b] = r.sample(LETTERS, 2);
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          const pressed = r.pick([a, b]);
          return kit.buildFlow(r, () => ['function draw(){', `  if(keyIsPressed && key == ${q(a)}){`, `    ${log(m1)}`, '  }', `  if(keyIsPressed && key == ${q(b)}){`, `    ${log(m2)}`, '  }', '  else{', `    ${log(m3)}`, '  }', '}'],
            'These are two separate ifs. The else belongs only to the second one.', {
              prompt: `The ${pressed} key is being held down. Tap every highlighted line that runs on this frame.`,
              vec: { frames: [down(pressed)] },
              kind: 'sketch',
              minHits: 1,
            });
        },
      },
    ],
  };

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const WRONG_LIMIT = 'This limit points the wrong way, so the code inside can never run.';
  const WRONG_CASE = 'Capital letters count, so this checks for a different key than the rule says.';
  const REASONS = [WHY.quotes, WHY.assign, WHY.notAFunction, WHY.missingAssign, WRONG_LIMIT, WRONG_CASE];
  const others = (r, why) => r.sample(REASONS.filter((reason) => reason !== why), 3);

  function bugSketch(r, {
    prompt, name, start, code, fixed, line, why, frames, explain,
  }) {
    const head = [`let ${name} = {`, `  size: ${start}`, '}', 'function draw(){'];
    const tail = ['}'];
    return kit.bugQuestion(r, {
      prompt: `${prompt} ${FIND_BUG}`,
      code: head.concat(code, tail),
      bugLines: [line + head.length],
      why,
      others: others(r, why),
      fixed: head.concat(fixed, tail),
      spec: {
        kind: 'sketch',
        hiddenSuffix: [report(`${name}.size`)],
        vectors: [{ frames }],
      },
      explain,
    });
  }

  const nested = (cond, body) => ['  if(keyIsPressed){', `    if(${cond}){`, `      ${body}`, '    }', '  }'];

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in key press code',
    patterns: [
      {
        id: 'letter-without-quotes',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const a = r.pick(LETTERS);
          const grow = 5 * r.int(1, 3);
          const body = `${name}.size += ${grow}`;
          return bugSketch(r, {
            prompt: `The circle should grow while the ${a} key is held down.`,
            name,
            start: 100,
            code: nested(`key == ${a}`, body),
            fixed: nested(`key == ${q(a)}`, body),
            line: 1,
            why: WHY.quotes,
            frames: [down(a), down(a)],
            explain: `It should be key == ${q(a)}, since key holds a string.`,
          });
        },
      },
      {
        id: 'single-equals',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, other] = r.sample(LETTERS, 2);
          const grow = 5 * r.int(1, 3);
          const body = `${name}.size += ${grow}`;
          return bugSketch(r, {
            prompt: `The circle should grow only while the ${a} key is held down, but every key makes it grow.`,
            name,
            start: 100,
            code: nested(`key = ${q(a)}`, body),
            fixed: nested(`key == ${q(a)}`, body),
            line: 1,
            why: WHY.assign,
            frames: [down(other), down(a)],
            explain: `It should be key == ${q(a)}. A single = changes key instead of checking it.`,
          });
        },
      },
      {
        id: 'parentheses-on-the-variable',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const a = r.pick(LETTERS);
          const grow = 5 * r.int(1, 3);
          const inner = [`    if(key == ${q(a)}){`, `      ${name}.size += ${grow}`, '    }', '  }'];
          return bugSketch(r, {
            prompt: `The circle should grow while the ${a} key is held down.`,
            name,
            start: 100,
            code: ['  if(keyIsPressed()){'].concat(inner),
            fixed: ['  if(keyIsPressed){'].concat(inner),
            line: 0,
            why: WHY.notAFunction,
            frames: [down(a), down(a)],
            explain: 'keyIsPressed is a variable, so it has no parentheses.',
          });
        },
      },
      {
        id: 'value-never-stored',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const a = r.pick(LETTERS);
          const grow = 5 * r.int(1, 3);
          return bugSketch(r, {
            prompt: `The circle should grow while the ${a} key is held down, but its size never changes.`,
            name,
            start: 100,
            code: nested(`key == ${q(a)}`, `${name}.size + ${grow}`),
            fixed: nested(`key == ${q(a)}`, `${name}.size += ${grow}`),
            line: 2,
            why: WHY.missingAssign,
            frames: [down(a), down(a)],
            explain: `It should be ${name}.size += ${grow}, or ${name}.size = ${name}.size + ${grow}.`,
          });
        },
      },
      {
        id: 'limit-backwards',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const a = r.pick(LETTERS);
          const grow = 5 * r.int(1, 3);
          const body = `${name}.size += ${grow}`;
          const limit = 10 * r.int(30, 50);
          return bugSketch(r, {
            prompt: `The circle should grow while the ${a} key is held down, until its size reaches ${limit}. It never grows at all.`,
            name,
            start: 100,
            code: nested(`key == ${q(a)} && ${name}.size > ${limit}`, body),
            fixed: nested(`key == ${q(a)} && ${name}.size < ${limit}`, body),
            line: 1,
            why: WRONG_LIMIT,
            frames: [down(a), down(a)],
            explain: `It should keep growing while the size is less than ${limit}: ${name}.size < ${limit}`,
          });
        },
      },
      {
        id: 'wrong-capital',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const a = r.pick(LETTERS);
          const grow = 5 * r.int(1, 3);
          const body = `${name}.size += ${grow}`;
          return bugSketch(r, {
            prompt: `The circle should grow while the lowercase ${a} key is held down, but nothing happens.`,
            name,
            start: 100,
            code: nested(`key == ${q(a.toUpperCase())}`, body),
            fixed: nested(`key == ${q(a)}`, body),
            line: 1,
            why: WRONG_CASE,
            frames: [down(a), down(a)],
            explain: `It should be key == ${q(a)}.`,
          });
        },
      },
    ],
  };

  const keyVectors = (a, b, other) => [
    { frames: repeat(down(a), 2) },
    { frames: repeat(down(b), 2) },
    { frames: repeat(down(other), 2) },
    { frames: [down(a), up, up] },
  ];

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing nested key press code',
    patterns: [
      {
        id: 'grow-and-shrink',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b, other] = r.sample(LETTERS, 3);
          const grow = 5 * r.int(1, 3);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so the circle grows by ${grow} while ${a} is held down, and shrinks by ${grow} while ${b} is held down.`,
            lines: [
              [`let ${name} = {`],
              ['  size: 100'],
              ['}'],
              ['function draw(){'],
              ['  if(', tok('keyIsPressed', 'var'), '){'],
              ['    if(key == ', tok(q(a), 'letter'), '){'],
              [`      ${name}.size `, tok('+=', 'change'), ` ${grow}`],
              ['    }'],
              ['    ', tok('else if', 'kw'), '(key == ', tok(q(b), 'letter'), '){'],
              [`      ${name}.size `, tok('-=', 'change'), ` ${grow}`],
              ['    }'],
              ['  }'],
              ['}'],
            ],
            must: ['var', 'change'],
            count: 4,
            pools: {
              var: ['mouseIsPressed', 'key'], letter: [q(other), a, b], change: ['=', '=='], kw: ['if', 'else'],
            },
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(`${name}.size`)],
              vectors: keyVectors(a, b, other),
            },
            explain: 'keyIsPressed checks whether any key is down, and key says which one. += adds to the value and -= subtracts from it.',
          });
        },
      },
      {
        id: 'color-by-key',
        make(r) {
          const [a, b, other] = r.sample(LETTERS, 3);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${V} is ${c1.name} while ${a} is held down, and ${c2.name} while ${b} is held down.`,
            lines: [
              ['if(', tok('keyIsPressed', 'var'), '){'],
              ['  if(', tok('key', 'var'), ' == ', tok(q(a), 'letter'), '){'],
              [`    ${kit.setColor(V, c1)}`],
              ['  }'],
              ['  ', tok('else if', 'kw'), '(key == ', tok(q(b), 'letter'), '){'],
              [`    ${kit.setColor(V, c2)}`],
              ['  }'],
              ['}'],
            ],
            must: ['letter', 'var'],
            count: 4,
            pools: { var: ['mouseIsPressed', 'mouseX'], letter: [q(other), a], kw: ['if', 'else'] },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V} = "none"`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: [
                { keyIsPressed: true, key: a },
                { keyIsPressed: true, key: b },
                { keyIsPressed: true, key: other },
                { keyIsPressed: false, key: a },
              ],
            },
            explain: 'Letters are strings, so they need quotation marks. The inner checks go inside the keyIsPressed check.',
          });
        },
      },
      {
        id: 'with-a-limit',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, other] = r.sample(LETTERS, 2);
          const limit = 110 + 10 * r.int(0, 3);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so holding ${a} adds 10 to the size, but only while the size is less than ${limit}.`,
            lines: [
              [`let ${name} = {`],
              ['  size: 100'],
              ['}'],
              ['function draw(){'],
              ['  if(keyIsPressed){'],
              ['    if(key == ', tok(q(a), 'letter'), ' ', tok('&&', 'conn'), ` ${name}.size `, tok('<', 'op'), ' ', tok(limit, 'num'), '){'],
              [`      ${name}.size `, tok('+=', 'change'), ' 10'],
              ['    }'],
              ['  }'],
              ['}'],
            ],
            must: ['conn', 'op'],
            count: 3,
            pools: {
              conn: ['||'], op: ['>', '=='], num: [limit + 50, limit - 50], letter: [q(other), a], change: ['=', '=='],
            },
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(`${name}.size`)],
              vectors: [{ frames: repeat(down(a), 8) }, { frames: repeat(down(other), 3) }, { frames: [down(a)] }],
            },
            explain: 'Both things must be true to grow, so it uses &&. It grows while the size is less than the limit.',
          });
        },
      },
      {
        id: 'and-instead-of-nesting',
        make(r) {
          const [a, other] = r.sample(LETTERS, 2);
          const [m1, m2] = kit.pickScene(r).outcomes;
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints "${m1}" only while the ${a} key is held down, and "${m2}" otherwise.`,
            lines: [
              ['if(', tok('keyIsPressed', 'var'), ' ', tok('&&', 'conn'), ' key == ', tok(q(a), 'letter'), '){'],
              [`  ${log(m1)}`],
              ['}'],
              [tok('else', 'kw'), '{'],
              [`  ${log(m2)}`],
              ['}'],
            ],
            must: ['conn', 'var'],
            count: 3,
            pools: {
              var: ['mouseIsPressed', 'mouseX'], conn: ['||'], letter: [q(other), a], kw: ['if', 'else if'],
            },
            spec: {
              kind: 'snippet',
              vectors: [
                { keyIsPressed: true, key: a },
                { keyIsPressed: true, key: other },
                { keyIsPressed: false, key: a },
                { keyIsPressed: false, key: other },
              ],
            },
            explain: 'Both must be true, so it uses &&. key still holds a letter after it is let go, so keyIsPressed matters.',
          });
        },
      },
    ],
  };

  const scramble = (rules) => `Put these lines in order so the code does this:\n${numberedRules(rules)}`;

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting nested key press code in order',
    patterns: [
      {
        id: 'grow-and-shrink',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b, other] = r.sample(LETTERS, 3);
          const grow = 5 * r.int(1, 3);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `While a key is down, check which key it is.`,
              `If it is ${a}, add ${grow} to ${name}.size.`,
              `Otherwise, if it is ${b}, subtract ${grow} from ${name}.size.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: ['if(keyIsPressed){', `if(key == ${q(a)}){`, `${name}.size += ${grow}`, '}', `else if(key == ${q(b)}){`, `${name}.size -= ${grow}`, '}', '}'],
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${name} = {`, '  size: 100', '}'],
              hiddenSuffix: [report(`${name}.size`)],
              vectors: keyVectors(a, b, other),
            },
            explain: 'The checks for each letter go inside the keyIsPressed check, so nothing happens unless a key is down.',
          });
        },
      },
      {
        id: 'draw-after-the-change',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, b, other] = r.sample(LETTERS, 3);
          const grow = 5 * r.int(1, 3);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              'Paint a gray background on every frame.',
              `While ${a} is held down, add ${grow} to ${name}.size.`,
              `Draw a circle at (200, 200) that is ${name}.size wide and tall, on top of the background.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: ['background(220)', 'if(keyIsPressed){', `if(key == ${q(a)}){`, `${name}.size += ${grow}`, '}', '}', `ellipse(200, 200, ${name}.size, ${name}.size)`],
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${name} = {`, '  size: 100', '}'],
              vectors: [{ frames: repeat(down(a), 2) }, { frames: repeat(down(b), 2) }, { frames: repeat(down(other), 2) }],
            },
            explain: 'background() comes first, or it covers the circle. Both ifs close before the circle gets drawn.',
          });
        },
      },
      {
        id: 'limit-on-growing',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const [a, other] = r.sample(LETTERS, 2);
          const limit = 110 + 10 * r.int(0, 3);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              'Only do anything while a key is down.',
              `If the key is ${a} and ${name}.size is less than ${limit}, add 10 to ${name}.size.`,
              `Otherwise, if the key is ${other}, set ${name}.size back to 100.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: ['if(keyIsPressed){', `if(key == ${q(a)} && ${name}.size < ${limit}){`, `${name}.size += 10`, '}', `else if(key == ${q(other)}){`, `${name}.size = 100`, '}', '}'],
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${name} = {`, '  size: 100', '}'],
              hiddenSuffix: [report(`${name}.size`)],
              vectors: [{ frames: repeat(down(a), 8) }, { frames: [down(a), down(a), down(other)] }, { frames: [down(a), up, up] }],
            },
            explain: 'The inner chain goes inside the keyIsPressed check, and each change goes right after its own condition.',
          });
        },
      },
      {
        id: 'color-for-each-key',
        make(r) {
          const [a, b, other] = r.sample(LETTERS, 3);
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `While a key is down: if it is ${a}, make ${V} ${c1.name}. If it is ${b}, make ${V} ${c2.name}.`,
              `When no key is down, make ${V} ${c3.name}.`,
            ]),
            movable: ['if(keyIsPressed){', `if(key == ${q(a)}){`, kit.setColor(V, c1), '}', `else if(key == ${q(b)}){`, kit.setColor(V, c2), '}', '}', 'else{', kit.setColor(V, c3), '}'],
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V} = "none"`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: [
                { keyIsPressed: true, key: a },
                { keyIsPressed: true, key: b },
                { keyIsPressed: true, key: other },
                { keyIsPressed: false, key: a },
              ],
            },
            explain: 'The last else belongs to the outer if, so it runs when no key is down.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA5.1',
    title: 'Key Presses && Nested Conditionals',
    unit: 2,
    source: 'curriculum/02-unit-2/14-U2LA5.1-Key-Presses-and-Nested-Conditionals.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [conceptSlot, keysSlot, sizeSlot, parentSlot, flowSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['sizeTrace', 'keyRows', 'parsons', 'whyNest', 'blanks', 'whyTheOuterIf', 'bug', 'lines'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
