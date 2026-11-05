// U2LA3.2: Functions that Return Values
// curriculum/02-unit-2/09-U2LA3.2-Functions-that-Return-Values.md
//
// Students at this point have seen: everything through U2LA3.1, plus functions that return
// values, and reading AP-style pseudocode (PROCEDURE, RETURN, DISPLAY).
// They have NOT seen: mouseIsPressed, key presses, or loops.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    tok, log, numberedRules, WHY,
  } = kit;

  const FN_NAMES = ['mystery', 'compute', 'doMath', 'crunch', 'puzzle', 'calc'];
  const PARAM_SETS = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r'], ['m', 'n', 'k']];
  // Nonsense math, as in the lesson. These read correctly with any three parameter names.
  const FORMULAS = [
    ([a, b, c]) => `${b} - ${a} - ${c}`,
    ([a, b, c]) => `${a} * ${b} + ${c}`,
    ([a, b, c]) => `${a} + ${b} * ${c}`,
    ([a, b, c]) => `${c} - ${a} + ${b}`,
    ([a, b, c]) => `${a} * ${c} - ${b}`,
    ([a, b, c]) => `${b} + ${c} - ${a}`,
  ];
  const ANSWER_NAMES = ['ans', 'result', 'output', 'value'];
  const small = (r) => r.pick([r.int(2, 9), r.int(2, 9), r.int(2, 9), -r.int(1, 6)]);

  function mystery(r) {
    const params = r.pick(PARAM_SETS);
    return {
      fn: r.pick(FN_NAMES),
      params,
      list: params.join(', '),
      formula: r.pick(FORMULAS)(params),
      ans: r.pick(ANSWER_NAMES),
      args: [small(r), small(r), small(r)],
    };
  }

  const TRACE_PROMPT = 'What number does this code print?';
  const NEGATIVE_NOTE = 'Put each input into its parameter, work out the math, and follow what gets returned. Remember that minus a negative number is the same as adding.';

  const traceSlot = {
    id: 'trace',
    skill: 'flow',
    concept: 'Working out what a function returns',
    patterns: [
      {
        id: 'store-then-return',
        make(r) {
          const m = mystery(r);
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, `  return ${m.ans}`, '}', '', `let answer = ${m.fn}(${m.args.join(', ')})`, 'console.log(answer)'],
            explain: NEGATIVE_NOTE,
          });
        },
      },
      {
        id: 'return-the-math',
        make(r) {
          const m = mystery(r);
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${m.fn}(${m.list}){`, `  return ${m.formula}`, '}', '', `console.log(${m.fn}(${m.args.join(', ')}))`],
            explain: NEGATIVE_NOTE,
          });
        },
      },
      {
        id: 'two-steps',
        make(r) {
          const m = mystery(r);
          const [a, b, c] = m.params;
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${a} + ${b}`, `  ${m.ans} = ${m.ans} * ${c}`, `  return ${m.ans}`, '}', '', `console.log(${m.fn}(${m.args.join(', ')}))`],
            explain: `${m.ans} starts as ${a} + ${b}. Then it gets multiplied by ${c}, and that is what comes back.`,
          });
        },
      },
      {
        id: 'if-inside-the-function',
        make(r) {
          const m = mystery(r);
          const [a, b] = m.params;
          const x = r.int(2, 20);
          let y = r.int(2, 20);
          if (y === x) y += 1;
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${m.fn}(${a}, ${b}){`, `  if(${a} > ${b}){`, `    return ${a} - ${b}`, '  }', '  else{', `    return ${b} - ${a}`, '  }', '}', '', `console.log(${m.fn}(${x}, ${y}))`],
            explain: `Check whether ${x} > ${y} to see which return runs.`,
          });
        },
      },
    ],
  };

  // AP-style pseudocode. Students read this version, and the answer comes from running the
  // same steps as JavaScript.
  const pseudoSlot = {
    id: 'pseudocode',
    skill: 'flow',
    concept: 'Reading pseudocode procedures',
    patterns: [
      {
        id: 'store-then-return',
        make(r) {
          const m = mystery(r);
          return kit.printedNumber({
            prompt: 'What does this pseudocode display?',
            code: [`PROCEDURE ${m.fn}(${m.list})`, '{', `  ${m.ans} ← ${m.formula}`, `  RETURN(${m.ans})`, '}', '', `answer ← ${m.fn}(${m.args.join(', ')})`, 'DISPLAY(answer)'],
            run: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, `  return ${m.ans}`, '}', `let answer = ${m.fn}(${m.args.join(', ')})`, 'console.log(answer)'],
            explain: `← stores a value, RETURN sends one back, and DISPLAY prints it. ${NEGATIVE_NOTE}`,
          });
        },
      },
      {
        id: 'two-steps',
        make(r) {
          const m = mystery(r);
          const [a, b, c] = m.params;
          return kit.printedNumber({
            prompt: 'What does this pseudocode display?',
            code: [`PROCEDURE ${m.fn}(${m.list})`, '{', `  ${m.ans} ← ${a} + ${b}`, `  ${m.ans} ← ${m.ans} * ${c}`, `  RETURN(${m.ans})`, '}', '', `DISPLAY(${m.fn}(${m.args.join(', ')}))`],
            run: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${a} + ${b}`, `  ${m.ans} = ${m.ans} * ${c}`, `  return ${m.ans}`, '}', `console.log(${m.fn}(${m.args.join(', ')}))`],
            explain: `${m.ans} starts as ${a} + ${b}, and then it gets multiplied by ${c}.`,
          });
        },
      },
      {
        id: 'called-twice',
        make(r) {
          const m = mystery(r);
          const [a, b] = m.params;
          const x = r.int(2, 9);
          const y = r.int(2, 9);
          const z = r.int(2, 9);
          return kit.printedNumber({
            prompt: 'What does this pseudocode display?',
            code: [`PROCEDURE ${m.fn}(${a}, ${b})`, '{', `  RETURN(${a} * ${b})`, '}', '', `first ← ${m.fn}(${x}, ${y})`, `second ← ${m.fn}(first, ${z})`, 'DISPLAY(second)'],
            run: [`function ${m.fn}(${a}, ${b}){`, `  return ${a} * ${b}`, '}', `let first = ${m.fn}(${x}, ${y})`, `let second = ${m.fn}(first, ${z})`, 'console.log(second)'],
            explain: `The value returned by the first call becomes an input to the second call.`,
          });
        },
      },
      {
        id: 'if-inside-the-procedure',
        make(r) {
          const m = mystery(r);
          const [a, b] = m.params;
          const x = r.int(2, 20);
          let y = r.int(2, 20);
          if (y === x) y += 1;
          return kit.printedNumber({
            prompt: 'What does this pseudocode display?',
            code: [`PROCEDURE ${m.fn}(${a}, ${b})`, '{', `  IF(${a} > ${b})`, '  {', `    RETURN(${a} - ${b})`, '  }', '  ELSE', '  {', `    RETURN(${b} + ${a})`, '  }', '}', '', `DISPLAY(${m.fn}(${x}, ${y}))`],
            run: [`function ${m.fn}(${a}, ${b}){`, `  if(${a} > ${b}){`, `    return ${a} - ${b}`, '  }', '  else{', `    return ${b} + ${a}`, '  }', '}', `console.log(${m.fn}(${x}, ${y}))`],
            explain: `Check whether ${x} > ${y} to see which RETURN runs.`,
          });
        },
      },
    ],
  };

  const chainSlot = {
    id: 'chained',
    skill: 'flow',
    concept: 'Using what one call returns in the next call',
    patterns: [
      {
        id: 'store-and-pass-along',
        make(r) {
          const fn = r.pick(FN_NAMES);
          const [a, b] = r.pick(PARAM_SETS);
          const [x, y, z] = [r.int(2, 9), r.int(2, 9), r.int(2, 9)];
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${fn}(${a}, ${b}){`, `  return ${a} + ${b}`, '}', '', `let first = ${fn}(${x}, ${y})`, `let second = ${fn}(first, ${z})`, 'console.log(second)'],
            explain: `first holds ${x + y}, which gets passed in again with ${z}.`,
          });
        },
      },
      {
        id: 'call-inside-a-call',
        make(r) {
          const fn = r.pick(FN_NAMES);
          const [a, b] = r.pick(PARAM_SETS);
          const [x, y, z] = [r.int(2, 6), r.int(2, 6), r.int(2, 6)];
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${fn}(${a}, ${b}){`, `  return ${a} * ${b}`, '}', '', `console.log(${fn}(${fn}(${x}, ${y}), ${z}))`],
            explain: 'Start with the inner call. Its answer becomes the first input to the outer call.',
          });
        },
      },
      {
        id: 'two-different-functions',
        make(r) {
          const [f, g] = r.sample(FN_NAMES, 2);
          const [a, b] = r.pick(PARAM_SETS);
          const [x, y] = [r.int(2, 9), r.int(2, 9)];
          const step = r.int(2, 5);
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${f}(${a}, ${b}){`, `  return ${a} + ${b}`, '}', '', `function ${g}(${a}){`, `  return ${a} * ${step}`, '}', '', `console.log(${g}(${f}(${x}, ${y})))`],
            explain: `${f} runs first because its answer is what gets passed to ${g}.`,
          });
        },
      },
      {
        id: 'math-with-two-results',
        make(r) {
          const fn = r.pick(FN_NAMES);
          const [a, b] = r.pick(PARAM_SETS);
          const [x, y, z, w] = [r.int(2, 9), r.int(2, 9), r.int(2, 9), r.int(2, 9)];
          return kit.printedNumber({
            prompt: TRACE_PROMPT,
            code: [`function ${fn}(${a}, ${b}){`, `  return ${a} - ${b}`, '}', '', `console.log(${fn}(${x}, ${y}) + ${fn}(${z}, ${w}))`],
            explain: 'A returned value can be used like any other number, so work out each call and then add.',
          });
        },
      },
    ],
  };

  const WHAT_PRINTS = 'What does this code print?';

  const returnSlot = {
    id: 'returnMeaning',
    skill: 'concepts',
    concept: 'Understanding what return does',
    patterns: [
      {
        id: 'forgot-to-return',
        make(r) {
          const m = mystery(r);
          const value = CC.evalExpr(m.formula, Object.fromEntries(m.params.map((p, i) => [p, m.args[i]])));
          return kit.traceChoice(r, {
            prompt: WHAT_PRINTS,
            code: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, '}', '', `let answer = ${m.fn}(${m.args.join(', ')})`, 'console.log(answer)'],
            wrong: [[String(value)], ['undefined'], [], [m.ans]],
            explain: 'The function works out a value but never returns it, so the program gets nothing back.',
          });
        },
      },
      {
        id: 'prints-instead-of-returning',
        make(r) {
          const m = mystery(r);
          const value = CC.evalExpr(m.formula, Object.fromEntries(m.params.map((p, i) => [p, m.args[i]])));
          return kit.traceChoice(r, {
            prompt: WHAT_PRINTS,
            code: [`function ${m.fn}(${m.list}){`, `  console.log(${m.formula})`, '}', '', `let answer = ${m.fn}(${m.args.join(', ')})`, 'console.log(answer)'],
            wrong: [[String(value)], [String(value), String(value)], [String(value), 'undefined'], ['undefined']],
            explain: 'console.log shows a value on the screen, but it does not send it back. answer is left with nothing, so the second line prints undefined.',
          });
        },
      },
      {
        id: 'code-after-return',
        make(r) {
          const m = mystery(r);
          const value = CC.evalExpr(m.formula, Object.fromEntries(m.params.map((p, i) => [p, m.args[i]])));
          return kit.traceChoice(r, {
            prompt: WHAT_PRINTS,
            code: [`function ${m.fn}(${m.list}){`, `  return ${m.formula}`, `  ${log('Done')}`, '}', '', `console.log(${m.fn}(${m.args.join(', ')}))`],
            wrong: [[String(value)], ['Done', String(value)], [String(value), 'Done'], ['Done']],
            explain: 'return ends the function right away, so the line after it never runs.',
          });
        },
      },
      {
        id: 'return-without-printing',
        make(r) {
          const m = mystery(r);
          const value = CC.evalExpr(m.formula, Object.fromEntries(m.params.map((p, i) => [p, m.args[i]])));
          return kit.traceChoice(r, {
            prompt: WHAT_PRINTS,
            code: [`function ${m.fn}(${m.list}){`, `  return ${m.formula}`, '}', '', `${m.fn}(${m.args.join(', ')})`],
            wrong: [[String(value)], ['undefined'], [], [m.fn]],
            explain: 'The function returns a value, but nothing stores it or prints it. So nothing shows up.',
          });
        },
      },
    ],
  };

  const vocabSlot = {
    id: 'vocab',
    skill: 'concepts',
    concept: 'Naming the parts of a function',
    patterns: [
      {
        id: 'label-the-parts',
        make(r) {
          const m = mystery(r);
          return kit.rowsQuestion({
            prompt: 'What is each of these in the code below?',
            code: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, `  return ${m.ans}`, '}', '', `let answer = ${m.fn}(${m.args.join(', ')})`],
            columns: ['Part'],
            rows: r.shuffle([
              { cells: [m.fn], answer: 0 },
              { cells: [m.list], answer: 1 },
              { cells: [m.args.join(', ')], answer: 2 },
              { cells: [m.ans], answer: 3 },
            ]),
            options: [{ text: 'function name' }, { text: 'parameters' }, { text: 'arguments' }, { text: 'what gets returned' }],
            explain: 'Parameters are the names in the function definition. Arguments are the actual values passed in when it is called.',
          });
        },
      },
      {
        id: 'which-are-the-inputs',
        make(r) {
          const m = mystery(r);
          return kit.choiceQuestion(r, {
            prompt: `When this code runs, which values are the inputs to ${m.fn}?`,
            code: [`function ${m.fn}(${m.list}){`, `  return ${m.formula}`, '}', '', `let answer = ${m.fn}(${m.args.join(', ')})`],
            correct: m.args.join(', '),
            wrong: [m.params.join(', '), 'answer', m.formula],
            codeOptions: true,
            explain: `The arguments in the call are the inputs. They fill in the parameters ${m.list}.`,
          });
        },
      },
      {
        id: 'which-parameter-gets-which',
        make(r) {
          const m = mystery(r);
          const i = r.int(0, 2);
          return kit.numberQuestion({
            prompt: `When this function is called, what value does ${m.params[i]} hold?`,
            code: [`function ${m.fn}(${m.list}){`, `  return ${m.formula}`, '}', '', `${m.fn}(${m.args.join(', ')})`],
            answer: m.args[i],
            explain: 'Arguments fill in parameters in order: first to first, second to second, and so on.',
          });
        },
      },
      {
        id: 'what-return-means',
        make(r) {
          const m = mystery(r);
          return kit.choiceQuestion(r, {
            prompt: `What does the return line do in this function?`,
            code: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, `  return ${m.ans}`, '}'],
            correct: `It sends the value of ${m.ans} back to the code that called the function`,
            wrong: [
              `It prints the value of ${m.ans} on the screen`,
              `It starts the function over from the top`,
              `It stores ${m.ans} so that any code outside the function can use that name`,
            ],
            explain: 'return hands a value back to wherever the function was called, and ends the function.',
          });
        },
      },
    ],
  };

  const flowSlot = {
    id: 'lines',
    skill: 'flow',
    concept: 'Seeing which lines run inside a function',
    patterns: [
      {
        id: 'early-return',
        make(r) {
          return kit.buildFlow(r, () => {
            const m = mystery(r);
            const [a] = m.params;
            const t = r.int(3, 8);
            return [`function ${m.fn}(${a}){`, `  ${log('Starting')}`, `  if(${a} > ${t}){`, `    return ${a}`, '  }', `  ${log('Too small')}`, '  return 0', '}', '', `console.log(${m.fn}(${r.int(1, 12)}))`];
          }, 'return ends the function right away, so nothing after it in the function runs.');
        },
      },
      {
        id: 'function-never-called',
        make(r) {
          const [f, g] = r.sample(FN_NAMES, 2);
          const [a, b] = r.pick(PARAM_SETS);
          const x = r.int(2, 9);
          const y = r.int(2, 9);
          return kit.buildFlow(r, () => [
            `function ${f}(${a}, ${b}){`, `  return ${a} + ${b}`, '}', '',
            `function ${g}(${a}, ${b}){`, `  return ${a} * ${b}`, '}', '',
            `console.log(${r.chance(0.5) ? f : g}(${x}, ${y}))`,
          ], 'A function only runs when it is called, so the other one does nothing.');
        },
      },
      {
        id: 'if-else-inside',
        make(r) {
          return kit.buildFlow(r, () => {
            const m = mystery(r);
            const [a, b] = m.params;
            return [`function ${m.fn}(${a}, ${b}){`, `  if(${a} > ${b}){`, `    return ${a}`, '  }', '  else{', `    return ${b}`, '  }', `  ${log('Done')}`, '}', '', `let answer = ${m.fn}(${r.int(1, 12)}, ${r.int(1, 12)})`, 'console.log(answer)'];
          }, 'Both branches return, so the function always ends before the last line inside it.');
        },
      },
      {
        id: 'called-after-other-code',
        make(r) {
          return kit.buildFlow(r, () => {
            const m = mystery(r);
            const [a, b] = m.params;
            const t = r.int(3, 8);
            return [log('First'), `function ${m.fn}(${a}, ${b}){`, `  if(${a} < ${t}){`, `    return ${b}`, '  }', `  return ${a}`, '}', log('Second'), `console.log(${m.fn}(${r.int(1, 12)}, ${r.int(1, 12)}))`];
          }, 'A function definition does not run where it is written. It only runs when it is called.');
        },
      },
    ],
  };

  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  const WRONG_VALUE = 'The function returns the wrong value, so its work never reaches the code that called it.';
  const REASONS = [WHY.noReturn, WHY.argOrder, WHY.outOfScope, WRONG_VALUE, WHY.assign];
  const others = (r, why) => r.sample(REASONS.filter((reason) => reason !== why), 3);

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in functions that return values',
    patterns: [
      {
        id: 'no-return',
        make(r) {
          const m = mystery(r);
          const value = (formula) => CC.evalExpr(formula, Object.fromEntries(m.params.map((p, i) => [p, m.args[i]])));
          const tail = [`let answer = ${m.fn}(${m.args.join(', ')})`, 'console.log(answer)'];
          return kit.bugQuestion(r, {
            prompt: `This code should print ${value(m.formula)}, but it prints undefined. ${FIND_BUG}`,
            code: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, '}'].concat(tail),
            bugLines: [1],
            why: WHY.noReturn,
            others: others(r, WHY.noReturn),
            fixed: [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, `  return ${m.ans}`, '}'].concat(tail),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `Add return ${m.ans} at the end of the function.`,
          });
        },
      },
      {
        id: 'returns-the-wrong-thing',
        make(r) {
          const fn = r.pick(FN_NAMES);
          const [a, b] = r.pick(PARAM_SETS);
          const ans = r.pick(ANSWER_NAMES);
          const [x, y] = [r.int(2, 9), r.int(10, 19)];
          const lines = (returned) => [`function ${fn}(${a}, ${b}){`, `  let ${ans} = ${a} + ${b}`, `  return ${returned}`, '}', `console.log(${fn}(${x}, ${y}))`];
          return kit.bugQuestion(r, {
            prompt: `This function should return the sum of its inputs, so this code should print ${x + y}. ${FIND_BUG}`,
            code: lines(a),
            bugLines: [2],
            why: WRONG_VALUE,
            others: others(r, WRONG_VALUE),
            fixed: lines(ans),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `It should be return ${ans}.`,
          });
        },
      },
      {
        id: 'arguments-out-of-order',
        make(r) {
          const fn = r.pick(['subtract', 'takeAway', 'difference']);
          const [a, b] = r.pick(PARAM_SETS);
          const x = r.int(11, 20);
          const y = r.int(2, 9);
          const lines = (first, second) => [`function ${fn}(${a}, ${b}){`, `  return ${a} - ${b}`, '}', `console.log(${fn}(${first}, ${second}))`];
          return kit.bugQuestion(r, {
            prompt: `This code should print ${x - y} by taking ${y} away from ${x}. ${FIND_BUG}`,
            code: lines(y, x),
            bugLines: [3],
            why: WHY.argOrder,
            others: others(r, WHY.argOrder),
            fixed: lines(x, y),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `${a} is first and ${b} is second, so the call should be ${fn}(${x}, ${y}).`,
          });
        },
      },
      {
        id: 'variable-used-outside',
        make(r) {
          const m = mystery(r);
          const head = [`function ${m.fn}(${m.list}){`, `  let ${m.ans} = ${m.formula}`, `  return ${m.ans}`, '}'];
          return kit.bugQuestion(r, {
            prompt: `This code should print the value the function returns. ${FIND_BUG}`,
            code: head.concat([`${m.fn}(${m.args.join(', ')})`, `console.log(${m.ans})`]),
            bugLines: [5],
            why: WHY.outOfScope,
            others: others(r, WHY.outOfScope),
            fixed: head.concat([`let answer = ${m.fn}(${m.args.join(', ')})`, 'console.log(answer)']),
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `${m.ans} only exists inside the function. Store what the function returns, and print that instead.`,
          });
        },
      },
    ],
  };

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing a function that returns a value',
    patterns: [
      {
        id: 'finish-the-function',
        make(r) {
          const m = mystery(r);
          const [a, b] = m.params;
          const [x, y] = [r.int(2, 9), r.int(2, 9)];
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${m.fn} returns its two inputs multiplied together, and the code prints the answer.`,
            lines: [
              ['function ', tok(m.fn, 'name'), '(', tok(a, 'param'), ', ', tok(b, 'param'), '){'],
              [`  let ${m.ans} = ${a} * ${b}`],
              ['  ', tok('return', 'word'), ' ', tok(m.ans, 'name')],
              ['}'],
              [`console.log(${m.fn}(${x}, ${y}))`],
            ],
            must: ['word'],
            count: 3,
            pools: { word: ['console.log', 'let', 'function'], name: ['answer', a], param: [m.params[2], x] },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: `return ${m.ans} sends the value back to the code that called the function.`,
          });
        },
      },
      {
        id: 'call-with-the-right-values',
        make(r) {
          const fn = r.pick(['subtract', 'takeAway', 'difference']);
          const [a, b] = r.pick(PARAM_SETS);
          const x = r.int(11, 20);
          const y = r.int(2, 9);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it takes ${y} away from ${x}, stores the answer, and prints it.`,
            lines: [
              [`function ${fn}(${a}, ${b}){`],
              ['  return ', tok(a, 'param'), ' - ', tok(b, 'param')],
              ['}'],
              [`let answer = ${fn}(`, tok(x, 'num'), ', ', tok(y, 'num'), ')'],
              ['console.log(', tok('answer', 'name'), ')'],
            ],
            must: ['num'],
            count: 3,
            pools: { param: [x, y], num: [x, y, x + y], name: [fn, a] },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: 'Arguments fill in parameters in order, so the order in the call has to match the math.',
          });
        },
      },
      {
        id: 'if-with-returns',
        make(r) {
          const fn = r.pick(['bigger', 'larger', 'maxOfTwo']);
          const [a, b] = r.pick(PARAM_SETS);
          return kit.blanksQuestion(r, {
            prompt: `Complete ${fn} so it returns whichever input is bigger.`,
            lines: [
              [`function ${fn}(${a}, ${b}){`],
              ['  if(', tok(a, 'param'), ' ', tok('>', 'op'), ' ', tok(b, 'param'), '){'],
              ['    ', tok('return', 'word'), ' ', tok(a, 'param')],
              ['  }'],
              ['  else{'],
              ['    ', tok('return', 'word'), ' ', tok(b, 'param')],
              ['  }'],
              ['}'],
            ],
            must: ['word', 'op'],
            count: 4,
            pools: { word: ['console.log', 'let'], op: ['<', '=='], param: [a, b] },
            spec: {
              kind: 'snippet',
              hiddenSuffix: [`console.log(${fn}(3, 8))`, `console.log(${fn}(9, 2))`],
              vectors: [{}],
            },
            explain: 'Each branch needs return to send its answer back.',
          });
        },
      },
      {
        id: 'store-the-result',
        make(r) {
          const m = mystery(r);
          const [a] = m.params;
          const step = r.int(2, 6);
          const x = r.int(2, 9);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so the value ${m.fn} returns is stored in answer, and then answer gets printed.`,
            lines: [
              [`function ${m.fn}(${a}){`],
              [`  return ${a} * ${step}`],
              ['}'],
              [tok('let', 'word'), ' ', tok('answer', 'name'), ' = ', tok(m.fn, 'fn'), `(${x})`],
              ['console.log(', tok('answer', 'name'), ')'],
            ],
            must: ['fn', 'name'],
            count: 3,
            pools: { word: ['return', 'function'], name: [a, m.fn], fn: [a, 'answer'] },
            spec: { kind: 'snippet', vectors: [{}] },
            explain: 'A call can go on the right side of =, and the returned value gets stored.',
          });
        },
      },
    ],
  };

  const scramble = (rules) => `Put these lines in order so the code does this:\n${numberedRules(rules)}`;
  const inputsOf = (a, b) => [{ inputs: { a: 3, b: 8 } }, { inputs: { a: 9, b: 2 } }, { inputs: { a: 5, b: 5 } }].map((vec) => ({
    inputs: { [a]: vec.inputs.a, [b]: vec.inputs.b },
  }));

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting a function that returns a value in order',
    patterns: [
      {
        id: 'one-step-then-print',
        make(r) {
          const m = mystery(r);
          const [a, b] = m.params;
          const [x, y] = [r.int(2, 9), r.int(2, 9)];
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Define ${m.fn}, which takes ${a} and ${b}, stores ${a} * ${b} in ${m.ans}, and returns ${m.ans}.`,
              `Call ${m.fn} with ${x} and ${y}, and store the answer in result.`,
              'Print result.',
            ]),
            movable: [
              `function ${m.fn}(${a}, ${b}){`,
              `let ${m.ans} = ${a} * ${b}`,
              `return ${m.ans}`,
              '}',
              { text: `let result = ${m.fn}(${x}, ${y})`, run: `let result = ${m.fn}(__in.${a}, __in.${b})` },
              'console.log(result)',
            ],
            spec: { kind: 'snippet', vectors: inputsOf(a, b) },
            explain: 'The return goes last inside the function, after the value is worked out. Then the call stores what comes back.',
          });
        },
      },
      {
        id: 'two-steps',
        make(r) {
          const m = mystery(r);
          const [a, b] = m.params;
          const step = r.int(2, 6);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Inside ${m.fn}, store ${a} + ${b} in ${m.ans}.`,
              `Then change ${m.ans} to ${m.ans} * ${step}.`,
              `Then return ${m.ans}.`,
              'Outside the function, print what it returns.',
            ]),
            prefix: [{ text: `function ${m.fn}(${a}, ${b}){` }],
            movable: [`let ${m.ans} = ${a} + ${b}`, `${m.ans} = ${m.ans} * ${step}`, `return ${m.ans}`, '}', { text: `console.log(${m.fn}(4, 6))`, run: `console.log(${m.fn}(__in.${a}, __in.${b}))` }],
            spec: { kind: 'snippet', vectors: inputsOf(a, b) },
            explain: 'A variable has to exist before it can change. Any line after return would never run.',
          });
        },
      },
      {
        id: 'if-with-returns',
        make(r) {
          const fn = r.pick(['bigger', 'larger', 'maxOfTwo']);
          const [a, b] = r.pick(PARAM_SETS);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `If ${a} is greater than ${b}, return ${a}.`,
              `Otherwise, return ${b}.`,
              `Outside the function, print what it returns.`,
            ]),
            prefix: [{ text: `function ${fn}(${a}, ${b}){` }],
            movable: [`if(${a} > ${b}){`, `return ${a}`, '}', 'else{', `return ${b}`, '}', '}', { text: `console.log(${fn}(4, 6))`, run: `console.log(${fn}(__in.${a}, __in.${b}))` }],
            spec: { kind: 'snippet', vectors: inputsOf(a, b) },
            explain: 'Each return goes inside its own branch. The function closes after the whole if and else.',
          });
        },
      },
      {
        id: 'use-the-answer-twice',
        make(r) {
          const m = mystery(r);
          const [a] = m.params;
          const step = r.int(2, 6);
          const x = r.int(2, 9);
          return kit.parsonsQuestion(r, {
            prompt: scramble([
              `Define ${m.fn}, which returns ${a} * ${step}.`,
              `Store ${m.fn}(${x}) in first.`,
              `Store ${m.fn}(first) in second.`,
              'Print second.',
            ]),
            movable: [`function ${m.fn}(${a}){`, `return ${a} * ${step}`, '}', `let first = ${m.fn}(${x})`, `let second = ${m.fn}(first)`, 'console.log(second)'],
            spec: { kind: 'snippet', vectors: [{}] },
            explain: 'first has to be stored before it can be passed in, and second has to be stored before it can print.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA3.2',
    title: 'Functions that Return Values',
    unit: 2,
    source: 'curriculum/02-unit-2/09-U2LA3.2-Functions-that-Return-Values.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: false,
    },
    notYetTaught: [
      [/mouseIsPressed|mousePressed|keyIsPressed/, 'clicks and keys (U2LA4.2 and U2LA5.1)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [returnSlot, vocabSlot, traceSlot, pseudoSlot, chainSlot, flowSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['trace', 'pseudocode', 'parsons', 'returnMeaning', 'blanks', 'chained', 'bug', 'lines', 'vocab'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
