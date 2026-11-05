// U2LA2.2: The Map Function
// curriculum/02-unit-2/07-U2LA2.2-The-Map-Function.md
//
// Students at this point have seen: everything through U2LA2.1, plus map() converting a
// value from one range to another, and mapped values stored in variables or objects.
// They have NOT seen: typeof, return values, mouseIsPressed, key presses, loops, or arrays.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const { tok, numberedRules } = kit;

  // Canvas sizes and output ranges that divide evenly, so students can work the answers out.
  const WIDTHS = [400, 500, 600, 800];
  const OUTPUTS = [100, 200, 400, 60, 80, 1000];
  const FRACTIONS = [[1, 4], [1, 2], [3, 4]];
  const VAR_NAMES = ['bright', 'shade', 'level', 'amount'];
  const SIZE_NAMES = ['circleSize', 'dotSize', 'ballSize'];
  const axisOf = (r) => (r.chance(0.5) ? 'mouseX' : 'mouseY');

  const part = (r, max) => {
    const [top, bottom] = r.pick(FRACTIONS);
    return (max * top) / bottom;
  };

  const compute = (r, { name, value, inMin, inMax, outMin, outMax, explain }) => {
    const axis = axisOf(r);
    return kit.printedNumber({
      prompt: `${axis} is ${value}. What number does ${name} hold?`,
      code: [`let ${name} = map(${axis}, ${inMin}, ${inMax}, ${outMin}, ${outMax})`],
      run: `let ${name} = map(${axis}, ${inMin}, ${inMax}, ${outMin}, ${outMax})\nconsole.log(${name})`,
      vec: { [axis]: value },
      explain,
    });
  };

  const computeSlot = {
    id: 'compute',
    skill: 'flow',
    concept: 'Working out what map() gives back',
    patterns: [
      {
        id: 'from-zero',
        make(r) {
          const w = r.pick(WIDTHS);
          const out = r.pick(OUTPUTS);
          const value = part(r, w);
          return compute(r, {
            name: r.pick(VAR_NAMES), value, inMin: 0, inMax: w, outMin: 0, outMax: out,
            explain: `${value} is ${value / w} of the way from 0 to ${w}, so the answer is that same fraction of the way from 0 to ${out}.`,
          });
        },
      },
      {
        id: 'backwards-output',
        make(r) {
          const w = r.pick(WIDTHS);
          const out = r.pick(OUTPUTS);
          const value = part(r, w);
          return compute(r, {
            name: r.pick(VAR_NAMES), value, inMin: 0, inMax: w, outMin: out, outMax: 0,
            explain: `The output range runs backwards, from ${out} down to 0. So as the input grows, the output shrinks.`,
          });
        },
      },
      {
        id: 'output-does-not-start-at-zero',
        make(r) {
          const w = r.pick(WIDTHS);
          const span = r.pick(OUTPUTS);
          const start = 10 * r.int(1, 5);
          const value = part(r, w);
          return compute(r, {
            name: r.pick(SIZE_NAMES), value, inMin: 0, inMax: w, outMin: start, outMax: start + span,
            explain: `Go ${value / w} of the way across the ${span} between ${start} and ${start + span}, then add that to ${start}.`,
          });
        },
      },
      {
        id: 'input-does-not-start-at-zero',
        make(r) {
          const span = r.pick([200, 400, 800]);
          const start = 100 * r.int(1, 2);
          const out = r.pick(OUTPUTS);
          const value = start + part(r, span);
          return compute(r, {
            name: r.pick(VAR_NAMES), value, inMin: start, inMax: start + span, outMin: 0, outMax: out,
            explain: `The input range starts at ${start}, so ${value} is ${value - start} of the way into a range that is ${span} wide.`,
          });
        },
      },
    ],
  };

  const WHICH_CALL = 'Which line does this?';

  const callSlot = {
    id: 'pickCall',
    skill: 'concepts',
    concept: 'Choosing the right map() call',
    patterns: [
      {
        id: 'black-to-white',
        make(r) {
          const w = r.pick(WIDTHS);
          return kit.choiceQuestion(r, {
            prompt: WHICH_CALL,
            rule: `On a canvas ${w} wide, make bgColor go from black on the left to white on the right.`,
            correct: `let bgColor = map(mouseX, 0, ${w}, 0, 255)`,
            wrong: [`let bgColor = map(mouseX, 0, 255, 0, ${w})`, `let bgColor = map(mouseX, 0, ${w}, 255, 0)`, `let bgColor = map(mouseY, 0, ${w}, 0, 255)`],
            codeOptions: true,
            explain: `The value to convert comes first, then the range it starts in (0 to ${w}), then the range you want (0 to 255).`,
          });
        },
      },
      {
        id: 'white-to-black',
        make(r) {
          const w = r.pick(WIDTHS);
          return kit.choiceQuestion(r, {
            prompt: WHICH_CALL,
            rule: `On a canvas ${w} wide, make bgColor go from white on the left to black on the right.`,
            correct: `let bgColor = map(mouseX, 0, ${w}, 255, 0)`,
            wrong: [`let bgColor = map(mouseX, 0, ${w}, 0, 255)`, `let bgColor = map(mouseX, ${w}, 0, 255, 0)`, `let bgColor = map(mouseX, 255, 0, 0, ${w})`],
            codeOptions: true,
            explain: 'Swapping the last two values makes the output run backwards. Swapping both ranges would make it run forwards again.',
          });
        },
      },
      {
        id: 'size-from-top-to-bottom',
        make(r) {
          const h = r.pick(WIDTHS);
          const low = 10 * r.int(1, 5);
          const high = low + 10 * r.int(5, 15);
          const name = r.pick(SIZE_NAMES);
          return kit.choiceQuestion(r, {
            prompt: WHICH_CALL,
            rule: `On a canvas ${h} tall, make ${name} go from ${low} at the top to ${high} at the bottom.`,
            correct: `let ${name} = map(mouseY, 0, ${h}, ${low}, ${high})`,
            wrong: [`let ${name} = map(mouseX, 0, ${h}, ${low}, ${high})`, `let ${name} = map(mouseY, ${low}, ${high}, 0, ${h})`, `let ${name} = map(mouseY, 0, ${h}, ${high}, ${low})`],
            codeOptions: true,
            explain: 'Top to bottom means mouseY. The input range is the canvas height, and the output range is the sizes you want.',
          });
        },
      },
      {
        id: 'stroke-weight',
        make(r) {
          const w = r.pick(WIDTHS);
          const low = r.int(1, 5);
          const high = low + 5 * r.int(2, 5);
          return kit.choiceQuestion(r, {
            prompt: WHICH_CALL,
            rule: `On a canvas ${w} wide, make the stroke weight go from ${low} on the left to ${high} on the right.`,
            correct: `strokeWeight(map(mouseX, 0, ${w}, ${low}, ${high}))`,
            wrong: [`strokeWeight(map(0, ${w}, mouseX, ${low}, ${high}))`, `strokeWeight(map(mouseX, ${low}, ${high}, 0, ${w}))`, `strokeWeight(map(mouseX, 0, ${w}, ${high}, ${low}))`],
            codeOptions: true,
            explain: 'The value to convert always comes first, followed by the input range and then the output range.',
          });
        },
      },
    ],
  };

  const whySlot = {
    id: 'whyMap',
    skill: 'concepts',
    concept: 'Explaining what map() is for',
    patterns: [
      {
        id: 'white-too-soon',
        make(r) {
          const w = r.pick([500, 600, 800, 1000]);
          return kit.numberQuestion({
            prompt: `This canvas is ${w} wide. Going from left to right, at what value of mouseX does the background first become fully white?`,
            code: [`createCanvas(${w}, 400)`, 'background(mouseX)'],
            answer: 255,
            explain: `Grays stop at 255, so the background is already white when mouseX reaches 255. This is why the code needs map(): to stretch 0 to 255 across all ${w} pixels.`,
          });
        },
      },
      {
        id: 'what-map-does',
        make(r) {
          const w = r.pick(WIDTHS);
          const name = r.pick(VAR_NAMES);
          return kit.choiceQuestion(r, {
            prompt: 'What does this line do?',
            code: [`let ${name} = map(mouseX, 0, ${w}, 0, 255)`],
            correct: `It converts mouseX from the range 0 to ${w} into the matching spot in the range 0 to 255`,
            wrong: [
              `It draws a picture on the canvas that is ${w} wide and 255 tall`,
              `It only gives a value when mouseX is exactly 0 or exactly ${w}`,
              `It moves the mouse to the position ${w}, 255`,
            ],
            explain: 'map() creates a proportional relationship between two ranges, so values stay evenly spaced.',
          });
        },
      },
      {
        id: 'what-each-part-is',
        make(r) {
          const w = r.pick(WIDTHS);
          const axis = axisOf(r);
          const out = r.pick(OUTPUTS);
          return kit.rowsQuestion({
            prompt: 'What does each part of this call do?',
            code: [`map(${axis}, 0, ${w}, 0, ${out})`],
            columns: ['Part'],
            rows: r.shuffle([
              { cells: [axis], answer: 0 },
              { cells: [`0, ${w}`], answer: 1 },
              { cells: [`0, ${out}`], answer: 2 },
            ]),
            options: [{ text: 'the value to convert' }, { text: 'the range it starts in' }, { text: 'the range you want' }],
            explain: 'map(value, inputStart, inputEnd, outputStart, outputEnd)',
          });
        },
      },
      {
        id: 'swap-the-last-two',
        make(r) {
          const w = r.pick(WIDTHS);
          const out = r.pick([100, 200, 255]);
          const axis = axisOf(r);
          return kit.choiceQuestion(r, {
            prompt: `A student changes the first line of this code to the second. What changes when the code runs?`,
            code: [`let bgColor = map(${axis}, 0, ${w}, 0, ${out})`, `let bgColor = map(${axis}, 0, ${w}, ${out}, 0)`],
            correct: 'The output runs in the opposite direction as the mouse moves',
            wrong: ['Nothing, because the same numbers are used', `The output can now go above ${out}`, 'The code stops working, because a range must go from small to big'],
            explain: 'Swapping the output range makes it start high and end low.',
          });
        },
      },
    ],
  };

  const SHADES = [{ text: 'black' }, { text: 'medium gray' }, { text: 'white' }];
  const shadeOf = (gray) => (gray <= 0 ? 0 : gray >= 255 ? 2 : 1);

  function shadeRows(r, { code, axis, positions, gray, explain }) {
    return kit.rowsQuestion({
      prompt: `What color is the background at each value of ${axis}?`,
      code,
      columns: [axis],
      rows: r.shuffle(positions).map((value) => ({ cells: [String(value)], answer: shadeOf(gray(value)) })),
      options: SHADES,
      explain,
    });
  }

  const shadeSlot = {
    id: 'shades',
    skill: 'flow',
    concept: 'Predicting what map() does to a background color',
    patterns: [
      {
        id: 'black-to-white',
        make(r) {
          const w = r.pick(WIDTHS);
          return shadeRows(r, {
            code: [`let bgColor = map(mouseX, 0, ${w}, 0, 255)`, 'background(bgColor)'],
            axis: 'mouseX',
            positions: [0, w / 2, w],
            gray: (x) => CC.p5Functions.map(x, 0, w, 0, 255),
            explain: 'The left edge gives 0, which is black. The right edge gives 255, which is white. Halfway gives a value in the middle.',
          });
        },
      },
      {
        id: 'white-to-black',
        make(r) {
          const w = r.pick(WIDTHS);
          return shadeRows(r, {
            code: [`let bgColor = map(mouseX, 0, ${w}, 255, 0)`, 'background(bgColor)'],
            axis: 'mouseX',
            positions: [0, w / 2, w],
            gray: (x) => CC.p5Functions.map(x, 0, w, 255, 0),
            explain: 'The output range runs backwards, so the left edge gives 255, which is white.',
          });
        },
      },
      {
        id: 'top-to-bottom',
        make(r) {
          const h = r.pick(WIDTHS);
          const flipped = r.chance(0.5);
          const [a, b] = flipped ? [255, 0] : [0, 255];
          return shadeRows(r, {
            code: [`let bgColor = map(mouseY, 0, ${h}, ${a}, ${b})`, 'background(bgColor)'],
            axis: 'mouseY',
            positions: [0, h / 4, h],
            gray: (y) => CC.p5Functions.map(y, 0, h, a, b),
            explain: `mouseY is 0 at the top and ${h} at the bottom, and those give the two ends of the output range.`,
          });
        },
      },
      {
        id: 'without-map',
        make(r) {
          const w = r.pick([600, 800, 1000]);
          return shadeRows(r, {
            code: [`createCanvas(${w}, 400)`, 'background(mouseX)'],
            axis: 'mouseX',
            positions: [0, 100, 255, w / 2],
            gray: (x) => x,
            explain: 'Without map(), the background uses mouseX directly. It reaches white at 255, long before the right edge.',
          });
        },
      },
    ],
  };

  const OBJECT_NAMES = ['rectProps', 'circleProps', 'toolProps'];

  const objectSlot = {
    id: 'objectMap',
    skill: 'flow',
    concept: 'Using map() to set values in an object',
    patterns: [
      {
        id: 'read-a-mapped-key',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const w = r.pick(WIDTHS);
          const out = r.pick(OUTPUTS);
          const mouseX = part(r, w);
          const code = [`let ${name} = {`, `  size: map(mouseX, 0, ${w}, 0, ${out}),`, `  weight: map(mouseX, 0, ${w}, 0, 10)`, '}', `console.log(${name}.size)`];
          return kit.printedNumber({
            prompt: `mouseX is ${mouseX}. What number does this code print?`,
            code,
            vec: { mouseX },
            explain: `size is map(${mouseX}, 0, ${w}, 0, ${out}), which goes the same fraction of the way across the output range.`,
          });
        },
      },
      {
        id: 'different-mouse-values',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const w = r.pick(WIDTHS);
          const h = r.pick(WIDTHS);
          const out = r.pick(OUTPUTS);
          const mouseX = part(r, w);
          const mouseY = part(r, h);
          const code = [`let ${name} = {`, `  size: map(mouseX, 0, ${w}, 0, 100),`, `  red: map(mouseY, 0, ${h}, 0, ${out})`, '}', `console.log(${name}.red)`];
          return kit.printedNumber({
            prompt: `mouseX is ${mouseX} and mouseY is ${mouseY}. What number does this code print?`,
            code,
            vec: { mouseX, mouseY },
            explain: `red uses mouseY, so only mouseY matters here: map(${mouseY}, 0, ${h}, 0, ${out}).`,
          });
        },
      },
      {
        id: 'add-two-mapped-keys',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const w = r.pick(WIDTHS);
          const mouseX = part(r, w);
          const code = [`let ${name} = {`, `  size: map(mouseX, 0, ${w}, 0, 100),`, `  weight: map(mouseX, 0, ${w}, 0, 20)`, '}', `console.log(${name}.size + ${name}.weight)`];
          return kit.printedNumber({
            prompt: `mouseX is ${mouseX}. What number does this code print?`,
            code,
            vec: { mouseX },
            explain: 'Work out each mapped value, then add them together.',
          });
        },
      },
    ],
  };

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const WHY_MAP = {
    ranges: 'The input range and the output range are swapped.',
    valueFirst: 'The value to convert has to come first, before the two ranges.',
    canvas: 'The input range does not match the size of the canvas.',
    backwards: 'The output range runs in the wrong direction for the rule.',
    setup: 'setup() only runs once, so the mapped value never updates as the mouse moves.',
  };
  const others = (r, why) => r.sample(Object.values(WHY_MAP).filter((reason) => reason !== why), 3);

  const positions = (w) => [0, w / 4, w / 2, (3 * w) / 4, w].map((mouseX) => ({ mouseX, mouseY: 10 }));

  function bugSketch(r, {
    prompt, w, line, fixedLine, why, explain,
  }) {
    const shell = (mapLine) => [`function setup(){`, `  createCanvas(${w}, 400)`, '}', '', 'function draw(){', `  ${mapLine}`, '  background(bgColor)', '}'];
    return kit.bugQuestion(r, {
      prompt: `${prompt} ${FIND_BUG}`,
      code: shell(line),
      bugLines: [5],
      why,
      others: others(r, why),
      fixed: shell(fixedLine),
      spec: { kind: 'sketch', vectors: positions(w) },
      explain,
    });
  }

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs with map()',
    patterns: [
      {
        id: 'ranges-swapped',
        make(r) {
          const w = r.pick(WIDTHS);
          return bugSketch(r, {
            prompt: 'The background should go from black on the left to white on the right.',
            w,
            line: `let bgColor = map(mouseX, 0, 255, 0, ${w})`,
            fixedLine: `let bgColor = map(mouseX, 0, ${w}, 0, 255)`,
            why: WHY_MAP.ranges,
            explain: `The mouse goes from 0 to ${w}, and that needs to become 0 to 255: map(mouseX, 0, ${w}, 0, 255)`,
          });
        },
      },
      {
        id: 'value-not-first',
        make(r) {
          const w = r.pick(WIDTHS);
          return bugSketch(r, {
            prompt: 'The background should go from black on the left to white on the right.',
            w,
            line: `let bgColor = map(0, ${w}, mouseX, 0, 255)`,
            fixedLine: `let bgColor = map(mouseX, 0, ${w}, 0, 255)`,
            why: WHY_MAP.valueFirst,
            explain: 'The order is map(value, inputStart, inputEnd, outputStart, outputEnd).',
          });
        },
      },
      {
        id: 'wrong-canvas-size',
        make(r) {
          const w = r.pick([600, 800]);
          const wrong = w / 2;
          return bugSketch(r, {
            prompt: `This canvas is ${w} wide. The background should only reach white at the far right, but it is white halfway across.`,
            w,
            line: `let bgColor = map(mouseX, 0, ${wrong}, 0, 255)`,
            fixedLine: `let bgColor = map(mouseX, 0, ${w}, 0, 255)`,
            why: WHY_MAP.canvas,
            explain: `The mouse can go all the way to ${w}, so the input range should end at ${w}.`,
          });
        },
      },
      {
        id: 'backwards-output',
        make(r) {
          const w = r.pick(WIDTHS);
          return bugSketch(r, {
            prompt: 'The background should go from white on the left to black on the right.',
            w,
            line: `let bgColor = map(mouseX, 0, ${w}, 0, 255)`,
            fixedLine: `let bgColor = map(mouseX, 0, ${w}, 255, 0)`,
            why: WHY_MAP.backwards,
            explain: `For white on the left, the output has to start at 255: map(mouseX, 0, ${w}, 255, 0)`,
          });
        },
      },
      {
        id: 'mapped-only-once',
        make(r) {
          const w = r.pick(WIDTHS);
          const name = r.pick(['bgColor', 'backColor', 'canvasColor']);
          const code = [`let ${name}`, '', 'function setup(){', `  createCanvas(${w}, 400)`, `  ${name} = map(mouseX, 0, ${w}, 0, 255)`, '}', '', 'function draw(){', `  background(${name})`, '}'];
          const fixed = [`let ${name}`, '', 'function setup(){', `  createCanvas(${w}, 400)`, '}', '', 'function draw(){', `  ${name} = map(mouseX, 0, ${w}, 0, 255)`, `  background(${name})`, '}'];
          return kit.bugQuestion(r, {
            prompt: `The background should change as the mouse moves, but it never changes. ${FIND_BUG}`,
            code,
            bugLines: [4],
            why: WHY_MAP.setup,
            others: others(r, WHY_MAP.setup),
            fixed,
            spec: { kind: 'sketch', vectors: [{ mouseX: 0, mouseY: 0, frames: positions(w) }] },
            explain: 'Anything that depends on the mouse needs to be worked out in draw(), which keeps running.',
          });
        },
      },
    ],
  };

  const MAP_POOL = (w) => ({
    axis: ['mouseX', 'mouseY'],
    num: [0, 255, w, 100, w / 2],
  });

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing a map() call',
    patterns: [
      {
        id: 'black-to-white',
        make(r) {
          const w = r.pick(WIDTHS);
          return kit.blanksQuestion(r, {
            prompt: `On a canvas ${w} wide, complete the code so the background goes from black on the left to white on the right.`,
            lines: [
              ['let bgColor = map(', tok('mouseX', 'axis'), ', ', tok(0, 'num'), ', ', tok(w, 'num'), ', ', tok(0, 'num'), ', ', tok(255, 'num'), ')'],
              ['background(bgColor)'],
            ],
            must: ['axis'],
            count: 3,
            pools: MAP_POOL(w),
            spec: { kind: 'sketch', hiddenPrefix: [], vectors: [] },
            explain: `It should be map(mouseX, 0, ${w}, 0, 255).`,
          }, { wrapInDraw: true, w });
        },
      },
      {
        id: 'white-to-black',
        make(r) {
          const w = r.pick(WIDTHS);
          return kit.blanksQuestion(r, {
            prompt: `On a canvas ${w} wide, complete the code so the background goes from white on the left to black on the right.`,
            lines: [
              ['let bgColor = map(', tok('mouseX', 'axis'), ', ', tok(0, 'num'), ', ', tok(w, 'num'), ', ', tok(255, 'num'), ', ', tok(0, 'num'), ')'],
              ['background(bgColor)'],
            ],
            must: ['axis'],
            count: 3,
            pools: MAP_POOL(w),
            spec: { kind: 'sketch', hiddenPrefix: [], vectors: [] },
            explain: `Starting the output at 255 makes the left edge white: map(mouseX, 0, ${w}, 255, 0).`,
          }, { wrapInDraw: true, w });
        },
      },
      {
        id: 'circle-size',
        make(r) {
          const h = r.pick(WIDTHS);
          const low = 10 * r.int(1, 5);
          const high = low + 10 * r.int(5, 15);
          const name = r.pick(SIZE_NAMES);
          return kit.blanksQuestion(r, {
            prompt: `On a canvas ${h} tall, complete the code so the circle goes from ${low} wide at the top to ${high} wide at the bottom.`,
            lines: [
              [`let ${name} = map(`, tok('mouseY', 'axis'), ', ', tok(0, 'num'), ', ', tok(h, 'num'), ', ', tok(low, 'num'), ', ', tok(high, 'num'), ')'],
              [`ellipse(200, 200, ${name}, ${name})`],
            ],
            must: ['axis'],
            count: 3,
            pools: { axis: ['mouseX', 'mouseY'], num: [0, h, low, high, 255] },
            spec: { kind: 'sketch', hiddenPrefix: [], vectors: [] },
            explain: `Top to bottom means mouseY, going from 0 to ${h}. The output is the sizes you want.`,
          }, { wrapInDraw: true, w: h, axis: 'mouseY' });
        },
      },
      {
        id: 'inside-an-object',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const w = r.pick(WIDTHS);
          const high = 5 * r.int(3, 8);
          return kit.blanksQuestion(r, {
            prompt: `On a canvas ${w} wide, complete the code so ${name}.weight goes from 0 on the left to ${high} on the right.`,
            lines: [
              [`let ${name} = {`],
              ['  weight', tok(':', 'punct'), ' map(', tok('mouseX', 'axis'), ', 0, ', tok(w, 'num'), ', 0, ', tok(high, 'num'), ')'],
              ['}'],
              ['strokeWeight(', tok(name, 'obj'), tok('.', 'punct'), 'weight)'],
              ['line(mouseX, mouseY, pmouseX, pmouseY)'],
            ],
            must: ['axis', 'num'],
            count: 4,
            pools: {
              axis: ['mouseX', 'mouseY'], num: [w, high, 255, 100], punct: [':', '=', ',', '.'], obj: [name, 'weight'],
            },
            spec: { kind: 'sketch', hiddenPrefix: [], vectors: [] },
            explain: `The value is map(mouseX, 0, ${w}, 0, ${high}), and it's read back with ${name}.weight.`,
          }, { wrapInDraw: true, w });
        },
      },
    ],
  };

  const scramble = (rules) => `Put these lines in order so the code does this:\n${numberedRules(rules)}`;
  const drawShell = (w) => ['function setup(){', `  createCanvas(${w}, 400)`, '}'];

  const mapFrames = (w) => [{
    mouseX: 0,
    mouseY: 0,
    frames: [{ mouseX: w / 4, mouseY: 100 }, { mouseX: w / 2, mouseY: 200 }, { mouseX: (3 * w) / 4, mouseY: 300 }, { mouseX: w, mouseY: 400 }],
  }];

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting code that uses map() in order',
    patterns: [
      {
        id: 'background-and-circle',
        make(r) {
          const w = r.pick(WIDTHS);
          const low = 10 * r.int(1, 5);
          const high = low + 10 * r.int(5, 15);
          const S = r.pick(SIZE_NAMES);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make bgColor go from black to white as mouseX goes from 0 to ${w}.`,
              'Paint the background with bgColor.',
              `Make ${S} go from ${low} to ${high} as mouseY goes from 0 to 400.`,
              `Draw a circle at the mouse that is ${S} wide and tall, on top of the background.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: [
              `let bgColor = map(mouseX, 0, ${w}, 0, 255)`,
              'background(bgColor)',
              `let ${S} = map(mouseY, 0, 400, ${low}, ${high})`,
              `ellipse(mouseX, mouseY, ${S}, ${S})`,
            ].concat(['fill(255, 0, 255)']),
            suffix: [{ text: '}' }],
            spec: { kind: 'sketch', hiddenPrefix: drawShell(w), vectors: mapFrames(w) },
            explain: 'A variable has to be created before it gets used. background() has to come before the circle, or it covers it.',
          });
        },
      },
      {
        id: 'object-with-mapped-values',
        make(r) {
          const name = r.pick(OBJECT_NAMES);
          const w = r.pick(WIDTHS);
          const high = 5 * r.int(3, 8);
          const out = r.pick([100, 200, 255]);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make ${name} an object. Its weight goes from 0 to ${high} and its size goes from 0 to ${out}, both as mouseX goes from 0 to ${w}.`,
              'Paint a gray background.',
              `Set the stroke weight from ${name}, then draw a square at (20, 20) using ${name}.size.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: [
              `let ${name} = {`,
              `weight: map(mouseX, 0, ${w}, 0, ${high}),`,
              `size: map(mouseX, 0, ${w}, 0, ${out})`,
              '}',
              'background(220)',
              `strokeWeight(${name}.weight)`,
              `rect(20, 20, ${name}.size, ${name}.size)`,
            ],
            suffix: [{ text: '}' }],
            spec: { kind: 'sketch', hiddenPrefix: drawShell(w), vectors: mapFrames(w) },
            explain: 'The object has to be created in draw() so its values update as the mouse moves, and it has to come before the lines that use it.',
          });
        },
      },
      {
        id: 'drawing-tool-with-map',
        make(r) {
          const w = r.pick(WIDTHS);
          const high = 5 * r.int(3, 8);
          const name = r.pick(['lineWeight', 'penWeight', 'thickness']);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `In setup(), make a canvas that is ${w} wide and paint the background once.`,
              `In draw(), make ${name} go from 1 to ${high} as mouseX goes from 0 to ${w}.`,
              `Set the stroke weight to ${name}, then draw a line from the mouse to where it was one frame ago.`,
            ]),
            prefix: [{ text: 'function setup(){' }],
            movable: [
              `createCanvas(${w}, 400)`,
              'background(220)',
              '}',
              'function draw(){',
              `let ${name} = map(mouseX, 0, ${w}, 1, ${high})`,
              `strokeWeight(${name})`,
              'line(mouseX, mouseY, pmouseX, pmouseY)',
            ],
            suffix: [{ text: '}' }],
            spec: { kind: 'sketch', vectors: mapFrames(w) },
            explain: 'Painting the background only once in setup() lets the drawing stay. The mapped value has to exist before strokeWeight() uses it.',
          });
        },
      },
      {
        id: 'two-mapped-grays',
        make(r) {
          const w = r.pick(WIDTHS);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make bgColor go from white to black as mouseX goes from 0 to ${w}.`,
              `Make shapeColor go from black to white as mouseX goes from 0 to ${w}.`,
              'Paint the background with bgColor.',
              'Fill with shapeColor and draw a circle at (200, 200) that is 100 wide and tall.',
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: [
              `let bgColor = map(mouseX, 0, ${w}, 255, 0)`,
              `let shapeColor = map(mouseX, 0, ${w}, 0, 255)`,
              'background(bgColor)',
              'fill(shapeColor)',
              'ellipse(200, 200, 100, 100)',
            ],
            suffix: [{ text: '}' }],
            spec: { kind: 'sketch', hiddenPrefix: drawShell(w), vectors: mapFrames(w) },
            explain: 'Both variables have to be created before they are used. background() has to come before the circle, or it covers it.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA2.2',
    title: 'The Map Function',
    unit: 2,
    source: 'curriculum/02-unit-2/07-U2LA2.2-The-Map-Function.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/typeof/, 'typeof (U2LA3.1)'],
      [/\breturn\b/, 'return values (U2LA3.2)'],
      [/mouseIsPressed|mousePressed|keyIsPressed/, 'clicks and keys (U2LA4.2 and U2LA5.1)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [callSlot, whySlot, computeSlot, shadeSlot, objectSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['compute', 'parsons', 'pickCall', 'blanks', 'shades', 'bug', 'whyMap', 'objectMap'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
