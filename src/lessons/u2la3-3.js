// U2LA3.3: Functions with Purpose
// curriculum/02-unit-2/10-U2LA3.3-Functions-with-Purpose.md
//
// Students at this point have seen: everything through U2LA3.2, plus writing functions from a
// prompt (like updateLight) and testing them with different inputs, in the CodeWars style.
// They have NOT seen: mouseIsPressed, key presses, loops, or arrays.
// The lesson marks itself as optional, so teachers may skip this test.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const { tok, WHY } = kit;

  const q = (word) => `"${word}"`;

  // Each kind of function: what it should do, its correct body, versions with a mistake, inputs
  // that exercise it, and specific bugs to hide in it.
  const SPECS = [
    {
      id: 'next-light',
      make(r) {
        const fn = r.pick(['updateLight', 'nextLight', 'changeLight']);
        const p = r.pick(['current', 'light', 'nowShowing']);
        const [a, b, c] = ['green', 'yellow', 'red'];
        const chain = (first, second, third) => [
          `if(${p} == ${q(a)}){`, `  return ${q(first)}`, '}',
          `else if(${p} == ${q(b)}){`, `  return ${q(second)}`, '}',
          `else if(${p} == ${q(c)}){`, `  return ${q(third)}`, '}',
        ];
        return {
          fn,
          params: [p],
          says: 'takes the color of a traffic light and returns the next color: green goes to yellow, yellow goes to red, and red goes to green',
          body: chain(b, c, a),
          broken: [chain(c, a, b), chain(b, a, a), chain(a, b, c)],
          inputs: [[q(a)], [q(b)], [q(c)]],
          bugs: [
            {
              line: 1, text: `  ${q(b)}`, why: WHY.noReturn, explain: `It needs return: return ${q(b)}`,
            },
            {
              line: 0, text: `if(${p} = ${q(a)}){`, why: WHY.assign, explain: `It should be if(${p} == ${q(a)}){`,
            },
          ],
        };
      },
    },
    {
      id: 'pass-or-fail',
      make(r) {
        const fn = r.pick(['passOrFail', 'checkScore', 'gradeIt']);
        const p = r.pick(['score', 'points', 'grade']);
        const t = r.pick([60, 65, 70, 75]);
        const body = (op, yes, no) => [`if(${p} ${op} ${t}){`, `  return ${q(yes)}`, '}', 'else{', `  return ${q(no)}`, '}'];
        return {
          fn,
          params: [p],
          says: `takes a score and returns "pass" when it is at least ${t}, and "fail" otherwise`,
          body: body('>=', 'pass', 'fail'),
          broken: [body('>', 'pass', 'fail'), body('>=', 'fail', 'pass'), body('<=', 'pass', 'fail')],
          inputs: [[t - 20], [t - 5], [t], [t + 5], [t + 20]],
          bugs: [
            {
              line: 1, text: `  ${q('pass')}`, why: WHY.noReturn, explain: `It needs return: return ${q('pass')}`,
            },
            {
              line: 0, text: `if(${p} < ${t}){`, why: WHY.backwards, explain: `It should be if(${p} >= ${t}){`,
            },
          ],
        };
      },
    },
    {
      id: 'ticket-price',
      make(r) {
        const fn = r.pick(['ticketPrice', 'priceFor', 'admission']);
        const p = r.pick(['age', 'guestAge', 'howOld']);
        const kid = r.pick([10, 12, 13]);
        const senior = r.pick([60, 65, 70]);
        const [low, mid, high] = r.pick([[5, 7, 10], [4, 6, 9], [6, 8, 12]]);
        const body = (op, first, second, third) => [
          `if(${p} ${op} ${kid}){`, `  return ${first}`, '}',
          `else if(${p} >= ${senior}){`, `  return ${second}`, '}',
          'else{', `  return ${third}`, '}',
        ];
        return {
          fn,
          params: [p],
          says: `takes an age and returns the ticket price: ${low} for anyone under ${kid}, ${mid} for anyone ${senior} or older, and ${high} for everyone else`,
          body: body('<', low, mid, high),
          broken: [body('<=', low, mid, high), body('<', mid, low, high), body('>', low, mid, high)],
          inputs: [[kid - 5], [kid], [kid + 3], [senior - 5], [senior], [senior + 10]],
          bugs: [
            {
              line: 4, text: `  ${mid}`, why: WHY.noReturn, explain: `It needs return: return ${mid}`,
            },
            {
              line: 3, text: `else if(${p} <= ${senior}){`, why: WHY.backwards, explain: `It should be else if(${p} >= ${senior}){`,
            },
          ],
        };
      },
    },
    {
      id: 'is-a-teen',
      make(r) {
        const fn = r.pick(['isTeen', 'teenCheck', 'checkTeen']);
        const p = r.pick(['age', 'guestAge', 'howOld']);
        const body = (op, low, high) => [`if(${p} >= ${low} ${op} ${p} <= ${high}){`, '  return true', '}', 'else{', '  return false', '}'];
        return {
          fn,
          params: [p],
          says: 'takes an age and returns true for ages 13 through 19, and false otherwise',
          body: body('&&', 13, 19),
          broken: [body('||', 13, 19), body('&&', 14, 19), body('&&', 13, 18)],
          inputs: [[10], [12], [13], [15], [19], [20], [40]],
          bugs: [
            {
              line: 0, text: `if(${p} >= 13 || ${p} <= 19){`, why: WHY.needsAnd, explain: `It should use &&: if(${p} >= 13 && ${p} <= 19){`,
            },
            {
              line: 1, text: '  true', why: WHY.noReturn, explain: 'It needs return: return true',
            },
          ],
        };
      },
    },
    {
      id: 'bigger-of-two',
      make(r) {
        const fn = r.pick(['biggerOf', 'larger', 'maxOfTwo']);
        const [a, b] = r.pick([['a', 'b'], ['x', 'y'], ['first', 'second']]);
        const body = (op, yes, no) => [`if(${a} ${op} ${b}){`, `  return ${yes}`, '}', 'else{', `  return ${no}`, '}'];
        return {
          fn,
          params: [a, b],
          says: 'takes two numbers and returns the bigger one',
          body: body('>', a, b),
          broken: [body('<', a, b), body('>', a, a), body('>', b, a)],
          inputs: [[3, 8], [9, 2], [5, 5], [12, 7], [1, 20]],
          bugs: [
            {
              line: 1, text: `  ${a}`, why: WHY.noReturn, explain: `It needs return: return ${a}`,
            },
            {
              line: 0, text: `if(${a} < ${b}){`, why: WHY.backwards, explain: `It should be if(${a} > ${b}){`,
            },
          ],
        };
      },
    },
    {
      id: 'can-ride',
      make(r) {
        const fn = r.pick(['canRide', 'rideCheck', 'mayRide']);
        const h = r.pick(['height', 'inches', 'tallness']);
        const a = r.pick(['age', 'years', 'howOld']);
        const tall = r.pick([44, 48, 52]);
        const old = r.pick([10, 12, 14]);
        const body = (op, yes, no) => [`if(${h} >= ${tall} ${op} ${a} >= ${old}){`, `  return ${q(yes)}`, '}', 'else{', `  return ${q(no)}`, '}'];
        return {
          fn,
          params: [h, a],
          says: `takes a height and an age. It returns "ride" when the height is at least ${tall} or the age is at least ${old}, and "wait" otherwise`,
          body: body('||', 'ride', 'wait'),
          broken: [body('&&', 'ride', 'wait'), body('||', 'wait', 'ride')],
          inputs: [[tall + 4, old + 2], [tall + 4, old - 2], [tall - 4, old + 2], [tall - 4, old - 2], [tall, old - 3]],
          bugs: [
            {
              line: 0, text: `if(${h} >= ${tall} && ${a} >= ${old}){`, why: WHY.needsOr, explain: `It should use ||: if(${h} >= ${tall} || ${a} >= ${old}){`,
            },
            {
              line: 4, text: `  ${q('wait')}`, why: WHY.noReturn, explain: `It needs return: return ${q('wait')}`,
            },
          ],
        };
      },
    },
  ];

  const header = (s) => `function ${s.fn}(${s.params.join(', ')}){`;
  const indent = (lines) => lines.map((line) => `  ${line}`);
  const source = (s, body) => [header(s)].concat(indent(body || s.body), ['}']);
  const callText = (s, args) => `${s.fn}(${args.join(', ')})`;

  const resultOf = (s, body, args) => {
    const logs = kit.printed(source(s, body).concat([`console.log(${callText(s, args)})`]));
    return logs[0];
  };

  // Every broken version must really behave differently on at least one input.
  const usefulBroken = (s) => s.broken.filter((body) => s.inputs.some((args) => resultOf(s, body, args) !== resultOf(s, s.body, args)));

  const eachSpec = (build) => SPECS.map((spec) => ({ id: spec.id, make: (r) => build(r, spec.make(r)) }));

  const matchSlot = {
    id: 'matchPrompt',
    skill: 'concepts',
    concept: 'Choosing the function that does what a prompt asks',
    patterns: eachSpec((r, s) => kit.choiceQuestion(r, {
      prompt: 'Which function does what this prompt asks?',
      rule: `${s.fn} ${s.says}.`,
      correct: source(s).join('\n'),
      wrong: usefulBroken(s).map((body) => source(s, body).join('\n')),
      codeOptions: true,
      explain: 'Try a few inputs on each one, especially values right on the edge of a condition.',
    })),
  };

  const testsSlot = {
    id: 'testTable',
    skill: 'flow',
    concept: 'Testing a function with different inputs',
    patterns: eachSpec((r, s) => {
      const outputs = Array.from(new Set(s.inputs.map((args) => resultOf(s, s.body, args))));
      // Keep picking until the chosen calls don't all give the same answer.
      let inputs;
      do {
        inputs = r.sample(s.inputs, Math.min(4, s.inputs.length));
      } while (new Set(inputs.map((args) => resultOf(s, s.body, args))).size < 2);
      const shown = (text) => (Number.isNaN(Number(text)) && text !== 'true' && text !== 'false' ? `"${text}"` : text);
      return kit.rowsQuestion({
        prompt: 'What does the function return for each call?',
        code: source(s),
        columns: ['Call'],
        rows: inputs.map((args) => ({ cells: [callText(s, args)], answer: outputs.indexOf(resultOf(s, s.body, args)) })),
        options: outputs.map((text) => ({ text: shown(text) })),
        explain: 'Put each input into the parameter, and follow the conditions until one returns a value.',
      });
    }),
  };

  function outOfSpec(r, s) {
    for (let tries = 0; tries < 50; tries++) {
      const body = r.pick(usefulBroken(s));
      const fails = s.inputs.filter((args) => resultOf(s, body, args) !== resultOf(s, s.body, args));
      const passes = s.inputs.filter((args) => resultOf(s, body, args) === resultOf(s, s.body, args));
      if (fails.length && passes.length >= 2) return { body, fails, passes };
    }
    throw new Error(`No useful broken version for ${s.fn}`);
  }

  const findInputSlot = {
    id: 'findInput',
    skill: 'concepts',
    concept: 'Finding a test input that shows a bug',
    patterns: eachSpec((r, s) => {
      const { body, fails, passes } = outOfSpec(r, s);
      const bad = r.pick(fails);
      return kit.choiceQuestion(r, {
        prompt: `${s.fn} should work this way: it ${s.says}. This version has a bug. Which call shows the bug by giving a wrong answer?`,
        code: source(s, body),
        correct: callText(s, bad),
        wrong: r.sample(passes, Math.min(3, passes.length)).map((args) => callText(s, args)),
        codeOptions: true,
        explain: `${callText(s, bad)} gives ${resultOf(s, body, bad)}, but it should give ${resultOf(s, s.body, bad)}. Testing right at the edges of a condition finds a lot of bugs.`,
      });
    }),
  };

  const flowSlot = {
    id: 'lines',
    skill: 'flow',
    concept: 'Seeing which lines run for a given input',
    patterns: eachSpec((r, s) => kit.buildFlow(r, () => {
      const args = r.pick(s.inputs);
      return source(s).concat(['', `console.log(${callText(s, args)})`]);
    }, 'The conditions are checked in order. Once a return runs, the function is over.', { minHits: 2 })),
  };

  const sumSlot = {
    id: 'useResults',
    skill: 'flow',
    concept: 'Using what functions return',
    patterns: [
      {
        id: 'add-two-prices',
        make(r) {
          const s = SPECS[2].make(r);
          const [x, y] = r.sample(s.inputs, 2);
          return kit.printedNumber({
            prompt: 'What number does this code print?',
            code: source(s).concat(['', `console.log(${callText(s, x)} + ${callText(s, y)})`]),
            explain: 'Work out what each call returns, and then add them.',
          });
        },
      },
      {
        id: 'bigger-of-bigger',
        make(r) {
          const s = SPECS[4].make(r);
          const nums = r.sample([3, 5, 8, 11, 14, 19, 22], 3);
          return kit.printedNumber({
            prompt: 'What number does this code print?',
            code: source(s).concat(['', `console.log(${s.fn}(${s.fn}(${nums[0]}, ${nums[1]}), ${nums[2]}))`]),
            explain: 'Start with the inner call. Its answer goes into the outer call.',
          });
        },
      },
      {
        id: 'store-then-adjust',
        make(r) {
          const s = SPECS[2].make(r);
          const args = r.pick(s.inputs);
          const name = r.pick(['total', 'cost', 'bill']);
          const fee = r.int(1, 4);
          return kit.printedNumber({
            prompt: 'What number does this code print?',
            code: source(s).concat(['', `let ${name} = ${callText(s, args)}`, `${name} = ${name} + ${fee}`, `console.log(${name})`]),
            explain: `${name} holds what the function returns, and then ${fee} gets added.`,
          });
        },
      },
    ],
  };

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const REASONS = [WHY.noReturn, WHY.assign, WHY.backwards, WHY.needsAnd, WHY.needsOr, WHY.elseLast];

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in a function',
    patterns: eachSpec((r, s) => {
      const bug = r.pick(s.bugs);
      const code = source(s);
      code[bug.line + 1] = `  ${bug.text}`;
      const tests = s.inputs.map((args) => `console.log(${callText(s, args)})`);
      return kit.bugQuestion(r, {
        prompt: `${s.fn} should work this way: it ${s.says}. ${FIND_BUG}`,
        code,
        bugLines: [bug.line + 1],
        why: bug.why,
        others: r.sample(REASONS.filter((reason) => reason !== bug.why && !isOpposite(reason, bug.why)), 3),
        fixed: source(s),
        spec: { kind: 'snippet', hiddenSuffix: tests, vectors: [{}] },
        explain: bug.explain,
      });
    }),
  };

  function isOpposite(a, b) {
    return (a === WHY.needsAnd && b === WHY.needsOr) || (a === WHY.needsOr && b === WHY.needsAnd);
  }

  // Turns the words students should know in a line of code into pieces that can be blanked out.
  const WORDS = /\b(return|else if|else|if)\b|(&&|\|\||==|>=|<=|>|<)/g;
  function piecesOf(line) {
    const parts = [];
    let last = 0;
    let match = WORDS.exec(line);
    while (match) {
      if (match.index > last) parts.push(line.slice(last, match.index));
      const word = match[0];
      parts.push(match[1] ? tok(word, word === 'return' ? 'ret' : 'kw') : tok(word, word === '&&' || word === '||' ? 'conn' : 'op'));
      last = match.index + word.length;
      match = WORDS.exec(line);
    }
    if (last < line.length) parts.push(line.slice(last));
    return parts;
  }

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing a function from its description',
    patterns: eachSpec((r, s) => {
      const lines = source(s).map(piecesOf);
      const tests = s.inputs.map((args) => `console.log(${callText(s, args)})`);
      return kit.blanksQuestion(r, {
        prompt: `Complete ${s.fn} so it ${s.says}.`,
        lines,
        must: ['ret'],
        count: 3,
        pools: {
          ret: ['console.log', 'let'], kw: ['if', 'else if', 'else'], op: ['>', '<', '>=', '<=', '=='], conn: ['&&', '||'],
        },
        spec: { kind: 'snippet', hiddenSuffix: tests, vectors: [{}] },
        explain: `Here is one way to write it:\n${source(s).join('\n')}`,
      });
    }),
  };

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting a function together from its description',
    patterns: eachSpec((r, s) => {
      const tests = s.inputs.map((args) => `console.log(${callText(s, args)})`);
      return kit.parsonsQuestion(r, {
        prompt: `Put these lines in order so ${s.fn} ${s.says}.`,
        prefix: [{ text: header(s) }],
        movable: s.body,
        suffix: [{ text: '}' }],
        spec: { kind: 'snippet', hiddenSuffix: tests, vectors: [{}] },
        explain: 'Each return goes right after the condition it belongs to, inside that branch.',
      });
    }),
  };

  CC.defineLesson({
    id: 'U2LA3.3',
    title: 'Functions with Purpose',
    unit: 2,
    source: 'curriculum/02-unit-2/10-U2LA3.3-Functions-with-Purpose.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/mouseIsPressed|mousePressed|keyIsPressed/, 'clicks and keys (U2LA4.2 and U2LA5.1)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [matchSlot, findInputSlot, testsSlot, sumSlot, flowSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['parsons', 'testTable', 'findInput', 'blanks', 'matchPrompt', 'bug', 'lines', 'useResults'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
