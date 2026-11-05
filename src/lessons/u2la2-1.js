// U2LA2.1: Draw with Mouse
// curriculum/02-unit-2/06-U2LA2.1-Draw-with-Mouse.md
//
// Students at this point have seen: everything through U2LA1.3, plus setup() running once
// and draw() repeating, frameCount, background in setup versus draw, pmouseX/pmouseY, and
// object literals with dot notation.
// They have NOT seen: map(), typeof, return values, mouseIsPressed, key presses, loops, or arrays.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    tok, log, chainLines, ifBlock, numberedRules, WHY,
  } = kit;

  const COUNTER_NAMES = ['counter', 'total', 'tally', 'steps'];
  const report = (expr) => `function __report(){\n  console.log(${expr})\n}`;
  const nFrames = (n) => Array.from({ length: n }, () => ({}));

  const framesSlot = {
    id: 'frames',
    skill: 'flow',
    concept: 'Knowing that setup() runs once and draw() keeps repeating',
    patterns: [
      {
        id: 'count-in-draw',
        make(r) {
          const name = r.pick(COUNTER_NAMES);
          const step = r.int(2, 5);
          const n = r.int(3, 6);
          const code = [`let ${name} = 0`, '', 'function setup(){', '  createCanvas(400, 400)', '}', '', 'function draw(){', `  ${name} = ${name} + ${step}`, '}'];
          return kit.printedNumber({
            prompt: `p5 has run setup() and then run draw() ${n} times. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { frames: nFrames(n) },
            kind: 'sketch',
            explain: `draw() adds ${step} each time it runs, and it has run ${n} times: ${n} × ${step} = ${n * step}.`,
          });
        },
      },
      {
        id: 'start-in-setup',
        make(r) {
          const name = r.pick(COUNTER_NAMES);
          const start = 10 * r.int(1, 5);
          const step = r.int(2, 5);
          const n = r.int(3, 6);
          const code = [`let ${name}`, '', 'function setup(){', '  createCanvas(400, 400)', `  ${name} = ${start}`, '}', '', 'function draw(){', `  ${name} = ${name} + ${step}`, '}'];
          return kit.printedNumber({
            prompt: `p5 has run setup() and then run draw() ${n} times. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { frames: nFrames(n) },
            kind: 'sketch',
            explain: `setup() runs once and sets ${name} to ${start}. Then draw() adds ${step} a total of ${n} times.`,
          });
        },
      },
      {
        id: 'made-new-inside-draw',
        make(r) {
          const name = r.pick(COUNTER_NAMES);
          const start = r.int(1, 9);
          const step = r.int(2, 5);
          const n = r.int(3, 6);
          const code = ['function draw(){', `  let ${name} = ${start}`, `  ${name} = ${name} + ${step}`, `  console.log(${name})`, '}'];
          return kit.printedNumber({
            prompt: `p5 has run draw() ${n} times. What is the last number printed?`,
            code,
            vec: { frames: nFrames(n) },
            kind: 'sketch',
            explain: `The variable is created again each time draw() runs, so it starts over at ${start} on every frame.`,
          });
        },
      },
      {
        id: 'waits-for-frame-count',
        make(r) {
          const name = r.pick(COUNTER_NAMES);
          const wait = r.int(1, 3);
          const n = wait + r.int(2, 4);
          const code = [`let ${name} = 0`, '', 'function draw(){'].concat(ifBlock(`frameCount > ${wait}`, `${name} = ${name} + 1`).map((l) => `  ${l}`), ['}']);
          return kit.printedNumber({
            prompt: `p5 has run draw() ${n} times. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { frames: nFrames(n) },
            kind: 'sketch',
            explain: `frameCount goes up by 1 each frame, starting at 1. The condition is only true on frames after ${wait}, which is ${n - wait} of them.`,
          });
        },
      },
    ],
  };

  const ONE = 'One shape that follows the mouse';
  const TRAIL = 'A trail of shapes that builds up as the mouse moves';
  const STILL = 'One shape that stays in the same place';
  const NOTHING = 'Only the background, with no shape showing';
  const SEE_PROMPT = 'What do you see on the canvas as the mouse moves around?';
  const moving = [{ mouseX: 50, mouseY: 60 }, { mouseX: 120, mouseY: 90 }, { mouseX: 200, mouseY: 150 }, { mouseX: 260, mouseY: 40 }];
  const pickShape = (r, x, y) => {
    const size = 5 * r.int(2, 10);
    return r.chance(0.5) ? `ellipse(${x}, ${y}, ${size}, ${size})` : `rect(${x}, ${y}, ${size}, ${size})`;
  };
  const sketch = (setupLines, drawLines) => ['function setup(){', '  createCanvas(400, 400)']
    .concat(setupLines.map((l) => `  ${l}`), ['}', '', 'function draw(){'], drawLines.map((l) => `  ${l}`), ['}']);

  // The answer comes from playing the sketch with a moving mouse and looking at what is left.
  function seeQuestion(r, code, explain) {
    const { shapes, error } = CC.runCode(code.join('\n'), { mouseX: 10, mouseY: 10, frames: moving }, 'sketch');
    if (error) throw new Error(`Sketch failed: ${error}\n${code.join('\n')}`);
    const follows = shapes.length > 0 && shapes[shapes.length - 1][1][0] === moving[moving.length - 1].mouseX;
    let correct = NOTHING;
    if (shapes.length > 1) correct = TRAIL;
    else if (shapes.length === 1) correct = follows ? ONE : STILL;
    return kit.choiceQuestion(r, {
      prompt: SEE_PROMPT,
      code,
      correct,
      wrong: [ONE, TRAIL, STILL, NOTHING].filter((text) => text !== correct),
      explain,
    });
  }

  const backgroundSlot = {
    id: 'background',
    skill: 'concepts',
    concept: 'Knowing what background() does in setup() versus draw()',
    patterns: [
      {
        id: 'background-in-setup',
        make(r) {
          return seeQuestion(r, sketch([`background(${r.int(1, 25) * 10})`], [pickShape(r, 'mouseX', 'mouseY')]),
            'The background only paints once, so every shape draw() makes stays on the canvas.');
        },
      },
      {
        id: 'background-in-draw',
        make(r) {
          return seeQuestion(r, sketch([], [`background(${r.int(1, 25) * 10})`, pickShape(r, 'mouseX', 'mouseY')]),
            'Each frame paints a fresh background over the old shape, then draws one new shape at the mouse.');
        },
      },
      {
        id: 'shape-does-not-use-the-mouse',
        make(r) {
          return seeQuestion(r, sketch([], [`background(${r.int(1, 25) * 10})`, pickShape(r, 10 * r.int(5, 30), 10 * r.int(5, 30))]),
            'The shape is drawn over and over, but always with the same numbers, so it never appears to move.');
        },
      },
      {
        id: 'background-after-the-shape',
        make(r) {
          return seeQuestion(r, sketch([], [pickShape(r, 'mouseX', 'mouseY'), `background(${r.int(1, 25) * 10})`]),
            'Code runs top to bottom. The background gets painted after the shape, so it covers the shape on every frame.');
        },
      },
    ],
  };

  const ONCE = 'Once';
  const REPEATS = 'Every frame';
  const WHEN_OPTIONS = [{ text: ONCE }, { text: REPEATS }];

  function whenRows(r, { setupLines, drawLines, explain }) {
    const rows = setupLines.map((line) => ({ cells: [line], answer: 0 }))
      .concat(drawLines.map((line) => ({ cells: [line], answer: 1 })));
    return kit.rowsQuestion({
      prompt: 'How often does each line run?',
      code: sketch(setupLines.slice(1), drawLines),
      columns: ['Line of code'],
      rows: r.shuffle(rows),
      options: WHEN_OPTIONS,
      explain,
    });
  }

  const whenSlot = {
    id: 'whenItRuns',
    skill: 'concepts',
    concept: 'Telling what runs once from what runs every frame',
    patterns: [
      {
        id: 'background-in-setup',
        make(r) {
          return whenRows(r, {
            setupLines: ['createCanvas(400, 400)', `background(${r.int(1, 25) * 10})`],
            drawLines: [pickShape(r, 'mouseX', 'mouseY'), `strokeWeight(${r.int(2, 9)})`],
            explain: 'p5 calls setup() once when the sketch starts. It calls draw() over and over after that.',
          });
        },
      },
      {
        id: 'background-in-draw',
        make(r) {
          return whenRows(r, {
            setupLines: ['createCanvas(400, 400)', `strokeWeight(${r.int(2, 9)})`],
            drawLines: [`background(${r.int(1, 25) * 10})`, pickShape(r, 'mouseX', 'mouseY')],
            explain: 'p5 calls setup() once when the sketch starts. It calls draw() over and over after that.',
          });
        },
      },
      {
        id: 'line-tool',
        make(r) {
          return whenRows(r, {
            setupLines: ['createCanvas(400, 400)', `background(${r.int(1, 25) * 10})`],
            drawLines: [`strokeWeight(${r.int(2, 9)})`, 'line(mouseX, mouseY, pmouseX, pmouseY)'],
            explain: 'Only lines inside draw() repeat. That is why the line keeps following the mouse.',
          });
        },
      },
    ],
  };

  // ---- pmouseX and pmouseY ----

  const pathOf = (r) => {
    const value = () => 10 * r.int(1, 39);
    return [{ mouseX: value(), mouseY: value() }, { mouseX: value(), mouseY: value() }, { mouseX: value(), mouseY: value() }];
  };
  const pathText = (path) => path.map((p, i) => `Frame ${i + 1}: mouseX = ${p.mouseX}, mouseY = ${p.mouseY}`).join('\n');

  const pmouseSlot = {
    id: 'pmouse',
    skill: 'flow',
    concept: 'Using pmouseX and pmouseY, the mouse position from the frame before',
    patterns: [
      {
        id: 'value-of-pmouse',
        make(r) {
          const path = pathOf(r);
          const name = r.pick(['pmouseX', 'pmouseY']);
          return kit.printedNumber({
            prompt: `The mouse was at these positions on three frames in a row:\n${pathText(path)}\nWhat is ${name} during frame 3?`,
            code: ['function draw(){', `  console.log(${name})`, '}'],
            vec: { mouseX: path[0].mouseX, mouseY: path[0].mouseY, frames: path },
            kind: 'sketch',
            explain: `${name} holds the position from the frame before, so on frame 3 it holds the value from frame 2.`,
          });
        },
      },
      {
        id: 'how-far-it-moved',
        make(r) {
          const path = pathOf(r);
          const axis = r.pick(['X', 'Y']);
          return kit.printedNumber({
            prompt: `The mouse was at these positions on three frames in a row:\n${pathText(path)}\nWhat is the last number printed?`,
            code: ['function draw(){', `  console.log(mouse${axis} - pmouse${axis})`, '}'],
            vec: { mouseX: path[0].mouseX, mouseY: path[0].mouseY, frames: path },
            kind: 'sketch',
            explain: `On frame 3, mouse${axis} is the value from frame 3 and pmouse${axis} is the value from frame 2. The answer can be negative.`,
          });
        },
      },
      {
        id: 'ends-of-the-line',
        make(r) {
          const path = pathOf(r);
          const [, b, c] = path;
          const point = (p) => `(${p.mouseX}, ${p.mouseY})`;
          const correct = `From ${point(c)} to ${point(b)}`;
          return kit.choiceQuestion(r, {
            prompt: `The mouse was at these positions on three frames in a row:\n${pathText(path)}\nWhat line does this code draw during frame 3?`,
            code: ['line(mouseX, mouseY, pmouseX, pmouseY)'],
            correct,
            wrong: [`From ${point(c)} to ${point(c)}`, `From ${point(b)} to ${point(path[0])}`, `From ${point(c)} to ${point(path[0])}`],
            explain: 'It connects where the mouse is now to where it was one frame ago. Doing that on every frame makes a smooth line.',
          });
        },
      },
      {
        id: 'why-a-line',
        make(r) {
          const size = 5 * r.int(1, 4);
          const weight = r.int(2, 8);
          return kit.choiceQuestion(r, {
            prompt: 'A student moves the mouse quickly. Which of these keeps the drawing connected with no gaps, and why?',
            code: ['function draw(){', `  strokeWeight(${weight})`, `  ellipse(mouseX, mouseY, ${size}, ${size})`, '  /\/ or', '  line(mouseX, mouseY, pmouseX, pmouseY)', '}'],
            correct: 'The line, because it connects the mouse\'s last position to its current one',
            wrong: [
              'The ellipse, because it is drawn at the exact mouse position',
              'The line, because it is drawn more often than the ellipse',
              'Both, because draw() runs fast enough that the mouse can never skip anywhere',
            ],
            explain: 'A fast mouse jumps between frames, so single shapes leave gaps. A line fills the space between the two positions.',
          });
        },
      },
    ],
  };

  // ---- Object literals ----

  const OBJECTS = [
    { names: ['theLine', 'myLine', 'penLine'], props: [['weight', [2, 3, 5, 8, 10]], ['red', [0, 100, 255]], ['green', [0, 100, 255]], ['blue', [0, 100, 255]], ['opacity', [50, 100, 200]]] },
    { names: ['theCircle', 'myCircle', 'dot'], props: [['size', [20, 50, 80, 100]], ['x', [100, 150, 200]], ['y', [100, 150, 200]], ['gray', [0, 100, 200]]] },
    { names: ['brush', 'myBrush', 'marker'], props: [['thickness', [2, 4, 6, 8]], ['red', [0, 100, 255]], ['alpha', [50, 100, 200]], ['size', [10, 20, 30]]] },
    { names: ['player', 'hero', 'runner'], props: [['score', [10, 20, 30, 40]], ['lives', [1, 2, 3]], ['level', [1, 2, 3, 4]], ['coins', [5, 10, 15]]] },
    { names: ['sneaker', 'myShoe', 'kick'], props: [['size', [7, 8, 9, 10]], ['laces', [2, 4, 6]], ['price', [40, 60, 80]]] },
  ];

  function pickObject(r, count) {
    const base = r.pick(OBJECTS);
    const props = r.sample(base.props, count).map(([key, values]) => ({ key, value: r.pick(values), values }));
    return { name: r.pick(base.names), props, keys: base.props.map((p) => p[0]) };
  }

  const objectLines = (o) => [`let ${o.name} = {`]
    .concat(o.props.map((p, i) => `  ${p.key}: ${p.value}${i < o.props.length - 1 ? ',' : ''}`), ['}']);

  const readSlot = {
    id: 'objectRead',
    skill: 'flow',
    concept: 'Reading and changing values in an object',
    patterns: [
      {
        id: 'read-one-key',
        make(r) {
          const o = pickObject(r, 3);
          const p = r.pick(o.props);
          return kit.printedNumber({
            prompt: 'What number does this code print?',
            code: objectLines(o).concat([`console.log(${o.name}.${p.key})`]),
            explain: `${o.name}.${p.key} gets the value stored with the key ${p.key}.`,
          });
        },
      },
      {
        id: 'change-then-read',
        make(r) {
          const o = pickObject(r, 3);
          const p = r.pick(o.props);
          const next = p.value + 5 * r.int(1, 4);
          return kit.printedNumber({
            prompt: 'What number does this code print?',
            code: objectLines(o).concat([`${o.name}.${p.key} = ${next}`, `console.log(${o.name}.${p.key})`]),
            explain: `The value starts as ${p.value}, then ${o.name}.${p.key} = ${next} replaces it.`,
          });
        },
      },
      {
        id: 'math-with-two-keys',
        make(r) {
          const o = pickObject(r, 3);
          const [a, b] = r.sample(o.props, 2);
          return kit.printedNumber({
            prompt: 'What number does this code print?',
            code: objectLines(o).concat([`console.log(${o.name}.${a.key} + ${o.name}.${b.key})`]),
            explain: `Each key gives its own value: ${a.value} + ${b.value}.`,
          });
        },
      },
      {
        id: 'changed-by-the-mouse',
        make(r) {
          const o = pickObject(r, 2);
          const p = o.props[0];
          const c = r.pick(kit.CANVASES);
          const [low, high] = r.pick([[5, 10], [2, 8], [20, 50]]);
          const mouseX = c.cx + 10 * r.pick([-5, -3, 3, 5]);
          return kit.printedNumber({
            prompt: `The mouse is at mouseX = ${mouseX}. What number does this code print?`,
            code: objectLines(o).concat(
              chainLines([{ cond: `mouseX > ${c.cx}`, body: `${o.name}.${p.key} = ${high}` }], `${o.name}.${p.key} = ${low}`),
              [`console.log(${o.name}.${p.key})`],
            ),
            vec: { mouseX },
            explain: `Check mouseX > ${c.cx}, and then the matching line replaces the value of ${p.key}.`,
          });
        },
      },
    ],
  };

  const ROLE_OPTIONS = [{ text: 'object name' }, { text: 'key' }, { text: 'value' }];

  const objectConceptSlot = {
    id: 'objectConcept',
    skill: 'concepts',
    concept: 'Knowing how object literals are written',
    patterns: [
      {
        id: 'name-the-parts',
        make(r) {
          const o = pickObject(r, 2);
          const [a, b] = o.props;
          return kit.rowsQuestion({
            prompt: 'What is each of these in the object below?',
            code: objectLines(o),
            columns: ['Part'],
            rows: r.shuffle([
              { cells: [o.name], answer: 0 },
              { cells: [a.key], answer: 1 },
              { cells: [String(a.value)], answer: 2 },
              { cells: [b.key], answer: 1 },
            ]),
            options: ROLE_OPTIONS,
            explain: 'An object is a list of key and value pairs in curly brackets, stored in a variable. Each key is followed by a colon and its value.',
          });
        },
      },
      {
        id: 'get-a-value',
        make(r) {
          const o = pickObject(r, 2);
          const { key } = o.props[0];
          return kit.choiceQuestion(r, {
            prompt: `Which of these gets the value of ${key} from this object?`,
            code: objectLines(o),
            correct: `${o.name}.${key}`,
            wrong: [`${key}.${o.name}`, `${o.name}(${key})`, `${key}`],
            codeOptions: true,
            explain: 'Use dot notation: the object name, a dot, and then the key.',
          });
        },
      },
      {
        id: 'change-a-value',
        make(r) {
          const o = pickObject(r, 2);
          const { key } = o.props[0];
          const next = 5 * r.int(5, 20);
          return kit.choiceQuestion(r, {
            prompt: `Which line changes ${key} to ${next}?`,
            code: objectLines(o),
            correct: `${o.name}.${key} = ${next}`,
            wrong: [`${o.name}.${key} == ${next}`, `${key} = ${next}`, `${o.name} = ${next}`],
            codeOptions: true,
            explain: `Assign to the key the same way as a variable. ${o.name} = ${next} would replace the whole object with a number.`,
          });
        },
      },
      {
        id: 'correctly-written',
        make(r) {
          const o = pickObject(r, 2);
          const [a, b] = o.props;
          return kit.choiceQuestion(r, {
            prompt: 'Which of these is written correctly?',
            correct: `let ${o.name} = {\n  ${a.key}: ${a.value},\n  ${b.key}: ${b.value}\n}`,
            wrong: [
              `let ${o.name} = {\n  ${a.key} = ${a.value},\n  ${b.key} = ${b.value}\n}`,
              `let ${o.name} = {\n  ${a.key}: ${a.value}\n  ${b.key}: ${b.value}\n}`,
              `let ${o.name} = (\n  ${a.key}: ${a.value},\n  ${b.key}: ${b.value}\n)`,
            ],
            codeOptions: true,
            explain: 'Objects use curly brackets. A colon goes between each key and its value, and a comma goes between pairs.',
          });
        },
      },
    ],
  };

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const BACKGROUND_WHY = 'background() repaints the whole canvas on every frame here, which erases the earlier shapes.';
  const REASONS = [WHY.objectEquals, WHY.objectComma, WHY.wrongKey, WHY.dotOrder, BACKGROUND_WHY];
  const others = (r, why) => r.sample(REASONS.filter((reason) => reason !== why), 3);

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs with objects and drawing',
    patterns: [
      {
        id: 'equals-in-object',
        make(r) {
          const o = pickObject(r, 2);
          const [a, b] = o.props;
          const print = `console.log(${o.name}.${a.key})`;
          return kit.bugQuestion(r, {
            prompt: `This code should print ${a.value}. ${FIND_BUG}`,
            code: [`let ${o.name} = {`, `  ${a.key} = ${a.value},`, `  ${b.key}: ${b.value}`, '}', print],
            bugLines: [1],
            why: WHY.objectEquals,
            others: others(r, WHY.objectEquals),
            fixed: objectLines(o).concat([print]),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `It should be ${a.key}: ${a.value},`,
          });
        },
      },
      {
        id: 'missing-comma',
        make(r) {
          const o = pickObject(r, 2);
          const [a, b] = o.props;
          const print = `console.log(${o.name}.${b.key})`;
          return kit.bugQuestion(r, {
            prompt: `This code should print ${b.value}. ${FIND_BUG}`,
            code: [`let ${o.name} = {`, `  ${a.key}: ${a.value}`, `  ${b.key}: ${b.value}`, '}', print],
            bugLines: [1, 2],
            why: WHY.objectComma,
            others: others(r, WHY.objectComma),
            fixed: objectLines(o).concat([print]),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `Pairs are separated by commas: ${a.key}: ${a.value},`,
          });
        },
      },
      {
        id: 'wrong-key',
        make(r) {
          const o = pickObject(r, 2);
          const { key, value } = o.props[0];
          const wrongCase = key[0].toUpperCase() + key.slice(1);
          return kit.bugQuestion(r, {
            prompt: `This code should print ${value}, but it prints undefined. ${FIND_BUG}`,
            code: objectLines(o).concat([`console.log(${o.name}.${wrongCase})`]),
            bugLines: [objectLines(o).length],
            why: WHY.wrongKey,
            others: others(r, WHY.wrongKey),
            fixed: objectLines(o).concat([`console.log(${o.name}.${key})`]),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `Capital letters count. The key is ${key}, not ${wrongCase}.`,
          });
        },
      },
      {
        id: 'backwards-dot',
        make(r) {
          const o = pickObject(r, 2);
          const { key, value } = o.props[0];
          return kit.bugQuestion(r, {
            prompt: `This code should print ${value}. ${FIND_BUG}`,
            code: objectLines(o).concat([`console.log(${key}.${o.name})`]),
            bugLines: [objectLines(o).length],
            why: WHY.dotOrder,
            others: others(r, WHY.dotOrder),
            fixed: objectLines(o).concat([`console.log(${o.name}.${key})`]),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `It should be ${o.name}.${key}`,
          });
        },
      },
      {
        id: 'background-erases-the-drawing',
        make(r) {
          const gray = r.int(1, 25) * 10;
          const fixed = sketch([`background(${gray})`], ['line(mouseX, mouseY, pmouseX, pmouseY)']);
          const code = sketch([], [`background(${gray})`, 'line(mouseX, mouseY, pmouseX, pmouseY)']);
          return kit.bugQuestion(r, {
            prompt: `This drawing tool should leave a line behind as the mouse moves, but only a tiny piece of line ever shows. ${FIND_BUG}`,
            code,
            bugLines: [code.indexOf(`  background(${gray})`)],
            why: BACKGROUND_WHY,
            others: others(r, BACKGROUND_WHY),
            fixed,
            spec: { kind: 'sketch', vectors: [{ mouseX: 10, mouseY: 10, frames: moving }] },
            explain: 'Move background() into setup(), so it only paints once.',
          });
        },
      },
    ],
  };

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing code that uses an object',
    patterns: [
      {
        id: 'write-an-object',
        make(r) {
          const o = pickObject(r, 2);
          const [a, b] = o.props;
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so the object holds ${a.key} as ${a.value} and ${b.key} as ${b.value}, and it prints ${a.key}.`,
            lines: [
              [`let ${o.name} = {`],
              ['  ', tok(a.key, 'key'), tok(':', 'punct'), ` ${a.value}`, tok(',', 'punct')],
              ['  ', tok(b.key, 'key'), tok(':', 'punct'), ` ${b.value}`],
              ['}'],
              ['console.log(', tok(o.name, 'obj'), tok('.', 'punct'), tok(a.key, 'key'), ')'],
            ],
            must: ['punct', 'key'],
            count: 3,
            pools: { punct: [':', ',', '.', '='], key: o.keys, obj: ['size', 'value', o.name] },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: 'Each pair is key: value, with commas between pairs. To read one, use the object name, a dot, and the key.',
          });
        },
      },
      {
        id: 'change-and-use',
        make(r) {
          const o = pickObject(r, 2);
          const [a, b] = o.props;
          const next = a.value + 5 * r.int(1, 4);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${a.key} changes to ${next}, and then it prints ${a.key}.`,
            lines: objectLines(o).map((text) => ({ text })).concat([
              [tok(o.name, 'obj'), tok('.', 'punct'), tok(a.key, 'key'), ' ', tok('=', 'punct'), ' ', tok(next, 'num')],
              ['console.log(', tok(o.name, 'obj'), '.', tok(a.key, 'key'), ')'],
            ]),
            must: ['key', 'obj'],
            count: 3,
            pools: {
              punct: ['==', ':', ','], key: [a.key, b.key], obj: [o.name, a.key], num: [a.value, next + 5],
            },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `${o.name}.${a.key} = ${next} replaces the value. Then reading it gives the new value.`,
          });
        },
      },
      {
        id: 'drawing-tool',
        make(r) {
          const gray = r.int(1, 25) * 10;
          const weight = r.int(2, 9);
          return kit.blanksQuestion(r, {
            prompt: `Complete this drawing tool. It should paint the background once, and then draw a line from the mouse to where it was one frame ago.`,
            lines: [
              ['function ', tok('setup', 'fn'), '(){'],
              ['  createCanvas(400, 400)'],
              [`  background(${gray})`],
              ['}'],
              ['function ', tok('draw', 'fn'), '(){'],
              [`  strokeWeight(${weight})`],
              ['  line(', tok('mouseX', 'pos'), ', ', tok('mouseY', 'pos'), ', ', tok('pmouseX', 'pos'), ', ', tok('pmouseY', 'pos'), ')'],
              ['}'],
            ],
            must: ['fn', 'pos'],
            count: 4,
            pools: { fn: ['setup', 'draw'], pos: ['mouseX', 'mouseY', 'pmouseX', 'pmouseY'] },
            spec: { kind: 'sketch', vectors: [{ mouseX: 10, mouseY: 10, frames: moving }] },
            explain: 'setup() runs once, so the background belongs there. pmouseX and pmouseY hold where the mouse was on the frame before.',
          });
        },
      },
      {
        id: 'weight-by-the-mouse',
        make(r) {
          const o = pickObject(r, 2);
          const p = o.props[0];
          const c = r.pick(kit.CANVASES);
          const [low, high] = r.pick([[5, 10], [2, 8], [20, 50]]);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${p.key} becomes ${high} when the mouse is on the right side of ${kit.canvasName(c)}, and ${low} otherwise.`,
            lines: objectLines(o).map((text) => ({ text })).concat([
              ['if(', tok('mouseX', 'pos'), ' ', tok('>', 'op'), ' ', tok(c.cx, 'num'), '){'],
              ['  ', tok(o.name, 'obj'), tok('.', 'punct'), tok(p.key, 'key'), ` = ${high}`],
              ['}'],
              ['else{'],
              ['  ', tok(o.name, 'obj'), '.', tok(p.key, 'key'), ` = ${low}`],
              ['}'],
            ]),
            must: ['key', 'op'],
            count: 4,
            pools: {
              pos: ['mouseX', 'mouseY'], op: ['<', '=='], num: [c.cx, c.cx + 50, c.cx + 100], obj: [o.name, p.key], punct: [':', ','], key: o.keys,
            },
            spec: {
              kind: 'snippet',
              hiddenSuffix: [`console.log(${o.name}.${p.key})`],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: `A bigger mouseX is further right, and ${o.name}.${p.key} = changes the value of that key.`,
          });
        },
      },
    ],
  };

  const scramble = (rules) => `Put these lines in order so the code does this:\n${numberedRules(rules)}`;

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting a sketch with an object in order',
    patterns: [
      {
        id: 'object-in-setup',
        make(r) {
          const name = r.pick(['theLine', 'myLine', 'penLine']);
          const weight = r.int(2, 9);
          const red = r.pick([100, 150, 255]);
          const gray = r.int(1, 25) * 10;
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `In setup(), make the canvas and paint a background of ${gray} once.`,
              `Also in setup(), make ${name} an object with a weight of ${weight} and a red of ${red}.`,
              `In draw(), set the stroke weight from ${name}, then draw a line from the mouse to where it was one frame ago.`,
            ]),
            prefix: [{ text: `let ${name}` }, { text: 'function setup(){' }],
            movable: [
              'createCanvas(400, 400)',
              `background(${gray})`,
              `${name} = {`,
              `weight: ${weight},`,
              `red: ${red}`,
              '}',
              '}',
              'function draw(){',
              `strokeWeight(${name}.weight)`,
              'line(mouseX, mouseY, pmouseX, pmouseY)',
            ],
            suffix: [{ text: '}' }],
            spec: { kind: 'sketch', vectors: [{ mouseX: 10, mouseY: 10, frames: moving }] },
            explain: 'Things that happen once go in setup(). The object has to exist before draw() uses it, and the stroke weight gets set before the line is drawn.',
          });
        },
      },
      {
        id: 'weight-changes-with-the-mouse',
        make(r) {
          const name = r.pick(['theLine', 'myLine', 'penLine']);
          const c = r.pick(kit.CANVASES);
          const [low, high] = r.pick([[5, 10], [2, 8], [3, 12]]);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `On ${kit.canvasName(c)}, if the mouse is on the right side, make ${name}.weight ${high}. Otherwise, make it ${low}.`,
              `Then set the stroke weight from ${name}.`,
              'Then draw a line from the mouse to where it was one frame ago.',
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: chainLines(
              [{ cond: `mouseX > ${c.cx}`, body: `${name}.weight = ${high}` }],
              `${name}.weight = ${low}`,
            ).concat([`strokeWeight(${name}.weight)`, 'line(mouseX, mouseY, pmouseX, pmouseY)']),
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${name} = {`, '  weight: 1', '}'],
              vectors: [
                { mouseX: 10, mouseY: 10, frames: [{ mouseX: c.cx + 20, mouseY: 30 }, { mouseX: c.cx - 20, mouseY: 40 }, { mouseX: c.cx + 40, mouseY: 50 }] },
              ],
            },
            explain: 'Change the value first, then use it. The line needs the stroke weight set before it is drawn.',
          });
        },
      },
      {
        id: 'circle-from-an-object',
        make(r) {
          const name = r.pick(['theCircle', 'myCircle', 'dot']);
          const size = r.pick([20, 30, 40, 60]);
          const gray = r.int(1, 25) * 10;
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make ${name} an object with a size of ${size} and a gray of ${gray}.`,
              'In setup(), make the canvas.',
              `In draw(), paint a white background, fill with ${name}.gray, and draw a circle at the mouse that is ${name}.size wide and tall.`,
            ]),
            prefix: [],
            movable: [
              `let ${name} = {`,
              `size: ${size},`,
              `gray: ${gray}`,
              '}',
              'function setup(){',
              'createCanvas(400, 400)',
              '}',
            ],
            suffix: [
              { text: 'function draw(){' },
              { text: '  background(255)' },
              { text: `  fill(${name}.gray)` },
              { text: `  ellipse(mouseX, mouseY, ${name}.size, ${name}.size)` },
              { text: '}' },
            ],
            spec: { kind: 'sketch', vectors: [{ mouseX: 10, mouseY: 10, frames: moving }] },
            explain: 'An object is written with a colon between each key and value, and commas between pairs. setup() gets its own brackets.',
          });
        },
      },
      {
        id: 'clear-each-frame',
        make(r) {
          const name = r.pick(['theCircle', 'myCircle', 'dot']);
          const a = r.pick([20, 30, 40]);
          const b = a + r.pick([20, 40, 60]);
          const c = r.pick(kit.CANVASES);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Paint a gray background on every frame, so only one circle ever shows.`,
              `On ${kit.canvasName(c)}, if the mouse is in the bottom half, make ${name}.size ${b}. Otherwise, make it ${a}.`,
              `Draw a circle at the mouse using ${name}.size for its width and height.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: ['background(220)'].concat(
              chainLines([{ cond: `mouseY > ${c.cy}`, body: `${name}.size = ${b}` }], `${name}.size = ${a}`),
              [`ellipse(mouseX, mouseY, ${name}.size, ${name}.size)`],
            ),
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${name} = {`, '  size: 1', '}'],
              vectors: [{ mouseX: 10, mouseY: 10, frames: [{ mouseX: 30, mouseY: c.cy + 20 }, { mouseX: 40, mouseY: c.cy - 20 }, { mouseX: 50, mouseY: c.cy + 40 }] }],
            },
            explain: 'background() has to come before the circle, or it covers it. The size has to be set before the circle uses it.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA2.1',
    title: 'Draw with Mouse',
    unit: 2,
    source: 'curriculum/02-unit-2/06-U2LA2.1-Draw-with-Mouse.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/\bmap\(/, 'map() (U2LA2.2)'],
      [/typeof/, 'typeof (U2LA3.1)'],
      [/\breturn\b/, 'return values (U2LA3.2)'],
      [/mouseIsPressed|mousePressed|keyIsPressed/, 'clicks and keys (U2LA4.2 and U2LA5.1)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [backgroundSlot, whenSlot, objectConceptSlot, framesSlot, pmouseSlot, readSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['parsons', 'frames', 'background', 'blanks', 'objectRead', 'pmouse', 'bug', 'objectConcept', 'whenItRuns'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
