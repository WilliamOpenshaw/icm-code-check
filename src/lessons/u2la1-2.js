// U2LA1.2: Conditionals and if, else if, and else statements
// curriculum/02-unit-2/03-U2LA1.2-Conditionals-and-if-else-if-and-else-statements.md
//
// Students at this point have seen: variables, functions with parameters, mouseX/mouseY,
// color(), comparing with == != < > <= >=, if, else if, and else.
// They have NOT seen: && or ||, return values, loops, arrays, or objects.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    side, tok, log, chainLines, ifBlock, numberedRules, WHY, lit,
  } = kit;

  // Three dividing values, biggest first.
  const pickThree = (r, v) => r.sample(v.thresholds.length >= 3 ? v.thresholds : v.thresholds.concat(v.hi - v.step), 3).sort((a, b) => b - a);

  // A chain of tiers such as: at least 90, at least 70, at least 50, otherwise.
  function tiers(r) {
    const s = kit.pickScene(r);
    const v = s.a;
    const [t1, t2, t3] = pickThree(r, v);
    return {
      v, t1, t2, t3, messages: s.outcomes.slice(0, 4),
    };
  }

  const chainOf = (conds, messages) => chainLines(
    conds.map((cond, i) => ({ cond, body: log(messages[i]) })),
    log(messages[conds.length]),
  );

  const FIRST_TRUE = 'The program checks each condition in order. It runs the first true one, then skips the rest of the chain.';

  const traceSlot = {
    id: 'chainTrace',
    skill: 'flow',
    concept: 'Following if / else if / else: the first true condition wins',
    patterns: [
      {
        id: 'at-least-tiers',
        make(r) {
          const {
            v, t1, t2, t3, messages,
          } = tiers(r);
          const value = r.pick(kit.valuesOf(v));
          const [m1, m2, m3, m4] = messages;
          return kit.traceChoice(r, {
            code: [`let ${v.name} = ${value}`].concat(chainOf([`${v.name} >= ${t1}`, `${v.name} >= ${t2}`, `${v.name} >= ${t3}`], messages)),
            wrong: [[m1], [m2], [m3], [m4], [m1, m2], [m2, m3]],
            explain: FIRST_TRUE,
          });
        },
      },
      {
        id: 'below-tiers',
        make(r) {
          const {
            v, t1, t2, t3, messages,
          } = tiers(r);
          const value = r.pick(kit.valuesOf(v));
          const [m1, m2, m3, m4] = messages;
          return kit.traceChoice(r, {
            code: [`let ${v.name} = ${value}`].concat(chainOf([`${v.name} < ${t3}`, `${v.name} < ${t2}`, `${v.name} < ${t1}`], messages)),
            wrong: [[m1], [m2], [m3], [m4], [m1, m2], [m2, m3]],
            explain: FIRST_TRUE,
          });
        },
      },
      {
        id: 'matching-words',
        make(r) {
          const w = kit.pickWordVar(r);
          const [a, b, c] = r.sample(w.values, 3);
          const value = r.pick(w.values);
          const [m1, m2, m3, m4] = kit.pickScene(r).outcomes;
          return kit.traceChoice(r, {
            code: [`let ${w.name} = ${lit(value)}`].concat(chainOf([`${w.name} == ${lit(a)}`, `${w.name} == ${lit(b)}`, `${w.name} == ${lit(c)}`], [m1, m2, m3, m4])),
            wrong: [[m1], [m2], [m3], [m4]],
            explain: 'Only one of these can match. If none of them do, the else runs.',
          });
        },
      },
      {
        id: 'two-variables',
        make(r) {
          const s = kit.pickScene(r);
          const values = kit.sceneValues(r, s)();
          const [m1, m2, m3] = s.outcomes;
          const A = side(s.a, kit.pickOp(r), s.a.t);
          const B = side(s.b, kit.pickOp(r), s.b.t);
          return kit.traceChoice(r, {
            code: kit.letLines(values).concat(chainOf([A.text, B.text], [m1, m2, m3])),
            wrong: [[m1], [m2], [m3], [m1, m2], []],
            explain: `${FIRST_TRUE} If the first condition is true, the else if never gets checked.`,
          });
        },
      },
    ],
  };

  const WHICH_PROMPT = (name, message) => `Which value of ${name} makes this code print "${message}"?`;

  function satisfyQuestion(r, { name, code, message, values, branchOf, target, show }) {
    const hits = values.filter((n) => branchOf(n) === target);
    const misses = r.sample(values.filter((n) => branchOf(n) !== target), 3);
    const correct = r.pick(hits);
    return kit.choiceQuestion(r, {
      prompt: WHICH_PROMPT(name, message),
      code,
      correct: show(correct),
      wrong: misses.map(show),
      codeOptions: true,
      explain: `With ${name} = ${show(correct)}, the chain ends up at "${message}". Try each value, checking the conditions from the top.`,
    });
  }

  const satisfySlot = {
    id: 'satisfy',
    skill: 'concepts',
    concept: 'Working out what value satisfies a condition',
    patterns: [
      {
        id: 'at-least-tiers',
        make(r) {
          const {
            v, t1, t2, messages,
          } = tiers(r);
          const conds = [`${v.name} >= ${t1}`, `${v.name} >= ${t2}`];
          const target = r.int(0, 2);
          const trio = messages.slice(0, 3);
          return satisfyQuestion(r, {
            name: v.name,
            code: chainOf(conds, trio),
            message: trio[target],
            values: kit.valuesOf(v),
            branchOf: (n) => kit.firstTrue(conds, { [v.name]: n }),
            target,
            show: String,
          });
        },
      },
      {
        id: 'below-tiers',
        make(r) {
          const {
            v, t1, t2, messages,
          } = tiers(r);
          const conds = [`${v.name} < ${t2}`, `${v.name} < ${t1}`];
          const target = r.int(0, 2);
          const trio = messages.slice(0, 3);
          return satisfyQuestion(r, {
            name: v.name,
            code: chainOf(conds, trio),
            message: trio[target],
            values: kit.valuesOf(v),
            branchOf: (n) => kit.firstTrue(conds, { [v.name]: n }),
            target,
            show: String,
          });
        },
      },
      {
        id: 'matching-words',
        make(r) {
          const w = kit.pickWordVar(r);
          const [a, b] = r.sample(w.values, 2);
          const conds = [`${w.name} == ${lit(a)}`, `${w.name} == ${lit(b)}`];
          const trio = kit.pickScene(r).outcomes.slice(0, 3);
          const target = r.int(0, 1);
          return satisfyQuestion(r, {
            name: w.name,
            code: chainOf(conds, trio),
            message: trio[target],
            values: w.values,
            branchOf: (n) => kit.firstTrue(conds, { [w.name]: n }),
            target,
            show: lit,
          });
        },
      },
      {
        id: 'mouse-position',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const conds = [`mouseX > ${c.cx}`, `mouseX < ${c.cx}`];
          const trio = kit.pickScene(r).outcomes.slice(0, 3);
          const target = r.int(0, 2);
          const values = [c.cx, c.cx - 50, c.cx - 100, c.cx + 50, c.cx + 100, c.cx - 10, c.cx + 10];
          return satisfyQuestion(r, {
            name: 'mouseX',
            code: chainOf(conds, trio),
            message: trio[target],
            values,
            branchOf: (n) => kit.firstTrue(conds, { mouseX: n }),
            target,
            show: String,
          });
        },
      },
    ],
  };

  const ELSE_PROMPT = 'When does the else part of this code run?';

  const elseSlot = {
    id: 'elseMeaning',
    skill: 'concepts',
    concept: 'Knowing when else runs',
    patterns: [
      {
        id: 'above-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          return kit.choiceQuestion(r, {
            prompt: ELSE_PROMPT,
            code: chainOf([`${v.name} > ${t1}`, `${v.name} > ${t2}`], messages),
            correct: `Only when ${v.noun} is ${t2} or less`,
            wrong: [`Only when ${v.noun} is above ${t1}`, `Only when ${v.noun} is above ${t2} but not above ${t1}`, 'Every time, after the other parts finish'],
            explain: `else runs only when every condition before it was false. That means ${v.name} is not above ${t1} and not above ${t2}.`,
          });
        },
      },
      {
        id: 'below-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          return kit.choiceQuestion(r, {
            prompt: ELSE_PROMPT,
            code: chainOf([`${v.name} < ${t2}`, `${v.name} < ${t1}`], messages),
            correct: `Only when ${v.noun} is ${t1} or more`,
            wrong: [`Only when ${v.noun} is below ${t2}`, `Only when ${v.noun} is below ${t1} but not below ${t2}`, 'Every time, after the other parts finish'],
            explain: `else runs only when every condition before it was false. That means ${v.name} is not below ${t2} and not below ${t1}.`,
          });
        },
      },
      {
        id: 'words',
        make(r) {
          const w = kit.pickWordVar(r);
          const [a, b] = r.sample(w.values, 2);
          const messages = kit.pickScene(r).outcomes;
          return kit.choiceQuestion(r, {
            prompt: ELSE_PROMPT,
            code: chainOf([`${w.name} == ${lit(a)}`, `${w.name} == ${lit(b)}`], messages),
            correct: `Only when ${w.noun} is neither ${a} nor ${b}`,
            wrong: [`Only when ${w.noun} is ${a}`, `Only when ${w.noun} is ${b}`, 'Every time, after the other parts finish'],
            explain: 'else handles everything the conditions above it did not catch.',
          });
        },
      },
      {
        id: 'exact-middle',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const messages = kit.pickScene(r).outcomes;
          return kit.choiceQuestion(r, {
            prompt: ELSE_PROMPT,
            code: chainOf([`mouseX > ${c.cx}`, `mouseX < ${c.cx}`], messages),
            correct: `Only when mouseX is exactly ${c.cx}`,
            wrong: [`Only when mouseX is above ${c.cx}`, `Only when mouseX is below ${c.cx}`, 'It can never run, because one of the other two is always true'],
            explain: `At exactly ${c.cx}, mouseX is neither above nor below ${c.cx}, so both conditions are false and the else runs.`,
          });
        },
      },
    ],
  };

  const mouseSlot = {
    id: 'mouseRows',
    skill: 'flow',
    concept: 'Predicting what a chain does at different mouse positions',
    patterns: [
      {
        id: 'left-right-middle',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          const y = () => 10 * r.int(1, c.h / 10 - 1);
          return kit.colorRows(r, {
            code: chainLines(
              [{ cond: `mouseX > ${c.cx}`, body: kit.setColor(V, colors[0]) }, { cond: `mouseX < ${c.cx}`, body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            points: [
              { mouseX: c.cx + 10 * r.int(1, 5), mouseY: y() },
              { mouseX: c.cx - 10 * r.int(1, 5), mouseY: y() },
              { mouseX: c.cx, mouseY: y() },
            ],
            explain: `At exactly ${c.cx}, both conditions are false, so the else runs.`,
          });
        },
      },
      {
        id: 'top-bottom-middle',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          const x = () => 10 * r.int(1, c.w / 10 - 1);
          return kit.colorRows(r, {
            code: chainLines(
              [{ cond: `mouseY < ${c.cy}`, body: kit.setColor(V, colors[0]) }, { cond: `mouseY > ${c.cy}`, body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            points: [
              { mouseX: x(), mouseY: c.cy - 10 * r.int(1, 5) },
              { mouseX: x(), mouseY: c.cy + 10 * r.int(1, 5) },
              { mouseX: x(), mouseY: c.cy },
            ],
            explain: `At exactly ${c.cy}, both conditions are false, so the else runs.`,
          });
        },
      },
      {
        id: 'thirds-of-the-canvas',
        make(r) {
          const h = r.pick([300, 450, 600]);
          const a = h / 3;
          const b = (2 * h) / 3;
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.light);
          const x = () => 10 * r.int(1, 39);
          return kit.colorRows(r, {
            code: chainLines(
              [{ cond: `mouseY < ${a}`, body: kit.setColor(V, colors[0]) }, { cond: `mouseY < ${b}`, body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            points: [
              { mouseX: x(), mouseY: a - 20 },
              { mouseX: x(), mouseY: a + 20 },
              { mouseX: x(), mouseY: b + 20 },
              { mouseX: x(), mouseY: a },
            ],
            explain: `Once mouseY < ${a} is true, the chain stops. So the second condition only runs for values that are at least ${a}.`,
          });
        },
      },
      {
        id: 'two-directions',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const colors = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          return kit.colorRows(r, {
            code: chainLines(
              [{ cond: `mouseX > ${c.cx}`, body: kit.setColor(V, colors[0]) }, { cond: `mouseY > ${c.cy}`, body: kit.setColor(V, colors[1]) }],
              kit.setColor(V, colors[2]),
            ),
            varName: V,
            colors,
            points: [
              { mouseX: c.cx + 20, mouseY: c.cy + 20 },
              { mouseX: c.cx - 20, mouseY: c.cy + 20 },
              { mouseX: c.cx - 20, mouseY: c.cy - 20 },
              { mouseX: c.cx, mouseY: c.cy },
            ],
            explain: `If mouseX > ${c.cx} is true, the chain stops there, even if mouseY > ${c.cy} is also true.`,
          });
        },
      },
    ],
  };

  const flowSlot = {
    id: 'lines',
    skill: 'flow',
    concept: 'Seeing which lines of code run',
    patterns: [
      {
        id: 'chain-then-more',
        make(r) {
          return kit.buildFlow(r, () => {
            const { v, t1, t2, messages } = tiers(r);
            return [`let ${v.name} = ${r.pick(kit.valuesOf(v))}`, log('Starting')].concat(
              chainOf([`${v.name} >= ${t1}`, `${v.name} >= ${t2}`], messages),
              [log('Finished')],
            );
          }, 'Only one branch of a chain runs. Lines outside the chain always run.');
        },
      },
      {
        id: 'two-chains',
        make(r) {
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const [m1, m2, m3, m4] = s.outcomes;
            const values = kit.sceneValues(r, s)();
            const a = side(s.a, kit.pickOp(r), r.pick(s.a.thresholds));
            const b = side(s.b, kit.pickOp(r), r.pick(s.b.thresholds));
            const b2 = side(s.b, kit.pickOp(r), r.pick(s.b.thresholds));
            return kit.letLines(values).concat(
              chainLines([{ cond: a.text, body: log(m1) }], log(m2)),
              chainLines([{ cond: b.text, body: log(m3) }, { cond: b2.text, body: log(m4) }]),
            );
          }, 'Each chain makes its own decision, so the second one gets checked no matter what the first one did.');
        },
      },
      {
        id: 'chain-with-no-else',
        make(r) {
          return kit.buildFlow(r, () => {
            const { v, t1, t2, messages } = tiers(r);
            return [`let ${v.name} = ${r.pick(kit.valuesOf(v))}`].concat(
              chainLines([{ cond: `${v.name} < ${t2}`, body: log(messages[0]) }, { cond: `${v.name} > ${t1}`, body: log(messages[1]) }]),
              [log('Finished')],
            );
          }, 'Without an else, it\'s possible that none of the branches run.', { minHits: 1 });
        },
      },
      {
        id: 'value-changes-inside',
        make(r) {
          return kit.buildFlow(r, () => {
            const { v, t1, messages } = tiers(r);
            const n = v.name;
            const change = v.step * r.int(2, 6);
            return [`let ${n} = ${r.pick(kit.valuesOf(v))}`].concat(
              chainLines([{ cond: `${n} > ${t1}`, body: `${n} = ${n} - ${change}` }], `${n} = ${n} + ${change}`),
              chainLines([{ cond: `${n} > ${t1}`, body: log(messages[0]) }], log(messages[1])),
            );
          }, 'The first chain changes the variable, so the second chain checks the new value.');
        },
      },
    ],
  };

  // Each version of the code has to really behave differently from the right one.
  function orderQuestion(r, { rule, correct, wrong, spec, explain }) {
    const run = (lines) => [].concat(kit.fromInputs(spec.names, spec.lets), lines).join('\n');
    wrong.forEach((lines) => {
      if (CC.sameBehavior(spec, run(correct), run(lines))) throw new Error(`A wrong version works:\n${lines.join('\n')}`);
    });
    return kit.choiceQuestion(r, {
      prompt: 'Which version of the code follows this rule?',
      rule,
      correct: correct.join('\n'),
      wrong: wrong.map((lines) => lines.join('\n')),
      codeOptions: true,
      explain,
    });
  }

  const orderSlot = {
    id: 'order',
    skill: 'concepts',
    concept: 'Choosing an order for the conditions in a chain',
    patterns: [
      {
        id: 'at-least-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          const n = v.name;
          return orderQuestion(r, {
            rule: `Print "${m1}" when ${v.noun} is at least ${t1}, "${m2}" when it is at least ${t2} but below ${t1}, and "${m3}" otherwise.`,
            correct: chainOf([`${n} >= ${t1}`, `${n} >= ${t2}`], [m1, m2, m3]),
            wrong: [
              chainOf([`${n} >= ${t2}`, `${n} >= ${t1}`], [m2, m1, m3]),
              ifBlock(`${n} >= ${t1}`, log(m1)).concat(chainLines([{ cond: `${n} >= ${t2}`, body: log(m2) }], log(m3))),
              chainOf([`${n} <= ${t1}`, `${n} <= ${t2}`], [m1, m2, m3]),
            ],
            spec: {
              kind: 'snippet', names: [n], lets: [`let ${n} = 0`], vectors: kit.sceneVectors([side(v, '>=', t1), side(v, '>=', t2)]),
            },
            explain: `Check ${t1} first. If you check ${t2} first, it catches the values that are at least ${t1} too. Separate ifs would let two messages print.`,
          });
        },
      },
      {
        id: 'below-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          const n = v.name;
          return orderQuestion(r, {
            rule: `Print "${m1}" when ${v.noun} is below ${t2}, "${m2}" when it is at least ${t2} but below ${t1}, and "${m3}" otherwise.`,
            correct: chainOf([`${n} < ${t2}`, `${n} < ${t1}`], [m1, m2, m3]),
            wrong: [
              chainOf([`${n} < ${t1}`, `${n} < ${t2}`], [m2, m1, m3]),
              ifBlock(`${n} < ${t2}`, log(m1)).concat(chainLines([{ cond: `${n} < ${t1}`, body: log(m2) }], log(m3))),
              chainOf([`${n} > ${t2}`, `${n} > ${t1}`], [m1, m2, m3]),
            ],
            spec: {
              kind: 'snippet', names: [n], lets: [`let ${n} = 0`], vectors: kit.sceneVectors([side(v, '<', t1), side(v, '<', t2)]),
            },
            explain: `Check the smaller value first. If you check ${t1} first, it catches the values below ${t2} too. Separate ifs would let two messages print.`,
          });
        },
      },
      {
        id: 'exact-then-range',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          const n = v.name;
          return orderQuestion(r, {
            rule: `Print "${m1}" when ${v.noun} is exactly ${t1}, "${m2}" when it is above ${t2} but not exactly ${t1}, and "${m3}" otherwise.`,
            correct: chainOf([`${n} == ${t1}`, `${n} > ${t2}`], [m1, m2, m3]),
            wrong: [
              chainOf([`${n} > ${t2}`, `${n} == ${t1}`], [m2, m1, m3]),
              ifBlock(`${n} == ${t1}`, log(m1)).concat(chainLines([{ cond: `${n} > ${t2}`, body: log(m2) }], log(m3))),
              chainOf([`${n} != ${t1}`, `${n} > ${t2}`], [m1, m2, m3]),
            ],
            spec: {
              kind: 'snippet', names: [n], lets: [`let ${n} = 0`], vectors: kit.sceneVectors([side(v, '==', t1), side(v, '>', t2)]),
            },
            explain: `The exact match has to come first, because ${t1} is also above ${t2} and the bigger condition would catch it.`,
          });
        },
      },
    ],
  };

  const printSlot = {
    id: 'printOrder',
    skill: 'flow',
    concept: 'Seeing that code runs from top to bottom',
    patterns: [
      {
        id: 'print-before-the-change',
        make(r) {
          const s = kit.pickScene(r);
          const [m1, m2, m3] = s.outcomes;
          const A = side(s.a, kit.pickOp(r), s.a.t);
          const value = r.pick(kit.valuesOf(s.a));
          return kit.traceChoice(r, {
            code: [`let ${s.a.name} = ${value}`, `let message = "${m1}"`, 'console.log(message)'].concat(
              chainLines([{ cond: A.text, body: `message = "${m2}"` }], `message = "${m3}"`),
            ),
            wrong: [[m1], [m2], [m3], [m1, m2]],
            explain: 'console.log runs before the chain changes the variable, so it prints the first value.',
          });
        },
      },
      {
        id: 'print-after-the-change',
        make(r) {
          const s = kit.pickScene(r);
          const [m1, m2, m3] = s.outcomes;
          const A = side(s.a, kit.pickOp(r), s.a.t);
          const value = r.pick(kit.valuesOf(s.a));
          return kit.traceChoice(r, {
            code: [`let ${s.a.name} = ${value}`, `let message = "${m1}"`].concat(
              chainLines([{ cond: A.text, body: `message = "${m2}"` }], `message = "${m3}"`),
              ['console.log(message)'],
            ),
            wrong: [[m1], [m2], [m3], [m1, m2]],
            explain: 'The chain runs first and changes the variable, so console.log prints the new value.',
          });
        },
      },
      {
        id: 'print-before-and-after',
        make(r) {
          const s = kit.pickScene(r);
          const [m1, m2] = s.outcomes;
          const A = side(s.a, kit.pickOp(r), s.a.t);
          const value = r.pick(kit.valuesOf(s.a));
          return kit.traceChoice(r, {
            code: [`let ${s.a.name} = ${value}`, `let message = "${m1}"`, 'console.log(message)'].concat(
              ifBlock(A.text, `message = "${m2}"`),
              ['console.log(message)'],
            ),
            wrong: [[m1, m1], [m1, m2], [m2, m2], [m2, m1], [m1]],
            explain: 'The variable only changes if the condition is true, and the first console.log has already run by then.',
          });
        },
      },
      {
        id: 'number-changes-along-the-way',
        make(r) {
          const s = kit.pickScene(r);
          const n = s.a.name;
          const start = r.pick(kit.valuesOf(s.a));
          const change = s.a.step * r.int(1, 5);
          const A = side(s.a, r.pick(['>', '<']), s.a.t);
          const code = [`let ${n} = ${start}`, `console.log(${n})`].concat(
            chainLines([{ cond: A.text, body: `${n} = ${n} + ${change}` }], `${n} = ${n} - ${change}`),
            [`console.log(${n})`],
          );
          return kit.printedNumber({
            prompt: 'What is the last number this code prints?',
            code,
            explain: `Check the condition with ${n} = ${start}, change ${n}, and then the last line prints its new value.`,
          });
        },
      },
    ],
  };

  const OTHER_REASONS = [WHY.elseIfCondition, WHY.elseLast, WHY.bracket, WHY.separateIf, WHY.order, WHY.assign];
  const others = (r, why) => r.sample(OTHER_REASONS.filter((reason) => reason !== why), 3);
  const FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in a chain',
    patterns: [
      {
        id: 'else-if-with-no-condition',
        make(r) {
          const { v, t1, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          const n = v.name;
          const lets = [`let ${n} = ${r.pick(kit.valuesOf(v))}`];
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}" when ${v.noun} is above ${t1}, "${m2}" when it is exactly ${t1}, and "${m3}" otherwise. ${FIND_BUG}`,
            code: lets.concat([`if(${n} > ${t1}){`, `  ${log(m1)}`, '}', 'else if{', `  ${log(m2)}`, '}', 'else{', `  ${log(m3)}`, '}']),
            bugLines: [4],
            why: WHY.elseIfCondition,
            others: others(r, WHY.elseIfCondition),
            fixed: lets.concat(chainOf([`${n} > ${t1}`, `${n} == ${t1}`], [m1, m2, m3])),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>', t1)]) },
            explain: `else if always needs a condition: else if(${n} == ${t1}){`,
          });
        },
      },
      {
        id: 'else-before-else-if',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          const n = v.name;
          const lets = [`let ${n} = ${r.pick(kit.valuesOf(v))}`];
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}" when ${v.noun} is above ${t1}, "${m2}" when it is above ${t2} but not above ${t1}, and "${m3}" otherwise. ${FIND_BUG}`,
            code: lets.concat([`if(${n} > ${t1}){`, `  ${log(m1)}`, '}', 'else{', `  ${log(m3)}`, '}', `else if(${n} > ${t2}){`, `  ${log(m2)}`, '}']),
            bugLines: [4, 7],
            why: WHY.elseLast,
            others: others(r, WHY.elseLast),
            fixed: lets.concat(chainOf([`${n} > ${t1}`, `${n} > ${t2}`], [m1, m2, m3])),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>', t1), side(v, '>', t2)]) },
            explain: 'The order is always if, then any else ifs, and then else last.',
          });
        },
      },
      {
        id: 'missing-bracket',
        make(r) {
          const { v, t1, messages } = tiers(r);
          const [m1, m2] = messages;
          const n = v.name;
          const lets = [`let ${n} = ${r.pick(kit.valuesOf(v))}`];
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}" when ${v.noun} is above ${t1}, and "${m2}" otherwise. ${FIND_BUG}`,
            code: lets.concat([`if(${n} > ${t1})`, `  ${log(m1)}`, '}', 'else{', `  ${log(m2)}`, '}']),
            bugLines: [1],
            why: WHY.bracket,
            others: others(r, WHY.bracket),
            fixed: lets.concat(chainOf([`${n} > ${t1}`], [m1, m2])),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>', t1)]) },
            explain: `The if line needs its opening bracket: if(${n} > ${t1}){`,
          });
        },
      },
      {
        id: 'separate-if',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          const n = v.name;
          const lets = [`let ${n} = ${r.pick(kit.valuesOf(v))}`];
          return kit.bugQuestion(r, {
            prompt: `This code should print only one message: "${m1}" when ${v.noun} is at least ${t1}, "${m2}" when it is at least ${t2} but below ${t1}, and "${m3}" otherwise. ${FIND_BUG}`,
            code: lets.concat(ifBlock(`${n} >= ${t1}`, log(m1)), chainLines([{ cond: `${n} >= ${t2}`, body: log(m2) }], log(m3))),
            bugLines: [4],
            why: WHY.separateIf,
            others: others(r, WHY.separateIf),
            fixed: lets.concat(chainOf([`${n} >= ${t1}`, `${n} >= ${t2}`], [m1, m2, m3])),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>=', t1), side(v, '>=', t2)]) },
            explain: `With a separate if, a value of at least ${t1} prints two messages. It should be else if(${n} >= ${t2}){`,
          });
        },
      },
      {
        id: 'wrong-order',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          const n = v.name;
          const lets = [`let ${n} = ${r.pick(kit.valuesOf(v))}`];
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}" when ${v.noun} is at least ${t1}, "${m2}" when it is at least ${t2} but below ${t1}, and "${m3}" otherwise. "${m1}" never prints. Tap a line that causes the bug, then choose why it is wrong.`,
            code: lets.concat(chainOf([`${n} >= ${t2}`, `${n} >= ${t1}`], [m2, m1, m3])),
            bugLines: [1, 4],
            why: WHY.order,
            others: others(r, WHY.order),
            fixed: lets.concat(chainOf([`${n} >= ${t1}`, `${n} >= ${t2}`], [m1, m2, m3])),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>=', t1), side(v, '>=', t2)]) },
            explain: `Any value at least ${t1} is also at least ${t2}, so the first condition catches it. Check ${t1} first.`,
          });
        },
      },
    ],
  };

  const KW_POOL = ['if', 'else if', 'else'];
  const blankChain = (branches, elseBody) => {
    const lines = [];
    branches.forEach((b, i) => {
      lines.push((i === 0 ? ['if('] : [tok('else if', 'kw'), '(']).concat(b.cond, ['){']));
      lines.push(['  '].concat(b.body));
      lines.push({ text: '}' });
    });
    lines.push([tok('else', 'kw'), '{']);
    lines.push(['  '].concat(elseBody));
    lines.push({ text: '}' });
    return lines;
  };
  const comparePiece = (name, op, value) => [tok(name, 'var'), ' ', tok(op, 'op'), ' ', tok(value, 'num')];
  const printPiece = (message) => ['console.log(', tok(lit(message), 'msg'), ')'];
  const followRules = (rules) => `Complete the code so it follows these rules, in this order:\n${numberedRules(rules)}`;

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing an if / else if / else chain',
    patterns: [
      {
        id: 'at-least-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          return kit.blanksQuestion(r, {
            prompt: followRules([
              `If ${v.noun} is at least ${t1}, print "${m1}".`,
              `Otherwise, if it is at least ${t2}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ]),
            lines: [{ text: `let ${v.name} = ${t1}`, run: `let ${v.name} = __in.${v.name}` }].concat(blankChain(
              [{ cond: comparePiece(v.name, '>=', t1), body: printPiece(m1) }, { cond: comparePiece(v.name, '>=', t2), body: printPiece(m2) }],
              printPiece(m3),
            )),
            must: ['kw', 'op'],
            count: 4,
            pools: {
              kw: KW_POOL, op: ['>', '<', '<=', '=='], var: [v.name], num: v.thresholds, msg: messages.map(lit),
            },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>=', t1), side(v, '>=', t2)]) },
            explain: '"Otherwise, if" is an else if. "In every other case" is an else.',
          });
        },
      },
      {
        id: 'below-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          return kit.blanksQuestion(r, {
            prompt: followRules([
              `If ${v.noun} is below ${t2}, print "${m1}".`,
              `Otherwise, if it is below ${t1}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ]),
            lines: [{ text: `let ${v.name} = ${t2}`, run: `let ${v.name} = __in.${v.name}` }].concat(blankChain(
              [{ cond: comparePiece(v.name, '<', t2), body: printPiece(m1) }, { cond: comparePiece(v.name, '<', t1), body: printPiece(m2) }],
              printPiece(m3),
            )),
            must: ['kw', 'op'],
            count: 4,
            pools: {
              kw: KW_POOL, op: ['>', '>=', '<=', '=='], var: [v.name], num: v.thresholds, msg: messages.map(lit),
            },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '<', t1), side(v, '<', t2)]) },
            explain: '"Otherwise, if" is an else if. "In every other case" is an else.',
          });
        },
      },
      {
        id: 'matching-words',
        make(r) {
          const w = kit.pickWordVar(r);
          const [a, b] = r.sample(w.values, 2);
          const [m1, m2, m3, m4] = kit.pickScene(r).outcomes;
          const wordPiece = (word) => [tok(w.name, 'var'), ' ', tok('==', 'op'), ' ', tok(lit(word), 'str')];
          return kit.blanksQuestion(r, {
            prompt: followRules([
              `If ${w.noun} is ${a}, print "${m1}".`,
              `Otherwise, if it is ${b}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ]),
            lines: [{ text: `let ${w.name} = ${lit(a)}`, run: `let ${w.name} = __in.${w.name}` }].concat(blankChain(
              [{ cond: wordPiece(a), body: printPiece(m1) }, { cond: wordPiece(b), body: printPiece(m2) }],
              printPiece(m3),
            )),
            must: ['kw', 'str'],
            count: 4,
            pools: {
              kw: KW_POOL, op: ['!=', '='], var: [w.name], str: w.values.map(lit).concat(a), msg: [m1, m2, m3, m4].map(lit),
            },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(w, '==', a)]) },
            explain: 'Comparing words uses == and quotation marks. "Otherwise, if" is an else if.',
          });
        },
      },
      {
        id: 'mouse-sides',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.shape);
          return kit.blanksQuestion(r, {
            prompt: followRules([
              `On ${kit.canvasName(c)}, if the mouse is on the right side, make ${V} ${c1.name}.`,
              `Otherwise, if the mouse is on the left side, make ${V} ${c2.name}.`,
              `In every other case, when the mouse is exactly in the middle, make ${V} ${c3.name}.`,
            ]),
            lines: blankChain(
              [{ cond: comparePiece('mouseX', '>', c.cx), body: [kit.setColor(V, c1)] }, { cond: comparePiece('mouseX', '<', c.cx), body: [kit.setColor(V, c2)] }],
              [kit.setColor(V, c3)],
            ),
            must: ['kw', 'op'],
            count: 4,
            pools: {
              kw: KW_POOL, op: ['>', '<', '=='], var: ['mouseX', 'mouseY'], num: [c.cx, c.cx + 50, c.cx + 100],
            },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V} = "none"`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy], [{ mouseX: c.cx, mouseY: 10 }, { mouseX: c.cx, mouseY: c.h - 10 }]),
            },
            explain: `A bigger mouseX is further right. At exactly ${c.cx}, both conditions are false, so the else runs.`,
          });
        },
      },
    ],
  };

  const SCRAMBLE_PROMPT = 'Put these lines in order so the code does this:';
  const scrambleRules = (rules) => `${SCRAMBLE_PROMPT}\n${numberedRules(rules)}`;
  const PAIRING = 'An if comes first, then else if, then else. Each message goes right after the condition it belongs to.';

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting scrambled if / else if / else code in order',
    patterns: [
      {
        id: 'at-least-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          return kit.parsonsQuestion(r, {
            prompt: scrambleRules([`If ${v.noun} is at least ${t1}, print "${m1}".`, `Otherwise, if it is at least ${t2}, print "${m2}".`, `In every other case, print "${m3}".`]),
            prefix: [{ text: `let ${v.name} = ${t1}`, run: `let ${v.name} = __in.${v.name}` }],
            movable: chainOf([`${v.name} >= ${t1}`, `${v.name} >= ${t2}`], [m1, m2, m3]),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>=', t1), side(v, '>=', t2)]) },
            explain: PAIRING,
          });
        },
      },
      {
        id: 'below-tiers',
        make(r) {
          const { v, t1, t2, messages } = tiers(r);
          const [m1, m2, m3] = messages;
          return kit.parsonsQuestion(r, {
            prompt: scrambleRules([`If ${v.noun} is below ${t2}, print "${m1}".`, `Otherwise, if it is below ${t1}, print "${m2}".`, `In every other case, print "${m3}".`]),
            prefix: [{ text: `let ${v.name} = ${t1}`, run: `let ${v.name} = __in.${v.name}` }],
            movable: chainOf([`${v.name} < ${t2}`, `${v.name} < ${t1}`], [m1, m2, m3]),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '<', t1), side(v, '<', t2)]) },
            explain: PAIRING,
          });
        },
      },
      {
        id: 'matching-words',
        make(r) {
          const w = kit.pickWordVar(r);
          const [a, b] = r.sample(w.values, 2);
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          return kit.parsonsQuestion(r, {
            prompt: scrambleRules([`If ${w.noun} is ${a}, print "${m1}".`, `Otherwise, if it is ${b}, print "${m2}".`, `In every other case, print "${m3}".`]),
            prefix: [{ text: `let ${w.name} = ${lit(a)}`, run: `let ${w.name} = __in.${w.name}` }],
            movable: chainOf([`${w.name} == ${lit(a)}`, `${w.name} == ${lit(b)}`], [m1, m2, m3]),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(w, '==', a)]) },
            explain: PAIRING,
          });
        },
      },
      {
        id: 'mouse-sketch',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          return kit.parsonsQuestion(r, {
            prompt: scrambleRules([
              `On ${kit.canvasName(c)}, if the mouse is on the right side, make ${V} ${c1.name}.`,
              `Otherwise, if the mouse is on the left side, make ${V} ${c2.name}.`,
              `In every other case, make ${V} ${c3.name}.`,
              `Paint the background with ${V}.`,
            ]),
            prefix: [{ text: 'function draw(){' }],
            movable: chainLines(
              [{ cond: `mouseX > ${c.cx}`, body: kit.setColor(V, c1) }, { cond: `mouseX < ${c.cx}`, body: kit.setColor(V, c2) }],
              kit.setColor(V, c3),
            ).concat([`background(${V})`]),
            suffix: [{ text: '}' }],
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${V}`, 'function setup(){', `  createCanvas(${c.w}, ${c.h})`, `  ${V} = color(255, 255, 255)`, '}'],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [], [{ mouseX: c.cx, mouseY: 10 }]),
            },
            explain: `${PAIRING} background() can go before or after them because draw() keeps repeating.`,
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA1.2',
    title: 'Conditionals and if, else if, and else',
    unit: 2,
    source: 'curriculum/02-unit-2/03-U2LA1.2-Conditionals-and-if-else-if-and-else-statements.md',
    defaults: {
      minutes: 20, questions: 11, attempts: 2, practice: true,
    },
    notYetTaught: [
      [/&&|\|\|/, '&& and || (U2LA1.3)'],
      [/\breturn\b/, 'return values (U2LA3.2)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [satisfySlot, elseSlot, orderSlot, traceSlot, mouseSlot, flowSlot, printSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['parsons', 'chainTrace', 'satisfy', 'blanks', 'lines', 'bug', 'elseMeaning', 'mouseRows', 'printOrder', 'order'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
