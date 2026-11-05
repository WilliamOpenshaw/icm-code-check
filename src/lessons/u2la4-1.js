// U2LA4.1: Collision Functions && Collide2D
// curriculum/02-unit-2/11-U2LA4.1-Collision-Functions-and-Collide2D.md
//
// Students at this point have seen: everything through U2LA3.3, plus working out when the mouse
// is inside a rectangle, a mouseOnRect function returning true or false, and the collide2D
// functions such as collidePointRect, collidePointCircle, and collidePointLine.
// They have NOT seen: mouseIsPressed, mousePressed(), key presses, or loops.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    tok, chainLines, numberedRules, WHY,
  } = kit;

  // Rectangles with tidy edges, on a canvas with room around them.
  function pickRect(r) {
    const canvas = r.pick([400, 500, 600]);
    const x = r.pick([50, 100, 150]);
    const y = r.pick([50, 100, 150]);
    const w = r.pick([100, 150, 200]);
    const h = r.pick([50, 100, 150]);
    return {
      canvas, x, y, w, h, right: x + w, bottom: y + h, args: `${x}, ${y}, ${w}, ${h}`,
    };
  }

  const handWritten = (b) => `mouseX > ${b.x} && mouseX < ${b.right} && mouseY > ${b.y} && mouseY < ${b.bottom}`;
  const collideCall = (b) => `collidePointRect(mouseX, mouseY, ${b.args})`;
  const midX = (b) => b.x + 20;
  const midY = (b) => b.y + 20;

  // The lesson's mouseOnRect function, under different names for each student.
  const FUNCTION_NAMES = ['mouseOnRect', 'isOnRect', 'overRect', 'touchingRect', 'hoveringRect'];
  const PARAMETERS = [['x', 'y', 'w', 'h'], ['rectX', 'rectY', 'rectW', 'rectH'], ['boxX', 'boxY', 'boxW', 'boxH'], ['left', 'top', 'wide', 'tall']];

  function pickOnRect(r) {
    const fn = r.pick(FUNCTION_NAMES);
    const [x, y, w, h] = r.pick(PARAMETERS);
    const inside = `mouseX > ${x} && mouseX < ${x} + ${w} && mouseY > ${y} && mouseY < ${y} + ${h}`;
    const head = `function ${fn}(${x}, ${y}, ${w}, ${h}){`;
    return {
      fn,
      x,
      y,
      w,
      h,
      inside,
      head,
      lines: (condition = inside, whenTrue = 'return true') => [head, `  if(${condition}){`, `    ${whenTrue}`, '  }', '  else{', '    return false', '  }', '}'],
    };
  }

  const ON_OFF = [{ text: 'on it' }, { text: 'off it' }];

  function insideRows(r, { b, code, points, explain }) {
    return kit.rowsQuestion({
      prompt: 'Is the mouse on the rectangle or off it at each position?',
      code,
      columns: ['mouseX', 'mouseY'],
      rows: r.shuffle(points).map((p) => ({
        cells: [String(p.mouseX), String(p.mouseY)],
        answer: kit.printed(`console.log(${collideCall(b)})`, p)[0] === 'true' ? 0 : 1,
      })),
      options: ON_OFF,
      explain,
    });
  }

  const insideSlot = {
    id: 'inside',
    skill: 'concepts',
    concept: 'Telling whether a point is inside a rectangle',
    patterns: [
      {
        id: 'each-side',
        make(r) {
          const b = pickRect(r);
          return insideRows(r, {
            b,
            code: [`rect(${b.args})`],
            points: [
              { mouseX: midX(b), mouseY: midY(b) },
              { mouseX: b.x - 20, mouseY: midY(b) },
              { mouseX: b.right + 20, mouseY: midY(b) },
              { mouseX: midX(b), mouseY: b.bottom + 20 },
            ],
            explain: `This rectangle covers x from ${b.x} to ${b.right}, and y from ${b.y} to ${b.bottom}.`,
          });
        },
      },
      {
        id: 'only-one-direction-is-right',
        make(r) {
          const b = pickRect(r);
          return insideRows(r, {
            b,
            code: [`rect(${b.args})`],
            points: [
              { mouseX: midX(b), mouseY: b.y - 20 },
              { mouseX: b.right + 20, mouseY: midY(b) },
              { mouseX: b.right - 10, mouseY: b.bottom - 10 },
              { mouseX: b.x - 20, mouseY: b.bottom - 10 },
            ],
            explain: 'A point is only on the rectangle when its x and its y are both within the rectangle.',
          });
        },
      },
      {
        id: 'width-is-not-the-right-edge',
        make(r) {
          const w = r.pick([50, 100, 120]);
          const x = w + r.pick([100, 150, 200]);
          const y = r.pick([50, 100]);
          const h = r.pick([50, 100, 150]);
          const b = {
            x, y, w, h, right: x + w, bottom: y + h, args: `${x}, ${y}, ${w}, ${h}`,
          };
          return insideRows(r, {
            b,
            code: [`rect(${b.args})`],
            points: [
              { mouseX: x - 10, mouseY: y + 10 },
              { mouseX: x + 10, mouseY: y + 10 },
              { mouseX: b.right + 10, mouseY: y + 10 },
              { mouseX: b.right - 10, mouseY: b.bottom - 10 },
            ],
            explain: `${w} is how wide the rectangle is, not where it ends. Its right edge is at ${x} + ${w} = ${b.right}.`,
          });
        },
      },
    ],
  };

  const edgesSlot = {
    id: 'edges',
    skill: 'flow',
    concept: 'Working out the edges of a rectangle',
    patterns: [
      {
        id: 'right-edge',
        make(r) {
          const b = pickRect(r);
          return kit.numberQuestion({
            prompt: 'What is the x value of this rectangle\'s right edge?',
            code: [`rect(${b.args})`],
            answer: b.right,
            explain: `rect(x, y, width, height), so the right edge is x + width: ${b.x} + ${b.w}.`,
          });
        },
      },
      {
        id: 'bottom-edge',
        make(r) {
          const b = pickRect(r);
          return kit.numberQuestion({
            prompt: 'What is the y value of this rectangle\'s bottom edge?',
            code: [`rect(${b.args})`],
            answer: b.bottom,
            explain: `rect(x, y, width, height), so the bottom edge is y + height: ${b.y} + ${b.h}.`,
          });
        },
      },
      {
        id: 'edge-from-variables',
        make(r) {
          const b = pickRect(r);
          const name = r.pick(['box', 'button', 'theRect']);
          const lines = [`let ${name} = {`, `  x: ${b.x},`, `  y: ${b.y},`, `  w: ${b.w},`, `  h: ${b.h}`, '}', `console.log(${name}.x + ${name}.w)`];
          return kit.printedNumber({
            prompt: 'What number does this code print?',
            code: lines,
            explain: `${name}.x + ${name}.w is the rectangle's right edge: ${b.x} + ${b.w}.`,
          });
        },
      },
      {
        id: 'edges-inside-the-function',
        make(r) {
          const b = pickRect(r);
          return kit.printedNumber({
            prompt: `When this call runs, what number does the function print?`,
            code: ['function mouseOnRect(x, y, w, h){', '  console.log(y + h)', '}', `mouseOnRect(${b.args})`],
            explain: `The arguments fill in x, y, w, and h in order, so y + h is ${b.y} + ${b.h}.`,
          });
        },
      },
    ],
  };

  const REGION_PROMPT = 'Tap every part of the canvas where this condition is true.';
  const cutsOf = (b) => ({ w: b.canvas, h: b.canvas, xs: [b.x, b.right], ys: [b.y, b.bottom] });

  const regionSlot = {
    id: 'region',
    skill: 'concepts',
    concept: 'Finding where a collision check is true on the canvas',
    patterns: [
      {
        id: 'collide-function',
        make(r) {
          const b = pickRect(r);
          return kit.regionQuestion({
            prompt: REGION_PROMPT, condition: collideCall(b), ...cutsOf(b), explain: 'collidePointRect is true only when the point is inside the rectangle, so only the middle part counts.',
          });
        },
      },
      {
        id: 'written-by-hand',
        make(r) {
          const b = pickRect(r);
          return kit.regionQuestion({
            prompt: REGION_PROMPT, condition: handWritten(b), ...cutsOf(b), explain: 'All four comparisons must be true, so only the part inside all the edges counts.',
          });
        },
      },
      {
        id: 'only-left-and-right',
        make(r) {
          const b = pickRect(r);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `mouseX > ${b.x} && mouseX < ${b.right}`,
            ...cutsOf(b),
            explain: 'This only checks mouseX, so the whole column counts, no matter how high or low the mouse is.',
          });
        },
      },
      {
        id: 'only-up-and-down',
        make(r) {
          const b = pickRect(r);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `mouseY > ${b.y} && mouseY < ${b.bottom}`,
            ...cutsOf(b),
            explain: 'This only checks mouseY, so the whole row counts, no matter how far left or right the mouse is.',
          });
        },
      },
    ],
  };

  const TRUE_FALSE = [{ text: 'true' }, { text: 'false' }];

  const functionSlot = {
    id: 'fnTrace',
    skill: 'flow',
    concept: 'Following a function that checks for collisions',
    patterns: [
      {
        id: 'what-it-returns',
        make(r) {
          const b = pickRect(r);
          const f = pickOnRect(r);
          const code = f.lines().concat(['', `console.log(${f.fn}(${b.args}))`]);
          const points = r.shuffle([
            { mouseX: midX(b), mouseY: midY(b) },
            { mouseX: b.right + 10, mouseY: midY(b) },
            { mouseX: midX(b), mouseY: b.y - 10 },
            { mouseX: b.x, mouseY: midY(b) },
          ]);
          return kit.rowsQuestion({
            prompt: 'What does the call return at each mouse position?',
            code,
            columns: ['mouseX', 'mouseY'],
            rows: points.map((p) => ({
              cells: [String(p.mouseX), String(p.mouseY)],
              answer: kit.printed(code, p)[0] === 'true' ? 0 : 1,
            })),
            options: TRUE_FALSE,
            explain: `On the rectangle means x from ${b.x} to ${b.right} and y from ${b.y} to ${b.bottom}. This function uses > and <, so exactly on an edge counts as off.`,
          });
        },
      },
      {
        id: 'color-from-the-function',
        make(r) {
          const b = pickRect(r);
          const f = pickOnRect(r);
          const colors = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          const code = f.lines().concat(['', ...chainLines(
            [{ cond: `${f.fn}(${b.args})`, body: kit.setColor(V, colors[0]) }],
            kit.setColor(V, colors[1]),
          )]);
          return kit.colorRows(r, {
            code,
            varName: V,
            colors,
            points: [
              { mouseX: midX(b), mouseY: midY(b) },
              { mouseX: b.right + 20, mouseY: midY(b) },
              { mouseX: b.x, mouseY: midY(b) },
            ],
            explain: 'The if uses what the function returns. When it returns true, the first line runs.',
          });
        },
      },
      {
        id: 'color-from-collide2d',
        make(r) {
          const b = pickRect(r);
          const colors = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.colorRows(r, {
            code: chainLines([{ cond: collideCall(b), body: kit.setColor(V, colors[0]) }], kit.setColor(V, colors[1])),
            varName: V,
            colors,
            points: [
              { mouseX: midX(b), mouseY: midY(b) },
              { mouseX: b.right + 20, mouseY: midY(b) },
              { mouseX: midX(b), mouseY: b.bottom + 20 },
            ],
            explain: 'collidePointRect returns true or false, so it can go right inside an if.',
          });
        },
      },
      {
        id: 'two-buttons',
        make(r) {
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          const [x1, x2] = [20, 220];
          const code = chainLines(
            [{ cond: `collidePointRect(mouseX, mouseY, ${x1}, 20, 100, 100)`, body: kit.setColor(V, colors[0]) },
              { cond: `collidePointRect(mouseX, mouseY, ${x2}, 20, 100, 100)`, body: kit.setColor(V, colors[1]) }],
            kit.setColor(V, colors[2]),
          );
          return kit.colorRows(r, {
            code,
            varName: V,
            colors,
            points: [
              { mouseX: x1 + 10 * r.int(1, 9), mouseY: 10 * r.int(3, 11) },
              { mouseX: x2 + 10 * r.int(1, 9), mouseY: 10 * r.int(3, 11) },
              { mouseX: 170, mouseY: 10 * r.int(3, 11) },
            ],
            explain: 'Each call checks a different rectangle, and the else runs when the mouse is on neither one.',
          });
        },
      },
    ],
  };

  const CHANGE_OPTIONS = ['Only the rectangle changes color', 'Only the circle changes color', 'Both shapes change color', 'Neither shape changes color'];

  // A shape can be a switch for another shape, so students have to read which one gets changed.
  function hoverQuestion(r, hover, changes) {
    const [rectVar, circleVar] = r.sample(['colorA', 'colorB', 'firstColor', 'secondColor'], 2);
    const [c1, c2, c3] = r.sample(kit.COLORS, 3);
    const b = {
      x: r.pick([20, 40, 60]), y: r.pick([30, 50, 70]), w: r.pick([100, 120]), h: r.pick([100, 120]),
    };
    const c = { x: r.pick([300, 320, 340]), y: r.pick([80, 100, 120]), d: r.pick([80, 100]) };
    const target = changes === 'rect' ? rectVar : circleVar;
    const condition = hover === 'rect'
      ? `collidePointRect(mouseX, mouseY, ${b.x}, ${b.y}, ${b.w}, ${b.h})`
      : `collidePointCircle(mouseX, mouseY, ${c.x}, ${c.y}, ${c.d})`;
    const code = ['function draw(){']
      .concat(chainLines([{ cond: condition, body: kit.setColor(target, c1) }], kit.setColor(target, c2), '  '), [
        `  fill(${rectVar})`,
        `  rect(${b.x}, ${b.y}, ${b.w}, ${b.h})`,
        `  fill(${circleVar})`,
        `  ellipse(${c.x}, ${c.y}, ${c.d}, ${c.d})`,
        '}',
      ]);
    const program = [`let ${rectVar} = ${kit.colorCall(c3)}`, `let ${circleVar} = ${kit.colorCall(c3)}`, ...code,
      'function __report(){', `  console.log(${rectVar})`, `  console.log(${circleVar})`, '}'].join('\n');
    const on = hover === 'rect' ? { mouseX: b.x + 10, mouseY: b.y + 10 } : { mouseX: c.x, mouseY: c.y };
    const [rectOn, circleOn] = kit.printed(program, on, 'sketch');
    const [rectOff, circleOff] = kit.printed(program, { mouseX: 200, mouseY: 350 }, 'sketch');
    const rectChanged = rectOn !== rectOff;
    const circleChanged = circleOn !== circleOff;
    let correct = CHANGE_OPTIONS[3];
    if (rectChanged && circleChanged) [, , correct] = CHANGE_OPTIONS;
    else if (rectChanged) [correct] = CHANGE_OPTIONS;
    else if (circleChanged) [, correct] = CHANGE_OPTIONS;
    return kit.choiceQuestion(r, {
      prompt: `What happens when the mouse moves onto the ${hover === 'rect' ? 'rectangle' : 'circle'}?`,
      code,
      correct,
      wrong: CHANGE_OPTIONS.filter((text) => text !== correct),
      explain: 'A shape only reacts because of the code you write. The check can look at one shape and change the variable used by another.',
    });
  }

  const switchSlot = {
    id: 'whichShape',
    skill: 'concepts',
    concept: 'Knowing that hovering on a shape can change something else',
    patterns: [
      ['rect-changes-circle', 'rect', 'circle'],
      ['rect-changes-itself', 'rect', 'rect'],
      ['circle-changes-rect', 'circle', 'rect'],
      ['circle-changes-itself', 'circle', 'circle'],
    ].map(([id, hover, changes]) => ({ id, make: (r) => hoverQuestion(r, hover, changes) })),
  };

  const DOC_PROMPT = 'Here is the documentation for a Collide2D function. Which call checks whether the mouse is on this shape?';

  const docsSlot = {
    id: 'docs',
    skill: 'concepts',
    concept: 'Reading the Collide2D documentation',
    patterns: [
      {
        id: 'rectangle',
        make(r) {
          const b = pickRect(r);
          return kit.choiceQuestion(r, {
            prompt: DOC_PROMPT,
            rule: 'collidePointRect(pointX, pointY, x, y, width, height)',
            code: [`rect(${b.args})`],
            correct: `collidePointRect(mouseX, mouseY, ${b.args})`,
            wrong: [`collidePointRect(${b.args}, mouseX, mouseY)`, `collidePointRect(mouseX, mouseY, ${b.right}, ${b.bottom})`, `collidePointRect(${b.args})`],
            codeOptions: true,
            explain: 'The mouse is the point, so mouseX and mouseY come first. Then come the same four numbers as the shape.',
          });
        },
      },
      {
        id: 'circle',
        make(r) {
          const x = 10 * r.int(16, 30);
          const y = 10 * r.int(5, 30);
          const d = 10 * r.int(4, 15);
          return kit.choiceQuestion(r, {
            prompt: DOC_PROMPT,
            rule: 'collidePointCircle(pointX, pointY, circleX, circleY, diameter)',
            code: [`ellipse(${x}, ${y}, ${d}, ${d})`],
            correct: `collidePointCircle(mouseX, mouseY, ${x}, ${y}, ${d})`,
            wrong: [`collidePointCircle(${x}, ${y}, ${d}, mouseX, mouseY)`, `collidePointCircle(mouseX, mouseY, ${d}, ${x}, ${y})`, `collidePointCircle(${x}, ${y}, mouseX, mouseY)`],
            codeOptions: true,
            explain: 'The mouse comes first, then the center of the circle, then its diameter.',
          });
        },
      },
      {
        id: 'line',
        make(r) {
          const [x1, y1, x2, y2] = [10 * r.int(1, 15), 10 * r.int(1, 15), 10 * r.int(16, 35), 10 * r.int(16, 35)];
          return kit.choiceQuestion(r, {
            prompt: DOC_PROMPT,
            rule: 'collidePointLine(pointX, pointY, x, y, x2, y2, [buffer])',
            code: [`line(${x1}, ${y1}, ${x2}, ${y2})`],
            correct: `collidePointLine(mouseX, mouseY, ${x1}, ${y1}, ${x2}, ${y2})`,
            wrong: [`collidePointLine(${x1}, ${y1}, ${x2}, ${y2}, mouseX, mouseY)`, `collidePointLine(mouseX, mouseY, ${x1}, ${x2}, ${y1}, ${y2})`, `collidePointLine(mouseX, ${x1}, ${y1}, ${x2}, ${y2})`],
            codeOptions: true,
            explain: 'Square brackets in documentation mean a value is optional, so the buffer can be left out.',
          });
        },
      },
      {
        id: 'what-it-gives-back',
        make(r) {
          const b = pickRect(r);
          const name = r.pick(['onIt', 'touching', 'hovering']);
          return kit.traceChoice(r, {
            prompt: `The mouse is at mouseX = ${b.x + 10}, mouseY = ${b.y + 10}. What does this code print?`,
            code: [`let ${name} = ${collideCall(b)}`, `console.log(${name})`],
            vec: { mouseX: b.x + 10, mouseY: b.y + 10 },
            wrong: [['true'], ['false'], [String(b.x + 10)], ['undefined']],
            explain: 'Collide2D is a library of boolean functions. They return true or false, so the result can be stored or used in an if.',
          });
        },
      },
    ],
  };

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const EDGE_WHY = 'The far edge of a rectangle is its position plus its size, not just its size.';
  const REASONS = [EDGE_WHY, WHY.needsAnd, WHY.noReturn, WHY.argOrder, WHY.assign];
  const others = (r, why) => r.sample(REASONS.filter((reason) => reason !== why), 3);
  const checks = (b) => [
    { mouseX: midX(b), mouseY: midY(b) },
    { mouseX: b.right - 10, mouseY: b.bottom - 10 },
    { mouseX: b.x - 20, mouseY: midY(b) },
    { mouseX: b.right + 20, mouseY: midY(b) },
    { mouseX: midX(b), mouseY: b.y - 20 },
    { mouseX: midX(b), mouseY: b.bottom + 20 },
    { mouseX: b.x - 20, mouseY: b.y - 20 },
  ];

  function functionBug(r, {
    f, b, condition, whenTrue, line, why, explain,
  }) {
    const call = `console.log(${f.fn}(${b.args}))`;
    return kit.bugQuestion(r, {
      prompt: `${f.fn} should return true only when the mouse is on the rectangle. ${FIND_BUG}`,
      code: f.lines(condition, whenTrue).concat([call]),
      bugLines: [line],
      why,
      others: others(r, why),
      fixed: f.lines().concat([call]),
      spec: { kind: 'snippet', vectors: checks(b) },
      explain,
    });
  }

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in collision code',
    patterns: [
      {
        id: 'size-as-the-far-edge',
        make(r) {
          const f = pickOnRect(r);
          const across = r.chance(0.5);
          const condition = across
            ? `mouseX > ${f.x} && mouseX < ${f.w} && mouseY > ${f.y} && mouseY < ${f.y} + ${f.h}`
            : `mouseX > ${f.x} && mouseX < ${f.x} + ${f.w} && mouseY > ${f.y} && mouseY < ${f.h}`;
          return functionBug(r, {
            f,
            b: pickRect(r),
            condition,
            line: 1,
            why: EDGE_WHY,
            explain: across ? `It should be mouseX < ${f.x} + ${f.w}.` : `It should be mouseY < ${f.y} + ${f.h}.`,
          });
        },
      },
      {
        id: 'or-instead-of-and',
        make(r) {
          const f = pickOnRect(r);
          return functionBug(r, {
            f,
            b: pickRect(r),
            condition: `mouseX > ${f.x} || mouseX < ${f.x} + ${f.w} || mouseY > ${f.y} || mouseY < ${f.y} + ${f.h}`,
            line: 1,
            why: WHY.needsAnd,
            explain: 'The mouse must pass all four comparisons to be on the rectangle, so they need &&.',
          });
        },
      },
      {
        id: 'never-returns',
        make(r) {
          const f = pickOnRect(r);
          return functionBug(r, {
            f, b: pickRect(r), whenTrue: 'true', line: 2, why: WHY.noReturn, explain: 'It needs return: return true',
          });
        },
      },
      {
        id: 'arguments-out-of-order',
        make(r) {
          const b = pickRect(r);
          const colors = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          const chain = (cond) => chainLines([{ cond, body: kit.setColor(V, colors[0]) }], kit.setColor(V, colors[1]));
          return kit.bugQuestion(r, {
            prompt: `${V} should turn ${colors[0].name} when the mouse is on rect(${b.args}). The function is collidePointRect(pointX, pointY, x, y, width, height). ${FIND_BUG}`,
            code: chain(`collidePointRect(${b.args}, mouseX, mouseY)`),
            bugLines: [0],
            why: WHY.argOrder,
            others: others(r, WHY.argOrder),
            fixed: chain(collideCall(b)),
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V}`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: checks(b),
            },
            explain: `The mouse comes first: ${collideCall(b)}`,
          });
        },
      },
    ],
  };

  const OP_POOL = ['>', '<', '=='];

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing a collision check',
    patterns: [
      {
        id: 'mouse-on-rect',
        make(r) {
          const b = pickRect(r);
          const f = pickOnRect(r);
          const right = `${f.x} + ${f.w}`;
          const bottom = `${f.y} + ${f.h}`;
          return kit.blanksQuestion(r, {
            prompt: `Complete ${f.fn} so it returns true only when the mouse is on the rectangle.`,
            lines: [
              [f.head],
              [`  if(mouseX > ${f.x} `, tok('&&', 'conn'), ' mouseX ', tok('<', 'op'), ' ', tok(right, 'edge'), ` && mouseY > ${f.y} && mouseY `, tok('<', 'op'), ' ', tok(bottom, 'edge'), '){'],
              ['    ', tok('return', 'word'), ' true'],
              ['  }'],
              ['  else{'],
              ['    return false'],
              ['  }'],
              ['}'],
              [`console.log(${f.fn}(${b.args}))`],
            ],
            must: ['edge', 'conn'],
            count: 4,
            pools: {
              conn: ['||'], op: OP_POOL, edge: [f.w, f.h, `${f.x} + ${f.h}`, `${f.y} + ${f.w}`], word: ['console.log', 'let'],
            },
            spec: { kind: 'snippet', vectors: checks(b) },
            explain: `The right edge is ${right}, and the bottom edge is ${bottom}. All four comparisons have to be true.`,
          });
        },
      },
      {
        id: 'numbers-for-this-rectangle',
        make(r) {
          const b = pickRect(r);
          return kit.blanksQuestion(r, {
            prompt: `Complete the condition so it is true only when the mouse is on rect(${b.args}).`,
            lines: [
              ['if(mouseX > ', tok(b.x, 'num'), ' && mouseX < ', tok(b.right, 'num'), ' && mouseY > ', tok(b.y, 'num'), ' && mouseY < ', tok(b.bottom, 'num'), '){'],
              ['  console.log("On it")'],
              ['}'],
            ],
            must: ['num'],
            count: 3,
            pools: { num: [b.w, b.h, b.x + b.h, b.y + b.w, b.right + 50, b.bottom + 50].filter((n) => ![b.x, b.right, b.y, b.bottom].includes(n)) },
            spec: { kind: 'snippet', vectors: checks(b) },
            explain: `x goes from ${b.x} to ${b.x} + ${b.w}. y goes from ${b.y} to ${b.y} + ${b.h}.`,
          });
        },
      },
      {
        id: 'collide-call',
        make(r) {
          const b = pickRect(r);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${V} is ${c1.name} when the mouse is on rect(${b.args}), and ${c2.name} otherwise.`,
            lines: [
              ['if(collidePointRect(', tok('mouseX', 'pos'), ', ', tok('mouseY', 'pos'), `, ${b.x}, ${b.y}, `, tok(b.w, 'num'), ', ', tok(b.h, 'num'), ')){'],
              [`  ${kit.setColor(V, c1)}`],
              ['}'],
              [tok('else', 'kw'), '{'],
              [`  ${kit.setColor(V, c2)}`],
              ['}'],
            ],
            must: ['pos', 'num'],
            count: 4,
            pools: {
              pos: ['width', 'height'], num: [b.right, b.bottom].concat(b.w === b.h ? [b.w + 50] : [b.w, b.h]), kw: ['if', 'else if'],
            },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V}`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: checks(b),
            },
            explain: `The function takes the point first, then the rectangle: collidePointRect(mouseX, mouseY, ${b.args}).`,
          });
        },
      },
      {
        id: 'circle-call',
        make(r) {
          const x = 100 + 10 * r.int(0, 20);
          const y = 100 + 10 * r.int(0, 20);
          const d = 10 * r.int(4, 15);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${V} is ${c1.name} when the mouse is on ellipse(${x}, ${y}, ${d}, ${d}), and ${c2.name} otherwise. The function is collidePointCircle(pointX, pointY, circleX, circleY, diameter).`,
            lines: [
              ['if(collidePointCircle(', tok('mouseX', 'pos'), ', ', tok('mouseY', 'pos'), ', ', tok(x, 'num'), ', ', tok(y, 'num'), ', ', tok(d, 'num'), ')){'],
              [`  ${kit.setColor(V, c1)}`],
              ['}'],
              ['else{'],
              [`  ${kit.setColor(V, c2)}`],
              ['}'],
            ],
            must: ['pos', 'num'],
            count: 4,
            pools: { pos: ['width', 'height'], num: [x + d, y + d, d + 50] },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V}`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: [
                { mouseX: x, mouseY: y },
                { mouseX: x + d / 2 - 5, mouseY: y },
                { mouseX: x, mouseY: y + d / 2 - 5 },
                { mouseX: x + d, mouseY: y },
                { mouseX: x, mouseY: y + d },
                { mouseX: x - d, mouseY: y - d },
              ],
            },
            explain: `The mouse comes first, then the center of the circle, then its diameter: collidePointCircle(mouseX, mouseY, ${x}, ${y}, ${d}).`,
          });
        },
      },
    ],
  };

  const scramble = (rules) => `Put these lines in order so the code does this:\n${numberedRules(rules)}`;

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting hover code in order',
    patterns: [
      {
        id: 'hover-color',
        make(r) {
          const b = pickRect(r);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `If the mouse is on rect(${b.args}), make ${V} ${c1.name}. Otherwise, make it ${c2.name}.`,
              `Fill with ${V}, and draw the rectangle.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: chainLines([{ cond: collideCall(b), body: kit.setColor(V, c1) }], kit.setColor(V, c2)).concat([`fill(${V})`, `rect(${b.args})`]),
            suffix: [{ text: '}' }],
            spec: { kind: 'sketch', hiddenPrefix: [`let ${V}`], vectors: checks(b) },
            explain: 'Each color goes right after its condition. fill() has to come before rect(), since it sets the color of the next shape.',
          });
        },
      },
      {
        id: 'function-with-returns',
        make(r) {
          const b = pickRect(r);
          const f = pickOnRect(r);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              'If the mouse is inside the rectangle, return true.',
              'Otherwise, return false.',
              `After the function, print what it returns for rect(${b.args}).`,
            ]),
            prefix: [{ text: f.head }],
            movable: [`if(${f.inside}){`, 'return true', '}', 'else{', 'return false', '}', '}', `console.log(${f.fn}(${b.args}))`],
            spec: { kind: 'snippet', vectors: checks(b) },
            explain: 'Each return goes in its own branch. The call comes after the function is closed.',
          });
        },
      },
      {
        id: 'a-different-shape-changes',
        make(r) {
          const b = pickRect(r);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.background);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `If the mouse is on rect(${b.args}), make ${V} ${c1.name}. Otherwise, make it ${c2.name}.`,
              `Paint the background with ${V}.`,
              'Draw the rectangle on top of the background.',
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: chainLines([{ cond: collideCall(b), body: kit.setColor(V, c1) }], kit.setColor(V, c2)).concat([`background(${V})`, `rect(${b.args})`]),
            suffix: [{ text: '}' }],
            spec: { kind: 'sketch', hiddenPrefix: [`let ${V}`], vectors: checks(b) },
            explain: 'A shape can be a switch for something else. background() has to come before rect(), or it covers the rectangle.',
          });
        },
      },
      {
        id: 'circle-hover',
        make(r) {
          const x = 100 + 10 * r.int(0, 20);
          const y = 100 + 10 * r.int(0, 20);
          const d = 10 * r.int(6, 15);
          const [small, big] = r.pick([[2, 10], [1, 8], [3, 12]]);
          const V = r.pick(['lineWeight', 'edgeWeight', 'thickness']);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `If the mouse is on the circle at (${x}, ${y}) with a diameter of ${d}, make ${V} ${big}. Otherwise, make it ${small}.`,
              `Set the stroke weight to ${V}, and draw the circle.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: chainLines([{ cond: `collidePointCircle(mouseX, mouseY, ${x}, ${y}, ${d})`, body: `${V} = ${big}` }], `${V} = ${small}`).concat([`strokeWeight(${V})`, `ellipse(${x}, ${y}, ${d}, ${d})`]),
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${V}`],
              vectors: [{ mouseX: x, mouseY: y }, { mouseX: x + d, mouseY: y + d }, { mouseX: x, mouseY: y + d }],
            },
            explain: 'The variable gets its value first. strokeWeight() has to come before ellipse(), since it sets up the next shape.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA4.1',
    title: 'Collision Functions && Collide2D',
    unit: 2,
    source: 'curriculum/02-unit-2/11-U2LA4.1-Collision-Functions-and-Collide2D.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/mouseIsPressed|mousePressed|keyIsPressed/, 'clicks and keys (U2LA4.2 and U2LA5.1)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[(?!buffer\])/, 'arrays (Unit 3)'],
    ],
    slots: [insideSlot, regionSlot, switchSlot, docsSlot, edgesSlot, functionSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['region', 'fnTrace', 'parsons', 'docs', 'blanks', 'inside', 'bug', 'whichShape', 'edges'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
