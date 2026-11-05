// U1LA1.1 to U1LA1.4: the canvas, lines, rectangles, ellipses, layering, other shapes.
// Students at this point have seen only drawing functions and comments. They have NOT seen
// color (until U1LA1.4's styling), variables, custom functions, or anything after those.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const { tok } = kit;
  const { slot, choice, at } = U;
  const noVariables = U.NO_LOGIC.concat([[/\blet\b/, 'variables (U1LA3.2)'], [/mouseX|mouseY/, 'mouse variables (U1LA3.1)']]);

  // ---- U1LA1.1 ----
  U.lesson('U1LA1.1', 'p5.js Introduction & Deconstruction', '02-U1LA1.1-p5.js-Introduction-and-Deconstruction.md', 12, 8, noVariables, [
    slot('origin', 'concepts', 'Knowing how the p5 coordinate system works', {
      whereIsZero(r) {
        return choice(r, 'Where is the point (0, 0) on a p5 canvas?', 'The top-left corner', ['The center', 'The bottom-left corner', 'The bottom-right corner'], 'Unlike the graphs in math class, the p5 origin is in the top-left corner.');
      },
      yGrows(r) {
        const [a, b] = r.shuffle([[at(r, 2, 10), at(r, 20, 30)]][0]);
        const lower = Math.max(a, b);
        return choice(r, `Point A is at y = ${a}, and point B is at y = ${b}. Which one is lower on the canvas?`, `The point at y = ${lower}`, [`The point at y = ${Math.min(a, b)}`, 'They are at the same height', 'It depends on the width of the canvas'], 'y gets bigger going down the canvas.');
      },
      xGrows(r) {
        const [a, b] = r.shuffle([at(r, 2, 10), at(r, 20, 30)]);
        const right = Math.max(a, b);
        return choice(r, `Point A is at x = ${a}, and point B is at x = ${b}. Which one is further right on the canvas?`, `The point at x = ${right}`, [`The point at x = ${Math.min(a, b)}`, 'They are the same distance across', 'It depends on the height of the canvas'], 'x gets bigger going right, as it does in math class.');
      },
    }),
    slot('where', 'concepts', 'Finding a location on the canvas', {
      point(r) {
        const [w, h] = U.canvas(r);
        const [x, y] = U.cornerPoint(r, w, h);
        return U.placeQuestion(r, {
          prompt: `The canvas is ${w} wide and ${h} tall. Where is the point (${x}, ${y})?`, x, y, w, h, explain: 'x counts across from the left, and y counts down from the top.',
        });
      },
      circleCenter(r) {
        const [w, h] = U.canvas(r);
        const [x, y] = U.cornerPoint(r, w, h);
        return U.placeQuestion(r, {
          prompt: `The canvas is ${w} wide and ${h} tall. A small circle has its center at (${x}, ${y}). Where is it?`, x, y, w, h, explain: 'x counts across from the left, and y counts down from the top.',
        });
      },
      robotEye(r) {
        const [w, h] = U.canvas(r);
        const [x, y] = U.cornerPoint(r, w, h);
        return U.placeQuestion(r, {
          prompt: `On a robot drawn on a ${w} by ${h} canvas, one bolt is at (${x}, ${y}). Where is the bolt?`, x, y, w, h, explain: 'x counts across from the left, and y counts down from the top.',
        });
      },
    }),
    slot('vocab', 'concepts', 'Knowing the words for this lesson', {
      p5(r) {
        return choice(r, 'What is p5.js?', 'A JavaScript library for making animated and interactive web pages', ['A website for storing photos', 'A type of computer hardware', 'A math formula for drawing circles'], 'p5.js is an open-source JavaScript library.');
      },
      ide(r) {
        return choice(r, 'What is an IDE?', 'An application that gives programmers a place to develop code', ['A function that draws shapes', 'A way to store a number', 'A type of canvas'], 'The p5 editor is an example of an IDE.');
      },
      abstraction(r) {
        return choice(r, 'Breaking a robot down into just rectangles and ellipses is an example of what?', 'Abstraction: reducing something to its essential characteristics', ['Debugging: finding and fixing errors', 'Layering: drawing one thing over another', 'Coloring: choosing how shapes look'], 'Abstraction removes details until only the essentials are left.');
      },
    }),
    slot('measure', 'flow', 'Working out sizes and edges', {
      rightEdge(r) {
        const x = at(r, 2, 20); const w = at(r, 2, 15);
        return kit.numberQuestion({ prompt: `A rectangle's top-left corner is at x = ${x}, and it is ${w} wide. What is the x value of its right edge?`, answer: x + w, explain: `Add the width to the left edge: ${x} + ${w}.` });
      },
      bottomEdge(r) {
        const y = at(r, 2, 20); const h = at(r, 2, 15);
        return kit.numberQuestion({ prompt: `A rectangle's top-left corner is at y = ${y}, and it is ${h} tall. What is the y value of its bottom edge?`, answer: y + h, explain: `y grows going down, so add the height: ${y} + ${h}.` });
      },
      diameter(r) {
        const radius = at(r, 1, 12);
        return kit.numberQuestion({ prompt: `A circle has a radius of ${radius}. What is its diameter?`, answer: radius * 2, explain: 'The diameter goes edge to edge through the center, so it is twice the radius.' });
      },
    }),
    slot('deconstruct', 'build', 'Deconstructing a drawing into shape information', {
      needed(r) {
        const rows = r.shuffle([['Position of a rectangle', 0], ['Position of an ellipse', 1], ['Where a robot\'s square body starts', 0], ['Where a robot\'s round eye sits', 1]]);
        return kit.rowsQuestion({ prompt: 'Which point do you record for each one?', columns: ['Shape information'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'top-left corner' }, { text: 'center' }], explain: 'Rectangles are placed by their top-left corner, and ellipses by their center.' });
      },
      shapeFor(r) {
        const rows = r.shuffle([['Square body', 0], ['Round eye', 1], ['Long rectangular arm', 0], ['Oval mouth', 1]]);
        return kit.rowsQuestion({ prompt: 'Which shape would you use for each robot part?', columns: ['Robot part'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'rectangle' }, { text: 'ellipse' }], explain: 'Straight sides use rectangles, and round parts use ellipses.' });
      },
      information(r) {
        const rows = r.shuffle([['Width and height', 0], ['Top-left corner', 0], ['Radius', 1], ['Center point', 1]]);
        return kit.rowsQuestion({ prompt: 'Which shape do you need each piece of information for on the robot worksheet?', columns: ['Information'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'rectangle' }, { text: 'ellipse' }], explain: 'A rectangle needs its corner and size. An ellipse needs its center and radius.' });
      },
    }),
  ]);

  // ---- U1LA1.2 ----
  const lineCall = (a, b, c, d) => `line(${a}, ${b}, ${c}, ${d})`;

  U.lesson('U1LA1.2', 'Line Functions and Parameters', '03-U1LA1.2-Line-Functions-and-Parameters.md', 15, 9, noVariables, [
    slot('whatItControls', 'concepts', 'Knowing what a function\'s values control', {
      canvas(r) {
        const w = at(r, 20, 80); const h = at(r, 12, 60);
        return choice(r, `In createCanvas(${w}, ${h}), what does ${h} control?`, 'The height of the canvas', ['The width of the canvas', 'The color of the canvas', 'Where the canvas is on the page'], 'createCanvas takes the width first, then the height.');
      },
      gray(r) {
        const rows = r.shuffle([['background(0)', 0], ['background(255)', 1], [`background(${r.int(100, 150)})`, 2]]);
        return kit.rowsQuestion({ prompt: 'What does each background look like?', columns: ['Code'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'black' }, { text: 'white' }, { text: 'gray' }], explain: 'One number is a gray value from 0, which is black, to 255, which is white.' });
      },
      terms(r) {
        const x = at(r, 2, 30); const y = at(r, 2, 30);
        return choice(r, `In point(${x}, ${y}), what are ${x} and ${y} called?`, 'Arguments, the values passed to the function\'s parameters', ['Function names', 'Comments', 'Canvases'], 'The values inside the parentheses change how a function behaves.', { code: [`point(${x}, ${y})`] });
      },
    }),
    slot('lineKinds', 'concepts', 'Reading the values of a line', {
      kinds(r) {
        const a = at(r, 2, 10); const b = at(r, 12, 20); const c = at(r, 22, 30); const d = at(r, 32, 38);
        const rows = r.shuffle([[lineCall(a, b, c, b), 0], [lineCall(a, b, a, d), 1], [lineCall(a, b, c, d), 2]]);
        return kit.rowsQuestion({ prompt: 'What kind of line does each call draw?', columns: ['Code'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'horizontal' }, { text: 'vertical' }, { text: 'diagonal' }], explain: 'The same y twice is horizontal, and the same x twice is vertical.' });
      },
      endPoint(r) {
        const a = at(r, 2, 10); const b = at(r, 12, 20); const c = at(r, 22, 30); const d = at(r, 32, 38);
        return choice(r, `Where does this line end?`, `(${c}, ${d})`, [`(${a}, ${b})`, `(${a}, ${c})`, `(${b}, ${d})`], 'line(x1, y1, x2, y2): the third and fourth values are the second point.', { code: [lineCall(a, b, c, d)] });
      },
      cornerLine(r) {
        const [w, h] = U.canvas(r);
        return choice(r, `Which call draws a line from the top-left corner to the bottom-right corner of a ${w} by ${h} canvas?`, lineCall(0, 0, w, h), [lineCall(w, h, 0, h), lineCall(0, h, w, 0), lineCall(0, w, 0, h)], 'The top-left corner is (0, 0), and the bottom-right corner is (width, height).', { codeOptions: true });
      },
    }),
    slot('order', 'flow', 'Knowing that code runs from top to bottom', {
      twoBackgrounds(r) {
        const [a, b] = r.sample([0, 50, 100, 150, 200, 255], 2);
        const code = [`background(${a})`, `background(${b})`];
        return kit.numberQuestion({ prompt: 'What gray value does the canvas end up with?', code, answer: Number(U.shapesOf(code).bg), explain: 'The last background paints over the earlier one.' });
      },
      threeBackgrounds(r) {
        const [a, b, c] = r.sample([0, 50, 100, 150, 200, 255], 3);
        const code = [`background(${a})`, `background(${b})`, `background(${c})`];
        return kit.numberQuestion({ prompt: 'What gray value does the canvas end up with?', code, answer: Number(U.shapesOf(code).bg), explain: 'They all run, in order, so the last one is what you see.' });
      },
      paintedOver(r) {
        const a = at(r, 2, 10); const b = at(r, 12, 20);
        const first = r.chance(0.5);
        const code = first ? [`line(${a}, ${b}, ${b}, ${a})`, 'background(200)'] : ['background(200)', `line(${a}, ${b}, ${b}, ${a})`];
        const seen = U.shapesOf(code).shapes.length > 0;
        return choice(r, 'Can you see the line when this code finishes?', seen ? 'Yes, the line was drawn after the background' : 'No, the background painted over the line', [seen ? 'No, the background painted over the line' : 'Yes, the line was drawn after the background', 'Only if the canvas is bigger than the line', 'Only for lines that are horizontal'], 'Code runs from top to bottom, and later drawing goes on top.', { code });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in point and line code', {
      missingValue(r) {
        const a = at(r, 2, 10); const b = at(r, 12, 20); const c = at(r, 22, 30); const d = at(r, 32, 38);
        return U.bug(r, { prompt: `This should draw a line from (${a}, ${b}) to (${c}, ${d}).`, code: ['background(220)', `line(${a}, ${b}, ${c})`], fixed: ['background(220)', lineCall(a, b, c, d)], line: 1, why: 1, explain: 'A line needs four values: two for each point.' });
      },
      capital(r) {
        const a = at(r, 2, 10); const b = at(r, 12, 20); const c = at(r, 22, 30); const d = at(r, 32, 38);
        return U.bug(r, { prompt: `This should draw a line from (${a}, ${b}) to (${c}, ${d}).`, code: ['background(220)', `Line(${a}, ${b}, ${c}, ${d})`], fixed: ['background(220)', lineCall(a, b, c, d)], line: 1, why: 2, explain: 'The function is line(), with a lowercase l.' });
      },
      swapped(r) {
        const x = at(r, 30, 50); const y = at(r, 2, 15);
        return U.bug(r, { prompt: `This should draw a point at x = ${x}, y = ${y}.`, code: ['background(220)', `point(${y}, ${x})`], fixed: ['background(220)', `point(${x}, ${y})`], line: 1, why: 0, explain: 'x comes first, and then y.' });
      },
    }),
    slot('blanks', 'build', 'Completing point and line code', {
      line(r) {
        const a = at(r, 2, 10); const b = at(r, 12, 20); const c = at(r, 22, 30); const d = at(r, 32, 38);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it draws a line from (${a}, ${b}) to (${c}, ${d}).`, lines: [['line(', tok(a, 'num'), ', ', tok(b, 'num'), ', ', tok(c, 'num'), ', ', tok(d, 'num'), ')']], must: ['num'], count: 3, pools: { num: [a + 5, d + 10] }, spec: U.spec(), explain: 'Each point is x and then y.' });
      },
      canvas(r) {
        const w = at(r, 20, 40); const h = at(r, 12, 18);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it makes a canvas ${w} wide and ${h} tall with a white background.`, lines: [['createCanvas(', tok(w, 'num'), ', ', tok(h, 'num'), ')'], ['background(', tok(255, 'gray'), ')']], must: ['num', 'gray'], count: 3, pools: { num: [w + 100], gray: [0, 128] }, spec: U.spec(), explain: 'Width comes first, then height. 255 is white.' });
      },
      point(r) {
        const x = at(r, 2, 30); const y = at(r, 32, 40);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it draws a point at x = ${x}, y = ${y}.`, lines: [[tok('point', 'fn'), '(', tok(x, 'num'), ', ', tok(y, 'num'), ')']], must: ['num', 'fn'], count: 3, pools: { fn: ['line', 'background'], num: [x + 5] }, spec: U.spec(), explain: 'point takes x and then y.' });
      },
    }),
    slot('parsons', 'build', 'Putting drawing code in order', {
      linesOnGray(r) {
        const g = r.pick([180, 200, 220]);
        const lines = [lineCall(10, 20, at(r, 10, 30), 20), lineCall(10, 60, at(r, 10, 30), 60), 'point(30, 90)', `point(${at(r, 10, 30)}, 90)`];
        return U.drawParsons(r, { rules: [`Paint a background with a gray value of ${g} first.`, 'Then draw the top line, the lower line, the left point, and the right point, in that order.'], lines: [`background(${g})`].concat(lines), explain: 'Code draws in the order it is written.' });
      },
      house(r) {
        const s = r.pick([100, 120, 150]); const x = at(r, 2, 8); const y = at(r, 5, 10);
        return U.drawParsons(r, { rules: ['Paint a light gray background.', 'Draw the top, right side, bottom, and then left side of a square, in that order.'], lines: ['background(220)', lineCall(x, y, x + s, y), lineCall(x + s, y, x + s, y + s), lineCall(x + s, y + s, x, y + s), lineCall(x, y + s, x, y)], explain: 'Each line starts where the last one ended.' });
      },
      pointsInOrder(r) {
        const g = r.pick([180, 200, 220]);
        return U.drawParsons(r, { rules: [`Paint a background with a gray value of ${g}.`, 'Draw the points in order from left to right.'], lines: [`background(${g})`, `point(${at(r, 1, 4)}, 50)`, `point(${at(r, 6, 9)}, 50)`, `point(${at(r, 11, 14)}, 50)`, `point(${at(r, 16, 19)}, 50)`], explain: 'The background comes first, or it covers the points.' });
      },
    }),
  ]);

  // ---- U1LA1.3 ----
  const rectArgs = (r) => [at(r, 2, 20), at(r, 2, 20), at(r, 5, 15), at(r, 3, 12)];

  U.lesson('U1LA1.3', 'Rectangles, Ellipses, and Layering', '04-U1LA1.3-Rectangles-Ellipses-and-Layering.md', 15, 9, noVariables, [
    slot('anchors', 'concepts', 'Knowing how rect() and ellipse() are placed', {
      rectAnchor(r) {
        const [x, y, w, h] = rectArgs(r);
        return choice(r, `In this call, which part of the rectangle is at (${x}, ${y})?`, 'Its top-left corner', ['Its center', 'Its bottom-right corner', 'Its top-right corner'], 'A rectangle is placed by its top-left corner.', { code: [`rect(${x}, ${y}, ${w}, ${h})`] });
      },
      ellipseAnchor(r) {
        const [x, y, w, h] = rectArgs(r);
        return choice(r, `In this call, which part of the ellipse is at (${x}, ${y})?`, 'Its center', ['Its top-left edge', 'Its bottom edge', 'Its right edge'], 'An ellipse is placed by its center.', { code: [`ellipse(${x}, ${y}, ${w}, ${h})`] });
      },
      diameter(r) {
        const [x, y, w] = rectArgs(r);
        return choice(r, `In this call, what does ${w} measure?`, 'The diameter, from one side to the other', ['The radius, from the center to the edge', 'How far the ellipse is from the corner', 'The area of the ellipse'], 'The width and height of an ellipse are diameters.', { code: [`ellipse(${x}, ${y}, ${w}, ${w})`] });
      },
    }),
    slot('edges', 'flow', 'Working out where the edges of a shape are', {
      rectRight(r) {
        const [x, y, w, h] = rectArgs(r);
        return kit.numberQuestion({ prompt: 'What is the x value of this rectangle\'s right edge?', code: [`rect(${x}, ${y}, ${w}, ${h})`], answer: x + w, explain: `x + width: ${x} + ${w}.` });
      },
      ellipseLeft(r) {
        const x = at(r, 20, 40); const y = at(r, 20, 40); const d = 20 * r.int(2, 8);
        return kit.numberQuestion({ prompt: 'What is the x value of this ellipse\'s left edge?', code: [`ellipse(${x}, ${y}, ${d}, ${d})`], answer: x - d / 2, explain: `The center minus half the width: ${x} - ${d / 2}.` });
      },
      ellipseBottom(r) {
        const x = at(r, 20, 40); const y = at(r, 20, 40); const d = 20 * r.int(2, 8);
        return kit.numberQuestion({ prompt: 'What is the y value of this ellipse\'s bottom edge?', code: [`ellipse(${x}, ${y}, ${d}, ${d})`], answer: y + d / 2, explain: `The center plus half the height: ${y} + ${d / 2}.` });
      },
    }),
    slot('layers', 'flow', 'Predicting which shape ends up on top', {
      twoShapes(r) {
        const rectFirst = r.chance(0.5);
        const shapes = ['rect(100, 100, 100, 100)', 'ellipse(150, 150, 80, 80)'];
        const code = rectFirst ? shapes : shapes.slice().reverse();
        const top = U.shapesOf(code).shapes[1][0];
        return choice(r, 'Which shape is on top where they overlap?', top === 'rect' ? 'The rectangle' : 'The ellipse', [top === 'rect' ? 'The ellipse' : 'The rectangle', 'The bigger shape', 'Neither, since shapes mix together'], 'Shapes are drawn from top to bottom, so the last one ends up on top.', { code });
      },
      three(r) {
        const names = r.shuffle([['rect(50, 50, 200, 200)', 'big rectangle'], ['ellipse(150, 150, 150, 150)', 'circle'], ['rect(120, 120, 60, 60)', 'small rectangle']]);
        return choice(r, 'Which shape is on the very top?', `The ${names[2][1]}`, [`The ${names[0][1]}`, `The ${names[1][1]}`, 'They are all at the same layer'], 'The last shape drawn is on top.', { code: names.map((n) => n[0]) });
      },
      hidden(r) {
        const small = `ellipse(150, 150, ${at(r, 3, 6)}, ${at(r, 3, 6)})`;
        return choice(r, 'Why can\'t you see the ellipse?', 'The bigger rectangle is drawn after it, and covers it', ['An ellipse can\'t be inside a rectangle', 'The ellipse needs a canvas of its own', 'rect() erases everything on the canvas'], 'Swap the order, and the ellipse appears on top.', { code: [small, 'rect(50, 50, 300, 300)'] });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in rectangle and ellipse code', {
      covered(r) {
        const a = 'rect(50, 50, 200, 200)'; const b = `ellipse(150, 150, ${at(r, 5, 10)}, ${at(r, 5, 10)})`;
        return U.bug(r, { prompt: 'The ellipse should be on top of the rectangle.', code: ['background(220)', b, a], fixed: ['background(220)', a, b], line: [1, 2], why: 3, explain: 'Draw the rectangle first, so that the ellipse lands on top.' });
      },
      missing(r) {
        const [x, y, w, h] = rectArgs(r);
        return U.bug(r, { prompt: `This should draw a rectangle ${w} wide and ${h} tall.`, code: ['background(220)', `rect(${x}, ${y}, ${w})`], fixed: ['background(220)', `rect(${x}, ${y}, ${w}, ${h})`], line: 1, why: 1, explain: 'This rectangle needs x, y, width, and height.' });
      },
      spelling(r) {
        const [x, y, w, h] = rectArgs(r);
        return U.bug(r, { prompt: `This should draw an ellipse centered at (${x}, ${y}).`, code: ['background(220)', `Ellipse(${x}, ${y}, ${w}, ${h})`], fixed: ['background(220)', `ellipse(${x}, ${y}, ${w}, ${h})`], line: 1, why: 2, explain: 'The function is ellipse(), all lowercase.' });
      },
    }),
    slot('blanks', 'build', 'Completing rectangle and ellipse code', {
      rect(r) {
        const [x, y, w, h] = rectArgs(r);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the rectangle's top-left corner is at (${x}, ${y}), and it is ${w} wide and ${h} tall.`, lines: [['rect(', tok(x, 'a'), ', ', tok(y, 'a'), ', ', tok(w, 'a'), ', ', tok(h, 'a'), ')']], must: ['a'], count: 3, pools: { a: [x + w, y + h + 5] }, spec: U.spec(), explain: 'x, y, width, and then height.' });
      },
      centered(r) {
        const x = at(r, 10, 30); const y = at(r, 10, 30); const s = 20 * r.int(2, 5);
        return kit.blanksQuestion(r, { prompt: `A square is at rect(${x}, ${y}, ${s}, ${s}). Complete the code so a circle fits exactly inside it.`, lines: [[`rect(${x}, ${y}, ${s}, ${s})`], ['ellipse(', tok(x + s / 2, 'a'), ', ', tok(y + s / 2, 'a'), ', ', tok(s, 'a'), ', ', tok(s, 'a'), ')']], must: ['a'], count: 3, pools: { a: [x, y + s] }, spec: U.spec(), explain: 'The circle\'s center is half the square\'s size in from its corner, and its diameter is the square\'s size.' });
      },
      layered(r) {
        const s = at(r, 5, 10);
        return kit.blanksQuestion(r, { prompt: 'Complete the code so a circle sits on top of a rectangle.', lines: [[tok('rect', 'fn'), `(100, 100, ${s * 2}, ${s * 2})`], [tok('ellipse', 'fn'), `(${100 + s}, ${100 + s}, ${s}, ${s})`]], must: ['fn'], count: 2, pools: { fn: ['point', 'line'] }, spec: U.spec(), explain: 'The rectangle goes first, so the circle lands on top.' });
      },
    }),
    slot('parsons', 'build', 'Putting layered shapes in order', {
      robot(r) {
        const x = at(r, 5, 15); const y = at(r, 5, 15);
        return U.drawParsons(r, { rules: ['Paint a gray background.', 'Draw the robot\'s body rectangle.', 'Draw its left eye and then its right eye on the body.', 'Draw its mouth rectangle last.'], lines: ['background(200)', `rect(${x}, ${y}, 100, 100)`, `ellipse(${x + 30}, ${y + 30}, 20, 20)`, `ellipse(${x + 70}, ${y + 30}, 20, 20)`, `rect(${x + 30}, ${y + 70}, 40, 10)`], explain: 'The body has to come before anything that sits on it.' });
      },
      target(r) {
        const c = at(r, 15, 25);
        return U.drawParsons(r, { rules: ['Paint a gray background.', `Draw circles centered at (${c}, ${c}), from biggest to smallest, so that all of them show.`], lines: ['background(180)', `ellipse(${c}, ${c}, 160, 160)`, `ellipse(${c}, ${c}, 120, 120)`, `ellipse(${c}, ${c}, 80, 80)`, `ellipse(${c}, ${c}, 40, 40)`], explain: 'Biggest first, because later shapes cover earlier ones.' });
      },
      framed(r) {
        const x = at(r, 2, 8);
        return U.drawParsons(r, { rules: ['Paint a gray background.', 'Draw a big rectangle.', 'Draw a smaller rectangle on it.', 'Draw a circle on that rectangle.', 'Draw a line across the circle.'], lines: ['background(210)', `rect(${x}, ${x}, 200, 200)`, `rect(${x + 40}, ${x + 40}, 120, 120)`, `ellipse(${x + 100}, ${x + 100}, 80, 80)`, lineCall(x + 60, x + 100, x + 140, x + 100)], explain: 'Each thing goes after whatever it sits on.' });
      },
    }),
  ]);

  // ---- U1LA1.4 ----
  U.lesson('U1LA1.4', 'Other Shapes & Styling', '05-U1LA1.4-Other-Shapes-and-Styling.md', 15, 9, U.NO_LOGIC.concat([[/\blet\b/, 'variables (U1LA3.2)']]), [
    slot('valueCounts', 'concepts', 'Knowing what each shape function needs', {
      counts(r) {
        const rows = r.shuffle([['triangle()', 0], ['quad()', 1], ['line()', 2]]);
        return kit.rowsQuestion({ prompt: 'How many numbers does each function need?', columns: ['Function'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: '6' }, { text: '8' }, { text: '4' }], explain: 'Each corner needs an x and a y.' });
      },
      triangleCorner(r) {
        const v = r.sample(Array.from({ length: 37 }, (_, i) => 10 * (i + 2)), 6);
        return choice(r, 'What is the second corner of this triangle?', `(${v[2]}, ${v[3]})`, [`(${v[0]}, ${v[1]})`, `(${v[4]}, ${v[5]})`, `(${v[1]}, ${v[2]})`], 'The values come in x, y pairs, one pair per corner.', { code: [`triangle(${v.join(', ')})`] });
      },
      polygon(r) {
        const sides = r.pick(['star', 'hexagon', 'arrow']);
        return choice(r, `Which functions would you use to draw a ${sides} with any number of corners?`, 'beginShape(), vertex(), and endShape()', ['triangle() and nothing else', 'rect() and ellipse()', 'createCanvas() and background()'], 'beginShape starts a shape, each vertex adds a corner, and endShape finishes it.');
      },
    }),
    slot('reference', 'concepts', 'Using the reference and solving problems', {
      stuck(r) {
        const fn = r.pick(['quad()', 'arc()', 'triangle()']);
        return choice(r, `You don't remember what values ${fn} needs. What's the best next step?`, 'Look it up in the p5 reference', ['Delete the line and start over', 'Guess values until it stops crashing', 'Wait until someone else solves it'], 'The reference shows every function and its parameters.');
      },
      errors(r) {
        const line = r.int(3, 40);
        return choice(r, `An error message mentions line ${line}. What should you do first?`, `Read the description and look at line ${line}`, ['Rewrite the entire program', 'Close the editor and reopen it', 'Ignore it, since messages are usually wrong'], 'Error messages usually point near the problem.');
      },
      expected(r) {
        return choice(r, r.pick(['Your shape isn\'t where you expected.', 'Your program runs but looks wrong.', 'A shape has disappeared.']) + ' Which two questions should you ask first?', 'What was supposed to happen, and what happened instead?', ['Who wrote this code, and when?', 'How long is the program, and how fast does it run?', 'What color should this be, and is it pretty?'], 'Comparing what you expected with what happened is how debugging begins.');
      },
    }),
    slot('arc', 'flow', 'Reading the values of an arc and styles', {
      half(r) {
        const s = at(r, 5, 20);
        return choice(r, 'How much of a circle does this draw?', 'Half', ['A quarter', 'All of it', 'Three quarters'], 'Degrees start at 0 and a full circle is 360, so 0 to 180 is half.', { code: ['angleMode(DEGREES)', `arc(200, 200, ${s}, ${s}, 0, 180)`] });
      },
      arcSize(r) {
        const w = at(r, 5, 20); const h = at(r, 21, 30);
        return kit.numberQuestion({ prompt: 'How tall is the full ellipse this arc is cut from?', code: [`arc(200, 200, ${w}, ${h}, 0, PI)`], answer: h, explain: 'The first four values work the same as they do in ellipse().' });
      },
      weight(r) {
        const [a, b] = r.sample([1, 2, 4, 6, 8, 10], 2);
        const code = [`strokeWeight(${a})`, 'line(10, 10, 90, 10)', `strokeWeight(${b})`, 'line(10, 30, 90, 30)'];
        return kit.numberQuestion({ prompt: 'What stroke weight does the second line get?', code, answer: U.shapesOf(code).shapes[1][3], explain: 'A style applies to whatever is drawn after it, until it changes.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in shape code', {
      triangleShort(r) {
        const v = Array.from({ length: 6 }, () => at(r, 2, 38));
        return U.bug(r, { prompt: 'This should draw a triangle.', code: ['background(220)', `triangle(${v.slice(0, 5).join(', ')})`], fixed: ['background(220)', `triangle(${v.join(', ')})`], line: 1, why: 1, explain: 'A triangle needs six values: x and y for each of three corners.' });
      },
      styleAfter(r) {
        const w = r.int(4, 12);
        return U.bug(r, { prompt: `The line should have a stroke weight of ${w}.`, code: ['line(10, 10, 200, 200)', `strokeWeight(${w})`], fixed: [`strokeWeight(${w})`, 'line(10, 10, 200, 200)'], line: [0, 1], why: 3, explain: 'Styles have to be set before the shape is drawn.' });
      },
      vertexSpelling(r) {
        const x = at(r, 2, 30);
        const lines = (name) => ['beginShape()', `${name}(${x}, 20)`, `vertex(${x + 50}, 20)`, `vertex(${x + 50}, 80)`, 'endShape(CLOSE)'];
        return U.bug(r, { prompt: 'This should draw a closed shape with three corners.', code: lines('Vertex'), fixed: lines('vertex'), line: 1, why: 2, explain: 'The function is vertex(), all lowercase.' });
      },
    }),
    slot('blanks', 'build', 'Completing code for other shapes', {
      triangle(r) {
        const v = [at(r, 2, 10), at(r, 2, 10), at(r, 12, 20), at(r, 12, 20), at(r, 22, 30), at(r, 22, 30)];
        return kit.blanksQuestion(r, { prompt: `Complete the code so the triangle has corners at (${v[0]}, ${v[1]}), (${v[2]}, ${v[3]}), and (${v[4]}, ${v[5]}).`, lines: [[tok('triangle', 'fn'), '(', tok(v[0], 'n'), ', ', tok(v[1], 'n'), `, ${v[2]}, ${v[3]}, `, tok(v[4], 'n'), ', ', tok(v[5], 'n'), ')']], must: ['fn', 'n'], count: 3, pools: { fn: ['quad', 'rect'], n: [v[0] + 5] }, spec: U.spec(), explain: 'One x, y pair for each corner.' });
      },
      shape(r) {
        const x = at(r, 2, 20);
        return kit.blanksQuestion(r, { prompt: 'Complete the code so it draws a closed three-cornered shape.', lines: [[tok('beginShape', 'fn'), '()'], [tok('vertex', 'fn'), `(${x}, 20)`], [`vertex(${x + 60}, 20)`], [`vertex(${x + 60}, 90)`], [tok('endShape', 'fn'), '(', tok('CLOSE', 'c'), ')']], must: ['fn'], count: 3, pools: { fn: ['createCanvas', 'point'], c: ['CENTER'] }, spec: U.spec(), explain: 'beginShape, then the corners, then endShape(CLOSE).' });
      },
      arc(r) {
        const s = at(r, 5, 15);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it draws the bottom half of a circle ${s} wide, centered at (200, 200), using degrees.`, lines: [['angleMode(DEGREES)'], ['arc(200, 200, ', tok(s, 'n'), `, ${s}, 0, `, tok(180, 'n'), ')']], must: ['n'], count: 2, pools: { n: [90, 360] }, spec: U.spec(), explain: 'Degrees go clockwise from the right, so 0 to 180 is the bottom half.' });
      },
    }),
    slot('parsons', 'build', 'Putting shapes and styles in order', {
      shapeLines(r) {
        const x = at(r, 2, 20);
        return U.drawParsons(r, { rules: ['Paint a gray background.', 'Start a shape, and add corners going clockwise from the top.', 'Close the shape.'], lines: ['background(220)', 'beginShape()', `vertex(${x + 50}, 10)`, `vertex(${x + 100}, 90)`, `vertex(${x}, 90)`, 'endShape(CLOSE)'], explain: 'Vertices go between beginShape and endShape.' });
      },
      weights(r) {
        const [a, b] = r.sample([2, 4, 6, 8], 2);
        return U.drawParsons(r, { rules: ['Paint a gray background.', `Draw a triangle with a stroke weight of ${a}.`, `Then draw a quad with a stroke weight of ${b}.`], lines: ['background(200)', `strokeWeight(${a})`, 'triangle(10, 90, 50, 10, 90, 90)', `strokeWeight(${b})`, 'quad(110, 10, 190, 10, 190, 90, 110, 90)'], explain: 'Each style goes right before the shape that uses it.' });
      },
      noOutline(r) {
        const s = at(r, 4, 9);
        return U.drawParsons(r, { rules: ['Paint a gray background.', 'Draw a triangle with its outline.', 'Turn off outlines.', `Draw an arc with a width and height of ${s}.`, 'Draw a rectangle.'], lines: ['background(220)', 'triangle(10, 90, 50, 10, 90, 90)', 'noStroke()', `arc(150, 50, ${s}, ${s}, 0, PI)`, 'rect(200, 20, 50, 50)'], explain: 'noStroke only affects what comes after it.' });
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
