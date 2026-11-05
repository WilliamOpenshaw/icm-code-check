// U3LA1.1 to U3LA1.3: while loops, for loops, and nested for loops. Also sets up the helpers
// shared by the Unit 3 tests. Students have NOT seen arrays yet, or classes (Unit 4).
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const { tok } = kit;
  const { slot, choice } = U;

  const U3 = {};
  CC.u3 = U3;

  U3.lesson = (id, title, file, minutes, questions, notYetTaught, slots) => CC.defineLesson({
    id,
    title,
    unit: 3,
    source: `curriculum/03-unit-3/${file}`,
    defaults: {
      minutes, questions, attempts: 2, practice: false,
    },
    notYetTaught,
    slots,
    priority: slots.map((s) => s.id),
  });

  U3.rows = (r, prompt, pairs, options, explain, code, column) => kit.rowsQuestion({
    prompt,
    code,
    columns: [column || 'Item'],
    rows: r.shuffle(pairs).map(([text, answer]) => ({ cells: [text], answer })),
    options: options.map((text) => ({ text })),
    explain,
  });

  U3.REASONS = [
    'The variable never changes, so the condition stays true and the loop never ends.',
    'This condition is false from the start, so the loop never runs.',
    'This stops one too soon or goes one too far.',
    'This counts by the wrong amount.',
    'Indexes start at 0, so this refers to the wrong element.',
    'This value is not a whole number, so it is not a valid index.',
    'This line is outside the loop, so it only runs once.',
    'This uses the wrong name for a method or variable.',
    'Without parentheses, this method never runs.',
    'This comes after the thing it should affect, so it has no effect on it.',
  ];
  U3.bug = (r, {
    prompt, code, fixed, line, why, explain, vectors, kind,
  }) => {
    const reason = U3.REASONS[why];
    return kit.bugQuestion(r, {
      prompt: `${prompt} ${U.FIND_BUG}`,
      code,
      bugLines: Array.isArray(line) ? line : [line],
      why: reason,
      others: r.sample(U3.REASONS.filter((t) => t !== reason), 3),
      fixed,
      spec: { kind: kind || 'snippet', vectors: vectors || [{}] },
      explain,
    });
  };
  U3.parsons = (r, rules, movable, explain, prefix, suffix, spec) => kit.parsonsQuestion(r, {
    prompt: `Put these lines in order so the code does this:\n${kit.numberedRules(rules)}`,
    prefix: prefix || [],
    movable,
    suffix: suffix || [],
    spec: spec || U.spec(),
    explain,
  });

  U3.NO_ARRAYS = [[/\bpush\(|\bsplice\(|\.length/, 'array methods (U3LA2)']];
  const NAMES = ['x', 'pos', 'spot', 'circleX', 'n'];
  const START_STEP = (r) => {
    const start = 10 * r.int(1, 8);
    const step = 10 * r.int(2, 6);
    const count = r.int(3, 6);
    return {
      start, step, count, limit: start + step * count - r.int(0, 1) * 5 - 5,
    };
  };
  const whileLines = (name, { start, step, limit }, body) => [`let ${name} = ${start}`, `while(${name} < ${limit}){`, `  ${body || `console.log(${name})`}`, `  ${name} = ${name} + ${step}`, '}'];
  const forHead = (name, { start, step, limit }) => `for(let ${name} = ${start}; ${name} < ${limit}; ${name} += ${step}){`;
  const wrong = (logs) => [logs.slice(0, -1), logs.slice(1), logs.concat([String(Number(logs[logs.length - 1]) + 10)])];

  U3.lesson('U3LA1.1', 'While Loops', '02-U3LA1.1-While-Loops.md', 15, 9, U3.NO_ARRAYS.concat([[/\bfor\s*\(/, 'for loops (U3LA1.2)']]), [
    slot('parts', 'concepts', 'Knowing the parts of a while loop', {
      steps(r) {
        const name = r.pick(NAMES); const s = START_STEP(r);
        return U3.rows(r, 'What does each part of this while loop do?', [[`let ${name} = ${s.start}`, 0], [`${name} < ${s.limit}`, 1], [`${name} = ${name} + ${s.step}`, 2]], ['set the starting value', 'check the condition', 'change the variable'], 'A loop needs a start, a condition, and a change.', whileLines(name, s), 'Part');
      },
      why(r) {
        const n = r.int(5, 50);
        return choice(r, `Why use a loop to draw ${n} ellipses in a row, rather than ${n} lines of code?`, 'It is shorter, and easy to change in one place', ['Loops make each ellipse a different shape', 'p5 can only draw shapes inside of loops', 'A loop draws them all at the same exact position'], 'Loops replace repeated code, and make it easy to update.');
      },
      infinite(r) {
        return choice(r, 'What causes an infinite loop?', 'The condition never becomes false', ['The loop runs fewer than 3 times', 'The loop draws too many colors', 'The canvas is too small'], 'If the variable never moves toward the stopping point, the loop never ends, and the browser can crash.');
      },
    }),
    slot('count', 'flow', 'Working out how many times a loop runs', {
      shapes(r) {
        const s = START_STEP(r);
        const code = whileLines('x', s, 'ellipse(x, 60, 40, 40)');
        return kit.numberQuestion({ prompt: 'How many ellipses does this draw?', code, answer: U.shapesOf(code).shapes.length, explain: 'Count the values of x that are still below the limit.' });
      },
      lastValue(r) {
        const name = r.pick(NAMES); const s = START_STEP(r);
        const code = whileLines(name, s, 'console.log("Drawing")').concat([`console.log(${name})`]);
        return kit.printedNumber({ prompt: 'What number does the last line print?', code, explain: 'The loop stops the first time the condition is false, so the variable ends just past the limit.' });
      },
      lastDrawn(r) {
        const s = START_STEP(r);
        const code = whileLines('x', s, 'ellipse(x, 60, 40, 40)');
        const { shapes } = U.shapesOf(code);
        return kit.numberQuestion({ prompt: 'What is the x value of the last ellipse drawn?', code, answer: shapes[shapes.length - 1][1][0], explain: 'It is the last value of x that was still below the limit.' });
      },
    }),
    slot('trace', 'flow', 'Tracing a while loop', {
      prints(r) {
        const name = r.pick(NAMES); const s = START_STEP(r);
        const code = whileLines(name, s);
        const logs = kit.printed(code);
        return kit.traceChoice(r, { code, wrong: wrong(logs), explain: 'Check the condition, run the body, change the variable, and then repeat.' });
      },
      total(r) {
        const n = r.int(3, 6); const a = r.int(2, 9);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['let count = 0', 'let total = 0', `while(count < ${n}){`, `  total = total + ${a}`, '  count = count + 1', '}', 'console.log(total)'], explain: `The body runs ${n} times, adding ${a} each time.` });
      },
      countDown(r) {
        const a = r.int(4, 8); const d = r.int(1, 2);
        const code = [`let n = ${a}`, 'while(n > 0){', '  console.log(n)', `  n = n - ${d}`, '}'];
        const logs = kit.printed(code);
        return kit.traceChoice(r, { code, wrong: wrong(logs), explain: 'A loop can count down, as long as it moves toward the stopping point.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in while loops', {
      noChange(r) {
        const s = START_STEP(r);
        const fixed = whileLines('x', s);
        return U3.bug(r, { prompt: `This should print values until x reaches ${s.limit}, but it crashes the browser.`, code: fixed.slice(0, 3).concat(['  x = x', '}']), fixed, line: 3, why: 0, explain: `It should add to x: x = x + ${s.step}.` });
      },
      wrongWay(r) {
        const s = START_STEP(r);
        const fixed = whileLines('x', s);
        const code = fixed.slice(); code[1] = `while(x > ${s.limit}){`;
        return U3.bug(r, { prompt: `This should print x while it is below ${s.limit}, but nothing appears.`, code, fixed, line: 1, why: 1, explain: `It should be x < ${s.limit}.` });
      },
      offByOne(r) {
        const n = r.int(3, 7);
        const lines = (c) => ['let count = 0', `while(count ${c}){`, '  console.log(count)', '  count = count + 1', '}'];
        return U3.bug(r, { prompt: `This should print exactly ${n} numbers.`, code: lines(`<= ${n}`), fixed: lines(`< ${n}`), line: 1, why: 2, explain: `count starts at 0, so it should stop before ${n}.` });
      },
    }),
    slot('blanks', 'build', 'Completing a while loop', {
      row(r) {
        const s = START_STEP(r);
        return kit.blanksQuestion(r, { prompt: `Complete the loop so it draws ellipses starting at x = ${s.start}, ${s.step} apart, while x is below ${s.limit}.`, lines: [['let x = ', tok(s.start, 'n')], [tok('while', 'k'), '(x ', tok('<', 'o'), ' ', tok(s.limit, 'n'), '){'], ['  ellipse(x, 60, 40, 40)'], ['  x = x + ', tok(s.step, 'n')], ['}']], must: ['k', 'o'], count: 4, pools: { k: ['if', 'function'], o: ['>', '=='], n: [s.limit + 100, s.step + 5] }, spec: U.spec(), explain: 'A start, a condition, and a change.' });
      },
      width(r) {
        const d = r.pick([30, 50, 100]);
        return kit.blanksQuestion(r, { prompt: `Complete the loop so ellipses ${d} apart fill the canvas from left to right.`, lines: [['let x = 0'], ['while(x < ', tok('width', 'v'), '){'], ['  ellipse(', tok('x', 'p'), ', 60, 20, 20)'], ['  ', tok('x', 'p'), ' = ', tok('x', 'p'), ' + ', tok(d, 'n')], ['}']], must: ['v', 'p'], count: 3, pools: { v: ['height', 'mouseX'], p: ['y', 'width'], n: [d + 7, 0] }, spec: U.spec([{ width: 300, height: 200, mouseX: 150 }]), explain: 'The condition uses width, and x has to change each time.' });
      },
      count(r) {
        const n = r.int(3, 8);
        return kit.blanksQuestion(r, { prompt: `Complete the loop so it prints "Hi" exactly ${n} times.`, lines: [['let count = ', tok(0, 'n')], ['while(', tok('count', 'p'), ' < ', tok(n, 'n'), '){'], ['  console.log("Hi")'], ['  count = count + ', tok(1, 'n')], ['}']], must: ['p', 'n'], count: 3, pools: { n: [n + 2, 3 + n * 2], p: ['width'] }, spec: U.spec([{ width: 400 }]), explain: `Starting at 0 and adding 1, it stops at ${n}.` });
      },
    }),
    slot('parsons', 'build', 'Putting a while loop in order', {
      row(r) {
        const s = START_STEP(r);
        return U3.parsons(r, [`Start x at ${s.start}.`, `While x is below ${s.limit}, draw an ellipse at x.`, `Inside the loop, add ${s.step} to x.`, 'After the loop, print "Done".'], [`let x = ${s.start}`, `while(x < ${s.limit}){`, 'ellipse(x, 60, 40, 40)', `x = x + ${s.step}`, '}', 'console.log("Done")'], 'The change has to be inside the loop, or it never ends.');
      },
      twoShapes(r) {
        const s = START_STEP(r);
        return U3.parsons(r, [`Start y at ${s.start}.`, `While y is below ${s.limit}: draw a rectangle at y, then draw a line at y, then add ${s.step} to y.`], [`let y = ${s.start}`, `while(y < ${s.limit}){`, 'rect(10, y, 20, 20)', 'line(40, y, 90, y)', `y = y + ${s.step}`, '}'], 'Everything that repeats goes inside the curly brackets.');
      },
      total(r) {
        const n = r.int(3, 6);
        return U3.parsons(r, ['Start total at 0, and count at 0.', `While count is below ${n}, add count to total, and then add 1 to count.`, 'Print total after the loop.'], ['let total = 0', 'let count = 0', `while(count < ${n}){`, 'total = total + count', 'count = count + 1', '}', 'console.log(total)'], 'Print after the closing bracket so that it only happens once.');
      },
    }),
  ]);

  U3.lesson('U3LA1.2', 'For Loops Pt 1', '03-U3LA1.2-For-Loops-Pt-1.md', 20, 12, U3.NO_ARRAYS, [
    slot('parts', 'concepts', 'Knowing the parts of a for loop', {
      pieces(r) {
        const s = START_STEP(r);
        return U3.rows(r, 'Which job does each part of this for loop do?', [[`let i = ${s.start}`, 0], [`i < ${s.limit}`, 1], [`i += ${s.step}`, 2]], ['set the starting value', 'check the condition', 'change the variable'], 'They are the same three parts as a while loop, all on one line.', [forHead('i', s), '  console.log(i)', '}'], 'Part');
      },
      versus(r) {
        return choice(r, 'How do a for loop and a while loop differ?', 'A for loop keeps its start, condition, and change on one line', ['A while loop can\'t have a condition', 'A for loop can only draw ellipses', 'A while loop always runs forever'], 'They do the same job, but organize the parts differently.');
      },
      syntax(r) {
        const n = r.int(3, 20);
        return choice(r, 'Which for loop is written correctly?', `for(let i = 0; i < ${n}; i++){`, [`for(let i = 0, i < ${n}, i++){`, `for(let i = 0; i++){`, `for(i < ${n}; let i = 0; i++){`], 'The three parts are separated by semicolons, in the order start, condition, change.', { codeOptions: true });
      },
    }),
    slot('trace', 'flow', 'Tracing a for loop', {
      prints(r) {
        const s = START_STEP(r);
        const code = [forHead('i', s), '  console.log(i)', '}'];
        return kit.traceChoice(r, { code, wrong: wrong(kit.printed(code)), explain: 'Start, check, run the body, change, and then check again.' });
      },
      count(r) {
        const s = START_STEP(r);
        const code = [forHead('x', s), '  ellipse(x, 75, 20, 20)', '}'];
        return kit.numberQuestion({ prompt: 'How many ellipses does this draw?', code, answer: U.shapesOf(code).shapes.length, explain: 'Count the values below the limit.' });
      },
      plusPlus(r) {
        const a = r.int(2, 6); const b = a + r.int(2, 6);
        const code = ['let total = 0', `for(let i = ${a}; i < ${b}; i++){`, '  total = total + 1', '}', 'console.log(total)'];
        return kit.printedNumber({ prompt: 'What number does this print?', code, explain: `i++ adds 1 each time, so it runs ${b - a} times.` });
      },
    }),
    slot('uses', 'flow', 'Using the loop variable for more than position', {
      size(r) {
        const code = ['for(let x = 100; x < 400; x = x + 100){', `  ellipse(x, 60, x/${r.pick([2, 5, 10])}, 20)`, '}'];
        const { shapes } = U.shapesOf(code);
        return kit.numberQuestion({ prompt: 'What is the width of the last ellipse drawn?', code, answer: shapes[shapes.length - 1][1][2], explain: 'The loop variable changes the size as well.' });
      },
      diagonal(r) {
        return choice(r, 'What does this loop draw?', 'A diagonal line of ellipses', ['A row of ellipses', 'A column of ellipses', 'One big ellipse'], 'x and y change together, so the shapes go both across and down.', { code: [`for(let i = 0; i < width; i += ${r.pick([30, 40, 50])}){`, '  ellipse(i, i, 20, 20)', '}'] });
      },
      column(r) {
        const d = r.pick([30, 40, 50]);
        return choice(r, 'What does this loop draw?', 'A column of ellipses, going down the canvas', ['A row of ellipses, going across the canvas', 'A diagonal line of ellipses', 'A grid of ellipses'], 'Only y changes.', { code: [`for(let y = 0; y < height; y += ${d}){`, '  ellipse(100, y, 20, 20)', '}'] });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in for loops', {
      offByOne(r) {
        const n = r.int(3, 8); const v = r.pick(['i', 'j', 'k', 'n']);
        const code = (c) => [`for(let ${v} = 0; ${v} ${c}; ${v}++){`, `  console.log(${v})`, '}'];
        return U3.bug(r, { prompt: `This should print exactly ${n} numbers.`, code: code(`<= ${n}`), fixed: code(`< ${n}`), line: 0, why: 2, explain: `0 up to but not including ${n} is ${n} numbers.` });
      },
      backwards(r) {
        const n = 10 * r.int(3, 9);
        const code = (c) => [`for(let i = 0; i ${c}; i += 10){`, '  console.log(i)', '}'];
        return U3.bug(r, { prompt: `This should print the values from 0 up to ${n}, but nothing appears.`, code: code(`> ${n}`), fixed: code(`< ${n}`), line: 0, why: 1, explain: 'i starts at 0, which is not greater than the limit.' });
      },
      wrongStep(r) {
        const d = r.pick([20, 30, 50]); const y = 10 * r.int(2, 30);
        const code = (c) => [`for(let x = 0; x < 200; x += ${c}){`, `  ellipse(x, ${y}, 10, 10)`, '}'];
        return U3.bug(r, { prompt: `The ellipses should be ${d} apart.`, code: code(d + 10), fixed: code(d), line: 0, why: 3, explain: `It should add ${d}.` });
      },
    }),
    slot('blanks', 'build', 'Completing a for loop', {
      row(r) {
        const s = START_STEP(r);
        return kit.blanksQuestion(r, { prompt: `Complete the loop so x starts at ${s.start}, stays below ${s.limit}, and goes up by ${s.step}.`, lines: [[tok('for', 'k'), '(let x = ', tok(s.start, 'n'), '; x ', tok('<', 'o'), ' ', tok(s.limit, 'n'), '; x += ', tok(s.step, 'n'), '){'], ['  ellipse(x, 60, 20, 20)'], ['}']], must: ['k', 'n'], count: 4, pools: { k: ['if', 'while'], o: ['>', '=='], n: [s.limit + 50, s.step + 5] }, spec: U.spec(), explain: 'Start, condition, change.' });
      },
      column(r) {
        const d = r.pick([30, 40, 50]);
        return kit.blanksQuestion(r, { prompt: `Complete the loop so it draws a column of ellipses ${d} apart, down the whole canvas.`, lines: [['for(let y = 0; y < ', tok('height', 'v'), '; y += ', tok(d, 'n'), '){'], ['  ellipse(100, ', tok('y', 'p'), ', 20, 20)'], ['}']], must: ['v', 'p'], count: 3, pools: { v: ['width', 'mouseX'], p: ['x', 'width'], n: [d + 7] }, spec: U.spec([{ width: 500, height: 200, mouseX: 150 }]), explain: 'A column changes y, up to the height.' });
      },
      size(r) {
        const n = r.pick([2, 5, 10]);
        return kit.blanksQuestion(r, { prompt: `Complete the loop so each ellipse's width is x divided by ${n}.`, lines: [['for(let x = 100; x < width; x = x + 100){'], ['  ellipse(', tok('x', 'p'), ', 60, ', tok('x', 'p'), '/', tok(n, 'n'), ', 20)'], ['}']], must: ['p', 'n'], count: 3, pools: { p: ['width', 'height'], n: [n + 1] }, spec: U.spec([{ width: 500, height: 200 }]), explain: 'The variable can go in more than one place.' });
      },
    }),
    slot('parsons', 'build', 'Putting a for loop in order', {
      styled(r) {
        const s = START_STEP(r);
        return U3.parsons(r, ['Set the fill to gray.', `For x from ${s.start}, below ${s.limit}, going up by ${s.step}: draw an ellipse, and then a rectangle.`, 'After the loop, draw a line.', 'Then print "Done".'], ['fill(150)', forHead('x', s), 'ellipse(x, 40, 20, 20)', 'rect(x, 80, 20, 20)', '}', 'line(0, 120, 400, 120)', 'console.log("Done")'], 'The repeated shapes go inside the loop.');
      },
      sum(r) {
        const n = r.int(3, 7);
        return U3.parsons(r, ['Start total at 0.', `For i from 1, up to and including ${n}, add i to total.`, 'After the loop, print total, and then print "Done".'], ['let total = 0', `for(let i = 1; i <= ${n}; i++){`, 'total = total + i', '}', 'console.log(total)', 'console.log("Done")'], 'total has to exist before the loop, and print after it.');
      },
      twoLoops(r) {
        const n = r.int(2, 4);
        return U3.parsons(r, [`First loop ${n} times, drawing a row of ellipses.`, `Then loop ${n} times, drawing a column of rectangles.`], [`for(let i = 0; i < ${n}; i++){`, 'ellipse(i * 50, 20, 10, 10)', '}', `for(let j = 0; j < ${n}; j++){`, 'rect(20, j * 50, 10, 10)', '}'], 'Close the first loop before you start the second.');
      },
    }),
  ]);

  const grid = (nx, ny, gap, body) => [`for(let x = 0; x < ${nx * gap}; x += ${gap}){`, `  for(let y = 0; y < ${ny * gap}; y += ${gap}){`, `    ${body || 'ellipse(x, y, 15, 15)'}`, '  }', '}'];

  U3.lesson('U3LA1.3', 'Nested For Loops', '04-U3LA1.3-Nested-For-Loops-For-Loops-pt-2.md', 20, 10, U3.NO_ARRAYS, [
    slot('concept', 'concepts', 'Understanding nested loops', {
      meaning(r) {
        return choice(r, 'What is a nested loop?', 'One loop running inside of another loop', ['Two loops that run one after the other', 'A loop that never ends', 'A loop that draws circles inside circles'], 'The inner loop runs completely for each pass of the outer loop.');
      },
      whichFirst(r) {
        return choice(r, 'In a nested loop, which variable changes more often?', 'The inner loop\'s variable', ['The outer loop\'s variable', 'They change at the same rate', 'Neither one changes'], 'The inner loop finishes all of its passes before the outer one moves on.');
      },
      why(r) {
        return choice(r, 'Why use nested loops to draw a grid?', 'Two loops can replace many separate rows of code', ['A grid can\'t be drawn any other way', 'They make shapes bigger', 'They keep the canvas clear'], 'One loop makes a line of shapes, and the other repeats that line.');
      },
    }),
    slot('count', 'flow', 'Working out how much a nested loop draws', {
      total(r) {
        const nx = r.int(2, 6); const ny = r.int(2, 6); const code = grid(nx, ny, 30);
        return kit.numberQuestion({ prompt: 'How many ellipses does this draw?', code, answer: U.shapesOf(code).shapes.length, explain: `${nx} columns, with ${ny} in each.` });
      },
      twoEach(r) {
        const nx = r.int(2, 4); const ny = r.int(2, 4);
        const code = [`for(let i = 0; i < ${nx}; i++){`, '  console.log("outer")', `  for(let j = 0; j < ${ny}; j++){`, '    console.log("inner")', '  }', '}'];
        return kit.numberQuestion({ prompt: 'How many lines does this print in total?', code, answer: kit.printed(code).length, explain: `${nx} outer lines, plus ${nx * ny} inner lines.` });
      },
      outerOnly(r) {
        const nx = r.int(2, 5); const ny = r.int(2, 5);
        const code = ['let count = 0', `for(let i = 0; i < ${nx}; i++){`, `  for(let j = 0; j < ${ny}; j++){`, '  }', '  count = count + 1', '}', 'console.log(count)'];
        return kit.printedNumber({ prompt: 'What number does this print?', code, explain: 'count is in the outer loop, but not in the inner one.' });
      },
    }),
    slot('order', 'flow', 'Following the order of a nested loop', {
      secondShape(r) {
        const gap = 10 * r.int(2, 5); const code = grid(3, 3, gap);
        const s = U.shapesOf(code).shapes[1][1];
        return choice(r, 'Where is the second ellipse drawn?', `(${s[0]}, ${s[1]})`, [`(${gap * 2}, 0)`, `(${gap}, 0)`, `(${gap}, ${gap})`], 'The inner loop goes first, so y changes before x does.', { code });
      },
      prints(r) {
        const code = ['for(let i = 0; i < 2; i++){', `  for(let j = 0; j < ${r.int(2, 3)}; j++){`, '    console.log(i, j)', '  }', '}'];
        const logs = kit.printed(code);
        return kit.traceChoice(r, { code, wrong: [logs.slice().reverse(), logs.slice(1), logs.concat(['2 0'])], explain: 'For each i, j goes through all of its values.' });
      },
      lastShape(r) {
        const gap = 10 * r.int(2, 5); const nx = r.int(2, 4); const ny = r.int(2, 4); const code = grid(nx, ny, gap);
        const { shapes } = U.shapesOf(code);
        return kit.numberQuestion({ prompt: 'What is the y value of the last ellipse drawn?', code, answer: shapes[shapes.length - 1][1][1], explain: 'The last ellipse uses the last value of y.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in nested loops', {
      sameVar(r) {
        const g = 10 * r.int(2, 5); const s = r.int(5, 20);
        return U3.bug(r, { prompt: 'This should draw a grid, but every ellipse is on one diagonal line.', code: grid(3, 3, g, `ellipse(x, x, ${s}, ${s})`), fixed: grid(3, 3, g, `ellipse(x, y, ${s}, ${s})`), line: 2, why: 7, explain: 'It should use both x and y.' });
      },
      inner(r) {
        const g = 10 * r.int(2, 5); const fixed = grid(r.int(2, 4), 3, g, `ellipse(x, y, ${r.int(5, 20)}, 10)`);
        const code = fixed.slice(); code[1] = `  for(let y = 0; y > ${3 * g}; y += ${g}){`;
        return U3.bug(r, { prompt: 'This should draw a grid, but nothing appears.', code, fixed, line: 1, why: 1, explain: `y starts at 0, so it should be y < ${3 * g}.` });
      },
      outside(r) {
        const n = r.int(2, 4); const s = r.int(5, 15);
        const fixed = [`for(let i = 0; i < ${n}; i++){`, `  for(let j = 0; j < ${n}; j++){`, `    rect(i * 20, j * 20, ${s}, ${s})`, '  }', '}'];
        return U3.bug(r, { prompt: 'This should draw a whole grid, but only the top row is there.', code: [`for(let i = 0; i < ${n}; i++){`, `  for(let j = 0; j < ${n}; j += ${n}){`, `    rect(i * 20, j * 20, ${s}, ${s})`, '  }', '}'], fixed, line: 1, why: 3, explain: 'j jumps right to the limit, so each column has only one square.' });
      },
    }),
    slot('blanks', 'build', 'Completing nested loops', {
      grid(r) {
        const g = 10 * r.int(2, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it fills the canvas with a grid of ellipses ${g} apart.`, lines: [['for(let x = 0; x < ', tok('width', 'v'), `; x += ${g}){`], ['  for(let y = 0; y < ', tok('height', 'v'), `; y += ${g}){`], ['    ellipse(', tok('x', 'p'), ', ', tok('y', 'p'), ', 15, 15)'], ['  }'], ['}']], must: ['v', 'p'], count: 3, pools: { v: ['mouseX', 'mouseY'], p: ['width', 'height'] }, spec: U.spec([{ width: 200, height: 100, mouseX: 30, mouseY: 60 }]), explain: 'x goes up to the width, and y goes up to the height.' });
      },
      counts(r) {
        const a = r.int(2, 5); const b = r.int(2, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the outer loop runs ${a} times, the inner loop runs ${b} times, and it prints i and j.`, lines: [['for(let i = 0; i < ', tok(a, 'n'), '; i++){'], ['  for(let ', tok('j', 'p'), ' = 0; j < ', tok(b, 'n'), '; j++){'], ['    console.log(i, j)'], ['  }'], ['}']], must: ['n'], count: 2, pools: { n: [a + 3, b + 4] }, spec: U.spec(), explain: 'The first limit is the outer loop, and the second is the inner.' });
      },
      fnCall(r) {
        const g = 10 * r.int(2, 5);
        return kit.blanksQuestion(r, { prompt: 'Complete the code so badge gets drawn at every spot in the grid.', lines: [['function badge(x, y){'], ['  ellipse(x, y, 10, 10)'], ['}'], [`for(let x = 0; x < 100; x += ${g}){`], [`  for(let y = 0; y < 100; y += ${g}){`], ['    ', tok('badge', 'f'), '(', tok('x', 'p'), ', ', tok('y', 'p'), ')'], ['  }'], ['}']], must: ['f', 'p'], count: 3, pools: { f: ['function', 'draw'], p: ['width', 'height'] }, spec: U.spec([{ width: 400, height: 300 }]), explain: 'A function call can go inside the loops.' });
      },
    }),
    slot('parsons', 'build', 'Putting nested loops in order', {
      grid(r) {
        const g = 10 * r.int(2, 5);
        return U3.parsons(r, [`For x from 0 below 100, going up by ${g}:`, `For y from 0 below 100, going up by ${g}, draw a rectangle at x and y.`, 'Close both loops, and then print "Done".'], [`for(let x = 0; x < 100; x += ${g}){`, `for(let y = 0; y < 100; y += ${g}){`, 'rect(x, y, 5, 5)', '}', '}', 'console.log("Done")'], 'The inner loop goes completely inside the outer loop.');
      },
      styled(r) {
        const n = r.int(2, 4);
        return U3.parsons(r, ['Print "Start".', `Loop i ${n} times.`, `Inside it, loop j ${n} times, filling with gray and drawing an ellipse.`, 'Print "End" when both loops are done.'], ['console.log("Start")', `for(let i = 0; i < ${n}; i++){`, `for(let j = 0; j < ${n}; j++){`, 'fill(120)', 'ellipse(i * 30, j * 30, 20, 20)', '}', '}', 'console.log("End")'], 'Work from the outside in.');
      },
      perRow(r) {
        const n = r.int(2, 4);
        return U3.parsons(r, [`Loop i ${n} times.`, `For each i, loop j ${n} times, printing j.`, 'After that inner loop, but still inside the outer one, print "next".'], [`for(let i = 0; i < ${n}; i++){`, `for(let j = 0; j < ${n}; j++){`, 'console.log(j)', '}', 'console.log("next")', '}'], 'A line after the inner bracket runs once per outer pass.');
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
