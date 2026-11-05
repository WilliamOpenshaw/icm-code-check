// U2LA4.2: Mouse Clicks && Shapes as Buttons
// curriculum/02-unit-2/12-U2LA4.2-Mouse-Clicks-and-Shapes-as-Buttons.md
//
// Students at this point have seen: everything through U2LA4.1, plus the variable mouseIsPressed,
// the callback function mousePressed(), and using them with collide2D to make shapes into
// buttons. The Light Switch Game mini project is about buttons controlling several lights.
// They have NOT seen: keyIsPressed, loops, or arrays.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    tok, chainLines, ifBlock, numberedRules, WHY, log,
  } = kit;

  const COUNTERS = ['score', 'clicks', 'points', 'tally'];
  const report = (expr) => `function __report(){\n  console.log(${expr})\n}`;
  const lift = { mouseIsPressed: false };
  const press = (x, y) => ({ mouseX: x, mouseY: y, mouseIsPressed: true });
  // One full click: the button goes down on one frame and comes back up on the next.
  const clickAt = (x, y) => [press(x, y), lift];
  const held = (x, y, n) => Array.from({ length: n }, () => press(x, y));

  function pickCircle(r) {
    return { x: 100 + 10 * r.int(0, 20), y: 100 + 10 * r.int(0, 20), d: 10 * r.int(6, 12) };
  }
  const onCircle = (c, r) => ({ x: c.x + 10 * r.int(-2, 2), y: c.y + 10 * r.int(-1, 1) });
  const circleCall = (c) => `collidePointCircle(mouseX, mouseY, ${c.x}, ${c.y}, ${c.d})`;
  const rectCall = (b) => `collidePointRect(mouseX, mouseY, ${b.x}, ${b.y}, ${b.w}, ${b.h})`;
  function pickButton(r) {
    return { x: r.pick([20, 40, 60]), y: r.pick([20, 40, 60]), w: r.pick([100, 120, 150]), h: r.pick([60, 80, 100]) };
  }
  const onButton = (b) => ({ x: b.x + 20, y: b.y + 20 });
  const offButton = (b) => ({ x: b.x + b.w + 50, y: b.y + b.h + 50 });

  // ---- mouseIsPressed or mousePressed()? ----

  const VARIABLE = 'mouseIsPressed';
  const CALLBACK = 'mousePressed()';
  const SCENARIOS = [
    ['Add 1 to a score each time the circle gets clicked', 1],
    ['Keep a shape red only while the button is held down', 0],
    ['Count how many times a light switch has been pressed', 1],
    ['Draw with the mouse only while the button is held down', 0],
    ['Move to the next level once per click', 1],
    ['Grow a circle a little more on every frame the button is down', 0],
    ['Flip a light on or off once per click', 1],
    ['Make the background flash while the button is down', 0],
  ];

  const whichSlot = {
    id: 'pressedOrCallback',
    skill: 'concepts',
    concept: 'Choosing between mouseIsPressed and mousePressed()',
    patterns: [
      {
        id: 'situations',
        make(r) {
          const once = r.sample(SCENARIOS.filter((s) => s[1] === 1), 2);
          const hold = r.sample(SCENARIOS.filter((s) => s[1] === 0), 2);
          return kit.rowsQuestion({
            prompt: 'Which one fits each situation best?',
            columns: ['Situation'],
            rows: r.shuffle(once.concat(hold)).map(([text, answer]) => ({ cells: [text], answer })),
            options: [{ text: VARIABLE }, { text: CALLBACK }],
            explain: 'mouseIsPressed is checked on every frame, so it fits anything that lasts while the button is held down. mousePressed() runs once per click, so it fits counting.',
          });
        },
      },
      {
        id: 'what-each-one-is',
        make(r) {
          const name = r.pick(COUNTERS);
          return kit.choiceQuestion(r, {
            prompt: `What is the difference between these two?`,
            code: ['if(mouseIsPressed){', `  ${name} = ${name} + 1`, '}', '', 'function mousePressed(){', `  ${name} = ${name} + 1`, '}'],
            correct: 'mouseIsPressed is a variable that is true while the button is down, and mousePressed() is a function that runs once per click',
            wrong: [
              'They are two names for the same thing, so they always behave the same',
              'mousePressed() is a variable that is true while the button is down, and mouseIsPressed is a function that runs once per click',
              'mouseIsPressed only works inside setup(), and mousePressed() only works inside draw()',
            ],
            explain: 'The if goes inside draw(), which runs many times while a finger is on the button. mousePressed() sits outside setup() and draw(), and p5 calls it once for each click.',
          });
        },
      },
      {
        id: 'where-it-goes',
        make(r) {
          const name = r.pick(COUNTERS);
          return kit.choiceQuestion(r, {
            prompt: 'Where in a sketch does this function belong?',
            code: ['function mousePressed(){', `  ${name} = ${name} + 1`, '}'],
            correct: 'On its own, outside of both setup() and draw()',
            wrong: ['Inside draw(), so it can run on every frame', 'Inside setup(), so p5 can find it when the sketch starts', 'Inside an if statement that checks mouseIsPressed'],
            explain: 'It has to stand on its own at the top level, like setup() and draw(). p5 calls it for you when the mouse is pressed.',
          });
        },
      },
      {
        id: 'type-of-the-variable',
        make(r) {
          const name = r.pick(['pressed', 'isDown', 'holding']);
          return kit.traceChoice(r, {
            prompt: 'The button is being held down. What does this code print?',
            code: [`let ${name} = mouseIsPressed`, `console.log(typeof ${name})`, `console.log(${name})`],
            vec: { mouseIsPressed: true },
            wrong: [['boolean', 'true'], ['boolean', 'false'], ['string', 'true'], ['number', '1']],
            explain: 'mouseIsPressed holds a boolean: true while the button is down, and false the rest of the time.',
          });
        },
      },
    ],
  };

  // ---- Counting across frames ----

  const countSlot = {
    id: 'counting',
    skill: 'flow',
    concept: 'Predicting what a click does across frames',
    patterns: [
      {
        id: 'held-with-the-variable',
        make(r) {
          const name = r.pick(COUNTERS);
          const c = pickCircle(r);
          const n = r.int(3, 6);
          const code = [`let ${name} = 0`, '', 'function draw(){', `  if(${circleCall(c)} && mouseIsPressed){`, `    ${name} = ${name} + 1`, '  }', '}'];
          const spot = onCircle(c, r);
          return kit.printedNumber({
            prompt: `The mouse is held down on the circle for ${n} frames. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: 0, mouseY: 0, frames: held(spot.x, spot.y, n) },
            kind: 'sketch',
            explain: 'draw() runs on every frame, and mouseIsPressed stays true the whole time. That is why the score jumps when you use the variable.',
          });
        },
      },
      {
        id: 'held-with-the-callback',
        make(r) {
          const name = r.pick(COUNTERS);
          const c = pickCircle(r);
          const n = r.int(3, 6);
          const code = [`let ${name} = 0`, '', 'function mousePressed(){', `  if(${circleCall(c)}){`, `    ${name} = ${name} + 1`, '  }', '}'];
          const spot = onCircle(c, r);
          return kit.printedNumber({
            prompt: `The mouse is held down on the circle for ${n} frames. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: 0, mouseY: 0, frames: held(spot.x, spot.y, n) },
            kind: 'sketch',
            explain: 'mousePressed() runs once when the button goes down, no matter how long it stays down.',
          });
        },
      },
      {
        id: 'several-clicks',
        make(r) {
          const name = r.pick(COUNTERS);
          const c = pickCircle(r);
          const hits = r.int(2, 4);
          const misses = r.int(1, 2);
          const frames = [];
          for (let i = 0; i < hits; i++) {
            const spot = onCircle(c, r);
            frames.push(...clickAt(spot.x, spot.y));
          }
          for (let i = 0; i < misses; i++) frames.push(...clickAt(c.x + c.d + 30, c.y + c.d + 30));
          const code = [`let ${name} = 0`, '', 'function mousePressed(){', `  if(${circleCall(c)}){`, `    ${name} = ${name} + 1`, '  }', '}'];
          return kit.printedNumber({
            prompt: `The user clicks on the circle ${hits} times, and clicks away from it ${misses} time${misses === 1 ? '' : 's'}. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: 0, mouseY: 0, frames },
            kind: 'sketch',
            explain: 'mousePressed() runs for every click, but the if only adds to the count when the mouse is on the circle.',
          });
        },
      },
      {
        id: 'press-anywhere',
        make(r) {
          const name = r.pick(COUNTERS);
          const n = r.int(2, 4);
          const rest = r.int(1, 3);
          const step = r.int(2, 5);
          const frames = held(50, 50, n).concat(Array.from({ length: rest }, () => lift));
          const code = [`let ${name} = 0`, '', 'function draw(){', '  if(mouseIsPressed){', `    ${name} = ${name} + ${step}`, '  }', '}'];
          return kit.printedNumber({
            prompt: `The mouse is held down for ${n} frames and then let go for ${rest} frames. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: 0, mouseY: 0, frames },
            kind: 'sketch',
            explain: `mouseIsPressed is only true on the ${n} frames the button is down, so ${step} gets added ${n} times.`,
          });
        },
      },
    ],
  };

  // ---- Does the change last? ----

  const lastingSlot = {
    id: 'staysOrResets',
    skill: 'flow',
    concept: 'Knowing whether a change lasts after the mouse is let go',
    patterns: [
      {
        id: 'no-else-stays',
        make(r) {
          const b = pickButton(r);
          const name = r.pick(['lineWeight', 'edgeWeight', 'thickness']);
          const [low, high] = r.pick([[2, 10], [1, 8], [3, 12]]);
          const code = [`let ${name} = ${low}`, '', 'function draw(){', `  if(${rectCall(b)} && mouseIsPressed){`, `    ${name} = ${high}`, '  }', '}'];
          const spot = onButton(b);
          return kit.printedNumber({
            prompt: `The mouse presses on the rectangle, and is then let go. A few frames later, what does ${name} hold?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: 0, mouseY: 0, frames: [press(spot.x, spot.y), lift, lift, lift] },
            kind: 'sketch',
            explain: 'There is no else, so nothing ever changes the value back. It stays changed forever.',
          });
        },
      },
      {
        id: 'else-resets',
        make(r) {
          const b = pickButton(r);
          const name = r.pick(['lineWeight', 'edgeWeight', 'thickness']);
          const [low, high] = r.pick([[2, 10], [1, 8], [3, 12]]);
          const code = [`let ${name} = ${low}`, '', 'function draw(){'].concat(
            chainLines([{ cond: `${rectCall(b)} && mouseIsPressed`, body: `${name} = ${high}` }], `${name} = ${low}`, '  '),
            ['}'],
          );
          const spot = onButton(b);
          return kit.printedNumber({
            prompt: `The mouse presses on the rectangle, and is then let go. A few frames later, what does ${name} hold?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: 0, mouseY: 0, frames: [press(spot.x, spot.y), lift, lift, lift] },
            kind: 'sketch',
            explain: 'Once the button is up, the condition is false, so the else sets the value back.',
          });
        },
      },
      {
        id: 'still-hovering',
        make(r) {
          const b = pickButton(r);
          const name = r.pick(['lineWeight', 'edgeWeight', 'thickness']);
          const [low, high] = r.pick([[2, 10], [1, 8], [3, 12]]);
          const code = [`let ${name} = ${low}`, '', 'function draw(){'].concat(
            chainLines([{ cond: `${rectCall(b)} && mouseIsPressed`, body: `${name} = ${high}` }], `${name} = ${low}`, '  '),
            ['}'],
          );
          const spot = onButton(b);
          return kit.printedNumber({
            prompt: `The mouse stays on the rectangle the whole time, but the button is never pressed. What does ${name} hold?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: spot.x, mouseY: spot.y, frames: [{}, {}, {}] },
            kind: 'sketch',
            explain: '&& needs both to be true. Hovering alone is not enough, so the else runs.',
          });
        },
      },
      {
        id: 'flip-with-each-click',
        make(r) {
          const name = r.pick(['lightOn', 'isOn', 'switchUp']);
          const clicks = r.int(2, 5);
          const start = r.chance(0.5);
          const frames = [];
          for (let i = 0; i < clicks; i++) frames.push(...clickAt(50, 50));
          const code = [`let ${name} = ${start}`, '', 'function mousePressed(){'].concat(
            chainLines([{ cond: `${name} == true`, body: `${name} = false` }], `${name} = true`, '  '),
            ['}'],
          );
          return kit.traceChoice(r, {
            prompt: `The user clicks ${clicks} times. What does ${name} hold now?`,
            code,
            run: `${code.join('\n')}\n${report(name)}`,
            vec: { mouseX: 0, mouseY: 0, frames },
            kind: 'sketch',
            wrong: [['true'], ['false'], [String(clicks)]],
            explain: 'Each click flips the value once, so count the flips from where it started.',
          });
        },
      },
    ],
  };

  // ---- Colors for each state of a button ----

  const NOT_ON = (b) => ({ mouseX: b.x + b.w + 40, mouseY: b.y + b.h + 40, mouseIsPressed: false });

  function buttonRows(r, { code, varName, colors, points, explain }) {
    const program = `let ${varName}\n${code.join('\n')}\nconsole.log(${varName})`;
    const keys = colors.map(kit.colorKey);
    return kit.rowsQuestion({
      prompt: `Pick the color ${varName} ends up with in each case.`,
      code,
      columns: ['mouseX', 'mouseY', 'mouseIsPressed'],
      rows: r.shuffle(points).map((p) => ({
        cells: [String(p.mouseX), String(p.mouseY), String(p.mouseIsPressed)],
        answer: keys.indexOf(kit.printed(program, p)[0]),
      })),
      options: colors.map((c) => ({ text: c.name, swatch: kit.colorCss(c) })),
      explain,
    });
  }

  const statesSlot = {
    id: 'buttonStates',
    skill: 'flow',
    concept: 'Predicting what a button does when hovered and clicked',
    patterns: [
      {
        id: 'click-hover-or-neither',
        make(r) {
          const b = pickButton(r);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          const spot = onButton(b);
          return buttonRows(r, {
            code: chainLines(
              [{ cond: `${rectCall(b)} && mouseIsPressed`, body: kit.setColor(V, colors[0]) },
                { cond: rectCall(b), body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            points: [
              { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: true },
              { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: false },
              NOT_ON(b),
              { ...NOT_ON(b), mouseIsPressed: true },
            ],
            explain: 'The clicked check has to come first, because anything clicked is also being hovered.',
          });
        },
      },
      {
        id: 'nested-conditionals',
        make(r) {
          const b = pickButton(r);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          const spot = onButton(b);
          return buttonRows(r, {
            code: [`if(${rectCall(b)}){`, '  if(mouseIsPressed){', `    ${kit.setColor(V, colors[0])}`, '  }', '  else{', `    ${kit.setColor(V, colors[1])}`, '  }', '}', 'else{', `  ${kit.setColor(V, colors[2])}`, '}'],
            varName: V,
            colors,
            points: [
              { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: true },
              { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: false },
              NOT_ON(b),
              { ...NOT_ON(b), mouseIsPressed: true },
            ],
            explain: 'The inner if is only checked when the outer condition is true. Off the rectangle, pressing does not matter.',
          });
        },
      },
      {
        id: 'press-anywhere',
        make(r) {
          const b = pickButton(r);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          const spot = onButton(b);
          return buttonRows(r, {
            code: chainLines(
              [{ cond: 'mouseIsPressed', body: kit.setColor(V, colors[0]) },
                { cond: rectCall(b), body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            points: [
              { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: true },
              { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: false },
              NOT_ON(b),
              { ...NOT_ON(b), mouseIsPressed: true },
            ],
            explain: 'mouseIsPressed works anywhere on the canvas. It does not have to be on a shape.',
          });
        },
      },
      {
        id: 'two-buttons',
        make(r) {
          const b1 = { x: 20, y: 20, w: 100, h: 80 };
          const b2 = { x: 220, y: 20, w: 100, h: 80 };
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          return buttonRows(r, {
            code: chainLines(
              [{ cond: `${rectCall(b1)} && mouseIsPressed`, body: kit.setColor(V, colors[0]) },
                { cond: `${rectCall(b2)} && mouseIsPressed`, body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            points: [
              { mouseX: 50, mouseY: 40, mouseIsPressed: true },
              { mouseX: 250, mouseY: 40, mouseIsPressed: true },
              { mouseX: 50, mouseY: 40, mouseIsPressed: false },
              { mouseX: 170, mouseY: 40, mouseIsPressed: true },
            ],
            explain: 'To change the color, the mouse has to be on that button and pressed.',
          });
        },
      },
    ],
  };

  // ---- The Light Switch Game ----

  const ROOMS = [['kitchen', 'hall', 'attic'], ['lamp', 'porch', 'closet'], ['den', 'stairs', 'cellar']];
  const LIGHTS_NAMES = ['lights', 'rooms', 'house'];
  const ON_OR_OFF = [{ text: 'on' }, { text: 'off' }];

  function switchSketch(r, clicksOf) {
    const name = r.pick(LIGHTS_NAMES);
    const [a, b, c] = r.shuffle(r.pick(ROOMS));
    const first = { x: 20, y: 20, w: 60, h: 60 };
    const second = { x: 120, y: 20, w: 60, h: 60 };
    const code = [`let ${name} = {`, `  ${a}: "off",`, `  ${b}: "on",`, `  ${c}: "off"`, '}', '', 'function mousePressed(){',
      `  if(${rectCall(first)}){`, `    ${name}.${a} = "on"`, `    ${name}.${b} = "off"`, '  }',
      `  if(${rectCall(second)}){`, `    ${name}.${a} = "off"`, `    ${name}.${c} = "on"`, '  }', '}'];
    const { clicks, words } = clicksOf({ first, second });
    const frames = clicks.flatMap((spot) => clickAt(spot.x, spot.y));
    const printed = kit.printed(
      `${code.join('\n')}\n${report(`${name}.${a}, ${name}.${b}, ${name}.${c}`)}`,
      { mouseX: 0, mouseY: 0, frames },
      'sketch',
    )[0].split(' ');
    const rows = [a, b, c].map((key, i) => ({ cells: [`${name}.${key}`], answer: printed[i] === 'on' ? 0 : 1 }));
    return kit.rowsQuestion({
      prompt: `The first switch is the rectangle at (20, 20), and the second is the rectangle at (120, 20). ${words} What does each light hold now?`,
      code,
      columns: ['Light'],
      rows: r.shuffle(rows),
      options: ON_OR_OFF,
      explain: 'Go through the clicks in order. Each click only runs the code for the switch it landed on, and a later switch can undo an earlier one.',
    });
  }

  const lightsSlot = {
    id: 'lightSwitch',
    skill: 'flow',
    concept: 'Following switches that control several lights',
    patterns: [
      {
        id: 'first-then-second',
        make(r) {
          return switchSketch(r, ({ first, second }) => ({
            clicks: [onButton(first), onButton(second)],
            words: 'The user clicks the first switch, and then the second switch.',
          }));
        },
      },
      {
        id: 'second-then-first',
        make(r) {
          return switchSketch(r, ({ first, second }) => ({
            clicks: [onButton(second), onButton(first)],
            words: 'The user clicks the second switch, and then the first switch.',
          }));
        },
      },
      {
        id: 'only-the-first',
        make(r) {
          return switchSketch(r, ({ first }) => ({
            clicks: [onButton(first)],
            words: 'The user clicks only the first switch.',
          }));
        },
      },
      {
        id: 'only-the-second',
        make(r) {
          return switchSketch(r, ({ second }) => ({
            clicks: [onButton(second)],
            words: 'The user clicks only the second switch.',
          }));
        },
      },
    ],
  };

  // ---- Which lines run ----

  const CLICK_NOW = (x, y) => ({ mouseX: 0, mouseY: 0, frames: [press(x, y)] });

  const flowSlot = {
    id: 'lines',
    skill: 'flow',
    concept: 'Seeing which lines run on the frame of a click',
    patterns: [
      {
        id: 'callback-and-draw',
        make(r) {
          const c = pickCircle(r);
          const spot = r.chance(0.5) ? onCircle(c, r) : { x: c.x + c.d + 30, y: c.y };
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          return kit.buildFlow(r, () => ['function draw(){', `  ${log(m1)}`, '}', '', 'function mousePressed(){'].concat(
            chainLines([{ cond: circleCall(c), body: log(m2) }], log(m3), '  '),
            ['}'],
          ), 'p5 calls mousePressed() once when the button goes down, and draw() still runs on the frame too.', {
            prompt: `The mouse is pressed at mouseX = ${spot.x}, mouseY = ${spot.y}, and this is the only frame that has run. Tap every highlighted line that runs.`,
            vec: CLICK_NOW(spot.x, spot.y),
            kind: 'sketch',
          });
        },
      },
      {
        id: 'variable-in-draw',
        make(r) {
          const b = pickButton(r);
          const spot = r.chance(0.5) ? onButton(b) : offButton(b);
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          return kit.buildFlow(r, () => ['function draw(){'].concat(
            chainLines([{ cond: `${rectCall(b)} && mouseIsPressed`, body: log(m1) }], log(m2), '  '),
            [`  ${log(m3)}`, '}'],
          ), 'Both have to be true for the first message. The last line is outside the if and else, so it always runs.', {
            prompt: `The mouse is pressed at mouseX = ${spot.x}, mouseY = ${spot.y}. Tap every highlighted line that runs on this frame.`,
            vec: CLICK_NOW(spot.x, spot.y),
            kind: 'sketch',
          });
        },
      },
      {
        id: 'no-click-happening',
        make(r) {
          const b = pickButton(r);
          const spot = onButton(b);
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          return kit.buildFlow(r, () => ['function draw(){', `  ${log(m1)}`, '}', '', 'function mousePressed(){'].concat(
            ifBlock(rectCall(b), log(m2)).map((l) => `  ${l}`),
            [`  ${log(m3)}`, '}'],
          ), 'Without a click, p5 never calls mousePressed(), so only draw() runs.', {
            prompt: `The mouse is hovering at mouseX = ${spot.x}, mouseY = ${spot.y}, but the button is not pressed. Tap every highlighted line that runs on this frame.`,
            vec: { mouseX: 0, mouseY: 0, frames: [{ mouseX: spot.x, mouseY: spot.y }] },
            kind: 'sketch',
            minHits: 1,
          });
        },
      },
    ],
  };

  // ---- Bugs ----

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const IN_DRAW = 'mousePressed() has to stand on its own, outside of draw(). Inside draw(), p5 never calls it.';
  const JUMPS = 'draw() runs many times during one click, so the count goes up many times. It belongs in mousePressed().';
  const NEVER_RESET = 'Nothing changes the value back when the button is let go. It needs an else.';
  const REASONS = [WHY.notAFunction, IN_DRAW, JUMPS, NEVER_RESET, WHY.assign];
  const others = (r, why) => r.sample(REASONS.filter((reason) => reason !== why), 3);

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in click code',
    patterns: [
      {
        id: 'parentheses-on-the-variable',
        make(r) {
          const name = r.pick(COUNTERS);
          const lines = (cond) => [`let ${name} = 0`, 'function draw(){', `  if(${cond}){`, `    ${name} = ${name} + 1`, '  }', '}'];
          return kit.bugQuestion(r, {
            prompt: `${name} should go up while the button is held down. ${FIND_BUG}`,
            code: lines('mouseIsPressed()'),
            bugLines: [2],
            why: WHY.notAFunction,
            others: others(r, WHY.notAFunction),
            fixed: lines('mouseIsPressed'),
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [{ mouseX: 0, mouseY: 0, frames: [press(10, 10), press(10, 10), lift] }],
            },
            explain: 'mouseIsPressed is a variable, so it has no parentheses.',
          });
        },
      },
      {
        id: 'callback-inside-draw',
        make(r) {
          const name = r.pick(COUNTERS);
          return kit.bugQuestion(r, {
            prompt: `${name} should go up by 1 with each click, but it never changes. ${FIND_BUG}`,
            code: [`let ${name} = 0`, 'function draw(){', '  background(220)', '  function mousePressed(){', `    ${name} = ${name} + 1`, '  }', '}'],
            bugLines: [3],
            why: IN_DRAW,
            others: others(r, IN_DRAW),
            fixed: [`let ${name} = 0`, 'function draw(){', '  background(220)', '}', 'function mousePressed(){', `  ${name} = ${name} + 1`, '}'],
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [{ mouseX: 0, mouseY: 0, frames: [press(10, 10), lift] }],
            },
            explain: 'Move mousePressed() out of draw(), so that it stands on its own.',
          });
        },
      },
      {
        id: 'score-jumps',
        make(r) {
          const name = r.pick(COUNTERS);
          const c = pickCircle(r);
          const spot = onCircle(c, r);
          return kit.bugQuestion(r, {
            prompt: `${name} should go up by 1 for each click on the circle, but it jumps by more than 1. ${FIND_BUG}`,
            code: [`let ${name} = 0`, 'function draw(){', `  if(${circleCall(c)} && mouseIsPressed){`, `    ${name} = ${name} + 1`, '  }', '}'],
            bugLines: [2, 3],
            why: JUMPS,
            others: others(r, JUMPS),
            fixed: [`let ${name} = 0`, 'function mousePressed(){', `  if(${circleCall(c)} && mouseIsPressed){`, `    ${name} = ${name} + 1`, '  }', '}'],
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [{ mouseX: 0, mouseY: 0, frames: [...held(spot.x, spot.y, 3), lift] }],
            },
            explain: 'The check has to move to mousePressed(), which only runs once per click.',
          });
        },
      },
      {
        id: 'single-equals',
        make(r) {
          const name = r.pick(COUNTERS);
          const lines = (cond) => [`let ${name} = 0`, 'function draw(){', `  if(${cond}){`, `    ${name} = ${name} + 1`, '  }', '}'];
          return kit.bugQuestion(r, {
            prompt: `${name} should only go up while the button is held down, but it always goes up. ${FIND_BUG}`,
            code: lines('mouseIsPressed = true'),
            bugLines: [2],
            why: WHY.assign,
            others: others(r, WHY.assign),
            fixed: lines('mouseIsPressed == true'),
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [{ mouseX: 0, mouseY: 0, frames: [lift, lift, press(10, 10), lift] }],
            },
            explain: 'if(mouseIsPressed == true){ checks the value, and so does just if(mouseIsPressed){',
          });
        },
      },
      {
        id: 'never-goes-back',
        make(r) {
          const b = pickButton(r);
          const name = r.pick(['lineWeight', 'edgeWeight', 'thickness']);
          const [low, high] = r.pick([[2, 10], [1, 8], [3, 12]]);
          const head = [`let ${name} = ${low}`, 'function draw(){'];
          const spot = onButton(b);
          return kit.bugQuestion(r, {
            prompt: `${name} should be ${high} only while the rectangle is being pressed, but it stays ${high} after that. ${FIND_BUG}`,
            code: head.concat(ifBlock(`${rectCall(b)} && mouseIsPressed`, `${name} = ${high}`).map((l) => `  ${l}`), ['}']),
            bugLines: [2, 3],
            why: NEVER_RESET,
            others: others(r, NEVER_RESET),
            fixed: head.concat(chainLines([{ cond: `${rectCall(b)} && mouseIsPressed`, body: `${name} = ${high}` }], `${name} = ${low}`, '  '), ['}']),
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [{ mouseX: 0, mouseY: 0, frames: [press(spot.x, spot.y), lift] }],
            },
            explain: `Add an else that sets ${name} back to ${low}.`,
          });
        },
      },
    ],
  };

  // ---- Building code ----

  const WORD_POOL = { word: ['mouseX', 'draw', 'setup'], fn: ['draw', 'setup', 'mouseIsPressed'], conn: ['||'] };

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing code that responds to clicks',
    patterns: [
      {
        id: 'count-clicks',
        make(r) {
          const name = r.pick(COUNTERS);
          const c = pickCircle(r);
          const spot = onCircle(c, r);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${name} goes up by 1 once for each click on the circle.`,
            lines: [
              [`let ${name} = 0`],
              ['function ', tok('mousePressed', 'fn'), '(){'],
              ['  if(', tok('collidePointCircle', 'call'), `(mouseX, mouseY, ${c.x}, ${c.y}, ${c.d})){`],
              ['    ', tok(name, 'name'), ' = ', tok(name, 'name'), ' + ', tok(1, 'num')],
              ['  }'],
              ['}'],
            ],
            must: ['fn', 'name'],
            count: 3,
            pools: {
              fn: WORD_POOL.fn, call: ['collidePointRect', 'mousePressed'], name: ['mouseX', 'frameCount'], num: [2, 0, 10],
            },
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [
                { mouseX: 0, mouseY: 0, frames: [...clickAt(spot.x, spot.y), ...clickAt(spot.x, spot.y)] },
                { mouseX: 0, mouseY: 0, frames: clickAt(c.x + c.d + 30, c.y + c.d + 30) },
                { mouseX: 0, mouseY: 0, frames: held(spot.x, spot.y, 3) },
              ],
            },
            explain: 'mousePressed() runs once per click, and the if checks that the click landed on the circle.',
          });
        },
      },
      {
        id: 'change-while-held',
        make(r) {
          const b = pickButton(r);
          const spot = onButton(b);
          const name = r.pick(['lineWeight', 'edgeWeight', 'thickness']);
          const [low, high] = r.pick([[2, 10], [1, 8], [3, 12]]);
          return kit.blanksQuestion(r, {
            prompt: `Complete draw() so ${name} is ${high} only while the rectangle is being pressed, and ${low} the rest of the time.`,
            lines: [
              [`let ${name} = ${low}`],
              ['function draw(){'],
              [`  if(${rectCall(b)} `, tok('&&', 'conn'), ' ', tok('mouseIsPressed', 'word'), '){'],
              [`    ${name} = `, tok(high, 'num')],
              ['  }'],
              ['  ', tok('else', 'kw'), '{'],
              [`    ${name} = `, tok(low, 'num')],
              ['  }'],
              ['}'],
            ],
            must: ['conn', 'word'],
            count: 4,
            pools: {
              conn: WORD_POOL.conn, word: ['mousePressed', 'mouseX'], num: [low + 1, high + 1], kw: ['if', 'else if'],
            },
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [
                { mouseX: 0, mouseY: 0, frames: [press(spot.x, spot.y)] },
                { mouseX: 0, mouseY: 0, frames: [press(spot.x, spot.y), lift] },
                { mouseX: spot.x, mouseY: spot.y, frames: [{}] },
                { mouseX: 0, mouseY: 0, frames: [press(b.x + b.w + 30, b.y)] },
              ],
            },
            explain: 'The rectangle check and mouseIsPressed both have to be true, and the else sets the value back.',
          });
        },
      },
      {
        id: 'nested-button',
        make(r) {
          const b = pickButton(r);
          const spot = onButton(b);
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.blanksQuestion(r, {
            prompt: `Complete the nested conditionals. On the rectangle, ${V} is ${c1.name} while pressed and ${c2.name} otherwise. Off the rectangle, it is ${c3.name}.`,
            lines: [
              ['if(', tok('collidePointRect', 'call'), `(mouseX, mouseY, ${b.x}, ${b.y}, ${b.w}, ${b.h})){`],
              ['  if(', tok('mouseIsPressed', 'word'), '){'],
              [`    ${kit.setColor(V, c1)}`],
              ['  }'],
              ['  ', tok('else', 'kw'), '{'],
              [`    ${kit.setColor(V, c2)}`],
              ['  }'],
              ['}'],
              [tok('else', 'kw'), '{'],
              [`  ${kit.setColor(V, c3)}`],
              ['}'],
            ],
            must: ['word', 'kw'],
            count: 3,
            pools: { call: ['collidePointCircle', 'mousePressed'], word: ['mousePressed', 'mouseY'], kw: ['if', 'else if'] },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V}`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: [
                { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: true },
                { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: false },
                { mouseX: b.x + b.w + 40, mouseY: b.y + b.h + 40, mouseIsPressed: true },
                { mouseX: b.x + b.w + 40, mouseY: b.y + b.h + 40, mouseIsPressed: false },
              ],
            },
            explain: 'The inner if and else only get checked when the mouse is on the rectangle.',
          });
        },
      },
      {
        id: 'light-switch',
        make(r) {
          const name = r.pick(LIGHTS_NAMES);
          const [a, b] = r.pick(ROOMS);
          const button = pickButton(r);
          const spot = onButton(button);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so each click on the rectangle turns ${name}.${a} on and ${name}.${b} off.`,
            lines: [
              [`let ${name} = {`],
              [`  ${a}: "off",`],
              [`  ${b}: "on"`],
              ['}'],
              ['function ', tok('mousePressed', 'fn'), '(){'],
              [`  if(${rectCall(button)}){`],
              ['    ', tok(name, 'obj'), '.', tok(a, 'key'), ' = ', tok('"on"', 'state')],
              ['    ', tok(name, 'obj'), '.', tok(b, 'key'), ' = ', tok('"off"', 'state')],
              ['  }'],
              ['}'],
            ],
            must: ['fn', 'state'],
            count: 3,
            pools: {
              fn: WORD_POOL.fn, obj: [a, 'switch'], key: [a, b], state: ['on', 'off', '"on"', '"off"'],
            },
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(`${name}.${a}, ${name}.${b}`)],
              vectors: [
                { mouseX: 0, mouseY: 0, frames: clickAt(spot.x, spot.y) },
                { mouseX: 0, mouseY: 0, frames: clickAt(button.x + button.w + 30, button.y) },
              ],
            },
            explain: 'mousePressed() runs once per click. Words like "on" are strings, so they need quotation marks.',
          });
        },
      },
    ],
  };

  const scramble = (rules) => `Put these lines in order so the code does this:\n${numberedRules(rules)}`;

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting click code in order',
    patterns: [
      {
        id: 'count-and-show',
        make(r) {
          const name = r.pick(COUNTERS);
          const c = pickCircle(r);
          const spot = onCircle(c, r);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `In draw(), paint a gray background and draw the circle at (${c.x}, ${c.y}) with a diameter of ${c.d}.`,
              `Make a separate mousePressed() function. If the click is on the circle, add 1 to ${name}.`,
            ]),
            prefix: [{ text: `let ${name} = 0` }, { text: 'function draw(){' }],
            movable: ['background(220)', `ellipse(${c.x}, ${c.y}, ${c.d}, ${c.d})`, '}', 'function mousePressed(){', `if(${circleCall(c)}){`, `${name} = ${name} + 1`, '}'],
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(name)],
              vectors: [
                { mouseX: 0, mouseY: 0, frames: [...clickAt(spot.x, spot.y), ...clickAt(c.x + c.d + 30, c.y)] },
                { mouseX: 0, mouseY: 0, frames: held(spot.x, spot.y, 3) },
              ],
            },
            explain: 'draw() has to close before mousePressed() starts, since mousePressed() must stand on its own.',
          });
        },
      },
      {
        id: 'color-while-held',
        make(r) {
          const b = pickButton(r);
          const spot = onButton(b);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `While the rectangle is being pressed, make ${V} ${c1.name}. Otherwise, make it ${c2.name}.`,
              `Fill with ${V}, and draw the rectangle.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: chainLines([{ cond: `${rectCall(b)} && mouseIsPressed`, body: kit.setColor(V, c1) }], kit.setColor(V, c2)).concat([`fill(${V})`, `rect(${b.x}, ${b.y}, ${b.w}, ${b.h})`]),
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${V}`],
              vectors: [
                { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: true },
                { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: false },
                { mouseX: b.x + b.w + 40, mouseY: b.y, mouseIsPressed: true },
              ],
            },
            explain: 'Each color goes right after its condition. fill() has to come before rect().',
          });
        },
      },
      {
        id: 'nested-button',
        make(r) {
          const b = pickButton(r);
          const spot = onButton(b);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              'Use one if inside another.',
              `If the mouse is on the rectangle and pressed, make ${V} ${c1.name}.`,
              `If it is on the rectangle but not pressed, make ${V} ${c2.name}.`,
            ]),
            prefix: [{ text: `if(${rectCall(b)}){` }],
            movable: ['if(mouseIsPressed){', kit.setColor(V, c1), '}', 'else{', kit.setColor(V, c2), '}'],
            suffix: [{ text: '}' }],
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V} = "none"`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: [
                { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: true },
                { mouseX: spot.x, mouseY: spot.y, mouseIsPressed: false },
                { mouseX: b.x + b.w + 40, mouseY: b.y, mouseIsPressed: true },
              ],
            },
            explain: 'The inner if and its else both go inside the outer if.',
          });
        },
      },
      {
        id: 'light-switch',
        make(r) {
          const name = r.pick(LIGHTS_NAMES);
          const [a, b, c] = r.pick(ROOMS);
          const button = pickButton(r);
          const spot = onButton(button);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make ${name} an object where ${a}, ${b}, and ${c} all start as "off".`,
              `In mousePressed(), if the click is on the rectangle, turn ${a} and ${c} on.`,
            ]),
            prefix: [{ text: `let ${name} = {` }, { text: `${a}: "off",` }, { text: `${b}: "off",` }],
            movable: [`${c}: "off"`, '}', 'function mousePressed(){', `if(${rectCall(button)}){`, `${name}.${a} = "on"`, `${name}.${c} = "on"`, '}'],
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenSuffix: [report(`${name}.${a}, ${name}.${b}, ${name}.${c}`)],
              vectors: [
                { mouseX: 0, mouseY: 0, frames: clickAt(spot.x, spot.y) },
                { mouseX: 0, mouseY: 0, frames: clickAt(button.x + button.w + 30, button.y) },
              ],
            },
            explain: 'The object closes before the function starts. The changes go inside the if, so only a click on the rectangle makes them.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA4.2',
    title: 'Mouse Clicks && Shapes as Buttons',
    unit: 2,
    source: 'curriculum/02-unit-2/12-U2LA4.2-Mouse-Clicks-and-Shapes-as-Buttons.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/keyIsPressed/, 'key presses (U2LA5.1)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [whichSlot, countSlot, lastingSlot, statesSlot, lightsSlot, flowSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['counting', 'pressedOrCallback', 'parsons', 'staysOrResets', 'blanks', 'buttonStates', 'bug', 'lightSwitch', 'lines'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
