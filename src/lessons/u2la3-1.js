// U2LA3.1: Data Type Scavenger Hunt
// curriculum/02-unit-2/08-U2LA3.1-Data-Type-Scavenger-Hunt.md
//
// Students at this point have seen: everything through U2LA2.2, plus the types string,
// number, boolean, and object (including arrays, as objects), and typeof.
// They have NOT seen: return values, mouseIsPressed, key presses, or loops.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    tok, lit, numberedRules, WHY,
  } = kit;

  const TYPES = ['string', 'number', 'boolean', 'object'];
  const TYPE_OPTIONS = TYPES.map((text) => ({ text }));
  const WRONG_TYPES = TYPES.map((t) => [t]);
  const typeOf = (expr, vars) => CC.evalExpr(`typeof (${expr})`, vars || {});

  const WORDS = ['Rebecca', 'cat', 'Hello', 'p5', 'blue', 'Saturday', 'CS rocks', 'dog'];
  const NUMBER_WORDS = [['5', 5], ['42', 42], ['100', 100], ['3.14', 3.14], ['0', 0]];
  const makeWord = (r) => `"${r.pick(WORDS)}"`;
  const makeNumber = (r) => r.pick([String(r.int(2, 500)), String(r.int(10, 99) / 10), String(r.int(1000, 5000000))]);
  const makeBoolean = (r) => r.pick(['true', 'false']);
  const makeObject = (r) => r.pick([
    `{ size: ${r.int(1, 20)} }`,
    `{ x: ${r.int(1, 99)}, y: ${r.int(1, 99)} }`,
    `{ name: "${r.pick(WORDS)}" }`,
    `["${r.pick(WORDS)}", "${r.pick(WORDS)}"]`,
    `[${r.int(1, 9)}, ${r.int(10, 19)}, ${r.int(20, 29)}]`,
  ]);

  function typeRows(r, {
    prompt, code, items, vars, explain, column,
  }) {
    return kit.rowsQuestion({
      prompt: prompt || 'What data type is each of these?',
      code,
      columns: [column || 'Data'],
      rows: r.shuffle(items).map((expr) => ({ cells: [expr], answer: TYPES.indexOf(typeOf(expr, vars)) })),
      options: TYPE_OPTIONS,
      explain,
    });
  }

  const classifySlot = {
    id: 'classify',
    skill: 'concepts',
    concept: 'Identifying the data type of a value',
    patterns: [
      {
        id: 'plain-values',
        make(r) {
          return typeRows(r, {
            items: [makeWord(r), makeNumber(r), makeBoolean(r), makeObject(r)],
            explain: 'Quotation marks make a string. Numbers have no quotation marks. A boolean is true or false. Curly or square brackets make an object.',
          });
        },
      },
      {
        id: 'quotation-marks-matter',
        make(r) {
          const [text, value] = r.pick(NUMBER_WORDS);
          const flag = makeBoolean(r);
          return typeRows(r, {
            items: [`"${text}"`, String(value), `"${flag}"`, flag],
            explain: 'Anything in quotation marks is a string, even if it looks like a number or a boolean.',
          });
        },
      },
      {
        id: 'results-of-expressions',
        make(r) {
          const a = r.int(2, 30);
          const b = r.int(2, 30);
          const [w1, w2] = r.sample(WORDS, 2);
          return typeRows(r, {
            column: 'Expression',
            items: r.sample([
              `${a} > ${b}`,
              `"${w1}" != "${w2}"`,
              `${a} + ${b}`,
              `${a} * ${b}`,
              `"${w1}" + "${w2}"`,
              `${a} == ${a}`,
            ], 4),
            explain: 'Think about what each one works out to. Comparisons give a boolean, math gives a number, and joining strings with + gives a string.',
          });
        },
      },
      {
        id: 'what-variables-hold',
        make(r) {
          const names = r.sample(['value', 'item', 'data', 'thing', 'mystery'], 4);
          const values = r.shuffle([makeWord(r), makeNumber(r), makeBoolean(r), makeObject(r)]);
          const vars = {};
          const code = names.map((name, i) => {
            vars[name] = CC.evalExpr(values[i], {});
            return `let ${name} = ${values[i]}`;
          });
          return typeRows(r, {
            prompt: 'What data type does each variable hold?',
            code,
            column: 'Variable',
            items: names,
            vars,
            explain: 'A variable takes the type of whatever data it is holding.',
          });
        },
      },
    ],
  };

  const TYPEOF_PROMPT = 'What does this code print?';

  const typeofSlot = {
    id: 'typeofOutput',
    skill: 'flow',
    concept: 'Predicting what typeof gives back',
    patterns: [
      {
        id: 'a-variable',
        make(r) {
          const value = r.pick([makeWord(r), makeNumber(r), makeBoolean(r), makeObject(r)]);
          const name = r.pick(['data', 'item', 'thing']);
          return kit.traceChoice(r, {
            prompt: TYPEOF_PROMPT,
            code: [`let ${name} = ${value}`, `console.log(typeof ${name})`],
            wrong: WRONG_TYPES,
            explain: `typeof gives the type of the data in ${name} as a string.`,
          });
        },
      },
      {
        id: 'after-the-value-changes',
        make(r) {
          const [first, second] = r.shuffle([makeWord(r), makeNumber(r), makeBoolean(r)]);
          const name = r.pick(['data', 'item', 'thing']);
          return kit.traceChoice(r, {
            prompt: TYPEOF_PROMPT,
            code: [`let ${name} = ${first}`, `${name} = ${second}`, `console.log(typeof ${name})`],
            wrong: WRONG_TYPES,
            explain: 'Only the current value matters. JavaScript lets a variable change from one type to another.',
          });
        },
      },
      {
        id: 'a-comparison',
        make(r) {
          const a = r.int(2, 30);
          const b = r.int(2, 30);
          const name = r.pick(['data', 'item', 'thing']);
          return kit.traceChoice(r, {
            prompt: TYPEOF_PROMPT,
            code: [`let ${name} = ${a} ${r.pick(['>', '<', '==', '!='])} ${b}`, `console.log(typeof ${name})`],
            wrong: WRONG_TYPES.concat([['true'], ['false']]),
            explain: 'A comparison gives true or false, so the variable holds a boolean. typeof prints the type, not the value.',
          });
        },
      },
      {
        id: 'inside-an-object',
        make(r) {
          const name = r.pick(['sneaker', 'myShoe', 'kick']);
          const key = r.pick([['color', `"${r.pick(['red', 'blue', 'green'])}"`], ['size', String(r.int(5, 12))], ['onSale', makeBoolean(r)]]);
          const code = [`let ${name} = {`, `  ${key[0]}: ${key[1]}`, '}', `console.log(typeof ${name}.${key[0]})`];
          return kit.traceChoice(r, {
            prompt: TYPEOF_PROMPT,
            code,
            wrong: WRONG_TYPES,
            explain: `The object as a whole is an object, but each value inside keeps its own type. ${name}.${key[0]} is ${key[1]}.`,
          });
        },
      },
    ],
  };

  const FIND_PROMPT = (type) => `Which of these is ${type}?`;

  const whichSlot = {
    id: 'whichOne',
    skill: 'concepts',
    concept: 'Recognizing each data type',
    patterns: [
      {
        id: 'find-the-string',
        make(r) {
          const [text, value] = r.pick(NUMBER_WORDS);
          return kit.choiceQuestion(r, {
            prompt: FIND_PROMPT('a string'),
            correct: `"${text}"`,
            wrong: [String(value), makeBoolean(r), makeObject(r)],
            codeOptions: true,
            explain: 'A string is characters in quotation marks, even when those characters are digits.',
          });
        },
      },
      {
        id: 'find-the-number',
        make(r) {
          const [text, value] = r.pick(NUMBER_WORDS);
          return kit.choiceQuestion(r, {
            prompt: FIND_PROMPT('a number'),
            correct: String(value),
            wrong: [`"${text}"`, makeBoolean(r), makeObject(r)],
            codeOptions: true,
            explain: 'A number has no quotation marks around it.',
          });
        },
      },
      {
        id: 'find-the-boolean',
        make(r) {
          const flag = makeBoolean(r);
          return kit.choiceQuestion(r, {
            prompt: FIND_PROMPT('a boolean'),
            correct: flag,
            wrong: [`"${flag}"`, makeNumber(r), makeObject(r)],
            codeOptions: true,
            explain: 'A boolean is only ever true or false, with no quotation marks.',
          });
        },
      },
      {
        id: 'find-the-object',
        make(r) {
          return kit.choiceQuestion(r, {
            prompt: FIND_PROMPT('an object'),
            correct: makeObject(r),
            wrong: [makeWord(r), makeNumber(r), makeBoolean(r)],
            codeOptions: true,
            explain: 'An object holds a set of values in curly brackets. Arrays in square brackets count as objects too.',
          });
        },
      },
    ],
  };

  const objectSlot = {
    id: 'objectProps',
    skill: 'flow',
    concept: 'Knowing that each value in an object keeps its own type',
    patterns: [
      {
        id: 'a-sneaker',
        make(r) {
          return objectRows(r, r.pick(['sneaker', 'myShoe', 'kick']), [
            ['color', `"${r.pick(['red', 'blue', 'green'])}"`],
            ['size', String(r.int(5, 12))],
            ['onSale', makeBoolean(r)],
            ['laces', `{ count: ${r.pick([2, 4])} }`],
          ]);
        },
      },
      {
        id: 'a-pet',
        make(r) {
          return objectRows(r, r.pick(['myPet', 'friend', 'buddy']), [
            ['name', `"${r.pick(['Milo', 'Luna', 'Coco'])}"`],
            ['age', String(r.int(1, 15))],
            ['friendly', makeBoolean(r)],
            ['toys', `["${r.pick(['ball', 'bone'])}", "${r.pick(['rope', 'sock'])}"]`],
          ]);
        },
      },
      {
        id: 'a-drawing-tool',
        make(r) {
          return objectRows(r, r.pick(['theLine', 'brush', 'marker']), [
            ['label', `"${r.pick(['thin', 'wide', 'neon'])}"`],
            ['weight', String(r.int(1, 12))],
            ['isOn', makeBoolean(r)],
            ['where', `{ x: ${r.int(1, 99)}, y: ${r.int(1, 99)} }`],
          ]);
        },
      },
    ],
  };

  function objectRows(r, name, props) {
    return typeRows(r, {
      prompt: 'What data type does each key in this object hold?',
      code: [`let ${name} = {`].concat(props.map(([k, v], i) => `  ${k}: ${v}${i < props.length - 1 ? ',' : ''}`), ['}']),
      column: 'Key',
      items: props.map(([k]) => `${name}.${k}`),
      vars: { [name]: Object.fromEntries(props.map(([k, v]) => [k, CC.evalExpr(v, {})])) },
      explain: 'The whole thing is an object, but each value inside it has its own type.',
    });
  }

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const JOINS = 'One value is a string, so + joins them instead of adding them.';
  const NOT_BOOLEAN = 'With quotation marks, this is a string and not a boolean.';
  const REASONS = [WHY.wrongType, JOINS, NOT_BOOLEAN, WHY.objectEquals, WHY.quotes];
  const others = (r, why) => r.sample(REASONS.filter((reason) => reason !== why), 3);
  const NUMBER_NAMES = [['fifty', 50], ['twenty', 20], ['eighty', 80], ['ten', 10], ['forty', 40]];

  const bugSlot = {
    id: 'wrongType',
    skill: 'flow',
    concept: 'Finding bugs caused by the wrong data type',
    patterns: [
      {
        id: 'word-in-ellipse',
        make(r) {
          const [word, value] = r.pick(NUMBER_NAMES);
          const size = 5 * r.int(2, 8);
          const lines = (x) => ['function setup(){', '  createCanvas(400, 400)', '}', '', 'function draw(){', `  ellipse(${x}, 100, ${size}, ${size})`, '}'];
          return kit.bugQuestion(r, {
            prompt: `This code should draw a circle at x = ${value}. ${FIND_BUG}`,
            code: lines(`"${word}"`),
            bugLines: [5],
            why: WHY.wrongType,
            others: others(r, WHY.wrongType),
            fixed: lines(String(value)),
            spec: { kind: 'sketch', vectors: [{}] },
            explain: `We know "${word}" means ${value}, but the computer only sees text. It should be ${value}.`,
          });
        },
      },
      {
        id: 'word-in-rect',
        make(r) {
          const [word, value] = r.pick(NUMBER_NAMES);
          const lines = (w) => ['function setup(){', '  createCanvas(400, 400)', '}', '', 'function draw(){', '  background(220)', `  rect(10, 10, ${w}, 30)`, '}'];
          return kit.bugQuestion(r, {
            prompt: `This code should draw a rectangle that is ${value} wide. ${FIND_BUG}`,
            code: lines(`"${word}"`),
            bugLines: [6],
            why: WHY.wrongType,
            others: others(r, WHY.wrongType),
            fixed: lines(String(value)),
            spec: { kind: 'sketch', vectors: [{}] },
            explain: `rect() needs numbers. It should be ${value}.`,
          });
        },
      },
      {
        id: 'quoted-number-joins',
        make(r) {
          const a = r.int(2, 9);
          const b = r.int(2, 9);
          const name = r.pick(['total', 'sum', 'answer']);
          const lines = (first) => [`let ${name} = ${first} + ${b}`, `console.log(${name})`];
          return kit.bugQuestion(r, {
            prompt: `This code should print ${a + b}, but it prints ${a}${b}. ${FIND_BUG}`,
            code: lines(`"${a}"`),
            bugLines: [0],
            why: JOINS,
            others: others(r, JOINS),
            fixed: lines(String(a)),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `"${a}" is a string. Without the quotation marks, ${a} + ${b} is ${a + b}.`,
          });
        },
      },
      {
        id: 'quoted-boolean',
        make(r) {
          const name = r.pick(['isOn', 'ready', 'done']);
          const [m1, m2] = kit.pickScene(r).outcomes;
          const lines = (value) => [`let ${name} = ${value}`].concat(kit.chainLines([{ cond: `${name} == true`, body: kit.log(m1) }], kit.log(m2)));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}", but it prints "${m2}". ${FIND_BUG}`,
            code: lines('"true"'),
            bugLines: [0],
            why: NOT_BOOLEAN,
            others: others(r, NOT_BOOLEAN),
            fixed: lines('true'),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `The string "true" is not the boolean true. It should be let ${name} = true.`,
          });
        },
      },
    ],
  };

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Choosing values of the right data type',
    patterns: [
      {
        id: 'one-of-each',
        make(r) {
          const word = r.pick(WORDS);
          const n = r.int(2, 99);
          const flag = makeBoolean(r);
          const [a, b, c] = r.sample(['first', 'second', 'third', 'data', 'item', 'thing'], 3);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${a} holds a string, ${b} holds a number, and ${c} holds a boolean.`,
            lines: [
              [`let ${a} = `, tok(`"${word}"`, 'val')],
              [`let ${b} = `, tok(n, 'val')],
              [`let ${c} = `, tok(flag, 'val')],
              [`console.log(typeof ${a}, typeof ${b}, typeof ${c})`],
            ],
            must: ['val'],
            count: 3,
            pools: { val: [word, `"${n}"`, `"${flag}"`] },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: 'Strings need quotation marks. Numbers and booleans do not have them.',
          });
        },
      },
      {
        id: 'numbers-for-a-shape',
        make(r) {
          const [word, value] = r.pick(NUMBER_NAMES);
          const y = 10 * r.int(1, 30);
          const size = 5 * r.int(2, 8);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so the circle is at x = ${value} and y = ${y}, and it is ${size} wide and tall.`,
            lines: [
              ['ellipse(', tok(value, 'val'), ', ', tok(y, 'val'), ', ', tok(size, 'val'), `, ${size})`],
            ],
            must: ['val'],
            count: 3,
            pools: { val: [`"${word}"`, `"${y}"`, value + 10, size + 5] },
            spec: {
              kind: 'sketch',
              hiddenPrefix: ['function draw(){'],
              hiddenSuffix: ['}'],
              vectors: [{}],
            },
            explain: 'ellipse() needs numbers. Words and numbers in quotation marks are strings.',
          });
        },
      },
      {
        id: 'object-with-mixed-types',
        make(r) {
          const name = r.pick(['sneaker', 'myShoe', 'kick']);
          const color = r.pick(['red', 'blue', 'green']);
          const size = r.int(5, 12);
          const flag = makeBoolean(r);
          return kit.blanksQuestion(r, {
            prompt: `Complete the object so color is a string, size is a number, and onSale is a boolean.`,
            lines: [
              [`let ${name} = {`],
              ['  color: ', tok(`"${color}"`, 'val'), ','],
              ['  size: ', tok(size, 'val'), ','],
              ['  onSale: ', tok(flag, 'val')],
              ['}'],
              [`console.log(typeof ${name}.color, typeof ${name}.size, typeof ${name}.onSale)`],
            ],
            must: ['val'],
            count: 3,
            pools: { val: [color, `"${size}"`, `"${flag}"`] },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: 'Each value in an object has its own type.',
          });
        },
      },
      {
        id: 'asking-for-the-type',
        make(r) {
          const name = r.pick(['data', 'item', 'thing']);
          const value = r.pick([makeWord(r), makeNumber(r), makeBoolean(r)]);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints the data type of ${name}.`,
            lines: [
              [`let ${name} = ${value}`],
              ['console.', tok('log', 'word'), '(', tok('typeof', 'word'), ' ', tok(name, 'name'), ')'],
            ],
            must: ['word', 'name'],
            count: 3,
            pools: { word: ['type', 'print', 'string'], name: ['value', 'data type'] },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `typeof goes right before the value you're asking about: console.log(typeof ${name})`,
          });
        },
      },
    ],
  };

  const scramble = (rules) => `Put these lines in order so the code does this:\n${numberedRules(rules)}`;
  const TRACK = 'Code runs from top to bottom, so typeof reports whatever the variable holds at that moment.';

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting code that checks data types in order',
    patterns: [
      {
        id: 'number-then-string',
        make(r) {
          const name = r.pick(['data', 'item', 'thing']);
          const n = r.int(2, 99);
          const word = r.pick(WORDS);
          const other = r.pick(['flag', 'other', 'extra']);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make ${name} hold the number ${n}, and print its type.`,
              `Change ${name} to the string "${word}", and print its type.`,
              `Make ${other} hold the boolean true, and print its type.`,
            ]),
            movable: [`let ${name} = ${n}`, `console.log(typeof ${name})`, `${name} = "${word}"`, `console.log(typeof ${name})`, `let ${other} = true`, `console.log(typeof ${other})`],
            spec: { kind: 'snippet', vectors: [{}] },
            explain: TRACK,
          });
        },
      },
      {
        id: 'string-then-boolean',
        make(r) {
          const name = r.pick(['data', 'item', 'thing']);
          const word = r.pick(WORDS);
          const other = r.pick(['size', 'count', 'extra']);
          const n = r.int(2, 99);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make ${name} hold the string "${word}", and print its type.`,
              `Change ${name} to the boolean false, and print its type.`,
              `Make ${other} hold the number ${n}, and print its type.`,
            ]),
            movable: [`let ${name} = "${word}"`, `console.log(typeof ${name})`, `${name} = false`, `console.log(typeof ${name})`, `let ${other} = ${n}`, `console.log(typeof ${other})`],
            spec: { kind: 'snippet', vectors: [{}] },
            explain: TRACK,
          });
        },
      },
      {
        id: 'object-and-its-values',
        make(r) {
          const name = r.pick(['sneaker', 'myShoe', 'kick']);
          const size = r.int(5, 12);
          const color = r.pick(['red', 'blue', 'green']);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Make ${name} an object with a size of ${size} and a color of "${color}".`,
              `Print the type of ${name}.`,
              `Print the type of ${name}.size.`,
              `Print the type of ${name}.color.`,
            ]),
            movable: [`let ${name} = {`, `size: ${size},`, `color: "${color}"`, '}', `console.log(typeof ${name})`, `console.log(typeof ${name}.size)`, `console.log(typeof ${name}.color)`],
            spec: { kind: 'snippet', vectors: [{}] },
            explain: 'The object has to be finished before the lines that use it. Each value inside keeps its own type.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA3.1',
    title: 'Data Type Scavenger Hunt',
    unit: 2,
    source: 'curriculum/02-unit-2/08-U2LA3.1-Data-Type-Scavenger-Hunt.md',
    defaults: {
      minutes: 12, questions: 9, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/\breturn\b/, 'return values (U2LA3.2)'],
      [/mouseIsPressed|mousePressed|keyIsPressed/, 'clicks and keys (U2LA4.2 and U2LA5.1)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
    ],
    slots: [classifySlot, whichSlot, typeofSlot, objectSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['classify', 'typeofOutput', 'blanks', 'wrongType', 'objectProps', 'whichOne', 'parsons'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
