// Shared parts for writing question generators: themed variables, colors, canvases,
// and builders that turn code into the question shapes the app knows how to show.
// Code follows the course's style: no semicolons, == for comparing, } on its own line
// before else, and `if(x > 1){` spacing.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = {};
  CC.kit = kit;

  // ---- Themes: variable names, sensible values, and messages ----

  const SCENES = [
    {
      id: 'game',
      a: { names: ['score', 'points', 'myScore'], noun: 'the score', lo: 0, hi: 100, step: 10, thresholds: [30, 40, 50, 60, 70] },
      b: { names: ['lives', 'hearts', 'livesLeft'], noun: 'the number of lives', lo: 0, hi: 6, step: 1, thresholds: [1, 2, 3, 4] },
      outcomes: ['Level up!', 'Keep playing', 'Game over', 'Bonus round', 'Try again'],
    },
    {
      id: 'weather',
      a: { names: ['temp', 'temperature', 'degrees'], noun: 'the temperature', lo: 30, hi: 100, step: 5, thresholds: [50, 60, 70, 80] },
      b: { names: ['wind', 'windSpeed', 'mph'], noun: 'the wind speed', lo: 0, hi: 40, step: 5, thresholds: [10, 15, 20, 25] },
      outcomes: ['Go to the beach', 'Fly a kite', 'Stay inside', 'Take a walk', 'Bring a jacket'],
    },
    {
      id: 'phone',
      a: { names: ['battery', 'batteryLevel', 'charge'], noun: 'the battery level', lo: 0, hi: 100, step: 10, thresholds: [20, 30, 40, 50] },
      b: { names: ['bars', 'signal', 'wifiBars'], noun: 'the number of signal bars', lo: 0, hi: 5, step: 1, thresholds: [1, 2, 3] },
      outcomes: ['Stream a movie', 'Send a text', 'Plug it in', 'Download the app', 'Wait for signal'],
    },
    {
      id: 'concert',
      a: { names: ['age', 'myAge', 'guestAge'], noun: 'the age', lo: 8, hi: 40, step: 1, thresholds: [13, 16, 18, 21] },
      b: { names: ['tickets', 'ticketCount', 'passes'], noun: 'the number of tickets', lo: 0, hi: 6, step: 1, thresholds: [1, 2, 3] },
      outcomes: ['Come on in', 'Buy a ticket', 'Bring an adult', 'See you next time', 'Front row seat'],
    },
    {
      id: 'snack',
      a: { names: ['cash', 'money', 'dollars'], noun: 'the amount of cash', lo: 0, hi: 30, step: 1, thresholds: [5, 8, 10, 12] },
      b: { names: ['hunger', 'hungerLevel', 'appetite'], noun: 'the hunger level', lo: 0, hi: 10, step: 1, thresholds: [3, 5, 7] },
      outcomes: ['Order a pizza', 'Grab a snack', 'Drink some water', 'Get a sandwich', 'Wait for dinner'],
    },
    {
      id: 'garden',
      a: { names: ['water', 'soilWater', 'moisture'], noun: 'the water level', lo: 0, hi: 100, step: 10, thresholds: [30, 40, 50, 60] },
      b: { names: ['sun', 'sunHours', 'sunlight'], noun: 'the number of sun hours', lo: 0, hi: 12, step: 1, thresholds: [4, 5, 6, 8] },
      outcomes: ['The plant blooms', 'Water the plant', 'Move it to the window', 'Add some soil', 'The plant rests'],
    },
    {
      id: 'skate',
      a: { names: ['speed', 'mySpeed', 'skateSpeed'], noun: 'the speed', lo: 0, hi: 30, step: 1, thresholds: [10, 12, 15, 20] },
      b: { names: ['laps', 'lapCount', 'lapsDone'], noun: 'the number of laps', lo: 0, hi: 10, step: 1, thresholds: [3, 4, 5, 6] },
      outcomes: ['New record', 'Keep skating', 'Take a break', 'Slow down', 'Victory lap'],
    },
  ];

  const WORD_VARS = [
    { names: ['day', 'today'], noun: 'the day', values: ['Monday', 'Friday', 'Saturday', 'Sunday'] },
    { names: ['sky', 'weather'], noun: 'the weather', values: ['rain', 'snow', 'sun', 'clouds'] },
    { names: ['movie', 'film'], noun: 'the movie', values: ['Ratatouille', 'Tangled', 'Coco', 'Moana'] },
    { names: ['pet', 'animal'], noun: 'the pet', values: ['dog', 'cat', 'hamster', 'parrot'] },
    { names: ['song', 'track'], noun: 'the song', values: ['Halo', 'Respect', 'Imagine', 'Happy'] },
  ];

  kit.named = (r, v) => ({ ...v, name: r.pick(v.names), t: v.thresholds ? r.pick(v.thresholds) : undefined });

  kit.pickScene = (r) => {
    const base = r.pick(SCENES);
    return { id: base.id, a: kit.named(r, base.a), b: kit.named(r, base.b), outcomes: r.shuffle(base.outcomes) };
  };

  kit.pickWordVar = (r) => {
    const base = r.pick(WORD_VARS);
    return { ...base, name: r.pick(base.names), isWord: true };
  };

  kit.FUNCTION_NAMES = ['pickPlan', 'decide', 'checkPlan', 'whatNext', 'chooseOne', 'runCheck', 'testValues'];

  // ---- Colors and canvases ----

  kit.COLORS = [
    { name: 'red', rgb: [255, 0, 0] },
    { name: 'green', rgb: [0, 200, 0] },
    { name: 'blue', rgb: [0, 0, 255] },
    { name: 'yellow', rgb: [255, 255, 0] },
    { name: 'magenta', rgb: [255, 0, 255] },
    { name: 'cyan', rgb: [0, 255, 255] },
    { name: 'orange', rgb: [255, 165, 0] },
  ];
  kit.colorCall = (c) => `color(${c.rgb.join(', ')})`;
  kit.colorCss = (c) => `rgb(${c.rgb.join(',')})`;
  kit.colorKey = (c) => `rgb(${c.rgb.join(',')})`;
  kit.setColor = (varName, c) => `${varName} = ${kit.colorCall(c)} /\/ ${c.name}`;

  kit.COLOR_VARS = {
    background: ['bgColor', 'backColor', 'canvasColor', 'screenColor'],
    shape: ['circleColor', 'circColor', 'ballColor', 'dotColor'],
    size: ['circleSize', 'ballSize', 'dotSize'],
    light: ['lightColor', 'signalColor', 'lampColor'],
  };

  // Canvas sizes with whole-number dividing lines.
  kit.CANVASES = [
    { w: 400, h: 400, cx: 200, cy: 200 },
    { w: 600, h: 400, cx: 300, cy: 200 },
    { w: 400, h: 300, cx: 200, cy: 150 },
    { w: 500, h: 500, cx: 250, cy: 250 },
    { w: 600, h: 600, cx: 300, cy: 300 },
    { w: 800, h: 400, cx: 400, cy: 200 },
  ];

  kit.pickCut = (r, max) => r.pick([max / 4, max / 2, (3 * max) / 4].filter((n) => n % 50 === 0));
  kit.pickThirdCuts = (r, max) => {
    const third = max / 3;
    if (third % 50 === 0) return [third, 2 * third];
    const q = max / 4;
    return r.pick([[q, 2 * q], [q, 3 * q], [2 * q, 3 * q]]);
  };

  // "a 600 by 400 canvas" or "an 800 by 400 canvas"
  kit.canvasName = (c) => `${c.w === 800 ? 'an' : 'a'} ${c.w} by ${c.h} canvas`;

  kit.QUADRANTS = {
    'top-left': { x: '<', y: '<' },
    'top-right': { x: '>', y: '<' },
    'bottom-left': { x: '<', y: '>' },
    'bottom-right': { x: '>', y: '>' },
  };
  kit.quadrantNames = Object.keys(kit.QUADRANTS);
  kit.quadCond = (name, c) => {
    const q = kit.QUADRANTS[name];
    return `mouseX ${q.x} ${c.cx} && mouseY ${q.y} ${c.cy}`;
  };
  // A mouse position inside a named quadrant, on a tidy multiple of 10.
  kit.quadPoint = (r, name, c) => {
    const q = kit.QUADRANTS[name];
    const inside = (mid, max, side) => {
      const lo = side === '<' ? 10 : mid + 10;
      const hi = side === '<' ? mid - 10 : max - 10;
      return Math.floor(r.int(lo, hi) / 10) * 10 || 10;
    };
    return { mouseX: inside(c.cx, c.w, q.x), mouseY: inside(c.cy, c.h, q.y) };
  };
  kit.mouseVar = (name, max, t) => ({
    name, noun: name, lo: 0, hi: max, step: Math.max(10, Math.round(max / 20)), t, isMouse: true,
  });

  // ---- Conditions ----

  const OP_WORDS = { '>': 'above', '<': 'below', '>=': 'at least', '<=': 'at most', '==': 'exactly' };
  const OP_OPPOSITE = { '>': '<', '<': '>', '>=': '<', '<=': '>', '==': '!=' };
  const lit = (value) => (typeof value === 'string' ? `"${value}"` : String(value));
  kit.lit = lit;

  kit.side = (v, op, t) => ({ v, op, t, text: `${v.name} ${op} ${lit(t)}` });
  kit.flipSide = (s) => kit.side(s.v, OP_OPPOSITE[s.op], s.t);
  kit.say = (s) => {
    if (s.v.isWord) return `${s.v.noun} is ${s.t}`;
    return `${s.v.noun} is ${OP_WORDS[s.op]} ${s.t}`;
  };

  const compare = (a, op, b) => {
    switch (op) {
      case '>': return a > b;
      case '<': return a < b;
      case '>=': return a >= b;
      case '<=': return a <= b;
      case '==': return a === b;
      case '!=': return a !== b;
      default: throw new Error(`Unknown operator ${op}`);
    }
  };
  kit.sideTrue = (s, value) => compare(value, s.op, s.t);

  kit.valuesOf = (v) => {
    if (v.values) return v.values;
    const out = [];
    for (let n = v.lo; n <= v.hi; n += v.step) out.push(n);
    return out;
  };

  // A value that makes this side come out true or false, not on the dividing value
  // unless allowEdge is set.
  kit.sideValue = (r, s, wantTrue, allowEdge) => {
    const options = kit.valuesOf(s.v).filter((n) => kit.sideTrue(s, n) === wantTrue
      && (allowEdge || s.v.isWord || n !== s.t));
    return r.pick(options);
  };

  kit.isEdgeable = (s) => !s.v.isWord && ['>', '<', '>=', '<='].includes(s.op);
  kit.edgeTruth = (s) => s.op === '>=' || s.op === '<=';

  // Inputs to test scrambled or filled-in code with: values on both sides of each
  // dividing value and on it, for each variable, in every combination.
  kit.sceneVectors = (sides) => {
    const byVar = new Map();
    sides.forEach((s) => {
      if (!byVar.has(s.v.name)) byVar.set(s.v.name, new Set());
      const bucket = byVar.get(s.v.name);
      if (s.v.isWord) {
        s.v.values.forEach((value) => bucket.add(value));
      } else {
        [s.t - s.v.step, s.t, s.t + s.v.step].forEach((n) => {
          if (n >= s.v.lo && n <= s.v.hi) bucket.add(n);
        });
      }
    });
    let vectors = [{}];
    byVar.forEach((values, name) => {
      const next = [];
      vectors.forEach((vec) => values.forEach((value) => next.push({ ...vec, [name]: value })));
      vectors = next;
    });
    return vectors.map((inputs) => ({ inputs }));
  };

  // Mouse positions that land in every region formed by the dividing lines. They avoid
  // the lines themselves unless a question's wording pins down what happens there.
  kit.mouseVectors = (w, h, xs, ys, extra) => {
    const centers = (cuts, max) => {
      const edges = [0].concat(cuts, [max]);
      return edges.slice(0, -1).map((e, i) => (e + edges[i + 1]) / 2);
    };
    const out = [];
    centers(xs, w).forEach((mouseX) => centers(ys, h).forEach((mouseY) => out.push({ mouseX, mouseY })));
    return out.concat(extra || []);
  };

  kit.pickOp = (r) => r.pick(['>', '<', '>=', '<=']);
  kit.join = (a, op, b) => `${a.text} ${op} ${b.text}`;
  kit.yesNo = (value) => (value ? 'true' : 'false');

  // Two dividing values with room for a value between them.
  kit.pickRange = (r, v) => {
    for (let tries = 0; tries < 50; tries++) {
      const [a, b] = r.sample(v.thresholds, 2);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (hi - lo >= 2 * v.step) return { lo, hi };
    }
    return { lo: v.thresholds[0], hi: v.thresholds[v.thresholds.length - 1] + 2 * v.step };
  };

  kit.firstTrue = (conds, vars) => {
    for (let i = 0; i < conds.length; i++) {
      if (CC.evalExpr(conds[i], vars)) return i;
    }
    return conds.length;
  };

  // True when every branch of a chain can run and every && or || in it changes what
  // happens. Without this, a branch could be unreachable and any answer would "work".
  kit.chainMatters = (conds, vectors) => {
    const outcomes = (list) => vectors.map((vec) => kit.firstTrue(list, vec.inputs));
    const base = outcomes(conds);
    if (new Set(base).size !== conds.length + 1) return false;
    const swapped = (cond) => {
      if (cond.includes('&&')) return cond.replace('&&', '||');
      return cond.includes('||') ? cond.replace('||', '&&') : cond;
    };
    return conds.every((cond, i) => {
      if (swapped(cond) === cond) return true;
      const changed = conds.slice();
      changed[i] = swapped(cond);
      return outcomes(changed).join() !== base.join();
    });
  };

  kit.numberedRules = (rules) => rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n');
  kit.letLines = (values) => Object.keys(values).map((name) => `let ${name} = ${lit(values[name])}`);
  kit.sceneValues = (r, s) => () => ({
    [s.a.name]: r.pick(kit.valuesOf(s.a)),
    [s.b.name]: r.pick(kit.valuesOf(s.b)),
  });
  // Shown lines that start with let become inputs when the code is tested.
  kit.fromInputs = (names, lines) => lines.map((line) => {
    const m = line.match(/^let (\w+) = /);
    return m && names.includes(m[1]) ? `let ${m[1]} = __in.${m[1]}` : line;
  });

  // Runs code that has to work, and gives back what it printed.
  kit.printed = (code, vec, kind) => {
    const text = Array.isArray(code) ? code.join('\n') : code;
    const result = CC.runCode(text, vec || {}, kind);
    if (result.error) throw new Error(`Generated code failed: ${result.error}\n${text}`);
    return result.logs;
  };

  // ---- Code shapes ----

  // Course style:
  //   if(a){
  //     body
  //   }
  //   else{
  //     body
  //   }
  kit.chainLines = (branches, elseBody, pad) => {
    const p = pad || '';
    const lines = [];
    branches.forEach((b, i) => {
      lines.push(`${p}${i === 0 ? 'if' : 'else if'}(${b.cond}){`);
      lines.push(`${p}  ${b.body}`);
      lines.push(`${p}}`);
    });
    if (elseBody !== undefined && elseBody !== null) {
      lines.push(`${p}else{`);
      lines.push(`${p}  ${elseBody}`);
      lines.push(`${p}}`);
    }
    return lines;
  };

  kit.log = (message) => `console.log(${lit(message)})`;
  kit.ifBlock = (cond, body) => [`if(${cond}){`, `  ${body}`, '}'];

  // ---- Question builders ----

  kit.choiceQuestion = (r, {
    prompt, code, rule, correct, wrong, codeOptions, exprOptions, explain,
  }) => {
    const texts = [correct].concat(wrong);
    if (new Set(texts).size !== texts.length) throw new Error(`Duplicate options: ${texts.join(' / ')}`);
    const shuffled = r.shuffle(texts);
    return {
      type: 'choice',
      prompt,
      code,
      rule,
      codeOptions: !!(codeOptions || exprOptions),
      // Options that are single conditions get checked for really meaning different things.
      exprOptions: !!exprOptions,
      options: shuffled.map((text) => ({ text })),
      answer: shuffled.indexOf(correct),
      explain,
    };
  };

  kit.rowsQuestion = ({
    prompt, code, columns, rows, options, explain,
  }) => ({
    type: 'rows', prompt, code, columns, rows, options, explain,
  });

  // Mouse positions and the color a variable ends up with at each one. Lessons should
  // include a position exactly on a dividing line, since that is where mistakes show.
  kit.colorRows = (r, {
    code, varName, colors, points, explain,
  }) => {
    const program = `let ${varName}\n${code.join('\n')}\nconsole.log(${varName})`;
    const keys = colors.map(kit.colorKey);
    const rows = r.shuffle(points).map((p) => {
      const answer = keys.indexOf(kit.printed(program, p)[0]);
      if (answer < 0) throw new Error(`No color matched for ${JSON.stringify(p)}`);
      return { cells: [String(p.mouseX), String(p.mouseY)], answer };
    });
    return kit.rowsQuestion({
      prompt: `Pick the color ${varName} ends up with for each mouse position.`,
      code,
      columns: ['mouseX', 'mouseY'],
      rows,
      options: colors.map((c) => ({ text: c.name, swatch: kit.colorCss(c) })),
      explain,
    });
  };

  // "What does this code print?" with answers written out in words.
  kit.formatLogs = (logs) => (logs.length ? logs.join(', then ') : 'Nothing prints');
  kit.traceChoice = (r, {
    prompt, code, run, vec, kind, wrong, explain,
  }) => {
    const correct = kit.formatLogs(kit.printed(run || code, vec, kind));
    const others = Array.from(new Set(wrong.map(kit.formatLogs))).filter((text) => text !== correct);
    return kit.choiceQuestion(r, {
      prompt: prompt || 'What does this code print?', code, correct, wrong: others, explain,
    });
  };

  // Typed answers are for numbers only, where a typo can't look like misunderstanding.
  kit.numberQuestion = ({ prompt, code, answer, explain }) => {
    if (!Number.isFinite(answer)) throw new Error(`Bad number answer: ${answer}`);
    return {
      type: 'number', prompt, code, answer, explain,
    };
  };

  // The question's answer is the last number the code prints.
  kit.printedNumber = ({
    prompt, code, run, vec, kind, explain,
  }) => {
    const logs = kit.printed(run || code, vec, kind);
    return kit.numberQuestion({
      prompt, code, answer: Number(logs[logs.length - 1]), explain,
    });
  };

  kit.regionQuestion = ({
    prompt, condition, code, w, h, xs, ys, explain,
  }) => {
    const edgesX = [0].concat(xs, [w]);
    const edgesY = [0].concat(ys, [h]);
    const cells = [];
    for (let y = 0; y < edgesY.length - 1; y++) {
      const row = [];
      for (let x = 0; x < edgesX.length - 1; x++) {
        row.push(!!CC.evalExpr(condition, {
          ...CC.p5Functions,
          mouseX: (edgesX[x] + edgesX[x + 1]) / 2,
          mouseY: (edgesY[y] + edgesY[y + 1]) / 2,
        }));
      }
      cells.push(row);
    }
    return {
      type: 'region', prompt, code: code || [condition], w, h, xs, ys, cells, explain,
    };
  };

  // code: strings. selectable: indexes of lines to tap. Hits come from running the code.
  kit.linesQuestion = ({
    prompt, code, selectable, explain, vec, kind,
  }) => {
    const result = CC.runCode(code.join('\n'), vec || {}, kind);
    if (result.error) throw new Error(`Generated code failed: ${result.error}\n${code.join('\n')}`);
    return {
      type: 'lines',
      prompt,
      code,
      selectable,
      hits: selectable.filter((i) => result.hits.has(i)),
      explain,
      runVec: vec,
      runKind: kind,
    };
  };

  // Lines students tap for the "lines that run" questions: anything that does something.
  kit.actionLines = (code) => code
    .map((line, i) => (/console\.log|^\s*return\b|^\s*[\w.]+ (=|\+=|-=) /.test(line) && !line.trim().startsWith('let') ? i : -1))
    .filter((i) => i >= 0);

  // Keeps trying until some highlighted lines run and some do not.
  kit.buildFlow = (r, makeCode, explain, options) => {
    const opts = options || {};
    for (let tries = 0; tries < 400; tries++) {
      const code = makeCode();
      const selectable = kit.actionLines(code);
      const q = kit.linesQuestion({
        prompt: opts.prompt || 'Tap every highlighted line that runs.',
        code,
        selectable,
        explain,
        vec: opts.vec,
        kind: opts.kind,
      });
      if (q.hits.length >= (opts.minHits || 2) && selectable.length - q.hits.length >= 1) return q;
    }
    throw new Error('Could not build a flow question');
  };

  // Common reasons for the find-the-bug questions.
  kit.WHY = {
    needsAnd: '|| only needs one side to be true, but this rule needs both, so it should use &&.',
    needsOr: '&& needs both sides to be true, but this rule only needs one, so it should use ||.',
    incomplete: 'Each side of && or || has to be a full comparison, so the variable must be written again.',
    yDirection: 'mouseY gets bigger going down the canvas, so this comparison points the wrong way.',
    never: 'No value can pass both comparisons at once, so this condition is never true.',
    always: 'Every value passes at least one side, so this condition is always true.',
    order: 'An earlier condition already catches those values, so a later branch can never run.',
    elseCondition: 'else cannot have its own condition. It needs to be else if.',
    elseNoCondition: 'else runs whenever the if is false, so it cannot have its own condition.',
    assign: 'A single = stores a value. Comparing two values needs ==.',
    quotes: 'A word needs quotation marks. Without them, the computer looks for a variable with that name.',
    backwards: 'This comparison points the wrong way for the rule.',
    bracket: 'An opening curly bracket { is missing, so the closing } has nothing to match.',
    elseIfCondition: 'else if needs a condition in parentheses to check.',
    elseLast: 'else has to come last. Nothing can follow it in the same chain.',
    separateIf: 'A new if starts a separate decision, so more than one message can print. It should be else if.',
    noReturn: 'The function works out a value but never returns it, so the call gives back undefined.',
    argOrder: 'The values are passed in the wrong order, so each one lands in the wrong parameter.',
    outOfScope: 'A variable made inside a function does not exist outside of it.',
    wrongKey: 'That key does not match the object exactly, so the value comes back undefined.',
    objectEquals: 'Inside an object, a key and its value are separated by a colon, not =.',
    objectComma: 'Key and value pairs in an object must be separated by commas.',
    dotOrder: 'The object name comes first, then a dot, then the key.',
    wrongType: 'A word in quotation marks is a string, but this function needs a number there.',
    notAFunction: 'This is a variable that holds true or false, so it has no parentheses.',
    missingAssign: 'This works out a new value but never stores it, so nothing changes.',
  };

  // spec.vectors should be able to catch the bug. Lines are tested with any let whose name
  // is in the vectors' inputs reading its value from there.
  kit.bugQuestion = (r, {
    prompt, code, bugLines, why, others, fixed, spec, explain,
  }) => {
    const shuffled = r.shuffle([why].concat(others));
    const inputNames = Object.keys((spec.vectors[0] && spec.vectors[0].inputs) || {});
    const runnable = (lines) => [].concat(
      spec.hiddenPrefix || [],
      kit.fromInputs(inputNames, lines),
      spec.hiddenSuffix || [],
    ).join('\n');
    const selectable = [];
    code.forEach((line, i) => { if (line.trim() && line.trim() !== '}') selectable.push(i); });
    return {
      type: 'bug',
      prompt,
      code,
      selectable,
      bugLines,
      whyOptions: shuffled,
      why: shuffled.indexOf(why),
      fixedRun: runnable(fixed),
      buggyRun: runnable(code),
      spec,
      explain,
    };
  };

  // Blank-able pieces for kit.blanksQuestion. kind is one of op, conn, var, num, kw, msg.
  kit.tok = (text, kind) => ({ tok: String(text), kind });

  // lines: arrays mixing plain strings and kit.tok pieces, or { text, run } for a fixed
  // line whose test run differs from what is shown. Picks `count` pieces to blank out,
  // always including one of each kind in `must`, so the blanks differ between students.
  kit.blanksQuestion = (r, {
    prompt, lines, spec, must, count, pools, explain,
  }, options) => {
    const opts = options || {};
    const tokens = [];
    lines.forEach((line) => {
      if (Array.isArray(line)) line.forEach((part) => { if (part.tok !== undefined) tokens.push(part); });
    });
    const chosen = new Set();
    (must || []).forEach((kind) => {
      const options = tokens.filter((t) => t.kind === kind && !chosen.has(t));
      if (!options.length) throw new Error(`No ${kind} piece to blank out`);
      chosen.add(r.pick(options));
    });
    r.shuffle(tokens).forEach((t) => {
      if (chosen.size < count && !chosen.has(t)) chosen.add(t);
    });

    const blanks = [];
    const builtLines = lines.map((line) => {
      if (!Array.isArray(line)) return { parts: [{ text: line.text }], run: line.run };
      return {
        parts: line.map((part) => {
          if (part.tok === undefined) return { text: part };
          if (!chosen.has(part)) return { text: part.tok };
          blanks.push({ answer: part.tok, kind: part.kind });
          return { blank: blanks.length - 1 };
        }),
      };
    });

    // The bank holds every right answer plus wrong options of the same kinds.
    const bank = new Set(blanks.map((b) => b.answer));
    const kinds = Array.from(new Set(blanks.map((b) => b.kind)));
    kinds.forEach((kind) => {
      const wrong = (pools[kind] || []).filter((t) => !bank.has(String(t)));
      r.sample(wrong, kind === 'conn' ? 1 : 2).forEach((t) => bank.add(String(t)));
    });
    // Code shown without its setup() and draw() gets tested inside them, at positions
    // across the whole canvas, moving from frame to frame.
    const finalSpec = opts.wrapInDraw ? {
      kind: 'sketch',
      hiddenPrefix: ['function setup(){', `  createCanvas(${opts.w}, ${opts.w})`, '}', 'function draw(){'],
      hiddenSuffix: ['}'],
      vectors: [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({
        mouseX: opts.w * fraction,
        mouseY: opts.w * (1 - fraction),
      })),
    } : spec;

    return {
      type: 'blanks',
      prompt,
      lines: builtLines,
      blanks,
      bank: r.shuffle(Array.from(bank)),
      spec: finalSpec,
      explain,
    };
  };

  // movable: the lines in their correct order, as strings or { text, run }. Lines are
  // stored without indentation, because indentation would give away the answer. The
  // app indents whatever order the student has chosen.
  kit.parsonsQuestion = (r, { prompt, prefix, movable, suffix, spec, explain }) => {
    const toLine = (line) => (typeof line === 'string'
      ? { text: line.trim() }
      : { ...line, text: line.text.trim() });
    const q = {
      type: 'parsons',
      prompt,
      prefix: (prefix || []).map(toLine),
      suffix: (suffix || []).map(toLine),
      lines: movable.map(toLine),
      solution: movable.map((_, i) => i),
      spec,
      explain,
    };
    q.order = CC.scramble(r, q);
    return q;
  };

  // Indents code by its braces, so a student's order reads properly without the
  // indentation giving away the answer.
  kit.indentLevels = (texts, startDepth) => {
    let depth = startDepth || 0;
    return texts.map((text) => {
      const trimmed = text.trim();
      if (trimmed.startsWith('}')) depth = Math.max(0, depth - 1);
      const level = depth;
      const code = trimmed.replace(/\/\/.*$/, '').replace(/"[^"]*"|'[^']*'/g, '');
      const opens = (code.match(/\{/g) || []).length;
      const closes = (code.match(/\}/g) || []).length;
      depth = Math.max(0, depth + opens - closes + (trimmed.startsWith('}') ? 1 : 0));
      return level;
    });
  };
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
