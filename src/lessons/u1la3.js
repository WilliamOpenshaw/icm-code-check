// U1LA3.1 and U1LA3.2: width, height, mouseX, mouseY, console.log, then custom variables.
// Students have NOT seen: custom functions (U1LA4), random(), or conditionals.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const { tok } = kit;
  const { slot, choice, at } = U;
  const noFunctions = U.NO_LOGIC.concat([[/\brandom\(/, 'random (U1LA4.4)']]);
  const FRACTIONS = [[2, 'half'], [4, 'one quarter'], [5, 'one fifth'], [10, 'one tenth']];
  const canvasVec = (w, h, mx, my) => ({ width: w, height: h, mouseX: mx, mouseY: my });

  U.lesson('U1LA3.1', 'Introducing Variables', '10-U1LA3.1-Introducing-Variables.md', 15, 9, noFunctions.concat([[/\blet\b/, 'custom variables (U1LA3.2)']]), [
    slot('meaning', 'concepts', 'Knowing what system variables hold', {
      each(r) {
        const rows = r.shuffle([['The current across position of the mouse', 0], ['The current up and down position of the mouse', 1], ['How wide the canvas is', 2], ['How tall the canvas is', 3]]);
        return kit.rowsQuestion({ prompt: 'Which variable holds each of these?', columns: ['Value'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: ['mouseX', 'mouseY', 'width', 'height'].map((text) => ({ text })), explain: 'All four are built in to p5.' });
      },
      why(r) {
        return choice(r, 'Why use width/2 instead of typing the number for the middle of the canvas?', 'It stays centered even when the canvas size changes', ['It makes the shape bigger', 'It draws the shape faster', 'p5 only accepts variables here'], 'A variable holds the current value, so you don\'t need to redo the math.');
      },
      stands(r) {
        return choice(r, 'A student says width can\'t go in ellipse() because it is a word. What is right?', 'width holds a number, so it can go anywhere a number can', ['The student is right, so it needs quotation marks', 'width only works inside console.log', 'width only works inside createCanvas'], 'Even though it looks like a word, a variable stands for its value.');
      },
    }),
    slot('compute', 'flow', 'Working out values from system variables', {
      halfWidth(r) {
        const [w, h] = U.canvas(r); const [d, word] = r.pick(FRACTIONS);
        return kit.printedNumber({ prompt: `The canvas is ${w} by ${h}. What number does this print?`, code: [`console.log(width/${d})`], vec: canvasVec(w, h, 0, 0), explain: `width holds ${w}, so this finds ${word} of it.` });
      },
      offset(r) {
        const mx = at(r, 2, 30); const my = at(r, 2, 30); const n = at(r, 1, 9);
        return kit.printedNumber({ prompt: `The mouse is at mouseX = ${mx}, mouseY = ${my}. What number does this print?`, code: [`console.log(mouseY + ${n})`], vec: canvasVec(400, 400, mx, my), explain: `mouseY holds ${my}.` });
      },
      heightMath(r) {
        const [w, h] = U.canvas(r); const n = at(r, 1, 5);
        return kit.printedNumber({ prompt: `The canvas is ${w} by ${h}. What number does this print?`, code: [`console.log(height - ${n})`], vec: canvasVec(w, h, 0, 0), explain: `height holds ${h}.` });
      },
    }),
    slot('position', 'flow', 'Predicting where a shape lands', {
      center(r) {
        const [w, h] = U.canvas(r);
        const code = ['ellipse(width/2, height/2, 50, 50)'];
        const args = U.shapesOf(code, canvasVec(w, h, 0, 0)).shapes[0][1];
        return kit.numberQuestion({ prompt: `On a ${w} by ${h} canvas, what is the x value of the ellipse's center?`, code, answer: args[0], explain: `width/2 is ${w}/2.` });
      },
      follows(r) {
        const mx = at(r, 2, 30); const my = at(r, 2, 30); const n = at(r, 1, 9);
        const code = [`rect(mouseX + ${n}, mouseY, 40, 40)`];
        const args = U.shapesOf(code, canvasVec(400, 400, mx, my)).shapes[0][1];
        return kit.numberQuestion({ prompt: `The mouse is at (${mx}, ${my}). What is the x value of the rectangle's corner?`, code, answer: args[0], explain: `mouseX + ${n}.` });
      },
      anchored(r) {
        const mx = at(r, 2, 30); const my = at(r, 5, 30);
        const code = ['triangle(mouseX, mouseY, mouseX+25, mouseY-40, mouseX+50, mouseY)'];
        const args = U.shapesOf(code, canvasVec(400, 400, mx, my)).shapes[0][1];
        return kit.numberQuestion({ prompt: `The mouse is at (${mx}, ${my}). What is the y value of the triangle's second corner?`, code, answer: args[3], explain: `mouseY - 40: the corners stay a set distance from the mouse.` });
      },
    }),
    slot('bug', 'flow', 'Finding bugs with system variables', {
      capital(r) {
        const s = at(r, 2, 9); const a = `ellipse(mouseX, mouseY, ${s}, ${s})`;
        return U.bug(r, { prompt: 'The ellipse should follow the mouse.', code: ['background(220)', `ellipse(mousex, mouseY, ${s}, ${s})`], fixed: ['background(220)', a], line: 1, why: 2, vectors: [{ mouseX: at(r, 2, 30), mouseY: 50 }], explain: 'The variable is mouseX, with a capital X.' });
      },
      swapped(r) {
        const [w, h] = r.pick([[600, 400], [800, 600], [500, 300]]);
        const s = at(r, 2, 9);
        return U.bug(r, { prompt: 'The ellipse should be in the center of the canvas.', code: ['background(220)', `ellipse(height/2, width/2, ${s}, ${s})`], fixed: ['background(220)', `ellipse(width/2, height/2, ${s}, ${s})`], line: 1, why: 0, vectors: [canvasVec(w, h, 0, 0)], explain: 'x comes first, so width/2 goes first.' });
      },
      stretch(r) {
        const code = (b) => [`triangle(mouseX, mouseY, ${b}, mouseX+50, mouseY)`];
        const dx = at(r, 2, 4); const dy = at(r, 2, 4);
        return U.bug(r, { prompt: 'The whole triangle should follow the mouse, but a corner stays put.', code: code(`${at(r, 5, 20)}, ${at(r, 1, 9)}`), fixed: code(`mouseX+${dx}, mouseY-${dy}`), line: 0, why: 5, vectors: [{ mouseX: 100, mouseY: 100 }, { mouseX: 230, mouseY: 310 }], explain: 'Every corner has to use the mouse variables.' });
      },
    }),
    slot('blanks', 'build', 'Completing code with system variables', {
      centered(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the code so the ellipse is always in the center of the canvas.', lines: [['ellipse(', tok('width', 'v'), '/', tok(2, 'n'), ', ', tok('height', 'v'), '/2, 50, 50)']], must: ['v'], count: 2, pools: { v: ['mouseX', 'mouseY'], n: [3, 4] }, spec: U.spec([canvasVec(600, 400, 10, 20), canvasVec(800, 300, 30, 40)]), explain: 'Half of width and half of height is the center.' });
      },
      follow(r) {
        const s = at(r, 3, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so a rectangle ${s} wide and tall follows the mouse.`, lines: [['rect(', tok('mouseX', 'v'), ', ', tok('mouseY', 'v'), `, ${s}, ${s})`]], must: ['v'], count: 2, pools: { v: ['width', 'height'] }, spec: U.spec([canvasVec(600, 400, 10, 20), canvasVec(800, 300, 70, 40)]), explain: 'mouseX and mouseY hold the mouse\'s position.' });
      },
      third(r) {
        const [d, word] = r.pick([[3, 'one third'], [4, 'one quarter'], [5, 'one fifth']]);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the ellipse is ${word} of the way across the canvas, halfway down.`, lines: [['ellipse(', tok('width', 'v'), '/', tok(d, 'n'), ', ', tok('height', 'v'), '/2, 50, 50)']], must: ['v', 'n'], count: 3, pools: { v: ['mouseX', 'mouseY'], n: [d + 3, d + 6] }, spec: U.spec([canvasVec(600, 400, 10, 20), canvasVec(900, 300, 30, 40)]), explain: `Across is width, so divide it by ${d}.` });
      },
    }),
    slot('parsons', 'build', 'Putting code with system variables in order', {
      followers(r) {
        return U.drawParsons(r, { rules: ['Paint a gray background on every frame.', 'Draw a rectangle at the mouse.', 'Draw a circle at the center of the canvas.', 'Print the width.', 'Print the height.'], lines: [`background(${r.pick([180, 200, 220])})`, 'rect(mouseX, mouseY, 40, 40)', 'ellipse(width/2, height/2, 40, 40)', 'console.log(width)', 'console.log(height)'], explain: 'They run in the order written.' });
      },
      mouseSize(r) {
        return U.drawParsons(r, { rules: ['Paint a gray background.', 'Draw an ellipse whose width is mouseX.', 'Draw a rectangle whose height is mouseY.', 'Print mouseX.', 'Print mouseY.'], lines: ['background(220)', `ellipse(100, 100, mouseX, ${at(r, 3, 9)})`, `rect(200, 100, ${at(r, 3, 9)}, mouseY)`, 'console.log(mouseX)', 'console.log(mouseY)'], explain: 'A variable can go anywhere a number can.' });
      },
      corners(r) {
        const s = at(r, 2, 5);
        return U.drawParsons(r, { rules: ['Paint a gray background.', 'Draw a square in the top-left corner.', 'Draw one in the bottom-right corner.', 'Draw a circle at the center.', 'Draw a line from the center to the mouse.'], lines: ['background(200)', `rect(0, 0, ${s}, ${s})`, `rect(width-${s}, height-${s}, ${s}, ${s})`, `ellipse(width/2, height/2, ${s}, ${s})`, 'line(width/2, height/2, mouseX, mouseY)'], explain: 'Subtracting the size keeps the square on the canvas.' });
      },
    }),
  ]);

  const NAMES = ['circleY', 'ellipseSize', 'boxX', 'score', 'lineTop', 'faceX'];

  U.lesson('U1LA3.2', 'Creating Custom Variables', '11-U1LA3.2-Creating-Custom-Variables.md', 20, 12, noFunctions, [
    slot('steps', 'concepts', 'Knowing how variables are created', {
      threeSteps(r) {
        const name = r.pick(NAMES); const n = at(r, 2, 30);
        const rows = r.shuffle([[`let ${name}`, 0], [`${name} = ${n}`, 1], [`ellipse(${name}, 100, 50, 50)`, 2]]);
        return kit.rowsQuestion({ prompt: 'Which step is each line?', columns: ['Code'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: ['declare', 'initialize', 'use'].map((text) => ({ text })), explain: 'Declare names it, initialize gives it a value, and then you use it.' });
      },
      why(r) {
        return choice(r, 'Five ellipses all use the same y value. Why use a variable for it?', 'Changing one value moves all of them', ['It makes the ellipses rounder', 'p5 requires one for every ellipse', 'It keeps the ellipses from overlapping'], 'A variable keeps a repeated value in one place.');
      },
      goodName(r) {
        const [good, bad] = r.pick([['circleY', 'q'], ['ellipseSize', 'zz'], ['boxX', 'thing']]);
        return choice(r, 'Which is the most useful name for a variable?', good, [bad, 'x1x1', 'aaa'], 'A clear name helps you keep track of what it holds.');
      },
    }),
    slot('scope', 'concepts', 'Understanding scope', {
      global(r) {
        const name = r.pick(NAMES);
        return choice(r, `${name} is declared above setup(). Where can it be used?`, 'In any function', ['Only in setup()', 'Only in draw()', 'Only on the line after it'], 'A variable declared outside of a function is global.', { code: [`let ${name}`, 'function setup(){', `  ${name} = 60`, '}'] });
      },
      local(r) {
        const name = r.pick(NAMES);
        return choice(r, `${name} is declared inside setup(). Where can it be used?`, 'Only inside setup()', ['In any function', 'Only inside draw()', 'Anywhere after setup() in the file'], 'A variable declared in a function is local to it.', { code: ['function setup(){', `  let ${name} = 60`, '}'] });
      },
      setupOnce(r) {
        const name = r.pick(NAMES);
        return choice(r, `Why give ${name} its starting value in setup() and not draw()?`, 'setup() runs once, while draw() runs over and over', ['setup() runs faster than draw()', 'draw() can\'t read variables', 'Only setup() can change a value'], 'A value set in draw() is reset on every frame.');
      },
    }),
    slot('trace', 'flow', 'Tracing a variable that changes', {
      add(r) {
        const name = r.pick(NAMES); const a = r.int(2, 30); const b = r.int(2, 30);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${a}`, `${name} = ${name} + ${b}`, `console.log(${name})`], explain: 'The right side is worked out first, and then stored.' });
      },
      twoVars(r) {
        const a = r.int(2, 30); const b = r.int(2, 30);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let first = ${a}`, `let second = ${b}`, 'first = second', 'second = first + 1', 'console.log(second)'], explain: 'Follow the lines one at a time. Each variable holds only its latest value.' });
      },
      overwritten(r) {
        const name = r.pick(NAMES); const a = r.int(2, 30); const b = r.int(31, 60); const c = r.int(2, 9);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${a}`, `${name} = ${b}`, `${name} = ${name} * ${c}`, `console.log(${name})`], explain: 'A new value replaces the old one.' });
      },
    }),
    slot('anchor', 'flow', 'Using one variable to move a design', {
      offset(r) {
        const x = at(r, 5, 30); const d = at(r, 2, 9);
        const code = [`let circleX = ${x}`, 'ellipse(circleX, 60, 60, 60)', `ellipse(circleX + ${d}, 60, 60, 60)`];
        return kit.numberQuestion({ prompt: 'What is the x value of the second ellipse?', code, answer: U.shapesOf(code).shapes[1][1][0], explain: `circleX + ${d}.` });
      },
      changed(r) {
        const x = at(r, 5, 30); const m = at(r, 2, 9); const d = at(r, 2, 9);
        const code = [`let boxX = ${x}`, `boxX = boxX + ${m}`, `rect(boxX + ${d}, 20, 30, 30)`];
        return kit.numberQuestion({ prompt: 'What is the x value of the rectangle?', code, answer: U.shapesOf(code).shapes[0][1][0], explain: 'Work out boxX, and then add the offset.' });
      },
      howMany(r) {
        const d = at(r, 1, 9);
        return choice(r, `To move this whole design ${d} to the right, what do you need to change?`, `Only the value of circleX, adding ${d}`, ['Every number in every ellipse', 'The width of the canvas', 'Nothing, since variables move by themselves'], 'Every shape is placed relative to circleX.', { code: ['let circleX = 120', 'ellipse(circleX, 60, 60, 60)', 'ellipse(circleX + 80, 60, 60, 60)', 'ellipse(circleX + 160, 60, 60, 60)'] });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in variable code', {
      notInitialized(r) {
        const name = r.pick(NAMES); const v = at(r, 2, 20);
        return U.bug(r, { prompt: `${name} should hold ${v} when it gets printed.`, code: [`let ${name}`, `console.log(${name})`, `${name} = ${v}`], fixed: [`let ${name}`, `${name} = ${v}`, `console.log(${name})`], line: [1, 2], why: 3, explain: 'Give it a value before you use it.' });
      },
      misspelled(r) {
        const v = at(r, 2, 20);
        return U.bug(r, { prompt: 'This should print the value of boxX.', code: [`let boxX = ${v}`, 'console.log(boxx)'], fixed: [`let boxX = ${v}`, 'console.log(boxX)'], line: 1, why: 2, explain: 'Variable names have to match exactly, including capitals.' });
      },
      declaredTwice(r) {
        const a = at(r, 2, 20); const b = at(r, 21, 40);
        return U.bug(r, { prompt: `This should change score to ${b}.`, code: [`let score = ${a}`, `let score = ${b}`, 'console.log(score)'], fixed: [`let score = ${a}`, `score = ${b}`, 'console.log(score)'], line: 1, why: 5, explain: 'let is only for creating a variable. To change one, leave let out.' });
      },
    }),
    slot('blanks', 'build', 'Completing variable code', {
      make(r) {
        const v = at(r, 2, 20);
        return kit.blanksQuestion(r, { prompt: `Complete the code so circleY holds ${v}, and both ellipses use it.`, lines: [[tok('let', 'k'), ' circleY'], ['circleY ', tok('=', 'o'), ' ', tok(v, 'n')], ['ellipse(100, ', tok('circleY', 'v'), ', 50, 50)'], ['ellipse(200, ', tok('circleY', 'v'), ', 50, 50)']], must: ['k', 'v'], count: 3, pools: { k: ['if', 'function'], o: ['=='], n: [v + 10], v: ['width', 'mouseY'] }, spec: U.spec([{ mouseY: 7 }]), explain: 'Declare it, give it a value, and use it where the number was.' });
      },
      offset(r) {
        const x = at(r, 5, 30); const d = at(r, 2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the second ellipse is always ${d} to the right of the first.`, lines: [[`let circleX = ${x}`], ['ellipse(', tok('circleX', 'v'), ', 60, 60, 60)'], ['ellipse(', tok('circleX', 'v'), ' + ', tok(d, 'n'), ', 60, 60, 60)']], must: ['v', 'n'], count: 3, pools: { v: ['circleY', 'width'], n: [d + 10, x] }, spec: U.spec([{ width: 400 }]), explain: 'Base the second position on the first, with the distance added.' });
      },
      update(r) {
        const name = r.pick(NAMES); const a = r.int(2, 30); const b = r.int(2, 30);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${name} goes up by ${b}, and then gets printed.`, lines: [[`let ${name} = ${a}`], [tok(name, 'v'), ' = ', tok(name, 'v'), ' + ', tok(b, 'n')], ['console.log(', tok(name, 'v'), ')']], must: ['v'], count: 3, pools: { v: ['width', 'height'], n: [b + 1] }, spec: U.spec([{ width: 400, height: 400 }]), explain: 'Use the old value on the right, and store the new one on the left.' });
      },
    }),
    slot('parsons', 'build', 'Putting variable code in order', {
      globalFlow(r) {
        const n = at(r, 2, 20);
        return kit.parsonsQuestion(r, {
          prompt: `Put these lines in order so the code does this:\n${kit.numberedRules(['Declare circleY outside of the functions.', `Give it a value of ${n} in setup().`, 'Use it to draw an ellipse in draw().'])}`,
          prefix: [{ text: 'let circleY' }],
          movable: ['function setup(){', `circleY = ${n}`, '}', 'function draw(){', 'ellipse(100, circleY, 50, 50)'],
          suffix: [{ text: '}' }],
          spec: { kind: 'sketch', vectors: [{}] },
          explain: 'setup() runs once to give it a value, and then draw() can use it.',
        });
      },
      trace(r) {
        const a = r.int(2, 20); const b = r.int(2, 9);
        return kit.parsonsQuestion(r, {
          prompt: `Put these lines in order so the code does this:\n${kit.numberedRules([`Make total hold ${a}, and print it.`, `Add ${b} to total, and print it.`, 'Double total, and print it.'])}`,
          prefix: [],
          movable: [`let total = ${a}`, 'console.log(total)', `total = total + ${b}`, 'console.log(total)', 'total = total * 2', 'console.log(total)'],
          suffix: [],
          spec: U.spec(),
          explain: 'A variable has to exist before you can print or change it.',
        });
      },
      design(r) {
        const x = at(r, 5, 20); const y = at(r, 5, 20);
        return kit.parsonsQuestion(r, {
          prompt: `Put these lines in order so the code does this:\n${kit.numberedRules([`Make faceX hold ${x}, and faceY hold ${y}.`, 'Draw the head at (faceX, faceY).', 'Then draw the left eye, and then the right eye, on top of it.'])}`,
          prefix: [],
          movable: [`let faceX = ${x}`, `let faceY = ${y}`, 'ellipse(faceX, faceY, 100, 100)', 'ellipse(faceX - 20, faceY, 10, 10)', 'ellipse(faceX + 20, faceY, 10, 10)'],
          suffix: [],
          spec: U.spec(),
          explain: 'Variables come first, and the head goes under the eyes.',
        });
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
