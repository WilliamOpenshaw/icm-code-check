// U1LA4.1 to U1LA4.4 and U1LA5.1: abstraction, function calls, custom functions, random(),
// and function libraries. Students have NOT seen: conditionals, return values, or loops.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const { tok } = kit;
  const { slot, choice, at } = U;
  const noLogic = U.NO_LOGIC;

  const TASKS = [
    ['washHands', ['turnOnSink', 'getSoap', 'sudsHands', 'rinseHands', 'dryHands'], 'wash your hands'],
    ['brushTeeth', ['getBrush', 'addToothpaste', 'scrubTeeth', 'rinseMouth', 'putBrushAway'], 'brush your teeth'],
    ['smileyFace', ['drawHead', 'drawLeftEye', 'drawRightEye', 'drawNose', 'drawMouth'], 'draw a smiley face'],
    ['makeToast', ['getBread', 'loadToaster', 'pressLever', 'removeToast', 'spreadButter'], 'make toast'],
  ];
  const stubs = (names) => names.map((n) => `function ${n}(){\n  console.log("${n}")\n}`);

  // ---- U1LA4.1 ----
  U.lesson('U1LA4.1', 'What is Abstraction?', '12-U1LA4.1-What-is-Abstraction.md', 12, 8, noLogic.concat([[/\brandom\(/, 'random (U1LA4.4)']]), [
    slot('define', 'concepts', 'Defining abstraction', {
      meaning(r) {
        return choice(r, 'What does abstraction mean in computer science?', 'A simplified version of something that hides the technical details', ['Making code as long and detailed as possible', 'Adding color and style to a drawing', 'Fixing errors in a program'], 'An abstraction lets you use something without handling every detail.');
      },
      generalize(r) {
        return choice(r, 'What does it mean to generalize a process?', 'To make it more widely applicable', ['To make it work for just one case', 'To delete it from a program', 'To rename it'], 'General processes can be reused in many situations.');
      },
      procedural(r) {
        return choice(r, 'What is procedural abstraction?', 'Giving a repeated process a name so that it can be reused', ['Drawing a process on paper', 'Running a process only once', 'Writing a process in a different language'], 'You call the name, rather than retyping every step.');
      },
    }),
    slot('examples', 'concepts', 'Recognizing abstractions in code', {
      lineFn(r) {
        const v = () => at(r, 2, 38);
        return choice(r, 'Why is this function call an abstraction?', 'It hides the code needed to draw a line behind one name', ['It draws abstract art', 'It has no parameters', 'It only works on one canvas size'], 'line() was written by a programmer and included in the p5.js library.', { code: [`line(${v()}, ${v()}, ${v()}, ${v()})`] });
      },
      steps(r) {
        const [name, steps] = r.pick(TASKS);
        return choice(r, 'Which one is the abstraction here?', `${name}()`, [`The first step inside of it, ${r.pick(steps)}()`, 'A comment at the end of the program', 'The canvas'], 'The name stands for all of the steps.', { code: [`${name}()`] });
      },
      benefit(r) {
        return choice(r, 'A program draws the same face in four places. What does a function named drawFace give you?', 'One place to write the steps, and a short name to reuse them', ['Four different faces with no code', 'A bigger canvas', 'Faster typing of every step, four times'], 'Functions reduce repetition.');
      },
    }),
    slot('algorithm', 'flow', 'Following the steps behind an abstraction', {
      firstStep(r) {
        const [name, steps] = r.pick(TASKS);
        const code = stubs(steps).concat([`function ${name}(){`], steps.map((s) => `  ${s}()`), ['}', `${name}()`]);
        return choice(r, `What gets printed first when ${name}() is called?`, kit.printed(code)[0], steps.slice(1, 4), 'The steps run from top to bottom.', { code: [`function ${name}(){`].concat(steps.map((s) => `  ${s}()`), ['}', `${name}()`]) });
      },
      count(r) {
        const [name, steps] = r.pick(TASKS); const calls = r.int(2, 4);
        const code = stubs(steps).concat([`function ${name}(){`], steps.map((s) => `  ${s}()`), ['}'], Array.from({ length: calls }, () => `${name}()`));
        return kit.numberQuestion({ prompt: `Each step prints one line. How many lines get printed in total?`, code: [`function ${name}(){`].concat(steps.map((s) => `  ${s}()`), ['}'], Array.from({ length: calls }, () => `${name}()`)), answer: kit.printed(code).length, explain: `${steps.length} steps for each of ${calls} calls.` });
      },
      neverCalled(r) {
        const [name, steps] = r.pick(TASKS);
        const shown = [`function ${name}(){`].concat(steps.map((s) => `  ${s}()`), ['}']);
        return kit.numberQuestion({ prompt: 'Each step prints one line. How many lines get printed by this whole program?', code: shown, answer: kit.printed(stubs(steps).concat(shown)).length, explain: 'Defining a function doesn\'t run it. It only runs when it is called.' });
      },
    }),
    slot('parsons', 'build', 'Writing the algorithm behind an abstraction', ...[{
      task0(r) { return order(r, 0); },
      task1(r) { return order(r, 1); },
      task2(r) { return order(r, 2); },
      task3(r) { return order(r, 3); },
    }]),
  ]);

  function order(r, i) {
    const [name, steps, words] = TASKS[i];
    return kit.parsonsQuestion(r, {
      prompt: `Put these lines in order so ${name} is an algorithm to ${words}. Choose the order that makes sense in real life.`,
      prefix: [{ text: `function ${name}(){` }],
      movable: steps.map((s) => `${s}()`),
      suffix: [{ text: '}' }, { text: `${name}()` }],
      spec: { kind: 'snippet', hiddenPrefix: stubs(steps).join('\n').split('\n'), vectors: [{}] },
      explain: 'The steps of an algorithm have to run in a sensible order.',
    });
  }

  // ---- U1LA4.2 ----
  const SAMPLE_CALLS = (r) => [
    `rect(${at(r, 2, 30)}, ${at(r, 2, 30)}, ${at(r, 2, 10)}, ${at(r, 2, 10)})`,
    `ellipse(${at(r, 2, 30)}, ${at(r, 2, 30)}, ${at(r, 2, 10)}, ${at(r, 2, 10)})`,
    `line(${at(r, 2, 30)}, ${at(r, 2, 30)}, ${at(r, 2, 30)}, ${at(r, 2, 30)})`,
  ];
  const WASH = (r) => {
    const [name, a, b] = r.pick([['washHands', 'brand', 'time'], ['makeTea', 'flavor', 'minutes'], ['paintWall', 'color', 'coats']]);
    return { name, a, b };
  };

  U.lesson('U1LA4.2', 'Intro to Functions && Function Calls', '13-U1LA4.2-Intro-to-Functions-and-Function-Calls.md', 12, 8, noLogic.concat([[/\brandom\(/, 'random (U1LA4.4)']]), [
    slot('terms', 'concepts', 'Telling calls, parameters, and arguments apart', {
      parts(r) {
        const { name, a, b } = WASH(r); const n = r.int(1, 9);
        const rows = r.shuffle([[`${a}, ${b}`, 0], [`"soap", ${n}`, 1], [name, 2]]);
        return kit.rowsQuestion({ prompt: 'What is each part of this code?', code: [`function ${name}(${a}, ${b}){`, '}', `${name}("soap", ${n})`], columns: ['Part'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: ['parameters', 'arguments', 'function name'].map((text) => ({ text })), explain: 'Parameters are named in the definition, and arguments are the values in the call.' });
      },
      whatIsCall(r) {
        return choice(r, 'What does calling a function do?', 'It runs the steps the function stands for', ['It deletes the function', 'It renames the function', 'It only checks the spelling of the function'], 'A call is the function\'s name, with parentheses, to run it.');
      },
      whyParams(r) {
        return choice(r, 'Why do functions have parameters?', 'So the same function can behave differently each time it is called', ['So that the function can only run once', 'To make the function name longer', 'To keep the function from being called'], 'Parameters are the inputs that you control.');
      },
    }),
    slot('spot', 'concepts', 'Identifying function calls in code', {
      howManyCalls(r) {
        const n = r.int(2, 3); const calls = r.sample(SAMPLE_CALLS(r), n);
        const code = ['/\/ A comment doesn\'t run', ...calls];
        return kit.numberQuestion({ prompt: 'How many function calls are in this code?', code, answer: n, explain: 'Each name followed by parentheses is a call. Comments don\'t run.' });
      },
      argCount(r) {
        const call = r.pick(SAMPLE_CALLS(r));
        return kit.numberQuestion({ prompt: 'How many arguments does this call pass?', code: [call], answer: call.split(',').length, explain: 'Commas separate the arguments.' });
      },
      whichName(r) {
        const call = r.pick(SAMPLE_CALLS(r)); const name = call.split('(')[0];
        return choice(r, 'Which part of this is the function name?', name, ['The first number', 'The last number', 'The parentheses'], 'The name comes right before the parentheses.', { code: [call] });
      },
    }),
    slot('matching', 'flow', 'Matching arguments to parameters', {
      second(r) {
        const v = [r.int(2, 30), r.int(31, 60)];
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['function show(a, b){', '  console.log(b)', '}', `show(${v[0]}, ${v[1]})`], explain: 'Arguments fill parameters in order.' });
      },
      first(r) {
        const v = [r.int(2, 30), r.int(31, 60), r.int(61, 90)];
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['function show(x, y, z){', '  console.log(x)', '}', `show(${v.join(', ')})`], explain: 'The first argument goes to the first parameter.' });
      },
      twice(r) {
        const v = [r.int(2, 30), r.int(31, 60)];
        return kit.printedNumber({ prompt: 'What number does this print last?', code: ['function show(size){', '  console.log(size)', '}', `show(${v[0]})`, `show(${v[1]})`], explain: 'Each call gives the parameter a new value.' });
      },
    }),
    slot('blanks', 'build', 'Completing a function call', {
      call(r) {
        const { name, a } = WASH(r); const v = r.int(2, 30);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${name} gets called, and prints ${v}.`, lines: [[`function ${name}(${a}){`], [`  console.log(`, tok(a, 'p'), ')'], ['}'], [tok(name, 'f'), '(', tok(v, 'n'), ')']], must: ['f', 'n'], count: 3, pools: { f: ['function', 'setup'], p: ['value', 'width'], n: [v + 1] }, spec: U.spec([{ width: 400 }]), explain: 'A call is the name with the argument in parentheses.' });
      },
      shape(r) {
        const x = at(r, 2, 30); const y = at(r, 2, 30);
        return kit.blanksQuestion(r, { prompt: `Complete the call so the circle is centered at (${x}, ${y}), and is 50 wide and tall.`, lines: [[tok('ellipse', 'f'), '(', tok(x, 'n'), ', ', tok(y, 'n'), ', 50, 50)']], must: ['f', 'n'], count: 3, pools: { f: ['rect', 'line'], n: [x + 5, y + 15] }, spec: U.spec(), explain: 'The function name comes first, and then its arguments.' });
      },
      define(r) {
        const { name, a, b } = WASH(r); const v = r.int(2, 30);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${name} has the parameters ${a} and ${b}, and prints ${b}.`, lines: [[tok('function', 'k'), ` ${name}(${a}, `, tok(b, 'p'), '){'], ['  console.log(', tok(b, 'p'), ')'], ['}'], [`${name}(1, ${v})`]], must: ['k', 'p'], count: 3, pools: { k: ['let', 'draw'], p: [a] }, spec: U.spec(), explain: 'The word function starts a definition, and parameters go in its parentheses.' });
      },
    }),
    slot('parsons', 'build', 'Ordering a function and its calls', {
      defineCall(r) { return defineThenCall(r, 3); },
      four(r) { return defineThenCall(r, 4); },
      withLog(r) {
        const a = r.int(2, 30);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so the code does this:\n${kit.numberedRules(['Print "Start".', `Call show with ${a}, which prints its input.`, 'Print "End".'])}`, prefix: [{ text: 'function show(value){' }], movable: ['console.log(value)', '}', 'console.log("Start")', `show(${a})`, 'console.log("End")'], suffix: [], spec: U.spec(), explain: 'The definition closes before the program goes on.' });
      },
    }),
  ]);

  function defineThenCall(r, calls) {
    const values = Array.from({ length: calls }, () => r.int(2, 90));
    return kit.parsonsQuestion(r, {
      prompt: `Put these lines in order so report prints its input, and gets called with ${values.join(', then ')}.`,
      prefix: [{ text: 'function report(amount){' }],
      movable: ['console.log(amount)', '}'].concat(values.map((v) => `report(${v})`)),
      suffix: [],
      spec: U.spec(),
      explain: 'The function closes, and then the calls run in order.',
    });
  }

  // ---- U1LA4.3 ----
  const FACE = (name, x, y) => [`function ${name}(${x}, ${y}){`, `  ellipse(${x}, ${y}, 100)`, `  arc(${x}-15, ${y}, 25, 25, 180, 0)`, `  arc(${x}+35, ${y}, 15, 25, 180, 0)`, '}'];
  const pickFace = (r) => [r.pick(['happyFace', 'angryFace', 'sillyFace']), ...r.pick([['xPos', 'yPos'], ['faceX', 'faceY'], ['x', 'y']])];

  U.lesson('U1LA4.3', 'Draw with Functions', '14-U1LA4.3-Draw-with-Functions.md', 15, 9, noLogic.concat([[/\brandom\(/, 'random (U1LA4.4)']]), [
    slot('definitions', 'concepts', 'Knowing how drawing functions work', {
      disappears(r) {
        const [name] = pickFace(r);
        return choice(r, `You move your drawing code into ${name}(), and the drawing disappears. Why?`, `${name}() is defined, but it hasn't been called yet`, ['Functions can\'t draw', 'It needs a new canvas', 'The code has to stay in setup()'], 'Defining a function doesn\'t run it. Call it in draw().');
      },
      whereCall(r) {
        const [name] = pickFace(r);
        return choice(r, `Where would you call ${name}() so it draws on every frame?`, 'Inside draw()', ['Outside of all functions, at the very bottom', 'Inside its own definition', 'In a comment'], 'draw() runs over and over.');
      },
      whyParams(r) {
        const [name] = pickFace(r);
        return choice(r, `Why give ${name} parameters for x and y?`, 'So it can be drawn anywhere, not only in one place', ['So that it only draws once', 'So that it changes color', 'p5 requires exactly two parameters'], 'Positions based on parameters move with each call.');
      },
    }),
    slot('positions', 'flow', 'Working out positions inside a function', {
      eye(r) {
        const [name, x, y] = pickFace(r); const a = at(r, 5, 30); const b = at(r, 5, 30);
        const code = FACE(name, x, y).concat([`${name}(${a}, ${b})`]);
        return kit.numberQuestion({ prompt: 'What is the x value of the first arc?', code, answer: U.shapesOf(code).shapes[1][1][0], explain: `${x} holds ${a}, so subtract 15.` });
      },
      secondArc(r) {
        const [name, x, y] = pickFace(r); const a = at(r, 5, 30); const b = at(r, 5, 30);
        const code = FACE(name, x, y).concat([`${name}(${a}, ${b})`]);
        return kit.numberQuestion({ prompt: 'What is the x value of the second arc?', code, answer: U.shapesOf(code).shapes[2][1][0], explain: `${x} holds ${a}, so add 35.` });
      },
      totalShapes(r) {
        const [name, x, y] = pickFace(r); const calls = r.int(2, 4);
        const code = FACE(name, x, y).concat(Array.from({ length: calls }, (_, i) => `${name}(${100 * (i + 1)}, 100)`));
        return kit.numberQuestion({ prompt: 'How many shapes get drawn in all?', code, answer: U.shapesOf(code).shapes.length, explain: `3 shapes for each of ${calls} calls.` });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in drawing functions', {
      hardcoded(r) {
        const a = at(r, 5, 30); const b = at(r, 5, 30);
        const def = (x) => ['function dot(xPos, yPos){', `  ellipse(${x}, yPos, 50, 50)`, '}', `dot(${a}, ${b})`];
        return U.bug(r, { prompt: `The dot should be drawn at x = ${a}.`, code: def(a + 50), fixed: def('xPos'), line: 1, why: 5, explain: 'Use the parameter rather than a fixed number.' });
      },
      neverCalled(r) {
        const a = at(r, 5, 30); const s = at(r, 2, 9); const name = r.pick(['dot', 'spot', 'ball', 'bubble']);
        return U.bug(r, { prompt: `The ${name} should be drawn, but nothing appears.`, code: [`function ${name}(xPos){`, `  ellipse(xPos, 100, ${s}, ${s})`, '}', name], fixed: [`function ${name}(xPos){`, `  ellipse(xPos, 100, ${s}, ${s})`, '}', `${name}(${a})`], line: 3, why: 1, explain: 'A call needs parentheses, with an argument for the parameter.' });
      },
      swapped(r) {
        const a = at(r, 5, 15); const b = at(r, 20, 35);
        const def = ['function dot(xPos, yPos){', '  ellipse(xPos, yPos, 50, 50)', '}'];
        return U.bug(r, { prompt: `The dot should be at x = ${a}, y = ${b}.`, code: def.concat([`dot(${b}, ${a})`]), fixed: def.concat([`dot(${a}, ${b})`]), line: 3, why: 0, explain: 'Arguments fill parameters in order.' });
      },
    }),
    slot('blanks', 'build', 'Completing a drawing function', {
      params(r) {
        const [name, x, y] = pickFace(r); const a = at(r, 5, 30); const b = at(r, 5, 30);
        return kit.blanksQuestion(r, { prompt: `Complete ${name} so it draws at the position it is given.`, lines: [[`function ${name}(${x}, ${y}){`], ['  ellipse(', tok(x, 'p'), ', ', tok(y, 'p'), ', 100, 100)'], [`  ellipse(`, tok(x, 'p'), ` + 20, ${y}, 10, 10)`], ['}'], [`${name}(${a}, ${b})`]], must: ['p'], count: 3, pools: { p: ['mouseX', 'width'] }, spec: U.spec([{ mouseX: 7, width: 400 }]), explain: 'Everything is placed relative to the parameters.' });
      },
      call(r) {
        const [name, x, y] = pickFace(r); const a = at(r, 5, 30); const b = at(r, 5, 30);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${name} is defined, and drawn at (${a}, ${b}).`, lines: [[tok('function', 'k'), ` ${name}(${x}, ${y}){`], [`  ellipse(${x}, ${y}, 100, 100)`], ['}'], [tok(name, 'f'), '(', tok(a, 'n'), ', ', tok(b, 'n'), ')']], must: ['k', 'n'], count: 3, pools: { k: ['let', 'draw'], f: ['setup', 'draw'], n: [a + 5] }, spec: U.spec(), explain: 'Define it with the word function, and call it with values.' });
      },
      offset(r) {
        const d = at(r, 1, 5); const a = at(r, 5, 30);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the eye is always ${d} to the right of the head.`, lines: [['function face(xPos){'], ['  ellipse(xPos, 100, 80, 80)'], ['  ellipse(', tok('xPos', 'p'), ' ', tok('+', 'o'), ' ', tok(d, 'n'), ', 100, 10, 10)'], ['}'], [`face(${a})`]], must: ['p', 'o'], count: 3, pools: { p: ['width', 'mouseX'], o: ['-', '*'], n: [d + 5] }, spec: U.spec([{ width: 400, mouseX: 7 }]), explain: 'Adding to the parameter keeps the distance the same.' });
      },
    }),
    slot('parsons', 'build', 'Putting a drawing function in order', {
      callInDraw(r) {
        const a = at(r, 5, 30);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so the code does this:\n${kit.numberedRules(['In draw(), paint a background, and call face at x = ' + a + '.', 'Define face, which draws a head and then an eye.'])}`, prefix: [{ text: 'function draw(){' }], movable: ['background(220)', `face(${a})`, '}', 'function face(xPos){', 'ellipse(xPos, 100, 80, 80)', 'ellipse(xPos + 20, 100, 10, 10)'], suffix: [{ text: '}' }], spec: { kind: 'sketch', vectors: [{}] }, explain: 'The call goes in draw(), and the definition stands on its own.' });
      },
      twoCalls(r) {
        const a = at(r, 5, 15); const b = at(r, 20, 35);
        return U.drawParsons(r, { rules: ['Paint a gray background.', `Call dot at x = ${a}, and then at x = ${b}.`, 'Draw a line across the canvas last.', 'Print "Done", and then the width.'], lines: ['background(200)', `dot(${a})`, `dot(${b})`, 'line(0, 100, width, 100)', 'console.log("Done")', 'console.log(width)'], hidden: ['function dot(x){', '  ellipse(x, 100, 10, 10)', '}'], explain: 'A function call runs in order like any other line.' });
      },
      styles(r) {
        const v = r.pick([[255, 0, 0], [0, 0, 255], [0, 200, 0]]);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so the function does this:\n${kit.numberedRules(['Turn off outlines.', `Set the fill to (${v.join(', ')}).`, 'Draw the head at the parameters.', 'Set the fill to white.', 'Draw the eye.'])}`, prefix: [{ text: 'function face(xPos, yPos){' }], movable: ['noStroke()', `fill(${v.join(', ')})`, 'ellipse(xPos, yPos, 80, 80)', 'fill(255)', 'ellipse(xPos + 20, yPos, 10, 10)'], suffix: [{ text: '}' }, { text: 'face(100, 100)' }], spec: U.spec(), explain: 'Each fill goes right before the shape that uses it.' });
      },
    }),
  ]);

  // ---- U1LA4.4 ----
  U.lesson('U1LA4.4', 'Using the Random Function', '15-U1LA4.4-Using-the-Random-Function.md', 15, 9, noLogic, [
    slot('range', 'concepts', 'Knowing what values random() can give', {
      oneArg(r) {
        const n = r.int(5, 100); const inside = r.int(1, n - 1);
        const rows = r.shuffle([[String(inside), 0], ['0', 0], [String(n), 1], [String(n + r.int(1, 20)), 1], ['-1', 1]]);
        return kit.rowsQuestion({ prompt: 'Could this call give each number?', code: [`random(${n})`], columns: ['Number'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'yes' }, { text: 'no' }], explain: `It goes from 0 up to, but not including, ${n}.` });
      },
      twoArgs(r) {
        const a = r.int(5, 50); const b = a + r.int(10, 60); const mid = r.int(a + 1, b - 1);
        const rows = r.shuffle([[String(a), 0], [String(mid), 0], [String(b), 1], [String(a - 1), 1]]);
        return kit.rowsQuestion({ prompt: 'Could this call give each number?', code: [`random(${a}, ${b})`], columns: ['Number'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'yes' }, { text: 'no' }], explain: `It can be ${a}, but it stops just short of ${b}.` });
      },
      decimals(r) {
        const n = r.int(5, 50);
        return choice(r, `Which of these could random(${n}) give?`, String(r.int(1, n - 1) + 0.37), [String(n + 3), '-2', '"five"'], 'random() gives decimals, not only whole numbers.');
      },
    }),
    slot('scope', 'concepts', 'Knowing where to pick random values', {
      flashing(r) {
        const a = r.int(10, 50);
        return choice(r, 'Why does this ellipse flash when it runs?', 'draw() runs over and over, so it picks a new width every frame', ['random() always flashes shapes', 'ellipse() can\'t take decimals', 'The canvas is too small'], 'To keep one value, pick it in setup() and store it.', { code: ['function draw(){', `  ellipse(300, 300, random(${a}, 150), 100)`, '}'] });
      },
      keep(r) {
        return choice(r, 'How do you pick one random value and keep it for the whole program?', 'Store it in a global variable in setup()', ['Call random() in draw() with a bigger number', 'Write random() twice', 'Put random() in a comment'], 'setup() only runs once.');
      },
      colorType(r) {
        return choice(r, 'Which line stores a whole random color in a variable?', 'randomColor = color(random(255), random(255), random(255))', ['randomColor = random(color)', 'randomColor = random(255, 255, 255, 255)', 'randomColor = fill(255)'], 'color() tells the computer that the three numbers make a color.', { codeOptions: true });
      },
    }),
    slot('parts', 'flow', 'Tracing code with stored random values', {
      frames(r) {
        const inSetup = r.chance(0.5); const n = r.int(10, 99);
        const code = inSetup ? ['let size', 'function setup(){', `  size = random(${n})`, '}', 'function draw(){', '  ellipse(100, 100, size, size)', '}'] : ['function draw(){', `  let size = random(${n})`, '  ellipse(100, 100, size, size)', '}'];
        return choice(r, 'Does the size of this ellipse change while the program runs?', inSetup ? 'No, it is picked once in setup()' : 'Yes, it is picked again on every frame', [inSetup ? 'Yes, it is picked again on every frame' : 'No, it is picked once in setup()', 'Only when the mouse moves', 'Only if the canvas changes size'], 'setup() runs once, and draw() runs over and over.', { code });
      },
      smallest(r) {
        const a = r.int(5, 50); const b = a + r.int(10, 50);
        return kit.numberQuestion({ prompt: 'What is the smallest possible x value of this ellipse?', code: [`let x = random(${a}, ${b})`, 'ellipse(x + 10, 100, 50, 50)'], answer: a + 10, explain: `x can be as low as ${a}, and then 10 gets added.` });
      },
      floorResult(r) {
        const v = r.int(2, 40) + 0.75;
        return kit.printedNumber({ prompt: 'floor() rounds down to a whole number. What does this print?', code: [`console.log(floor(${v}))`], explain: `Rounding ${v} down removes the decimal part.` });
      },
    }),
    slot('bug', 'flow', 'Finding bugs with random()', {
      inDraw(r) {
        const n = r.int(50, 200);
        return U.bug(r, { prompt: `size should be chosen once. Then every frame should use it. Right now it never gets a value before the ellipse is drawn.`, code: ['let size', 'ellipse(100, 100, size, size)', `size = random(${n})`], fixed: ['let size', `size = random(${n})`, 'ellipse(100, 100, size, size)'], line: [1, 2], why: 3, explain: 'Give the variable its value before you use it.' });
      },
      misspelled(r) {
        const n = r.int(50, 200);
        return U.bug(r, { prompt: 'This should choose a random width.', code: [`let w = Random(${n})`, 'ellipse(100, 100, w, 50)'], fixed: [`let w = random(${n})`, 'ellipse(100, 100, w, 50)'], line: 0, why: 2, explain: 'The function is random(), all lowercase.' });
      },
      swapped(r) {
        const a = r.int(5, 50); const b = a + r.int(50, 100);
        return U.bug(r, { prompt: `This should draw an ellipse at x = 200, with a random y.`, code: [`let y = random(${a}, ${b})`, 'ellipse(y, 200, 50, 50)'], fixed: [`let y = random(${a}, ${b})`, 'ellipse(200, y, 50, 50)'], line: 1, why: 0, explain: 'x comes first, and then y.' });
      },
    }),
    slot('blanks', 'build', 'Completing code that uses random()', {
      range(r) {
        const a = r.int(5, 50); const b = a + r.int(10, 60);
        return kit.blanksQuestion(r, { prompt: `Complete the code so w is a random value from ${a} up to ${b}, and the ellipse uses it.`, lines: [['let w = ', tok('random', 'f'), '(', tok(a, 'n'), ', ', tok(b, 'n'), ')'], ['ellipse(100, 100, ', tok('w', 'v'), ', 50)']], must: ['f', 'n'], count: 3, pools: { f: ['fill', 'floor'], n: [a + 1, b + 1], v: ['width'] }, spec: U.spec([{ width: 400 }]), explain: 'The first value is the low end, and the second is the high end.' });
      },
      setup(r) {
        const n = r.int(50, 200);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so size gets a random value up to ${n} once, and draw() uses it on every frame.`, prefix: [{ text: 'let size' }], movable: ['function setup(){', `size = random(${n})`, '}', 'function draw(){', 'ellipse(100, 100, size, size)'], suffix: [{ text: '}' }], spec: { kind: 'sketch', vectors: [{}] }, explain: 'Picking the value in setup() keeps it from changing.' });
      },
      color(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the code so randomColor holds a random color, and the ellipse is filled with it.', lines: [['let randomColor = ', tok('color', 'f'), '(random(255), random(255), random(255))'], [tok('fill', 'g'), '(', tok('randomColor', 'v'), ')'], ['ellipse(100, 100, 50, 50)']], must: ['f', 'g'], count: 3, pools: { f: ['fill', 'stroke'], g: ['background', 'stroke'], v: ['width'] }, spec: U.spec([{ width: 400 }]), explain: 'color() combines the numbers, and fill() uses the result.' });
      },
    }),
    slot('parsons', 'build', 'Putting random code in order', {
      args(r) {
        const n = r.int(50, 200);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so the code does this:\n${kit.numberedRules([`Define dot, which draws a circle at x with a size.`, `Make s a random value up to ${n}.`, 'Call dot at x = 100 using s.'])}`, prefix: [{ text: 'function dot(x, size){' }], movable: ['ellipse(x, 100, size, size)', '}', `let s = random(${n})`, 'console.log(s)', 'dot(100, s)'], suffix: [{ text: 'console.log("Done")' }], spec: U.spec(), explain: 'A variable has to exist before you pass it as an argument.' });
      },
      colors(r) {
        return U.drawParsons(r, { rules: ['Paint a gray background.', 'Make red hold a random value up to 255.', 'Make blue hold a random value up to 255.', 'Fill with red and blue, and no green.', 'Draw a circle.'], lines: ['background(220)', 'let red = random(255)', 'let blue = random(255)', 'fill(red, 0, blue)', `ellipse(100, 100, ${at(r, 3, 9)}, 50)`], explain: 'Each value has to be picked before fill() can use it.' });
      },
      inFunction(r) {
        const n = r.int(50, 200);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so the code does this:\n${kit.numberedRules([`Make x a random value up to ${n}.`, 'Make y a random value up to 100.', 'Draw a circle at x and y.', 'Print x.', 'Print y.'])}`, prefix: [], movable: [`let x = random(${n})`, 'let y = random(100)', 'ellipse(x, y, 40, 40)', 'console.log(x)', 'console.log(y)'], suffix: [], spec: U.spec(), explain: 'Pick the values first, and then use them.' });
      },
    }),
  ]);

  // ---- U1LA5.1 ----
  U.lesson('U1LA5.1', 'Your Custom Function Library', '17-U1LA5.1-Your-Custom-Function-Library.md', 12, 8, noLogic, [
    slot('library', 'concepts', 'Knowing what a function library is for', {
      what(r) {
        return choice(r, 'What is a library?', 'A document that contains a set of functions', ['A list of variables to delete', 'A kind of canvas', 'A website for saving photos'], 'p5.js itself is a library of functions.');
      },
      uniqueNames(r) {
        return choice(r, 'Why do functions shared in a class library need unique names?', 'Two functions with one name would conflict, and only one would work', ['The computer can only read short names', 'It makes them run faster', 'Names don\'t matter, as long as they have comments'], 'A name has to point to one function.');
      },
      fileName(r) {
        return choice(r, 'You add a new file to hold your functions. What does its name need?', 'It must end in .js, like functions.js', ['It must end in .html', 'It must start with a capital letter', 'It must be named sketch'], 'The .js tells the computer it is a JavaScript file.');
      },
    }),
    slot('docs', 'concepts', 'Documenting a function', {
      whatToWrite(r) {
        return choice(r, 'What should documentation for a function include?', 'What the function does and what each parameter does', ['Only the date', 'Every line of the function, retyped', 'Nothing, since the code explains itself'], 'Someone else should be able to use it from the documentation alone.');
      },
      comment(r) {
        return choice(r, 'Which of these is a multi-line comment?', '/\* Draws a face. xPos is the x position. *\/', ['# Draws a face', '"Draws a face"', '(Draws a face)'], 'Multi-line comments start with a slash and a star, and end with a star and a slash.');
      },
      paramDoc(r) {
        const [x, y] = r.pick([['xPos', 'yPos'], ['faceX', 'faceY']]);
        return choice(r, `Which is the best documentation for the parameter ${x}?`, `${x} is the x position of the face on the canvas`, [`${x} is a thing`, `${x} is a word with ${x.length} letters`, `Do not change ${x}`], 'Say what the value controls.');
      },
    }),
    slot('linking', 'flow', 'Linking files in the right order', {
      order(r) {
        return choice(r, 'sketch.js calls functions from functions.js. Which order works in index.html?', '<script src="functions.js"><\/script> and then <script src="sketch.js"><\/script>', ['Only <script src="sketch.js"><\/script>', 'Only <script src="index.html"><\/script>', 'Neither file needs a script line'], 'Both files need to be linked, with the functions first.');
      },
      where(r) {
        const fn = r.pick(['happyFace', 'coolEmoji', 'starShape']);
        return choice(r, `${fn} is in functions.js, and you get an error saying it isn't defined. What should you check first?`, 'That functions.js is linked in index.html', ['That the canvas is big enough', 'That colorMode is HSB', 'That the sketch has a background'], 'A file has to be linked before its functions can be used.');
      },
      calls(r) {
        const n = r.int(2, 4); const v = r.int(2, 30);
        const defs = ['function dot(x){', '  ellipse(x, 100, 10, 10)', '}'];
        const code = defs.concat(Array.from({ length: n }, (_, i) => `dot(${v + i * 10})`));
        return kit.numberQuestion({ prompt: 'How many ellipses does this draw?', code, answer: U.shapesOf(code).shapes.length, explain: 'One for each call.' });
      },
    }),
    slot('parsons', 'build', 'Using a function someone else wrote', {
      peerFunction(r) {
        const a = at(r, 5, 15); const b = at(r, 20, 35);
        return U.drawParsons(r, { rules: ['Paint a gray background.', `Call happyFace at (${a}, 100).`, `Call happyFace at (${b}, 100).`, `Call happyFace at (${b}, 200).`, 'Draw a line under them.'], lines: ['background(220)', `happyFace(${a}, 100)`, `happyFace(${b}, 100)`, `happyFace(${b}, 200)`, 'line(0, 300, 400, 300)'], hidden: ['function happyFace(x, y){', '  ellipse(x, y, 100, 100)', '}'], explain: 'Library functions are called just like your own.' });
      },
      documented(r) {
        const v = at(r, 5, 30);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so the function comes first, and is then called at x = ${v}.`, prefix: [{ text: '/\/ Draws a dot. x is its position.' }], movable: ['function dot(x){', 'ellipse(x, 100, 10, 10)', 'rect(x, 120, 10, 10)', '}', `dot(${v})`], suffix: [], spec: U.spec(), explain: 'Documentation goes directly above the function it describes.' });
      },
      twoFunctions(r) {
        const v = at(r, 5, 30);
        return kit.parsonsQuestion(r, { prompt: `Put these lines in order so eye draws a small circle, and face draws a big circle and then calls eye at x = ${v}.`, prefix: [{ text: 'function eye(x){' }], movable: ['ellipse(x, 100, 10, 10)', '}', 'function face(x){', 'ellipse(x, 100, 80, 80)', 'eye(x)', '}', `face(${v})`], suffix: [], spec: U.spec(), explain: 'A function can call another one.' });
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
