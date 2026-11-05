// U4LA4.1 to U4LA5.2: translate(), push(), pop(), rotate(), sin(), and cos(). The course marks
// the sine and cosine lessons as skippable, so the Unit 4 review leaves them out.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const U3 = CC.u3;
  const U4 = CC.u4;
  const { tok } = kit;
  const { slot, choice, at } = U;

  // Where a shape's first two values land, once its translation is added in.
  const landed = (shape) => [shape[1][0] + shape[5].x, shape[1][1] + shape[5].y];
  const noTrig = [[/\bsin\(|\bcos\(/, 'sine and cosine (U4LA5)']];

  U4.lesson('U4LA4.1', 'Translation Battleship', '11-U4LA4.1-Translation-Battleship.md', 15, 9, noTrig.concat([[/\brotate\(/, 'rotate (U4LA4.2)']]), [
    slot('concept', 'concepts', 'Knowing what translate, push, and pop do', {
      meaning(r) {
        return choice(r, 'What does translate() move?', 'The coordinate system, for everything drawn after it', ['Only shapes drawn before it', 'The window on the screen', 'One shape, once it is finished'], 'The shape keeps its numbers, but the origin has moved.');
      },
      pushPop(r) {
        return U3.rows(r, 'What does each one do?', [['push()', 0], ['pop()', 1], ['translate(10, 20)', 2]], ['saves the current settings', 'restores the saved settings', 'moves the origin'], 'push and pop keep a transformation from spreading.', undefined, 'Code');
      },
      math(r) {
        const x = at(r, 1, 9); const y = at(r, 1, 9); const a = at(r, 1, 9); const b = at(r, 1, 9);
        return choice(r, `A point at (${x}, ${y}) is translated by ${a} on the x axis and ${b} on the y axis. Where does it land?`, `(${x + a}, ${y + b})`, [`(${x + a + 10}, ${y + b})`, `(${a}, ${b + 5})`, `(${x + b}, ${y + a + 5})`], 'Add each amount to its own axis.');
      },
    }),
    slot('landing', 'flow', 'Working out where shapes land', {
      one(r) {
        const a = at(r, 1, 20); const b = at(r, 1, 20); const x = at(r, 1, 9); const y = at(r, 1, 9);
        const code = [`translate(${a}, ${b})`, `ellipse(${x}, ${y}, 10, 10)`];
        return kit.numberQuestion({ prompt: 'What x value on the canvas does this ellipse land at?', code, answer: landed(U.shapesOf(code).shapes[0])[0], explain: `${a} + ${x}.` });
      },
      cumulative(r) {
        const a = at(r, 1, 9); const b = at(r, 1, 9); const c = at(r, 1, 9);
        const code = [`translate(${a}, 0)`, `translate(${b}, 0)`, `rect(${c}, 0, 10, 10)`];
        return kit.numberQuestion({ prompt: 'What x value on the canvas does this rectangle land at?', code, answer: landed(U.shapesOf(code).shapes[0])[0], explain: 'Translations add up.' });
      },
      popped(r) {
        const a = at(r, 1, 20); const x = at(r, 1, 9);
        const code = ['push()', `translate(${a}, 0)`, `ellipse(${x}, 0, 10, 10)`, 'pop()', `ellipse(${x}, 50, 10, 10)`];
        return kit.numberQuestion({ prompt: 'What x value on the canvas does the second ellipse land at?', code, answer: landed(U.shapesOf(code).shapes[1])[0], explain: 'pop() undoes the translation.' });
      },
      mouse(r) {
        const mx = at(r, 5, 30); const x = at(r, 1, 9);
        const code = ['translate(mouseX, mouseY)', `ellipse(${x}, 0, 10, 10)`];
        return kit.numberQuestion({ prompt: `The mouse is at mouseX = ${mx}, mouseY = 100. What x value does this ellipse land at?`, code, answer: landed(U.shapesOf(code, { mouseX: mx, mouseY: 100 }).shapes[0])[0], explain: 'The shape follows the mouse, because the origin does.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs with translate', {
      noPop(r) {
        const a = at(r, 1, 20); const s = at(r, 2, 6);
        const top = ['push()', `translate(${a}, 0)`, `ellipse(0, 0, ${s}, ${s})`];
        const end = [`rect(0, 50, ${s}, ${s})`];
        return U4.bug(r, { prompt: 'The rectangle should not be translated.', code: top.concat(['push()'], end), fixed: top.concat(['pop()'], end), line: 3, why: 6, explain: 'It should be pop(), which restores the saved settings.' });
      },
      after(r) {
        const a = at(r, 1, 20); const s = at(r, 2, 6);
        return U4.bug(r, { prompt: 'The ellipse should be translated.', code: [`ellipse(0, 0, ${s}, ${s})`, `translate(${a}, 0)`], fixed: [`translate(${a}, 0)`, `ellipse(0, 0, ${s}, ${s})`], line: [0, 1], why: 7, explain: 'Translate first: it only affects what comes after it.' });
      },
      swapped(r) {
        const a = at(r, 2, 15); const b = at(r, 16, 30);
        return U4.bug(r, { prompt: `The origin should move ${a} across and ${b} down.`, code: [`translate(${b}, ${a})`, 'rect(0, 0, 20, 20)'], fixed: [`translate(${a}, ${b})`, 'rect(0, 0, 20, 20)'], line: 0, why: 7, explain: 'x comes first.' });
      },
    }),
    slot('blanks', 'build', 'Completing translation code', {
      pair(r) {
        const a = at(r, 1, 20); const s = at(r, 2, 6);
        return kit.blanksQuestion(r, { prompt: `Complete the code so only the ellipse is moved ${a} to the right.`, lines: [[tok('push', 'f'), '()'], [tok('translate', 'f'), '(', tok(a, 'n'), ', 0)'], [`ellipse(0, 0, ${s}, ${s})`], [tok('pop', 'f'), '()'], [`rect(0, 50, ${s}, ${s})`]], must: ['f'], count: 3, pools: { f: ['rotate', 'fill'], n: [a + 10] }, spec: U.spec(), explain: 'push, translate, draw, and pop.' });
      },
      center(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the code so the origin moves to the center of the canvas.', lines: [['translate(', tok('width', 'v'), '/', tok(2, 'n'), ', ', tok('height', 'v'), '/2)'], [`ellipse(0, 0, ${at(r, 2, 9)}, 10)`]], must: ['v'], count: 2, pools: { v: ['mouseX', 'mouseY'], n: [3, 4] }, spec: U.spec([{ width: 400, height: 200, mouseX: 7, mouseY: 9 }]), explain: 'Half the width, and half the height.' });
      },
      follow(r) {
        const d = at(r, 2, 6);
        return kit.blanksQuestion(r, { prompt: `Complete the code so an ellipse stays ${d} to the left of the mouse.`, lines: [['translate(', tok('mouseX', 'v'), ', ', tok('mouseY', 'v'), ')'], ['ellipse(', tok(`-${d}`, 'n'), ', 0, 10, 10)']], must: ['v', 'n'], count: 2, pools: { v: ['width', 'height'], n: [d, d + 20] }, spec: U.spec([{ width: 400, height: 200, mouseX: 7, mouseY: 9 }]), explain: 'Left of the origin is a negative x.' });
      },
    }),
    slot('parsons', 'build', 'Putting translation code in order', {
      isolate(r) {
        const a = at(r, 1, 20); const b = at(r, 1, 20);
        return U3.parsons(r, ['Save the settings.', `Move the origin by (${a}, ${b}).`, 'Draw an ellipse at (0, 0).', 'Restore the settings.', 'Draw a rectangle at (0, 0).'], ['push()', `translate(${a}, ${b})`, 'ellipse(0, 0, 20, 20)', 'pop()', 'rect(0, 0, 20, 20)'], 'push and pop go around what you want moved.');
      },
      two(r) {
        const a = at(r, 1, 20); const b = at(r, 21, 40);
        return U3.parsons(r, [`Save, move by ${a} across, draw a circle, and restore.`, `Then save, move by ${b} across, draw a circle, and restore.`], ['push()', `translate(${a}, 0)`, 'ellipse(0, 0, 10, 10)', 'pop()', 'push()', `translate(${b}, 0)`, 'ellipse(0, 0, 10, 10)', 'pop()'], 'Each pair keeps its translation separate.');
      },
      mouse(r) {
        const s = at(r, 2, 6);
        return U3.parsons(r, ['Paint a background.', 'Save the settings.', 'Move the origin to the mouse.', `Draw a circle ${s} wide.`, 'Restore the settings.'], ['background(204)', 'push()', 'translate(mouseX, mouseY)', `ellipse(0, 0, ${s}, ${s})`, 'pop()'], 'The background comes first.', [{ text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [{ mouseX: 30, mouseY: 40 }] });
      },
    }),
  ]);

  const DEG = [45, 90, 180, 270, 360];

  U4.lesson('U4LA4.2', 'Rotations', '12-U4LA4.2-Rotations.md', 15, 9, noTrig, [
    slot('concept', 'concepts', 'Knowing how rotate() works', {
      origin(r) {
        return choice(r, 'What point do shapes rotate around?', 'The origin, unless it has been translated', ['The center of each shape', 'The mouse', 'The bottom-right corner'], 'That is why you often translate before you rotate.');
      },
      direction(r) {
        return U3.rows(r, 'Which way does each one turn?', [[`rotate(${r.pick([30, 60, 90])})`, 0], [`rotate(-${r.pick([30, 60, 90])})`, 1]].concat([['A positive angle', 0], ['A negative angle', 1]]), ['clockwise', 'counterclockwise'], 'In p5, positive angles turn clockwise.', undefined, 'Rotation');
      },
      modes(r) {
        return U3.rows(r, 'Which angle mode does each describe?', [['The default', 0], ['A full turn is 360', 1], ['A half turn is PI', 0], ['Needs angleMode to be set first', 1]], ['RADIANS', 'DEGREES'], 'Radians are the default.', undefined, 'Description');
      },
    }),
    slot('values', 'flow', 'Working out rotation amounts', {
      total(r) {
        const [a, b] = r.sample([15, 30, 45, 60, 90], 2);
        const code = ['angleMode(DEGREES)', `rotate(${a})`, `rotate(${b})`, 'rect(0, 0, 10, 10)'];
        return kit.numberQuestion({ prompt: 'How many degrees in total is this rectangle rotated?', code, answer: U.shapesOf(code).shapes[0][5].turn, explain: 'Rotations add up.' });
      },
      popped(r) {
        const [a, b] = r.sample([15, 30, 45, 60, 90], 2);
        const code = ['angleMode(DEGREES)', 'push()', `rotate(${a})`, 'rect(0, 0, 10, 10)', 'pop()', `rotate(${b})`, 'rect(0, 0, 10, 10)'];
        return kit.numberQuestion({ prompt: 'How many degrees is the second rectangle rotated?', code, answer: U.shapesOf(code).shapes[1][5].turn, explain: 'pop() undoes the first rotation.' });
      },
      animated(r) {
        const s = r.int(2, 9); const n = r.int(2, 6);
        const code = ['let angle = 0', 'function draw(){', '  rotate(angle)', `  angle += ${s}`, '}'];
        return U4.after({ prompt: `After ${n} frames, what does angle hold?`, code, expr: 'angle', n, explain: 'A changing angle makes a rotation animate.' });
      },
      mapped(r) {
        const mx = r.pick([100, 200, 300]);
        const code = ['angleMode(DEGREES)', 'let angle = map(mouseX, 0, 400, 0, 360)', 'console.log(angle)'];
        return kit.printedNumber({ prompt: `The mouse is at mouseX = ${mx} on a canvas 400 wide. What number does this print?`, code, vec: { mouseX: mx }, explain: 'map stretches 0 to 400 onto 0 to 360.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs with rotation', {
      noMode(r) {
        const a = r.pick(DEG);
        const lines = (m) => [`angleMode(${m})`, `rotate(${a})`, 'rect(0, 0, 10, 10)'];
        return U4.bug(r, { prompt: `This should rotate by ${a} degrees.`, code: lines('RADIANS'), fixed: lines('DEGREES'), line: 0, why: 7, explain: 'Set angleMode(DEGREES) first.' });
      },
      afterShape(r) {
        const a = r.pick(DEG); const s = at(r, 2, 9);
        return U4.bug(r, { prompt: 'The rectangle should be rotated.', code: [`rect(0, 0, ${s}, ${s})`, `rotate(${a})`], fixed: [`rotate(${a})`, `rect(0, 0, ${s}, ${s})`], line: [0, 1], why: 7, explain: 'Rotate first.' });
      },
      spreads(r) {
        const a = r.pick(DEG); const s = at(r, 2, 9);
        const lines = (x) => ['push()', `rotate(${a})`, `rect(0, 0, ${s}, ${s})`, x, `ellipse(50, 50, ${s}, ${s})`];
        return U4.bug(r, { prompt: 'The ellipse should not be rotated.', code: lines('push()'), fixed: lines('pop()'), line: 3, why: 6, explain: 'It should be pop().' });
      },
    }),
    slot('blanks', 'build', 'Completing rotation code', {
      center(r) {
        const a = r.pick(DEG);
        return kit.blanksQuestion(r, { prompt: `Complete the code so a rectangle spins ${a} degrees around the center of the canvas.`, lines: [['angleMode(', tok('DEGREES', 'm'), ')'], ['push()'], [tok('translate', 'f'), '(width/2, height/2)'], [tok('rotate', 'f'), '(', tok(a, 'n'), ')'], ['rect(-40, -20, 80, 40)'], ['pop()']], must: ['f'], count: 2, pools: { m: ['RADIANS', 'HSB'], f: ['fill', 'ellipse'], n: [a + 15] }, spec: U.spec([{ width: 400, height: 200 }]), explain: 'Translate to the center, and then rotate.' });
      },
      pair(r) {
        const a = r.pick(DEG);
        return kit.blanksQuestion(r, { prompt: 'Complete the code so only the rectangle is rotated.', lines: [[tok('push', 'f'), '()'], [`rotate(${a})`], ['rect(0, 0, 10, 10)'], [tok('pop', 'f'), '()'], ['ellipse(50, 50, 10, 10)']], must: ['f'], count: 2, pools: { f: ['translate', 'fill'] }, spec: U.spec(), explain: 'push and pop go around what you want rotated.' });
      },
      spin(r) {
        const s = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the angle goes up by ${s} on each frame.`, lines: [['let angle = ', tok(0, 'n')], ['function draw(){'], ['  ', tok('rotate', 'f'), '(', tok('angle', 'v'), ')'], ['  rect(0, 0, 20, 20)'], ['  angle ', tok('+=', 'o'), ' ', tok(s, 'n')], ['}']], must: ['v', 'o'], count: 3, pools: { n: [s + 2, s + 7], f: ['fill', 'translate'], v: ['width', 'height'], o: ['-=', '='] }, spec: { kind: 'sketch', vectors: [{ width: 400, height: 200 }] }, explain: 'A changing angle makes it spin.' });
      },
    }),
    slot('parsons', 'build', 'Putting rotation code in order', {
      center(r) {
        const a = r.pick(DEG);
        return U3.parsons(r, ['Set the mode to degrees.', 'Save the settings.', 'Move the origin to the center.', `Rotate by ${a}.`, 'Draw the rectangle, and then restore the settings.'], ['angleMode(DEGREES)', 'push()', 'translate(200, 200)', `rotate(${a})`, 'rect(-40, -20, 80, 40)', 'pop()'], 'Translate, then rotate, then draw.');
      },
      spin(r) {
        const s = r.int(2, 9);
        return U3.parsons(r, ['Paint a background.', 'Save the settings.', 'Move to (100, 100), and rotate by angle.', 'Draw the shape, and restore the settings.', `Add ${s} to angle.`], ['background(220)', 'push()', 'translate(100, 100)', 'rotate(angle)', 'rect(-10, -10, 20, 20)', 'pop()', `angle += ${s}`], 'The angle changes after each frame is drawn.', [{ text: 'let angle = 0' }, { text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      two(r) {
        const [a, b] = r.sample([15, 30, 45, 60, 90], 2);
        return U3.parsons(r, [`Save, rotate by ${a}, draw a rectangle, and restore.`, `Save, rotate by ${b}, draw an ellipse, and restore.`], ['push()', `rotate(${a})`, 'rect(0, 0, 20, 20)', 'pop()', 'push()', `rotate(${b})`, 'ellipse(0, 0, 20, 20)', 'pop()'], 'Each pair keeps its rotation separate.');
      },
    }),
  ]);

  const SIN_ROWS = [[0, 0], [90, 1], [180, 0], [270, -1]];
  const COS_ROWS = [[0, 1], [90, 0], [180, -1], [270, 0]];
  const TRIG_OPTIONS = ['-1', '0', '1'];
  const trigRows = (r, fn, rows) => {
    return kit.rowsQuestion({ prompt: `What does ${fn}() give for each angle?`, code: ['angleMode(DEGREES)'], columns: ['Call'], rows: r.shuffle(rows).map(([a]) => ({ cells: [`${fn}(${a})`], answer: TRIG_OPTIONS.indexOf(kit.printed(`angleMode(DEGREES)\nconsole.log(${fn}(${a}))`)[0]) })), options: TRIG_OPTIONS.map((text) => ({ text })), explain: `${fn}() moves in a cycle between -1 and 1.` });
  };
  const AMP = (r) => [r.pick([100, 150, 200, 250]), r.pick([20, 50, 75, 100])];

  U4.lesson('U4LA5.1', 'Sine && Oscillating Motion', '13-U4LA5.1-Sine-and-Oscillating-Motion.md', 15, 9, [[/\bcos\(/, 'cosine (U4LA5.2)']], [
    slot('concept', 'concepts', 'Understanding sine and oscillation', {
      oscillate(r) {
        return choice(r, 'What does it mean to oscillate?', 'To move back and forth in a consistent pattern', ['To stop moving after a while', 'To move faster and faster in one direction', 'To jump to a random spot'], 'A fan that turns back and forth oscillates.');
      },
      range(r) {
        return choice(r, 'What is the range of values that sin() gives?', 'From -1 to 1', ['From 0 to 360', 'From 0 to 255', 'From -360 to 360'], 'However big the angle gets, the result stays in that range.');
      },
      scale(r) {
        return choice(r, 'Why does sin() need to be mapped or multiplied before it moves a shape?', 'Values from -1 to 1 are too small to see', ['sin() only works in setup()', 'It gives only whole numbers', 'It gives only negative numbers'], 'Moving 1 pixel isn\'t visible motion.');
      },
    }),
    slot('values', 'flow', 'Working out sine values', {
      rows(r) { return trigRows(r, 'sin', r.sample(SIN_ROWS, 3).concat([[360, 0]])); },
      multiplied(r) {
        const [c, a] = AMP(r); const d = r.pick([0, 90, 270]);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['angleMode(DEGREES)', `console.log(${c} + sin(${d}) * ${a})`], explain: `sin(${d}) is worked out first, and then multiplied.` });
      },
      biggest(r) {
        const [c, a] = AMP(r);
        return kit.numberQuestion({ prompt: 'What is the largest value y can ever have here?', code: [`let y = ${c} + sin(angle) * ${a}`], answer: c + a, explain: 'sin() is at most 1.' });
      },
      mapped(r) {
        const lo = r.pick([0, 50, 100]); const hi = lo + r.pick([100, 200, 300]);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['angleMode(DEGREES)', `console.log(map(sin(90), -1, 1, ${lo}, ${hi}))`], explain: 'sin(90) is 1, the top of its range, so it maps to the top of the new range.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs with sine', {
      noScale(r) {
        const [c, a] = AMP(r);
        const lines = (e) => ['angleMode(DEGREES)', 'let angle = 90', `ellipse(100, ${e}, 20, 20)`];
        return U4.bug(r, { prompt: 'The circle should move up and down in a visible way, but barely moves.', code: lines(`${c} + sin(angle)`), fixed: lines(`${c} + sin(angle) * ${a}`), line: 2, why: 7, explain: 'Multiply to make the motion bigger.' });
      },
      noChange(r) {
        const [c, a] = AMP(r); const s = r.int(1, 5);
        const lines = (l) => ['let angle = 0', 'function draw(){', `  let y = ${c} + sin(angle) * ${a}`, '  console.log(y)', `  ${l}`, '}'];
        return U4.bug(r, { prompt: 'The value of y should keep changing.', code: lines(`angle = ${s}`), fixed: lines(`angle += ${s}`), line: 4, why: 0, kind: 'sketch', explain: 'Keep adding to the angle.' });
      },
      resetting(r) {
        const [c, a] = AMP(r); const s = r.int(1, 5);
        return U4.bug(r, { prompt: 'The value of y should keep changing.', code: ['function draw(){', '  let angle = 0', `  let y = ${c} + sin(angle) * ${a}`, '  console.log(y)', `  angle += ${s}`, '}'], fixed: ['let angle = 0', 'function draw(){', `  let y = ${c} + sin(angle) * ${a}`, '  console.log(y)', `  angle += ${s}`, '}'], line: 1, why: 8, kind: 'sketch', explain: 'Declare the angle outside of draw().' });
      },
    }),
    slot('blanks', 'build', 'Completing sine code', {
      motion(r) {
        const [c, a] = AMP(r); const s = r.int(1, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the code so y swings ${a} above and below ${c}.`, lines: [['let angle = 0'], ['function draw(){'], [`  let y = `, tok(c, 'n'), ' + ', tok('sin', 'f'), '(angle) * ', tok(a, 'n')], ['  console.log(y)'], ['  angle ', tok('+=', 'o'), ` ${s}`], ['}']], must: ['f', 'o'], count: 3, pools: { n: [c + a + 5], f: ['floor', 'map'], o: ['-', '='] }, spec: { kind: 'sketch', vectors: [{}] }, explain: 'The center, plus sine, times the size of the swing.' });
      },
      map(r) {
        const lo = r.pick([0, 50, 100]); const hi = lo + r.pick([100, 200, 300]);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the sine value maps to the range ${lo} to ${hi}.`, lines: [['angleMode(DEGREES)'], ['console.log(', tok('map', 'f'), '(sin(90), ', tok(-1, 'r'), ', ', tok(1, 'r'), ', ', tok(lo, 'n'), ', ', tok(hi, 'n'), '))']], must: ['f', 'n'], count: 3, pools: { f: ['floor', 'dist'], r: [0, 2], n: [hi + 50] }, spec: U.spec(), explain: 'sin() goes from -1 to 1, so that is the input range.' });
      },
      mode(r) {
        const d = r.pick([90, 270]);
        return kit.blanksQuestion(r, { prompt: `Complete the code so sin(${d}) is read in degrees.`, lines: [['angleMode(', tok('DEGREES', 'm'), ')'], ['console.log(', tok('sin', 'f'), `(${d}))`]], must: ['f'], count: 2, pools: { m: ['RADIANS', 'HSB'], f: ['map', 'floor'] }, spec: U.spec(), explain: 'Angles are radians by default.' });
      },
    }),
    slot('parsons', 'build', 'Putting sine code in order', {
      y(r) {
        const [c, a] = AMP(r); const s = r.int(1, 5);
        return U3.parsons(r, ['Paint a background.', `Find y, using ${c} + sin(angle) * ${a}.`, 'Draw a circle at y.', `Add ${s} to angle.`, 'Print y.'], ['background(220)', `let y = ${c} + sin(angle) * ${a}`, 'ellipse(100, y, 20, 20)', `angle += ${s}`, 'console.log(y)'], 'y has to be worked out before it gets used.', [{ text: 'let angle = 0' }, { text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      mapping(r) {
        const s = r.int(1, 5);
        return U3.parsons(r, ['Set angle mode to degrees in setup().', 'In draw(), map sin(angle) to 50 through 350, and draw at that x.', `Add ${s} to angle.`], ['function setup(){', 'angleMode(DEGREES)', '}', 'function draw(){', 'let x = map(sin(angle), -1, 1, 50, 350)', 'ellipse(x, 100, 20, 20)', `angle += ${s}`], 'Settings go in setup(), and motion goes in draw().', [{ text: 'let angle = 0' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      both(r) {
        const s = r.int(1, 5); const [c, a] = AMP(r);
        return U3.parsons(r, ['Set the mode to degrees.', 'Start angle at 90.', 'Print the swing position.', `Add ${s} to angle.`, 'Print the swing position again.'], ['angleMode(DEGREES)', 'let angle = 90', `console.log(${c} + sin(angle) * ${a})`, `angle += ${s}`, `console.log(${c} + sin(angle) * ${a})`], 'The angle changes between the two prints.');
      },
    }),
  ]);

  U4.lesson('U4LA5.2', 'Cosine && Circular Motion', '14-U4LA5.2-Cosine-and-Circular-Motion.md', 15, 9, [], [
    slot('concept', 'concepts', 'Understanding cosine and circular motion', {
      together(r) {
        return choice(r, 'What do sin() and cos() make when they are used together for y and x?', 'Circular motion', ['Motion in a straight line', 'A random jump', 'No motion at all'], 'x uses cos, and y uses sin.');
      },
      range(r) {
        return choice(r, 'What is the range of values that cos() gives?', 'From -1 to 1', ['From 0 to 1', 'From 0 to 360', 'From -180 to 180'], 'The same as sine, though it moves differently.');
      },
      names(r) {
        return U3.rows(r, 'What does each value control in this code?', [['offset', 0], ['scalar', 1], ['speed', 2]], ['the center of the circle', 'the radius of the circle', 'how fast it goes around'], 'Clearer names could be center and radius.', ['x = offset + cos(angle) * scalar', 'y = offset + sin(angle) * scalar', 'angle += speed'], 'Variable');
      },
    }),
    slot('values', 'flow', 'Working out positions on a circle', {
      rows(r) { return trigRows(r, 'cos', r.sample(COS_ROWS, 3).concat([[360, 1]])); },
      x(r) {
        const off = r.pick([50, 100, 200]); const sc = r.pick([20, 40, 60]); const a = r.pick([0, 90, 180]);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['angleMode(DEGREES)', `let x = ${off} + cos(${a}) * ${sc}`, 'console.log(x)'], explain: `cos(${a}) is worked out first.` });
      },
      y(r) {
        const off = r.pick([50, 100, 200]); const sc = r.pick([20, 40, 60]); const a = r.pick([0, 90, 270]);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['angleMode(DEGREES)', `let y = ${off} + sin(${a}) * ${sc}`, 'console.log(y)'], explain: `sin(${a}) is worked out first.` });
      },
      spiral(r) {
        const s = r.int(1, 5); const n = r.int(2, 6); const sc = r.pick([0, 10, 20]);
        const code = [`let scalar = ${sc}`, 'function draw(){', `  scalar += ${s}`, '}'];
        return U4.after({ prompt: `This makes a spiral. After ${n} frames, what does scalar hold?`, code, expr: 'scalar', n, explain: 'A growing radius turns a circle into a spiral.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in circular motion', {
      sameFn(r) {
        const off = r.pick([50, 100, 200]); const sc = r.pick([20, 40, 60]); const a = r.pick([30, 60]);
        const lines = (f) => ['angleMode(DEGREES)', `let x = ${off} + ${f}(${a}) * ${sc}`, `let y = ${off} + sin(${a}) * ${sc}`, 'ellipse(x, y, 10, 10)'];
        return U4.bug(r, { prompt: 'This should find a point on a circle, using cos for x and sin for y.', code: lines('sin'), fixed: lines('cos'), line: 1, why: 7, explain: 'x should use cos.' });
      },
      noAngle(r) {
        const off = r.pick([50, 100, 200]); const sc = r.pick([20, 40, 60]); const s = r.int(1, 5);
        const lines = (l) => ['let angle = 0', 'function draw(){', `  let x = ${off} + cos(angle) * ${sc}`, '  console.log(x)', `  ${l}`, '}'];
        return U4.bug(r, { prompt: 'The point should go around the circle.', code: lines(`angle + ${s}`), fixed: lines(`angle += ${s}`), line: 4, why: 0, kind: 'sketch', explain: 'The new angle has to be stored.' });
      },
      noOffset(r) {
        const off = r.pick([50, 100, 200]); const sc = r.pick([20, 40, 60]);
        const lines = (e) => ['angleMode(DEGREES)', `let x = ${e}`, 'console.log(x)'];
        return U4.bug(r, { prompt: `The circle should be centered on x = ${off}.`, code: lines(`cos(0) * ${sc}`), fixed: lines(`${off} + cos(0) * ${sc}`), line: 1, why: 7, explain: 'Add the offset to move the center.' });
      },
    }),
    slot('blanks', 'build', 'Completing circular motion', {
      point(r) {
        const off = r.pick([50, 100, 200]); const sc = r.pick([20, 40, 60]);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the point moves in a circle around (${off}, ${off}) with a radius of ${sc}.`, lines: [['angleMode(DEGREES)'], ['let angle = 60'], ['let x = ', tok(off, 'n'), ' + ', tok('cos', 'f'), '(angle) * ', tok(sc, 'n')], ['let y = ', tok(off, 'n'), ' + ', tok('sin', 'f'), '(angle) * ', tok(sc, 'n')], ['ellipse(x, y, 10, 10)']], must: ['f'], count: 3, pools: { n: [off + sc + 5], f: ['map', 'floor'] }, spec: U.spec(), explain: 'x uses cos, and y uses sin.' });
      },
      grow(r) {
        const s = r.int(1, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the circle becomes a spiral, with the radius growing by ${s}.`, lines: [['let circ1 = {'], ['  angle: 0,'], ['  scalar: 20'], ['}'], ['function draw(){'], ['  circ1.', tok('scalar', 'p'), ' ', tok('+=', 'o'), ` ${s}`], ['  console.log(circ1.scalar)'], ['}']], must: ['p', 'o'], count: 2, pools: { p: ['angle', 'size'], o: ['-=', '='] }, spec: { kind: 'sketch', vectors: [{}] }, explain: 'A growing radius makes a spiral.' });
      },
      speed(r) {
        const s = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the angle goes up by the speed of ${s}.`, lines: [['let circ1 = {'], ['  angle: 0,'], ['  speed: ', tok(s, 'n')], ['}'], ['function draw(){'], ['  circ1.angle ', tok('+=', 'o'), ' circ1.', tok('speed', 'p')], ['  console.log(circ1.angle)'], ['}']], must: ['o', 'p'], count: 2, pools: { n: [s + 3], o: ['-=', '='], p: ['angle', 'size'] }, spec: { kind: 'sketch', vectors: [{}] }, explain: 'The speed is how much the angle changes on each frame.' });
      },
    }),
    slot('parsons', 'build', 'Putting circular motion in order', {
      circle(r) {
        const off = r.pick([100, 200]); const sc = r.pick([20, 40, 60]); const s = r.int(1, 5);
        return U3.parsons(r, ['Find x, using cos.', 'Find y, using sin.', 'Draw the circle at x and y.', `Add ${s} to angle.`, 'Print x.'], [`let x = ${off} + cos(angle) * ${sc}`, `let y = ${off} + sin(angle) * ${sc}`, 'ellipse(x, y, 10, 10)', `angle += ${s}`, 'console.log(x)'], 'Positions come first, and the angle changes after drawing.', [{ text: 'let angle = 0' }, { text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [{}] });
      },
      spiral(r) {
        const s = r.int(1, 3);
        return U3.parsons(r, ['Find x with cos and scalar.', 'Find y with sin and scalar.', 'Draw at x and y.', 'Add 5 to angle.', `Add ${s} to scalar.`], ['let x = 200 + cos(angle) * scalar', 'let y = 200 + sin(angle) * scalar', 'ellipse(x, y, 5, 5)', 'angle += 5', `scalar += ${s}`], 'Both the angle and the radius change on each frame.', [{ text: 'let angle = 0' }, { text: 'let scalar = 10' }, { text: 'function draw(){' }], [{ text: '}' }], { kind: 'sketch', vectors: [U4.frames(4)] });
      },
      obj(r) {
        const sc = r.pick([20, 40, 60]);
        return U3.parsons(r, ['Set the mode to degrees.', 'Make circ1 hold an angle of 0.', `Print cos at that angle, times ${sc}.`, 'Add 90 to the angle.', 'Print it again.'], ['angleMode(DEGREES)', 'let circ1 = { angle: 0 }', `console.log(cos(circ1.angle) * ${sc})`, 'circ1.angle += 90', `console.log(cos(circ1.angle) * ${sc})`], 'The mode has to be set first.');
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
