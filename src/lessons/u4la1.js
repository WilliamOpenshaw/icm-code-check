// U4LA1.1 to U4LA3.1: motion, bouncing, classes and objects, methods, and many objects.
// Also sets up helpers shared by the Unit 4 tests.
// Students have NOT seen translate(), rotate(), sin(), or cos() before U4LA4.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const U3 = CC.u3;
  const { tok } = kit;
  const { slot, choice } = U;

  const U4 = {};
  CC.u4 = U4;

  U4.lesson = (id, title, file, minutes, questions, notYetTaught, slots) => CC.defineLesson({
    id,
    title,
    unit: 4,
    source: `curriculum/04-unit-4/${file}`,
    defaults: {
      minutes, questions, attempts: 2, practice: false,
    },
    notYetTaught,
    slots,
    priority: slots.map((s) => s.id),
  });

  U4.REASONS = [
    'The value never changes, so nothing moves.',
    'This changes the value in the wrong direction.',
    'Without this., the value is not stored on the object.',
    'This word is misspelled, so it does not do its job.',
    'A class needs the word new to make an object.',
    'This calls something that was never defined on the object.',
    'This setting stays on for everything drawn after it.',
    'The values are in the wrong order, or use the wrong units.',
    'Resetting this on every frame keeps it from ever changing.',
  ];
  U4.bug = (r, {
    prompt, code, fixed, line, why, explain, vectors, kind,
  }) => {
    const reason = U4.REASONS[why];
    return kit.bugQuestion(r, {
      prompt: `${prompt} ${U.FIND_BUG}`,
      code,
      bugLines: Array.isArray(line) ? line : [line],
      why: reason,
      others: r.sample(U4.REASONS.filter((t) => t !== reason), 3),
      fixed,
      spec: { kind: kind || 'snippet', vectors: vectors || [{}] },
      explain,
    });
  };
  U4.frames = (n) => ({ frames: Array.from({ length: n }, () => ({})) });
  // What a value holds after the sketch has run for some frames.
  U4.after = ({ prompt, code, expr, n, explain }) => kit.printedNumber({
    prompt, code, run: `${code.join('\n')}\nfunction __report(){\n  console.log(${expr})\n}`, vec: U4.frames(n), kind: 'sketch', explain,
  });

  const noTransforms = [[/\btranslate\(|\brotate\(|\bsin\(|\bcos\(/, 'transformations and trig (U4LA4 and U4LA5)']];
  const noClasses = noTransforms.concat([[/\bclass\s|\bnew\s|\bthis\./, 'classes (U4LA2)']]);
  const OBJ = ['circ1', 'ball', 'dot', 'bubble'];
  const motion = (name, x, step, op) => [`let ${name} = {`, `  x: ${x}`, '}', 'function draw(){', `  ${name}.x = ${name}.x ${op} ${step}`, `  ellipse(${name}.x, 60, 20, 20)`, '}'];

  U4.lesson('U4LA1.1', 'Intro to Motion with Flipbooks', '02-U4LA1.1-Intro-to-Motion-with-Flipbooks.md', 12, 8, noClasses, [
    slot('terms', 'concepts', 'Knowing the words for animation', {
      match(r) {
        return U3.rows(r, 'Which word matches each description?', [['A single image in an animation', 0], ['How many images are shown each second', 1], ['Frames between major frames that create movement', 2]], ['frame', 'frame rate', 'tweens'], 'p5 works like a digital flipbook.', undefined, 'Description');
      },
      illusion(r) {
        return choice(r, 'What makes a flipbook seem to move?', 'Slightly different images flipped through quickly', ['Each page physically moves', 'The drawings are colored in', 'Only the first and last pages'], 'Small changes shown quickly look like motion.');
      },
      drawLoop(r) {
        return choice(r, 'How is draw() like a flipbook?', 'Each time it runs, it draws one new frame', ['It only runs once', 'It draws every frame at the same time', 'It can only draw circles'], 'Change a value between frames, and things appear to move.');
      },
    }),
    slot('speed', 'concepts', 'Knowing how to change the speed of motion', {
      faster(r) {
        const a = r.int(1, 3); const b = a + r.int(2, 6);
        return choice(r, `Which line moves the ball fastest?`, `ball.x = ball.x + ${b}`, [`ball.x = ball.x + ${a}`, 'ball.x = ball.x + 0', `ball.x = ${b}`], 'Adding more on each frame moves it faster.', { codeOptions: true });
      },
      left(r) {
        const s = r.int(1, 5);
        return choice(r, `Which line moves the ball to the left?`, `ball.x = ball.x - ${s}`, [`ball.x = ball.x + ${s}`, `ball.y = ball.y + ${s}`, `ball.x = ${s}`], 'x gets smaller going left.', { codeOptions: true });
      },
      rate(r) {
        const fps = r.pick([10, 20, 30, 60]);
        return kit.numberQuestion({ prompt: `A sketch uses frameRate(${fps}), and adds 1 to x on each frame. How far does x move in 2 seconds?`, answer: fps * 2, explain: `${fps} frames per second, for 2 seconds.` });
      },
    }),
    slot('trace', 'flow', 'Working out a position after several frames', {
      adds(r) {
        const name = r.pick(OBJ); const x = 10 * r.int(0, 20); const s = r.int(1, 6); const n = r.int(3, 9);
        return U4.after({ prompt: `After ${n} frames, what does ${name}.x hold?`, code: motion(name, x, s, '+'), expr: `${name}.x`, n, explain: `Start at ${x}, and add ${s} on each frame.` });
      },
      subtracts(r) {
        const name = r.pick(OBJ); const x = 10 * r.int(20, 40); const s = r.int(1, 6); const n = r.int(3, 9);
        return U4.after({ prompt: `After ${n} frames, what does ${name}.x hold?`, code: motion(name, x, s, '-'), expr: `${name}.x`, n, explain: `Start at ${x}, and subtract ${s} on each frame.` });
      },
      howFar(r) {
        const s = r.int(2, 6); const x = 10 * r.int(1, 8); const n = r.int(3, 8);
        const code = motion('ball', x, s, '+');
        const run = `${code.join('\n')}\nfunction __report(){\n  console.log(ball.x - ${x})\n}`;
        return kit.printedNumber({ prompt: `How far has the ball moved after ${n} frames?`, code, run, vec: U4.frames(n), kind: 'sketch', explain: `${s} per frame, for ${n} frames.` });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in motion code', {
      noStore(r) {
        const s = r.int(1, 6); const x = 10 * r.int(1, 9);
        const lines = (l) => [`let ball = {`, `  x: ${x}`, '}', 'function draw(){', `  ${l}`, '  console.log(ball.x)', '}'];
        return U4.bug(r, { prompt: 'The ball should move to the right.', code: lines(`ball.x + ${s}`), fixed: lines(`ball.x = ball.x + ${s}`), line: 4, why: 0, kind: 'sketch', explain: 'The new value has to be stored.' });
      },
      reset(r) {
        const s = r.int(1, 6); const x = 10 * r.int(1, 9);
        const body = [`  ball.x = ball.x + ${s}`, '  console.log(ball.x)', '}'];
        return U4.bug(r, { prompt: 'The ball should keep moving to the right, but it stays in one place.', code: ['let ball', 'function draw(){', `  ball = { x: ${x} }`].concat(body), fixed: ['let ball', 'function setup(){', `  ball = { x: ${x} }`, '}', 'function draw(){'].concat(body), line: 2, why: 8, kind: 'sketch', explain: 'Give it its starting value in setup(), which runs once.' });
      },
      wrongWay(r) {
        const s = r.int(1, 6); const x = 10 * r.int(20, 40);
        const lines = (op) => [`let ball = {`, `  x: ${x}`, '}', 'function draw(){', `  ball.x = ball.x ${op} ${s}`, '  console.log(ball.x)', '}'];
        return U4.bug(r, { prompt: 'The ball should move to the left.', code: lines('+'), fixed: lines('-'), line: 4, why: 1, kind: 'sketch', explain: 'Going left means x gets smaller.' });
      },
    }),
    slot('blanks', 'build', 'Completing motion code', {
      move(r) {
        const name = r.pick(OBJ); const s = r.int(1, 6); const x = 10 * r.int(0, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${name} moves right by ${s} on each frame.`, lines: [[`let ${name} = {`], [`  x: ${x}`], ['}'], ['function ', tok('draw', 'f'), '(){'], [`  ${name}.x = `, tok(`${name}.x`, 'v'), ' ', tok('+', 'o'), ' ', tok(s, 'n')], [`  ellipse(${name}.x, 60, 20, 20)`], ['}']], must: ['f', 'o'], count: 3, pools: { f: ['setup', 'preload'], v: ['width', 'mouseX'], o: ['-', '*'], n: [s + 5] }, spec: { kind: 'sketch', vectors: [{ width: 400, mouseX: 3 }] }, explain: 'draw() repeats, so the value keeps growing.' });
      },
      setup(r) {
        const x = 10 * r.int(0, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so x starts at ${x} once, and then grows on every frame.`, lines: [['let x'], ['function ', tok('setup', 'f'), '(){'], ['  x = ', tok(x, 'n')], ['}'], ['function ', tok('draw', 'f'), '(){'], ['  x = x + 1'], ['  ellipse(x, 60, 20, 20)'], ['}']], must: ['f'], count: 2, pools: { f: ['mousePressed', 'preload'], n: [x + 5] }, spec: { kind: 'sketch', vectors: [{}] }, explain: 'Starting values go in setup(), and changes go in draw().' });
      },
      frame(r) {
        const fps = r.pick([10, 20, 30]);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the sketch runs at ${fps} frames per second, and x goes up by 2.`, lines: [['let x = 0'], [tok('frameRate', 'f'), '(', tok(fps, 'n'), ')'], ['function draw(){'], ['  x = x + ', tok(2, 'n')], ['}'], ['function __report(){'], ['  console.log(x)'], ['}']], must: ['n'], count: 2, pools: { f: ['fill', 'rect'], n: [fps + 5, 5] }, spec: { kind: 'sketch', vectors: [{}] }, explain: 'frameRate() sets the number of frames per second.' });
      },
    }),
    slot('parsons', 'build', 'Putting motion code in order', {
      whole(r) {
        const x = 10 * r.int(0, 9); const s = r.int(1, 6);
        return U3.parsons(r, [`In setup(), start ball at x = ${x}.`, `In draw(), paint a background, add ${s} to ball.x, and draw the ball.`], ['function setup(){', `ball = { x: ${x} }`, '}', 'function draw(){', 'background(0)', `ball.x = ball.x + ${s}`, 'ellipse(ball.x, 60, 20, 20)'], 'The background goes first, so it doesn\'t cover the ball.', [{ text: 'let ball' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      two(r) {
        const s = r.int(1, 6);
        return U3.parsons(r, ['Paint a background.', `Move a to the right by ${s}.`, `Move b to the left by ${s}.`, 'Draw a, and then draw b.'], ['background(0)', `a.x = a.x + ${s}`, `b.x = b.x - ${s}`, 'ellipse(a.x, 50, 20, 20)', 'ellipse(b.x, 100, 20, 20)'], 'Each object has its own values.', [{ text: 'let a = { x: 0 }' }, { text: 'let b = { x: 400 }' }, { text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      setRate(r) {
        const fps = r.pick([10, 20, 30]);
        return U3.parsons(r, [`In setup(), make a canvas, and set the frame rate to ${fps}.`, 'In draw(), paint a background, move the ball, and draw it.'], ['function setup(){', 'createCanvas(400, 400)', `frameRate(${fps})`, '}', 'function draw(){', 'background(0)', 'ball.x = ball.x + 1', 'ellipse(ball.x, 60, 20, 20)'], 'Settings go in setup(), since they only need to run once.', [{ text: 'let ball = { x: 0 }' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
    }),
  ]);

  const bouncer = (x, spd, w, code) => [`let ball = {`, `  x: ${x},`, `  xSpd: ${spd}`, '}', 'function draw(){', '  ball.x += ball.xSpd', `  if(ball.x > ${w} || ball.x < 0){`, '    ball.xSpd *= -1', '  }'].concat(code || [], ['}']);

  U4.lesson('U4LA1.2', 'Move in All Directions && Make it Bounce', '03-U4LA1.2-Move-in-All-Directions-and-Make-it-Bounce.md', 15, 9, noClasses, [
    slot('operators', 'concepts', 'Knowing the assignment operators', {
      same(r) {
        const n = r.int(2, 9);
        return U3.rows(r, 'Which shorter form matches each line?', [[`x = x + ${n}`, 0], [`x = x - ${n}`, 1], [`x = x * ${n}`, 2], [`x = x / ${n}`, 3]], [`x += ${n}`, `x -= ${n}`, `x *= ${n}`, `x /= ${n}`], 'These do the same thing, and are just shorter.', undefined, 'Code');
      },
      direction(r) {
        const s = r.int(1, 5);
        return U3.rows(r, 'Which way does the ball move?', [[`ball.x += ${s}`, 0], [`ball.x -= ${s}`, 1], [`ball.y += ${s}`, 2], [`ball.y -= ${s}`, 3]], ['right', 'left', 'down', 'up'], 'y grows going down the canvas.', undefined, 'Code');
      },
      flip(r) {
        return choice(r, 'What does xSpd *= -1 do?', 'It reverses the direction of the motion', ['It stops the motion', 'It makes the motion twice as fast', 'It moves the object to x = -1'], 'Multiplying by -1 flips the sign of the speed.');
      },
    }),
    slot('diagonal', 'flow', 'Working out diagonal motion', {
      both(r) {
        const a = r.int(1, 5); const b = r.int(1, 5); const n = r.int(2, 6);
        const code = ['let ball = {', '  x: 0,', '  y: 0', '}', 'function draw(){', `  ball.x += ${a}`, `  ball.y += ${b}`, '}'];
        return U4.after({ prompt: `After ${n} frames, what does ball.y hold?`, code, expr: 'ball.y', n, explain: `It gets ${b} added on each frame.` });
      },
      useSpeed(r) {
        const s = r.int(2, 9); const x = 10 * r.int(10, 30); const n = r.int(2, 6);
        const code = ['let ball = {', `  x: ${x},`, `  xSpd: ${s}`, '}', 'function draw(){', '  ball.x -= ball.xSpd', '}'];
        return U4.after({ prompt: `After ${n} frames, what does ball.x hold?`, code, expr: 'ball.x', n, explain: 'The speed is subtracted on each frame.' });
      },
      kind(r) {
        const a = r.int(1, 5); const b = r.int(1, 5);
        return choice(r, 'What path does this ball take?', 'Diagonal, moving down and to the right', ['Straight to the right', 'Straight down', 'Diagonal, moving up and to the left'], 'x and y both grow.', { code: [`ball.x += ${a}`, `ball.y += ${b}`] });
      },
    }),
    slot('bounce', 'flow', 'Following a bounce', {
      speedAfter(r) {
        const spd = r.pick([2, 3, 5]); const w = 10 * r.int(5, 10); const x = w - spd;
        const n = 2;
        const code = bouncer(x, spd, w);
        return U4.after({ prompt: `After ${n} frames, what does ball.xSpd hold?`, code, expr: 'ball.xSpd', n, explain: 'The ball passes the edge on the second frame, so the speed flips.' });
      },
      positionAfter(r) {
        const spd = r.pick([2, 3, 5]); const w = 10 * r.int(5, 10); const x = w - spd; const n = 3;
        const code = bouncer(x, spd, w);
        return U4.after({ prompt: `After ${n} frames, what does ball.x hold?`, code, expr: 'ball.x', n, explain: 'Go frame by frame: it goes past the edge, flips, and comes back.' });
      },
      notYet(r) {
        const spd = r.pick([2, 3, 5]); const w = 10 * r.int(20, 30); const x = 10 * r.int(1, 5); const n = r.int(2, 5);
        const code = bouncer(x, spd, w);
        return U4.after({ prompt: `After ${n} frames, what does ball.xSpd hold?`, code, expr: 'ball.xSpd', n, explain: 'It hasn\'t reached an edge yet, so the speed stays the same.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in bouncing', {
      noFlip(r) {
        const w = 10 * r.int(8, 30); const spd = r.pick([3, 5, 7]);
        const fixed = bouncer(w - 10, spd, w, ['  console.log(ball.x)']);
        const code = fixed.slice(); code[7] = '    ball.xSpd *= 1';
        return U4.bug(r, { prompt: `The ball should bounce at x = ${w}, but goes off the edge.`, code, fixed, line: 7, why: 1, kind: 'sketch', vectors: [U4.frames(8)], explain: 'Multiply by -1 to reverse the direction.' });
      },
      overwrite(r) {
        const s = r.int(2, 9);
        const lines = (l) => ['let ball = {', '  x: 0,', `  xSpd: ${s}`, '}', 'function draw(){', `  ${l}`, '  console.log(ball.x)', '}'];
        return U4.bug(r, { prompt: 'The ball should keep moving at its speed, but it stays in one spot.', code: lines('ball.x = ball.xSpd'), fixed: lines('ball.x += ball.xSpd'), line: 5, why: 0, kind: 'sketch', explain: 'Add the speed, rather than replacing the position with it.' });
      },
      upDown(r) {
        const s = r.int(2, 9);
        const lines = (l) => ['let ball = {', '  y: 200', '}', 'function draw(){', `  ${l}`, '  console.log(ball.y)', '}'];
        return U4.bug(r, { prompt: 'The ball should move up the canvas.', code: lines(`ball.y += ${s}`), fixed: lines(`ball.y -= ${s}`), line: 4, why: 1, kind: 'sketch', explain: 'y gets smaller going up.' });
      },
    }),
    slot('blanks', 'build', 'Completing bouncing code', {
      flip(r) {
        const w = 10 * r.int(10, 40); const s = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the ball bounces when x goes past ${w} or below 0.`, lines: [['let ball = {'], [`  x: ${w - s},`], [`  xSpd: ${s}`], ['}'], ['function draw(){'], ['  ball.x ', tok('+=', 'o'), ' ball.xSpd'], ['  if(ball.x > ', tok(w, 'n'), ' ', tok('||', 'c'), ' ball.x < 0){'], ['    ball.xSpd ', tok('*=', 'p'), ' -1'], ['  }'], ['  console.log(ball.x)'], ['}']], must: ['c', 'p'], count: 3, pools: { o: ['-=', '='], n: [w + 50], c: ['&&'], p: ['+=', '='] }, spec: { kind: 'sketch', vectors: [U4.frames(5)] }, explain: 'Either edge can trigger the bounce, and multiplying by -1 reverses it.' });
      },
      direction(r) {
        const a = r.int(2, 9); const b = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the ball moves left by ${a} and down by ${b}.`, lines: [['let ball = {'], ['  x: 200,'], ['  y: 200'], ['}'], ['function draw(){'], ['  ball.', tok('x', 'a'), ' ', tok('-=', 'o'), ' ', tok(a, 'n')], ['  ball.y ', tok('+=', 'o'), ' ', tok(b, 'n')], ['  console.log(ball.x, ball.y)'], ['}']], must: ['o', 'n'], count: 3, pools: { a: ['size'], o: ['*=', '/='], n: [a + b + 3] }, spec: { kind: 'sketch', vectors: [{}] }, explain: 'Left makes x smaller, and down makes y bigger.' });
      },
      shorter(r) {
        const n = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code using the shorter operators, so size goes up by ${n}, and is then doubled.`, lines: [['let size = 10'], ['size ', tok('+=', 'o'), ' ', tok(n, 'n')], ['size ', tok('*=', 'o'), ' 2'], ['console.log(size)']], must: ['o'], count: 2, pools: { o: ['-=', '/='], n: [n + 2] }, spec: U.spec(), explain: '+= adds, and *= multiplies.' });
      },
    }),
    slot('parsons', 'build', 'Putting bouncing code in order', {
      bounce(r) {
        const w = 10 * r.int(10, 40); const s = r.int(2, 9);
        return U3.parsons(r, ['Move the ball by its speed.', `If it goes past ${w} or below 0, reverse its speed.`, 'Then draw the ball.'], ['ball.x += ball.xSpd', `if(ball.x > ${w} || ball.x < 0){`, 'ball.xSpd *= -1', '}', 'ellipse(ball.x, 100, 20, 20)'], 'The reversal goes inside the if.', [{ text: `let ball = { x: ${w - s}, xSpd: ${s} }` }, { text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [U4.frames(5)] });
      },
      diagonal(r) {
        const a = r.int(2, 9); const b = r.int(2, 9);
        return U3.parsons(r, ['Paint a background.', `Move the ball right by ${a}.`, `Move it down by ${b}.`, 'Draw it, and then print its x.'], ['background(0)', `ball.x += ${a}`, `ball.y += ${b}`, 'ellipse(ball.x, ball.y, 20, 20)', 'console.log(ball.x)'], 'Positions change first, and then the ball gets drawn in its new spot.', [{ text: 'let ball = { x: 0, y: 0 }' }, { text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      random(r) {
        const s = r.int(2, 9);
        return U3.parsons(r, ['In setup(), give ball a random x below the width.', `Set its speed to ${s}.`, 'In draw(), move it by its speed, and draw it.'], ['function setup(){', 'ball.x = random(width)', `ball.xSpd = ${s}`, '}', 'function draw(){', 'ball.x += ball.xSpd', 'ellipse(ball.x, 100, 20, 20)'], 'Random starting values go in setup(), so that they stay put.', [{ text: 'let ball = {}' }], [{ text: '}' }], { kind: 'sketch', vectors: [{ width: 400 }] });
      },
    }),
  ]);

  // ---- Classes ----
  const THINGS = [
    { cls: 'Minion', a: 'name', b: 'eyes', fixedKey: 'color', fixedVal: 'yellow', av: 'Bob', bv: 2 },
    { cls: 'Student', a: 'name', b: 'grade', fixedKey: 'school', fixedVal: 'CS University', av: 'Ana', bv: 10 },
    { cls: 'Car', a: 'brand', b: 'wheels', fixedKey: 'status', fixedVal: 'parked', av: 'Ford', bv: 4 },
    { cls: 'Pet', a: 'name', b: 'age', fixedKey: 'kind', fixedVal: 'cat', av: 'Coco', bv: 3 },
  ];
  const pick = (r) => {
    const t = r.pick(THINGS);
    return { ...t, av: r.pick([t.av, 'Sam', 'Lee', 'Max']), bv: t.bv + r.int(0, 6), v: r.pick(['one', 'first', 'item', 'thing']) };
  };
  const ctor = (t) => [`class ${t.cls}{`, `  constructor(the${t.a}, the${t.b}){`, `    this.${t.a} = the${t.a}`, `    this.${t.b} = the${t.b}`, `    this.${t.fixedKey} = "${t.fixedVal}"`, '  }', '}'];
  const make = (t) => `let ${t.v} = new ${t.cls}("${t.av}", ${t.bv})`;
  const noMethods = noTransforms.concat([[/\bdisplay\(|\bmove\(/, 'methods (U4LA2.3)']]);
  const classParsons = (t, rules, extra, explain) => (r) => U3.parsons(r, rules, ctor(t).slice(1).map((l) => l.trim()).concat(extra), explain, [{ text: `class ${t.cls}{` }]);

  U4.lesson('U4LA2.1', 'Introduction to Classes and Objects', '04-U4LA2.1-Introduction-to-Classes-and-Objects.md', 15, 9, noMethods, [
    slot('terms', 'concepts', 'Telling classes and objects apart', {
      waffle(r) {
        const [m, o] = r.pick([['a waffle maker', 'a waffle'], ['a cookie cutter', 'a cookie'], ['a blueprint', 'a house']]);
        return U3.rows(r, 'In this comparison, which is the class, and which is the object?', [[m, 0], [o, 1]].concat([['Car, as a general idea', 0], ['My neighbor\'s red car', 1]]), ['class', 'object'], 'A class is a template, and an object is made from it.', undefined, 'Example');
      },
      constructorMeaning(r) {
        return choice(r, 'When does the constructor run?', 'Automatically, when a new object is created', ['Only when you call it by name', 'On every frame', 'When the class is deleted'], 'It sets up the new object\'s attributes.');
      },
      thisMeaning(r) {
        const t = pick(r);
        return choice(r, `What does this mean in this.${t.a}?`, 'The object being made or used', ['The class name', 'The canvas', 'The previous object'], 'Each object keeps its own values.', { code: ctor(t) });
      },
    }),
    slot('parts', 'concepts', 'Reading a class', {
      names(r) {
        const t = pick(r);
        return U3.rows(r, 'Where does each attribute get its value?', [[`${t.a}`, 0], [`${t.b}`, 0], [`${t.fixedKey}`, 1]], ['a value passed in', 'a default in the constructor'], 'Some attributes vary, and some are the same for every object.', ctor(t), 'Attribute');
      },
      capital(r) {
        const t = pick(r);
        return choice(r, `Why is ${t.cls} capitalized?`, 'Class names usually start with a capital letter', ['p5 only reads capital letters', 'It is a string', 'Variables must be capitalized'], 'It helps tell classes apart from variables.');
      },
      howMake(r) {
        const t = pick(r);
        return choice(r, 'Which line correctly makes a new object from this class?', `let pal = new ${t.cls}("${t.av}", ${t.bv})`, [`let pal = ${t.cls}("${t.av}", ${t.bv})`, `new pal = ${t.cls}("${t.av}", ${t.bv})`, `let ${t.cls} = new pal("${t.av}", ${t.bv})`], 'Use the word new, then the class name, and then the values.', { code: ctor(t), codeOptions: true });
      },
    }),
    slot('trace', 'flow', 'Tracing a new object', {
      number(r) {
        const t = pick(r);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ctor(t).concat([make(t), `console.log(${t.v}.${t.b})`]), explain: 'The second value goes to the second parameter, and gets stored on the object.' });
      },
      fixed(r) {
        const t = pick(r);
        const code = ctor(t).concat([make(t), `console.log(${t.v}.${t.fixedKey})`]);
        return kit.traceChoice(r, { code, wrong: [[t.av], [String(t.bv)], ['undefined'], [t.fixedVal]], explain: 'Defaults are the same for every object.' });
      },
      two(r) {
        const t = pick(r); const b2 = t.bv + r.int(1, 9);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ctor(t).concat([make(t), `let other = new ${t.cls}("Kim", ${b2})`, `console.log(other.${t.b} + ${t.v}.${t.b})`]), explain: 'Each object has its own values.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in classes', {
      noThis(r) {
        const t = pick(r); const fixed = ctor(t).concat([make(t), `console.log(${t.v}.${t.a})`]); const code = fixed.slice(); code[2] = `    ${t.a} = the${t.a}`;
        return U4.bug(r, { prompt: `The object should hold its ${t.a}.`, code, fixed, line: 2, why: 2, explain: `It should be this.${t.a} = the${t.a}.` });
      },
      misspelled(r) {
        const t = pick(r); const fixed = ctor(t).concat([make(t), `console.log(${t.v}.${t.a})`]); const code = fixed.slice(); code[1] = code[1].replace('constructor', 'construtor');
        return U4.bug(r, { prompt: `The object's ${t.a} should be "${t.av}", but it prints undefined.`, code, fixed, line: 1, why: 3, explain: 'It must be spelled constructor.' });
      },
      noNew(r) {
        const t = pick(r); const fixed = ctor(t).concat([make(t), `console.log(${t.v}.${t.a})`]); const code = fixed.slice(); code[7] = code[7].replace('new ', '');
        return U4.bug(r, { prompt: 'This should make an object.', code, fixed, line: 7, why: 4, explain: 'Classes need new.' });
      },
    }),
    slot('blanks', 'build', 'Completing a class', {
      fill(r) {
        const t = pick(r);
        return kit.blanksQuestion(r, { prompt: `Complete the class so each ${t.cls} stores its ${t.a} and ${t.b}, and then make one.`, lines: [[tok('class', 'k'), ` ${t.cls}{`], [`  constructor(the${t.a}, the${t.b}){`], ['    ', tok('this', 't'), `.${t.a} = the${t.a}`], ['    ', tok('this', 't'), `.${t.b} = the${t.b}`], ['  }'], ['}'], [`let ${t.v} = `, tok('new', 'n'), ` ${t.cls}("${t.av}", ${t.bv})`], [`console.log(${t.v}.${t.a}, ${t.v}.${t.b})`]], must: ['t', 'n'], count: 3, pools: { k: ['function', 'let'], t: ['self', 'class'], n: ['let', 'make'] }, spec: U.spec(), explain: 'this stores values on the object, and new makes one.' });
      },
      defaults(r) {
        const t = pick(r);
        return kit.blanksQuestion(r, { prompt: `Complete the constructor so ${t.fixedKey} always starts as "${t.fixedVal}".`, lines: [[`class ${t.cls}{`], ['  constructor(){'], ['    this.', tok(t.fixedKey, 'p'), ' = ', tok(`"${t.fixedVal}"`, 'v')], ['  }'], ['}'], [`let ${t.v} = new ${t.cls}()`], [`console.log(${t.v}.${t.fixedKey})`]], must: ['p', 'v'], count: 2, pools: { p: ['size', 'width'], v: [t.fixedVal, '"none"'] }, spec: U.spec(), explain: 'A default doesn\'t need a parameter.' });
      },
      call(r) {
        const t = pick(r);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it makes a ${t.cls} with ${t.a} "${t.av}" and ${t.b} ${t.bv}.`, lines: ctor(t).map((l) => [l]).concat([[`let ${t.v} = new `, tok(t.cls, 'c'), '(', tok(`"${t.av}"`, 'a'), ', ', tok(t.bv, 'a'), ')'], [`console.log(${t.v}.${t.a}, ${t.v}.${t.b})`]]), must: ['c', 'a'], count: 3, pools: { c: ['class', t.v], a: [t.av, t.bv + 3] }, spec: U.spec(), explain: 'Values go in the same order as the parameters.' });
      },
    }),
    slot('parsons', 'build', 'Putting a class in order', {
      a(r) {
        const t = pick(r);
        return classParsons(t, [`Make the constructor take the${t.a} and the${t.b}.`, `Store ${t.a}, then ${t.b}, then set ${t.fixedKey} to "${t.fixedVal}".`, 'Close the class.', 'Make an object.'], [make(t)], 'The constructor goes inside the class, and the object gets made after it.')(r);
      },
      b(r) {
        const t = pick(r);
        return classParsons(t, [`Build the constructor for ${t.a} and ${t.b}, with a default ${t.fixedKey}.`, 'Make an object, and then print its first attribute.'], [make(t), `console.log(${t.v}.${t.a})`], 'A class has to be finished before you can use it.')(r);
      },
      c(r) {
        const t = pick(r);
        return classParsons(t, ['Build the constructor.', 'Make an object.', `Print its ${t.b}, and then its ${t.fixedKey}.`], [make(t), `console.log(${t.v}.${t.b})`, `console.log(${t.v}.${t.fixedKey})`], 'Print after the object exists.')(r);
      },
    }),
  ]);

  // Lessons from here on share a class with a method.
  const counter = (t, step) => [`class ${t.cls}{`, `  constructor(the${t.b}){`, `    this.${t.b} = the${t.b}`, '  }', '  grow(){', `    this.${t.b} += ${step}`, '  }', '}'];

  U4.lesson('U4LA2.2', 'Reading and Updating Object Properties', '05-U4LA2.2-Reading-and-Updating-Object-Properties.md', 12, 8, noMethods, [
    slot('read', 'concepts', 'Knowing how to read and update properties', {
      syntaxRead(r) {
        const t = pick(r);
        return choice(r, `Which prints the ${t.a} of ${t.v}?`, `console.log(${t.v}.${t.a})`, [`console.log(${t.cls}.${t.a})`, `console.log(this.${t.a})`, `console.log(${t.a}.${t.v})`], 'Use the object name, a dot, and the property.', { codeOptions: true });
      },
      syntaxWrite(r) {
        const t = pick(r);
        return choice(r, `Which changes the ${t.b} of ${t.v}?`, `${t.v}.${t.b} = ${t.bv + 1}`, [`${t.cls}.${t.b} = ${t.bv + 1}`, `this.${t.b} == ${t.bv + 1}`, `${t.v}(${t.b}) = ${t.bv + 1}`], 'Assign to the object\'s property.', { codeOptions: true });
      },
      independent(r) {
        return choice(r, 'Two objects come from one class. You change a property on the first. What happens to the second?', 'Nothing, since each object has its own values', ['It changes too', 'It gets deleted', 'It causes an error'], 'Objects share a template, but not their values.');
      },
    }),
    slot('trace', 'flow', 'Tracing updates to properties', {
      update(r) {
        const t = pick(r); const n = r.int(1, 9);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ctor(t).concat([make(t), `${t.v}.${t.b} = ${t.v}.${t.b} + ${n}`, `console.log(${t.v}.${t.b})`]), explain: 'Read the old value, add to it, and store it.' });
      },
      twoObjects(r) {
        const t = pick(r); const n = r.int(1, 9);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ctor(t).concat([make(t), `let other = new ${t.cls}("Kim", ${t.bv + 5})`, `${t.v}.${t.b} = ${n}`, `console.log(other.${t.b})`]), explain: 'Only the first object changed.' });
      },
      newProp(r) {
        const t = pick(r); const n = r.int(1, 99);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ctor(t).concat([make(t), `${t.v}.score = ${n}`, `console.log(${t.v}.score)`]), explain: 'You can add a new property to an object after it is made.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in property code', {
      className(r) {
        const t = pick(r); const n = t.bv + r.int(1, 9); const base = ctor(t).concat([make(t)]);
        return U4.bug(r, { prompt: `This should set the ${t.b} of ${t.v}.`, code: base.concat([`${t.cls}.${t.b} = ${n}`, `console.log(${t.v}.${t.b})`]), fixed: base.concat([`${t.v}.${t.b} = ${n}`, `console.log(${t.v}.${t.b})`]), line: base.length, why: 5, explain: 'Use the object\'s name, not the class\'s.' });
      },
      comma(r) {
        const t = pick(r); const fixed = ctor(t).concat([make(t), `console.log(${t.v}.${t.fixedKey})`]); const code = fixed.slice(); code[4] = `    this,${t.fixedKey} = "${t.fixedVal}"`;
        return U4.bug(r, { prompt: `The object should hold its ${t.fixedKey}.`, code, fixed, line: 4, why: 2, explain: 'It needs a dot, not a comma.' });
      },
      compare(r) {
        const t = pick(r); const n = t.bv + r.int(1, 9); const base = ctor(t).concat([make(t)]);
        return U4.bug(r, { prompt: `This should change the ${t.b} to ${n}.`, code: base.concat([`${t.v}.${t.b} == ${n}`, `console.log(${t.v}.${t.b})`]), fixed: base.concat([`${t.v}.${t.b} = ${n}`, `console.log(${t.v}.${t.b})`]), line: base.length, why: 0, explain: 'Use one =, which stores a value.' });
      },
    }),
    slot('blanks', 'build', 'Completing property code', {
      update(r) {
        const t = pick(r); const n = r.int(1, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the ${t.b} of ${t.v} goes up by ${n}.`, lines: ctor(t).map((l) => [l]).concat([[make(t)], [tok(t.v, 'o'), '.', tok(t.b, 'p'), ' ', tok('+=', 's'), ' ', tok(n, 'n')], [`console.log(${t.v}.${t.b})`]]), must: ['o', 's'], count: 3, pools: { o: [t.cls, 'this'], p: [t.a], s: ['-=', '=='], n: [n + 2] }, spec: U.spec(), explain: 'Object, dot, property, and then the update.' });
      },
      read(r) {
        const t = pick(r);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it prints the ${t.a} of ${t.v}.`, lines: ctor(t).map((l) => [l]).concat([[make(t)], ['console.log(', tok(t.v, 'o'), '.', tok(t.a, 'p'), ')']]), must: ['o', 'p'], count: 2, pools: { o: [t.cls, 'this'], p: [t.b, t.fixedKey] }, spec: U.spec(), explain: 'Object, dot, property.' });
      },
      add(r) {
        const t = pick(r); const n = r.int(1, 99);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${t.v} gets a new property, score, of ${n}.`, lines: ctor(t).map((l) => [l]).concat([[make(t)], [`${t.v}.`, tok('score', 'p'), ' ', tok('=', 's'), ' ', tok(n, 'n')], [`console.log(${t.v}.score)`]]), must: ['p', 's'], count: 2, pools: { p: [t.a, 'total'], s: ['==', '+='], n: [n + 1] }, spec: U.spec(), explain: 'Assigning to a new name adds it.' });
      },
    }),
    slot('parsons', 'build', 'Putting property updates in order', {
      makeThenChange(r) {
        const t = pick(r); const n = r.int(1, 9);
        return U3.parsons(r, ['Make the object.', `Print its ${t.b}.`, `Change it to ${n + 20}.`, 'Print it again.', `Print its ${t.a}.`], [make(t), `console.log(${t.v}.${t.b})`, `${t.v}.${t.b} = ${n + 20}`, `console.log(${t.v}.${t.b})`, `console.log(${t.v}.${t.a})`], 'The order changes what gets printed.', ctor(t).map((text) => ({ text })));
      },
      two(r) {
        const t = pick(r);
        return U3.parsons(r, ['Make first with the values given.', 'Make second from the same class.', 'Change second\'s value to 99.', 'Print first\'s value, and then second\'s.'], [`let first = new ${t.cls}("${t.av}", ${t.bv})`, `let second = new ${t.cls}("Kim", 1)`, `second.${t.b} = 99`, `console.log(first.${t.b})`, `console.log(second.${t.b})`], 'Only the second object changes.', ctor(t).map((text) => ({ text })));
      },
      add(r) {
        const t = pick(r); const n = r.int(1, 99);
        return U3.parsons(r, ['Make the object.', `Add a score property of ${n}.`, 'Double the score.', 'Print the score, and then "Done".'], [make(t), `${t.v}.score = ${n}`, `${t.v}.score *= 2`, `console.log(${t.v}.score)`, 'console.log("Done")'], 'A property has to exist before it can be doubled.', ctor(t).map((text) => ({ text })));
      },
    }),
  ]);

  U4.lesson('U4LA2.3', 'Methods Off Canvas', '06-U4LA2.3-Methods-Off-Canvas.md', 15, 9, noTransforms, [
    slot('terms', 'concepts', 'Knowing what methods are', {
      meaning(r) {
        return choice(r, 'What is a method?', 'A function that is part of a class', ['A property that holds a number', 'A type of object', 'A comment in a class'], 'Objects of that class can use it.');
      },
      syntax(r) {
        return choice(r, 'How do you write a method in a class?', 'Name it with parentheses and curly brackets, without the word function', ['Start it with the word function', 'Start it with the word let', 'Put it after the end of the class'], 'updateEmail(newEmail){ is an example.');
      },
      call(r) {
        const t = pick(r);
        return choice(r, `How do you call grow() on ${t.v}?`, `${t.v}.grow()`, [`grow(${t.v})`, `${t.cls}.grow()`, `this.grow(${t.v})`], 'Object, dot, method, parentheses.', { codeOptions: true });
      },
    }),
    slot('trace', 'flow', 'Tracing method calls', {
      once(r) {
        const t = pick(r); const s = r.int(1, 9); const a = r.int(1, 30);
        return kit.printedNumber({ prompt: 'What number does this print?', code: counter(t, s).concat([`let ${t.v} = new ${t.cls}(${a})`, `${t.v}.grow()`, `console.log(${t.v}.${t.b})`]), explain: 'The method adds to this object\'s value.' });
      },
      many(r) {
        const t = pick(r); const s = r.int(1, 9); const a = r.int(1, 30); const n = r.int(2, 4);
        return kit.printedNumber({ prompt: 'What number does this print?', code: counter(t, s).concat([`let ${t.v} = new ${t.cls}(${a})`], Array.from({ length: n }, () => `${t.v}.grow()`), [`console.log(${t.v}.${t.b})`]), explain: `${n} calls, each adding ${s}.` });
      },
      other(r) {
        const t = pick(r); const s = r.int(1, 9); const a = r.int(1, 30); const b = r.int(31, 60);
        return kit.printedNumber({ prompt: 'What number does this print?', code: counter(t, s).concat([`let ${t.v} = new ${t.cls}(${a})`, `let other = new ${t.cls}(${b})`, `${t.v}.grow()`, 'console.log(other.' + t.b + ')']), explain: 'A method only changes the object it was called on.' });
      },
    }),
    slot('cart', 'flow', 'Following a method with an input', {
      addItem(r) {
        const a = r.int(2, 30); const b = r.int(2, 30);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['class Cart{', '  constructor(email){', '    this.email = email', '    this.total = 0', '  }', '  addCost(price){', '    this.total += price', '  }', '}', 'let cart = new Cart("a@b.com")', `cart.addCost(${a})`, `cart.addCost(${b})`, 'console.log(cart.total)'], explain: 'Each call adds its own price.' });
      },
      list(r) {
        const n = r.int(2, 5);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['class Cart{', '  constructor(){', '    this.itemList = []', '  }', '  addItem(item){', '    this.itemList.push(item)', '  }', '}', 'let cart = new Cart()'].concat(Array.from({ length: n }, (_, i) => `cart.addItem("item${i}")`), ['console.log(cart.itemList.length)']), explain: 'A property can hold an array.' });
      },
      update(r) {
        const [a, b] = r.sample(['a@b.com', 'me@x.org', 'hi@y.net', 'us@z.edu'], 2);
        const code = ['class Cart{', '  constructor(email){', '    this.email = email', '  }', '  updateEmail(newEmail){', '    this.email = newEmail', '  }', '}', `let cart = new Cart("${a}")`, `cart.updateEmail("${b}")`, 'console.log(cart.email)'];
        return kit.traceChoice(r, { code, wrong: [[a], ['newEmail'], ['undefined']], explain: 'The method replaces the stored value.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in methods', {
      noThis(r) {
        const t = pick(r); const s = r.int(1, 9); const a = r.int(1, 30);
        const fixed = counter(t, s).concat([`let ${t.v} = new ${t.cls}(${a})`, `${t.v}.grow()`, `console.log(${t.v}.${t.b})`]); const code = fixed.slice(); code[5] = `    ${t.b} += ${s}`;
        return U4.bug(r, { prompt: 'grow() should add to the object\'s value.', code, fixed, line: 5, why: 2, explain: 'Use this. inside a method.' });
      },
      noCall(r) {
        const t = pick(r); const s = r.int(1, 9); const a = r.int(1, 30);
        const fixed = counter(t, s).concat([`let ${t.v} = new ${t.cls}(${a})`, `${t.v}.grow()`, `console.log(${t.v}.${t.b})`]); const code = fixed.slice(); code[9] = `${t.v}.grows()`;
        return U4.bug(r, { prompt: 'This should grow the object once.', code, fixed, line: 9, why: 5, explain: 'The method is named grow.' });
      },
      withFunction(r) {
        const t = pick(r); const s = r.int(1, 9); const a = r.int(1, 30);
        const fixed = counter(t, s).concat([`let ${t.v} = new ${t.cls}(${a})`, `${t.v}.grow()`, `console.log(${t.v}.${t.b})`]); const code = fixed.slice(); code[4] = '  function grow(){';
        return U4.bug(r, { prompt: 'grow() should be a method of this class.', code, fixed, line: 4, why: 3, explain: 'Methods don\'t use the word function.' });
      },
    }),
    slot('blanks', 'build', 'Completing methods', {
      method(r) {
        const t = pick(r); const s = r.int(1, 9); const a = r.int(1, 30);
        return kit.blanksQuestion(r, { prompt: `Complete grow() so it adds ${s} to the object's ${t.b}, and then call it.`, lines: [[`class ${t.cls}{`], [`  constructor(the${t.b}){`], [`    this.${t.b} = the${t.b}`], ['  }'], ['  grow(){'], ['    ', tok('this', 't'), `.${t.b} `, tok('+=', 'o'), ' ', tok(s, 'n')], ['  }'], ['}'], [`let ${t.v} = new ${t.cls}(${a})`], [`${t.v}.`, tok('grow', 'm'), '()'], [`console.log(${t.v}.${t.b})`]], must: ['t', 'm'], count: 3, pools: { t: ['self', t.cls], o: ['-=', '='], n: [s + 2], m: ['setup', 'draw'] }, spec: U.spec(), explain: 'this. inside, and object-dot-method to call it.' });
      },
      input(r) {
        const a = r.int(2, 30);
        return kit.blanksQuestion(r, { prompt: `Complete addCost() so it adds its input to total, and call it with ${a}.`, lines: [['class Cart{'], ['  constructor(){'], ['    this.total = 0'], ['  }'], ['  addCost(', tok('price', 'p'), '){'], ['    this.total += ', tok('price', 'p')], ['  }'], ['}'], ['let cart = new Cart()'], ['cart.addCost(', tok(a, 'n'), ')'], ['console.log(cart.total)']], must: ['p'], count: 2, pools: { p: ['this', 'cart'], n: [a + 1] }, spec: U.spec(), explain: 'The parameter name has to match where it is used.' });
      },
      push(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete addItem() so it adds its input to itemList.', lines: [['class Cart{'], ['  constructor(){'], ['    this.itemList = ', tok('[]', 'e')], ['  }'], ['  addItem(item){'], ['    this.itemList.', tok('push', 'm'), '(', tok('item', 'v'), ')'], ['  }'], ['}'], ['let cart = new Cart()'], [`cart.addItem("${r.pick(['pen', 'hat', 'cup'])}")`], ['console.log(cart.itemList.length, cart.itemList[0])']], must: ['m', 'e'], count: 3, pools: { e: ['0', '""'], m: ['splice', 'indexOf'], v: ['this', 'cart'] }, spec: U.spec(), explain: 'Start with an empty array, and push onto it.' });
      },
    }),
    slot('parsons', 'build', 'Putting a method in order', {
      method(r) {
        const t = pick(r); const s = r.int(1, 9);
        return U3.parsons(r, [`After the constructor, add grow(), which adds ${s}.`, 'Close the class.', 'Make an object with 10.', 'Call grow(), and print the value.'], ['grow(){', `this.${t.b} += ${s}`, '}', '}', `let ${t.v} = new ${t.cls}(10)`, `${t.v}.grow()`, `console.log(${t.v}.${t.b})`], 'The method goes inside the class, after the constructor.', counter(t, s).slice(0, 4).map((text) => ({ text })));
      },
      cart(r) {
        const a = r.int(2, 30);
        return U3.parsons(r, ['Add addCost(price) to the class, adding price to total.', 'Close the class.', `Make a cart, and add ${a}.`, 'Print the total.'], ['addCost(price){', 'this.total += price', '}', '}', 'let cart = new Cart()', `cart.addCost(${a})`, 'console.log(cart.total)'], 'Methods get called after the object exists.', ['class Cart{', '  constructor(){', '    this.total = 0', '  }'].map((text) => ({ text })));
      },
      twoCalls(r) {
        const t = pick(r); const s = r.int(1, 9);
        return U3.parsons(r, ['Make the object with 5.', 'Print its value.', 'Call grow() twice.', 'Print its value again.'], [`let ${t.v} = new ${t.cls}(5)`, `console.log(${t.v}.${t.b})`, `${t.v}.grow()`, `${t.v}.grow()`, `console.log(${t.v}.${t.b})`], 'Each line uses what came before it.', counter(t, s).map((text) => ({ text })));
      },
    }),
  ]);

  const WIG = (cls, s) => [`class ${cls}{`, '  constructor(x, y){', '    this.x = x', '    this.y = y', `    this.xSpd = ${s}`, '  }', '  display(){', '    rect(this.x, this.y, 20, 20)', '  }', '  move(){', '    this.x += this.xSpd', '  }', '}'];
  const pickCls = (r) => r.pick(['Wiggler', 'Bubble', 'Blob', 'Critter']);

  U4.lesson('U4LA2.4', 'Objects on Canvas', '07-U4LA2.4-Objects-on-Canvas.md', 15, 9, noTransforms, [
    slot('where', 'concepts', 'Knowing where object code goes', {
      make(r) {
        const c = pickCls(r);
        return choice(r, `Where should you make a new ${c} that needs to keep moving?`, 'In setup(), so that it is only made once', [`In draw(), to make a new one on every frame`, 'Inside the class', 'In a comment'], 'Making it in draw() would keep resetting it.');
      },
      call(r) {
        return choice(r, 'Where should you call display() and move()?', 'In draw(), so they run on every frame', ['In setup(), so they run once', 'In the constructor only', 'Outside of all functions'], 'draw() repeats, which makes it animate.');
      },
      nothing(r) {
        const c = pickCls(r);
        return choice(r, `You make a new ${c}, but nothing appears on the canvas. Why?`, 'A new object doesn\'t draw itself until a drawing method is called', [`The class needs a capital letter`, 'The constructor has to be in draw()', 'Objects can\'t be drawn'], 'Call its display() method.');
      },
    }),
    slot('trace', 'flow', 'Tracing an object across frames', {
      x(r) {
        const c = pickCls(r); const s = r.int(1, 6); const a = 10 * r.int(1, 20); const n = r.int(2, 7);
        const code = WIG(c, s).concat(['let w', 'function setup(){', `  w = new ${c}(${a}, 50)`, '}', 'function draw(){', '  w.move()', '  w.display()', '}']);
        return U4.after({ prompt: `After ${n} frames, what does w.x hold?`, code, expr: 'w.x', n, explain: `move() adds ${s} on each frame.` });
      },
      noMove(r) {
        const c = pickCls(r); const s = r.int(1, 6); const a = 10 * r.int(1, 20); const n = r.int(2, 7);
        const code = WIG(c, s).concat(['let w', 'function setup(){', `  w = new ${c}(${a}, 50)`, '}', 'function draw(){', '  w.display()', '}']);
        return U4.after({ prompt: `After ${n} frames, what does w.x hold?`, code, expr: 'w.x', n, explain: 'move() is never called, so it stays put.' });
      },
      two(r) {
        const c = pickCls(r); const s = r.int(1, 6); const a = 10 * r.int(1, 20); const n = r.int(2, 7);
        const code = WIG(c, s).concat(['let w', 'let z', 'function setup(){', `  w = new ${c}(${a}, 50)`, `  z = new ${c}(${a}, 90)`, '}', 'function draw(){', '  w.move()', '  z.move()', '  z.move()', '}']);
        return U4.after({ prompt: `After ${n} frames, what does z.x hold?`, code, expr: 'z.x', n, explain: `z moves twice per frame, adding ${s} each time.` });
      },
    }),
    slot('bug', 'flow', 'Finding bugs with objects on the canvas', {
      inDraw(r) {
        const c = pickCls(r); const s = r.int(1, 6); const a = 10 * r.int(1, 20);
        const head = WIG(c, s).concat(['let w']);
        const tail = ['  w.move()', '  console.log(w.x)', '}'];
        return U4.bug(r, { prompt: 'The object should keep moving, but it stays in one place.', code: head.concat(['function draw(){', `  w = new ${c}(${a}, 50)`], tail), fixed: head.concat(['function setup(){', `  w = new ${c}(${a}, 50)`, '}', 'function draw(){'], tail), line: head.length + 1, why: 8, kind: 'sketch', explain: 'Make the object in setup(), which runs once.' });
      },
      noThis(r) {
        const c = pickCls(r); const s = r.int(1, 6); const a = 10 * r.int(1, 20);
        const fixed = WIG(c, s).concat([`let w = new ${c}(${a}, 50)`, 'w.display()']); const code = fixed.slice(); code[7] = '    rect(x, y, 20, 20)';
        return U4.bug(r, { prompt: 'display() should draw the object where it is.', code, fixed, line: 7, why: 2, explain: 'Use this.x and this.y.' });
      },
      wrongName(r) {
        const c = pickCls(r); const s = r.int(1, 6); const a = 10 * r.int(1, 20);
        const fixed = WIG(c, s).concat([`let w = new ${c}(${a}, 50)`, 'w.display()']); const code = fixed.slice(); code[14] = 'w.show()';
        return U4.bug(r, { prompt: 'This should draw the object.', code, fixed, line: 14, why: 5, explain: 'The method is named display.' });
      },
    }),
    slot('blanks', 'build', 'Completing an object on the canvas', {
      display(r) {
        const c = pickCls(r); const a = 10 * r.int(1, 20);
        return kit.blanksQuestion(r, { prompt: 'Complete display() so it draws the object at its position.', lines: [[`class ${c}{`], ['  constructor(x, y){'], ['    this.x = x'], ['    this.y = y'], ['  }'], ['  display(){'], ['    ellipse(', tok('this.x', 'p'), ', ', tok('this.y', 'p'), ', 20, 20)'], ['  }'], ['}'], [`let w = new ${c}(${a}, 50)`], ['w.', tok('display', 'm'), '()']], must: ['p', 'm'], count: 3, pools: { p: ['width', 'height'], m: ['draw', 'setup'] }, spec: U.spec([{ width: 400, height: 300 }]), explain: 'this. reads the object\'s own values.' });
      },
      sketchFlow(r) {
        const c = pickCls(r); const s = r.int(1, 6);
        return kit.blanksQuestion(r, { prompt: 'Complete the sketch so the object is made once, and then moves on every frame.', lines: WIG(c, s).map((l) => [l]).concat([['let w'], ['function ', tok('setup', 'f'), '(){'], ['  w = ', tok('new', 'n'), ` ${c}(10, 10)`], ['}'], ['function ', tok('draw', 'f'), '(){'], ['  w.', tok('move', 'm'), '()'], ['  w.display()'], ['}']]), must: ['f', 'm'], count: 3, pools: { f: ['preload', 'mousePressed'], n: ['class', 'make'], m: ['setup', 'draw'] }, spec: { kind: 'sketch', hiddenSuffix: ['function __report(){', '  console.log(w.x)', '}'], vectors: [{}] }, explain: 'setup() makes it, and draw() runs its methods.' });
      },
      move(r) {
        const c = pickCls(r); const s = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete move() so the object goes right by its speed of ${s}.`, lines: [[`class ${c}{`], ['  constructor(){'], ['    this.x = 0'], ['    this.xSpd = ', tok(s, 'n')], ['  }'], ['  move(){'], ['    ', tok('this.x', 'p'), ' ', tok('+=', 'o'), ' ', tok('this.xSpd', 'q')], ['  }'], ['}'], [`let w = new ${c}()`], ['w.move()'], ['console.log(w.x)']], must: ['p', 'o'], count: 3, pools: { n: [s + 3], p: ['x', 'width'], o: ['-=', '='], q: ['xSpd', 'width'] }, spec: U.spec([{ width: 400 }]), explain: 'Add the object\'s speed to its position.' });
      },
    }),
    slot('parsons', 'build', 'Putting an object sketch in order', {
      flow(r) {
        const c = pickCls(r); const s = r.int(1, 6);
        return U3.parsons(r, [`In setup(), make w, a new ${c} at (10, 50).`, 'In draw(), paint a background, move w, and display it.'], ['function setup(){', `w = new ${c}(10, 50)`, '}', 'function draw(){', 'background(220)', 'w.move()', 'w.display()'], 'Make it once, and then use it on every frame.', WIG(c, s).concat(['let w']).map((text) => ({ text })), [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      methodsBody(r) {
        const c = pickCls(r); const s = r.int(1, 6);
        return U3.parsons(r, ['Add display(), which draws at this.x and 50.', `Add move(), which adds ${s} to this.x.`, 'Close the class, make an object, and move it.'], ['display(){', 'rect(this.x, 50, 20, 20)', '}', 'move(){', `this.x += ${s}`, '}', '}', `let w = new ${c}()`, 'w.move()', 'w.display()'], 'Each method closes before the next one starts.', [`class ${c}{`, '  constructor(){', '    this.x = 0', '  }'].map((text) => ({ text })));
      },
      twoObjects(r) {
        const c = pickCls(r); const s = r.int(1, 6);
        return U3.parsons(r, ['In setup(), make a at (10, 50), and then b at (10, 90).', 'In draw(), move a, and then display a, and then display b.'], ['function setup(){', `a = new ${c}(10, 50)`, `b = new ${c}(10, 90)`, '}', 'function draw(){', 'a.move()', 'a.display()', 'b.display()'], 'Each object is separate.', WIG(c, s).concat(['let a', 'let b']).map((text) => ({ text })), [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
    }),
  ]);

  const BUB = ['class Bubble{', '  constructor(d){', '    this.d = d', '    this.x = 0', '  }', '  grow(){', '    this.d += 1', '  }', '  display(){', '    ellipse(this.x, 100, this.d, this.d)', '  }', '}'];

  U4.lesson('U4LA3.1', 'Creating Many Objects', '09-U4LA3.1-Creating-Many-Objects.md', 15, 9, noTransforms, [
    slot('why', 'concepts', 'Knowing why objects go in arrays', {
      list(r) {
        const n = r.pick([50, 100, 500]);
        return choice(r, `How would you make ${n} bubbles without ${n} separate variables?`, 'Store them in an array, using a for loop', [`Write ${n} lines of code`, 'Make one bubble very big', 'Use a bigger canvas'], 'A loop can fill the array, however long it needs to be.');
      },
      where(r) {
        return choice(r, 'Where should the loop that creates the objects go?', 'In setup(), so that they are only created once', ['In draw(), so that new ones appear every frame', 'In the class', 'In the constructor'], 'draw() would keep making more.');
      },
      each(r) {
        const m = r.pick(['display', 'move', 'animate']);
        return choice(r, `How do you run ${m}() on every object?`, `Loop over the array, calling bubbles[i].${m}()`, [`Call bubbles.${m}()`, `Call Bubble.${m}()`, `Call ${m}(bubbles)`], 'The array holds objects, and each object has the methods.');
      },
    }),
    slot('trace', 'flow', 'Tracing many objects', {
      howMany(r) {
        const n = r.int(2, 9);
        const code = BUB.concat(['let bubbles = []', `for(let i = 0; i < ${n}; i++){`, '  bubbles[i] = new Bubble(10)', '}', 'console.log(bubbles.length)']);
        return kit.printedNumber({ prompt: 'What number does this print?', code, explain: 'One object per pass.' });
      },
      shapes(r) {
        const n = r.int(2, 6);
        const code = BUB.concat(['let bubbles = []', `for(let i = 0; i < ${n}; i++){`, '  bubbles.push(new Bubble(10))', '}', 'for(let j = 0; j < bubbles.length; j++){', '  bubbles[j].display()', '}']);
        return kit.numberQuestion({ prompt: 'How many ellipses does this draw?', code, answer: U.shapesOf(code).shapes.length, explain: 'One per object.' });
      },
      each(r) {
        const n = r.int(2, 4); const i = r.int(0, n - 1); const k = r.int(2, 9);
        const code = BUB.concat(['let bubbles = []', `for(let i = 0; i < ${n}; i++){`, `  bubbles[i] = new Bubble(i * ${k})`, '}', 'for(let j = 0; j < bubbles.length; j++){', '  bubbles[j].grow()', '}', `console.log(bubbles[${i}].d)`]);
        return kit.printedNumber({ prompt: 'What number does this print?', code, explain: 'Its starting size comes from i, and then grow() adds 1.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs with arrays of objects', {
      oneOnly(r) {
        const n = r.int(2, 5); const d = r.int(5, 30);
        const lines = (x) => BUB.concat(['let bubbles = []', `for(let i = 0; i < ${n}; i++){`, `  bubbles[i] = new Bubble(${d} + i)`, '}', 'for(let j = 0; j < bubbles.length; j++){', `  ${x}.display()`, '}']);
        return U4.bug(r, { prompt: 'Each bubble should be displayed.', code: lines('bubbles[0]'), fixed: lines('bubbles[j]'), line: 17, why: 7, explain: 'Use j, so each pass reaches a different bubble.' });
      },
      arrayCall(r) {
        const n = r.int(2, 5); const d = r.int(5, 30);
        const lines = (x) => BUB.concat(['let bubbles = []', `for(let i = 0; i < ${n}; i++){`, `  bubbles[i] = new Bubble(${d})`, '}', 'for(let j = 0; j < bubbles.length; j++){', `  ${x}`, '}']);
        return U4.bug(r, { prompt: 'Each bubble should be displayed.', code: lines('bubbles.display()'), fixed: lines('bubbles[j].display()'), line: 17, why: 5, explain: 'The array itself doesn\'t have a display method.' });
      },
      noNew(r) {
        const n = r.int(2, 5); const d = r.int(5, 30);
        const lines = (x) => BUB.concat(['let bubbles = []', `for(let i = 0; i < ${n}; i++){`, `  bubbles[i] = ${x}Bubble(${d})`, '}', 'console.log(bubbles.length)']);
        return U4.bug(r, { prompt: 'This should fill the array with bubbles.', code: lines(''), fixed: lines('new '), line: 14, why: 4, explain: 'Classes need new.' });
      },
    }),
    slot('blanks', 'build', 'Completing code for many objects', {
      make(r) {
        const n = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so bubbles holds ${n} Bubble objects.`, lines: BUB.map((l) => [l]).concat([['let bubbles = ', tok('[]', 'e')], ['for(let i = 0; i < ', tok(n, 'n'), '; i++){'], ['  bubbles[', tok('i', 'v'), '] = ', tok('new', 'k'), ' Bubble(10)'], ['}'], ['console.log(bubbles.length)']]), must: ['e', 'k'], count: 3, pools: { e: ['0', '""'], n: [n + 3], v: ['width'], k: ['let', 'make'] }, spec: U.spec([{ width: 400 }]), explain: 'Start empty, and store a new object per pass.' });
      },
      run(r) {
        const n = r.int(2, 5);
        return kit.blanksQuestion(r, { prompt: 'Complete the loop so every bubble grows, and is then displayed.', lines: BUB.map((l) => [l]).concat([['let bubbles = []'], [`for(let i = 0; i < ${n}; i++){`], ['  bubbles[i] = new Bubble(10)'], ['}'], ['for(let j = 0; j < bubbles.', tok('length', 'p'), '; j++){'], ['  bubbles[', tok('j', 'v'), '].', tok('grow', 'm'), '()'], ['  bubbles[j].', tok('display', 'm'), '()'], ['}']]), must: ['p', 'm'], count: 3, pools: { p: ['size', 'width'], v: ['width', 'height'], m: ['setup', 'draw'] }, spec: U.spec([{ width: 400, height: 300 }]), explain: 'Go to the length, using j to reach each object.' });
      },
      pushed(r) {
        const n = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: 'Complete the code using push to add each new Bubble.', lines: BUB.map((l) => [l]).concat([['let bubbles = []'], [`for(let i = 0; i < ${n}; i++){`], ['  bubbles.', tok('push', 'm'), '(', tok('new', 'k'), ' Bubble(', tok('i', 'v'), '))'], ['}'], ['console.log(bubbles.length, bubbles[1].d)']]), must: ['m', 'k'], count: 2, pools: { m: ['splice', 'indexOf'], k: ['let', 'make'], v: ['width'] }, spec: U.spec([{ width: 400 }]), explain: 'push adds the new object to the end.' });
      },
    }),
    slot('parsons', 'build', 'Putting many-object code in order', {
      setupDraw(r) {
        const n = r.int(2, 9);
        return U3.parsons(r, [`In setup(), loop ${n} times, adding a new Bubble each time.`, 'In draw(), loop over bubbles, and display each one.'], ['function setup(){', `for(let i = 0; i < ${n}; i++){`, 'bubbles[i] = new Bubble(10)', '}', '}', 'function draw(){', 'for(let j = 0; j < bubbles.length; j++){', 'bubbles[j].display()', '}'], 'Create once, and then draw them on every frame.', BUB.concat(['let bubbles = []']).map((text) => ({ text })), [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      plain(r) {
        const n = r.int(2, 9);
        return U3.parsons(r, ['Start with an empty array.', `Fill it with ${n} Bubbles.`, 'Make every bubble grow.', 'Print how many there are.'], ['let bubbles = []', `for(let i = 0; i < ${n}; i++){`, 'bubbles[i] = new Bubble(5)', '}', 'for(let j = 0; j < bubbles.length; j++){', 'bubbles[j].grow()', '}', 'console.log(bubbles.length)'], 'The array has to be filled before you loop over it.', BUB.map((text) => ({ text })));
      },
      click(r) {
        return U3.parsons(r, ['In mousePressed(), add a new Bubble with a size of 20.', 'In draw(), display every bubble.'], ['function mousePressed(){', 'bubbles.push(new Bubble(20))', '}', 'function draw(){', 'for(let j = 0; j < bubbles.length; j++){', 'bubbles[j].display()', '}'], 'Arrays can grow while the sketch is running.', BUB.concat(['let bubbles = []']).map((text) => ({ text })), [{ text: '}' }], { kind: 'sketch', vectors: [{ frames: [{ mouseIsPressed: true }, {}] }] });
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
