// U2LA1.1: Conditionals and If Statements
// curriculum/02-unit-2/02-U2LA1.1-Conditionals-and-If-Statements.md
//
// Students at this point have seen: variables, functions with parameters, mouseX/mouseY,
// color(), comparing with == != < > <= >=, if, and else.
// They have NOT seen: else if, && or ||, return values, loops, arrays, or objects.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    side, say, tok, log, chainLines, pickOp, yesNo, ifBlock, numberedRules, WHY, lit,
  } = kit;

  const TRUE_FALSE = [{ text: 'true' }, { text: 'false' }];
  const COMPARE_PROMPT = 'For each row, decide whether the expression is true or false.';
  const ALL_OPS = ['>', '<', '>=', '<=', '==', '!='];

  function expressionRows(r, { code, expressions, vars, explain }) {
    return kit.rowsQuestion({
      prompt: COMPARE_PROMPT,
      code,
      columns: ['Expression'],
      rows: r.shuffle(expressions).map((expr) => ({ cells: [expr], answer: CC.evalExpr(expr, vars || {}) ? 0 : 1 })),
      options: TRUE_FALSE,
      explain,
    });
  }

  // A mix that always has both kinds of answer, but not always the same split.
  const pickTruths = (r) => r.shuffle(r.pick([
    [true, true, false, false],
    [true, true, true, false],
    [true, false, false, false],
  ]));

  // sameSides makes both numbers match, for the row that checks > versus >=.
  function compareExpression(r, want, makeLeft, makeRight, sameSides) {
    for (let tries = 0; tries < 200; tries++) {
      const left = makeLeft();
      const op = r.pick(ALL_OPS);
      let right = makeRight();
      if (sameSides) right = left;
      else if (right === left) continue;
      const expr = `${left} ${op} ${right}`;
      if (!!CC.evalExpr(expr, {}) === want) return expr;
    }
    throw new Error('Could not build a comparison');
  }

  const compareSlot = {
    id: 'compare',
    skill: 'concepts',
    concept: 'Deciding whether a comparison is true or false',
    patterns: [
      {
        id: 'numbers',
        make(r) {
          const used = new Set();
          const expressions = pickTruths(r).map((want, i) => {
            for (;;) {
              const expr = compareExpression(r, want, () => r.int(2, 40), () => r.int(2, 40), i === 0);
              if (!used.has(expr)) {
                used.add(expr);
                return expr;
              }
            }
          });
          return expressionRows(r, {
            expressions,
            explain: 'Read each one as a question. For example, 26 > 5 asks "Is 26 greater than 5?" == asks whether two values are the same, and != asks whether they are different.',
          });
        },
      },
      {
        id: 'words',
        make(r) {
          const [a, b] = r.sample(kit.pickWordVar(r).values, 2);
          const lower = a.toLowerCase();
          return expressionRows(r, {
            expressions: r.sample([
              `"${a}" == "${a}"`,
              `"${a}" == "${b}"`,
              `"${a}" != "${b}"`,
              `"${b}" != "${b}"`,
              `"${a}" == "${lower === a ? a.toUpperCase() : lower}"`,
            ], 4),
            explain: '== checks whether two strings are exactly the same, and != checks whether they are different. Capital letters count, so "Cat" and "cat" are not the same.',
          });
        },
      },
      {
        id: 'variables',
        make(r) {
          const s = kit.pickScene(r);
          const a = r.pick(kit.valuesOf(s.a));
          const b = r.pick(kit.valuesOf(s.b));
          const vars = { [s.a.name]: a, [s.b.name]: b };
          for (;;) {
            const expressions = r.sample([
              `${s.a.name} > ${s.a.t}`,
              `${s.a.name} == ${a}`,
              `${s.a.name} != ${a}`,
              `${s.a.name} <= ${s.a.t}`,
              `${s.b.name} < ${s.b.t}`,
              `${s.b.name} >= ${s.b.t}`,
              `${s.b.name} == ${b + 1}`,
              `${s.b.name} != ${b + 1}`,
            ], 4);
            const answers = expressions.map((e) => !!CC.evalExpr(e, vars));
            if (answers.includes(true) && answers.includes(false)) {
              return expressionRows(r, {
                code: kit.letLines(vars),
                expressions,
                vars,
                explain: 'Put each variable\'s value into the expression, then read it as a question.',
              });
            }
          }
        },
      },
      {
        id: 'mouse-position',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const vars = { mouseX: 10 * r.int(2, c.w / 10 - 2), mouseY: 10 * r.int(2, c.h / 10 - 2) };
          for (;;) {
            const expressions = r.sample([
              `mouseX > ${c.cx}`,
              `mouseX < ${c.cx}`,
              `mouseY > ${c.cy}`,
              `mouseY < ${c.cy}`,
              `mouseX == ${vars.mouseX}`,
              `mouseY != ${vars.mouseY}`,
              `mouseX >= ${vars.mouseX}`,
              `mouseY <= ${vars.mouseY - 10}`,
            ], 4);
            const answers = expressions.map((e) => !!CC.evalExpr(e, vars));
            if (answers.includes(true) && answers.includes(false)) {
              return expressionRows(r, {
                code: [`/\/ The mouse is at mouseX = ${vars.mouseX}, mouseY = ${vars.mouseY}`],
                expressions,
                vars,
                explain: 'mouseX and mouseY hold the mouse\'s current position, so use those values in each comparison.',
              });
            }
          }
        },
      },
    ],
  };

  const traceSlot = {
    id: 'traceIf',
    skill: 'flow',
    concept: 'Following an if and else',
    patterns: [
      {
        id: 'number-if-else',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const value = r.pick(kit.valuesOf(s.a));
          const [m1, m2] = s.outcomes;
          return kit.traceChoice(r, {
            code: [`let ${s.a.name} = ${value}`].concat(chainLines([{ cond: A.text, body: log(m1) }], log(m2))),
            wrong: [[m1], [m2], [m1, m2], []],
            explain: `${A.text} is ${yesNo(kit.sideTrue(A, value))} when ${s.a.name} is ${value}. An if and its else never both run.`,
          });
        },
      },
      {
        id: 'word-if-else',
        make(r) {
          const w = kit.pickWordVar(r);
          const target = r.pick(w.values);
          const value = r.chance(0.5) ? target : r.pick(w.values.filter((v) => v !== target));
          const [m1, m2] = kit.pickScene(r).outcomes;
          return kit.traceChoice(r, {
            code: [`let ${w.name} = ${lit(value)}`].concat(chainLines([{ cond: `${w.name} == ${lit(target)}`, body: log(m1) }], log(m2))),
            wrong: [[m1], [m2], [m1, m2], []],
            explain: `${w.name} holds "${value}", so ${w.name} == "${target}" is ${yesNo(value === target)}.`,
          });
        },
      },
      {
        id: 'if-without-else',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const value = r.pick(kit.valuesOf(s.a));
          const [m1, m2] = s.outcomes;
          return kit.traceChoice(r, {
            code: [`let ${s.a.name} = ${value}`].concat(ifBlock(A.text, log(m1)), [log(m2)]),
            wrong: [[m1], [m2], [m1, m2], []],
            explain: `If the condition is false, the code inside the brackets gets skipped and the program continues. "${m2}" is outside the if, so it always prints.`,
          });
        },
      },
      {
        id: 'not-equal',
        make(r) {
          const w = kit.pickWordVar(r);
          const target = r.pick(w.values);
          const value = r.chance(0.5) ? target : r.pick(w.values.filter((v) => v !== target));
          const [m1, m2] = kit.pickScene(r).outcomes;
          return kit.traceChoice(r, {
            code: [`let ${w.name} = ${lit(value)}`].concat(chainLines([{ cond: `${w.name} != ${lit(target)}`, body: log(m1) }], log(m2))),
            wrong: [[m1], [m2], [m1, m2], []],
            explain: `!= asks whether the values are different. Here ${w.name} != "${target}" is ${yesNo(value !== target)}.`,
          });
        },
      },
      {
        id: 'prints-the-comparison',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, r.pick(ALL_OPS), s.a.t);
          const value = r.chance(0.3) ? s.a.t : r.pick(kit.valuesOf(s.a));
          return kit.traceChoice(r, {
            code: [`let ${s.a.name} = ${value}`, `console.log(${A.text})`],
            wrong: [['true'], ['false'], [String(value)], [A.text]],
            explain: `A comparison works out to true or false, and console.log prints that result. ${value} ${A.op} ${s.a.t} is ${yesNo(!!CC.evalExpr(`${value} ${A.op} ${s.a.t}`, {}))}.`,
          });
        },
      },
    ],
  };

  const RULE_PROMPT = 'Which condition matches this rule?';

  const ruleSlot = {
    id: 'rule',
    skill: 'concepts',
    concept: 'Writing a rule as a condition',
    patterns: [
      {
        id: 'above-or-below',
        make(r) {
          const v = kit.pickScene(r).a;
          const up = r.chance(0.5);
          const n = v.name;
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run only when ${v.noun} is ${up ? 'above' : 'below'} ${v.t}.`,
            correct: `${n} ${up ? '>' : '<'} ${v.t}`,
            wrong: [`${n} ${up ? '<' : '>'} ${v.t}`, `${n} ${up ? '>=' : '<='} ${v.t}`, `${n} == ${v.t}`],
            exprOptions: true,
            explain: `"${up ? 'Above' : 'Below'}" does not include ${v.t} itself, so it uses ${up ? '>' : '<'} rather than ${up ? '>=' : '<='}.`,
          });
        },
      },
      {
        id: 'at-least-or-at-most',
        make(r) {
          const v = kit.pickScene(r).a;
          const up = r.chance(0.5);
          const n = v.name;
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run only when ${v.noun} is ${up ? 'at least' : 'at most'} ${v.t}.`,
            correct: `${n} ${up ? '>=' : '<='} ${v.t}`,
            wrong: [`${n} ${up ? '>' : '<'} ${v.t}`, `${n} ${up ? '<=' : '>='} ${v.t}`, `${n} == ${v.t}`],
            exprOptions: true,
            explain: `"${up ? 'At least' : 'At most'}" includes ${v.t} itself, so it uses ${up ? '>=' : '<='}.`,
          });
        },
      },
      {
        id: 'anything-except',
        make(r) {
          const v = kit.pickScene(r).a;
          const n = v.name;
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run when ${v.noun} is anything except ${v.t}.`,
            correct: `${n} != ${v.t}`,
            wrong: [`${n} == ${v.t}`, `${n} > ${v.t}`, `${n} < ${v.t}`],
            exprOptions: true,
            explain: '!= means "not the same as."',
          });
        },
      },
      {
        id: 'matching-a-word',
        make(r) {
          const w = kit.pickWordVar(r);
          const target = r.pick(w.values);
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run only when ${w.noun} is ${target}.`,
            correct: `${w.name} == "${target}"`,
            wrong: [`${w.name} = "${target}"`, `${w.name} == ${target}`, `${w.name} != "${target}"`],
            codeOptions: true,
            explain: 'Comparing uses ==, because a single = stores a value. Words need quotation marks, or the computer looks for a variable with that name.',
          });
        },
      },
    ],
  };

  const REGION_PROMPT = 'Tap every part of the canvas where this condition is true.';

  const regionSlot = {
    id: 'region',
    skill: 'concepts',
    concept: 'Finding where a mouse condition is true on the canvas',
    patterns: [
      {
        id: 'left-or-right',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const x = kit.pickCut(r, c.w);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `mouseX ${r.pick(['>', '<'])} ${x}`,
            w: c.w,
            h: c.h,
            xs: [x],
            ys: [],
            explain: 'mouseX gets bigger as the mouse moves to the right.',
          });
        },
      },
      {
        id: 'top-or-bottom',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const y = kit.pickCut(r, c.h);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `mouseY ${r.pick(['>', '<'])} ${y}`,
            w: c.w,
            h: c.h,
            xs: [],
            ys: [y],
            explain: 'mouseY starts at 0 at the top and gets bigger going down.',
          });
        },
      },
      {
        id: 'three-columns',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [a, b] = kit.pickThirdCuts(r, c.w);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: r.chance(0.5) ? `mouseX > ${a}` : `mouseX < ${b}`,
            w: c.w,
            h: c.h,
            xs: [a, b],
            ys: [],
            explain: 'Check each column. A part of the canvas counts if every mouseX inside it passes the comparison.',
          });
        },
      },
      {
        id: 'three-rows',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [a, b] = kit.pickThirdCuts(r, c.h);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: r.chance(0.5) ? `mouseY > ${a}` : `mouseY < ${b}`,
            w: c.w,
            h: c.h,
            xs: [],
            ys: [a, b],
            explain: 'mouseY gets bigger going down, so a bigger mouseY means lower on the canvas.',
          });
        },
      },
    ],
  };

  const mouseSlot = {
    id: 'mouseRows',
    skill: 'flow',
    concept: 'Predicting what an if and else do at different mouse positions',
    patterns: [
      {
        id: 'left-or-right',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const colors = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          const y = () => 10 * r.int(1, c.h / 10 - 1);
          return kit.colorRows(r, {
            code: chainLines([{ cond: `mouseX > ${c.cx}`, body: kit.setColor(V, colors[0]) }], kit.setColor(V, colors[1])),
            varName: V,
            colors,
            points: [
              { mouseX: c.cx + 10 * r.int(1, 5), mouseY: y() },
              { mouseX: c.cx - 10 * r.int(1, 5), mouseY: y() },
              { mouseX: c.cx, mouseY: y() },
            ],
            explain: `At exactly ${c.cx}, mouseX > ${c.cx} is false, so the else runs.`,
          });
        },
      },
      {
        id: 'top-or-bottom',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const colors = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.background);
          const x = () => 10 * r.int(1, c.w / 10 - 1);
          return kit.colorRows(r, {
            code: chainLines([{ cond: `mouseY < ${c.cy}`, body: kit.setColor(V, colors[0]) }], kit.setColor(V, colors[1])),
            varName: V,
            colors,
            points: [
              { mouseX: x(), mouseY: c.cy - 10 * r.int(1, 5) },
              { mouseX: x(), mouseY: c.cy + 10 * r.int(1, 5) },
              { mouseX: x(), mouseY: c.cy },
            ],
            explain: `At exactly ${c.cy}, mouseY < ${c.cy} is false, so the else runs.`,
          });
        },
      },
      {
        id: 'exactly-one-spot',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const colors = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          const y = () => 10 * r.int(1, c.h / 10 - 1);
          return kit.colorRows(r, {
            code: chainLines([{ cond: `mouseX == ${c.cx}`, body: kit.setColor(V, colors[0]) }], kit.setColor(V, colors[1])),
            varName: V,
            colors,
            points: [
              { mouseX: c.cx, mouseY: y() },
              { mouseX: c.cx + 10, mouseY: y() },
              { mouseX: c.cx - 10 * r.int(1, 5), mouseY: y() },
            ],
            explain: `== is only true at exactly ${c.cx}. Even ${c.cx + 10} does not count.`,
          });
        },
      },
      {
        id: 'anywhere-but-one-spot',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const colors = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.background);
          const x = () => 10 * r.int(1, c.w / 10 - 1);
          return kit.colorRows(r, {
            code: chainLines([{ cond: `mouseY != ${c.cy}`, body: kit.setColor(V, colors[0]) }], kit.setColor(V, colors[1])),
            varName: V,
            colors,
            points: [
              { mouseX: x(), mouseY: c.cy },
              { mouseX: x(), mouseY: c.cy + 10 },
              { mouseX: x(), mouseY: c.cy - 10 * r.int(1, 5) },
            ],
            explain: `!= is true everywhere except at exactly ${c.cy}.`,
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
        id: 'if-else-then-more',
        make(r) {
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const A = side(s.a, pickOp(r), r.pick(s.a.thresholds));
            return kit.letLines({ [s.a.name]: r.pick(kit.valuesOf(s.a)) }).concat(
              [log('Starting')],
              chainLines([{ cond: A.text, body: log(s.outcomes[0]) }], log(s.outcomes[1])),
              [log('Finished')],
            );
          }, 'Lines outside the if and else always run. Only one of the if and else blocks runs.');
        },
      },
      {
        id: 'two-separate-ifs',
        make(r) {
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const A = side(s.a, pickOp(r), r.pick(s.a.thresholds));
            const B = side(s.b, pickOp(r), r.pick(s.b.thresholds));
            return kit.letLines(kit.sceneValues(r, s)()).concat(
              ifBlock(A.text, log(s.outcomes[0])),
              chainLines([{ cond: B.text, body: log(s.outcomes[1]) }], log(s.outcomes[2])),
              [log('Finished')],
            );
          }, 'Separate if statements are checked one after the other. An else belongs only to the if right before it.');
        },
      },
      {
        id: 'value-changes-first',
        make(r) {
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const n = s.a.name;
            const A = side(s.a, r.pick(['>', '>=']), s.a.t);
            const change = s.a.step * r.int(2, 6);
            return [`let ${n} = ${r.pick(kit.valuesOf(s.a))}`, `${n} = ${n} + ${change}`].concat(
              chainLines([{ cond: A.text, body: log(s.outcomes[0]) }], log(s.outcomes[1])),
            );
          }, 'Code runs from top to bottom, so the if checks the new value.');
        },
      },
      {
        id: 'inside-a-function',
        make(r) {
          const fn = r.pick(kit.FUNCTION_NAMES);
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const A = side(s.a, pickOp(r), r.pick(s.a.thresholds));
            return [`function ${fn}(${s.a.name}){`].concat(
              chainLines([{ cond: A.text, body: log(s.outcomes[0]) }], log(s.outcomes[1]), '  '),
              ['}', '', log('Starting'), `${fn}(${r.pick(kit.valuesOf(s.a))})`],
            );
          }, 'The function\'s code only runs when it is called, using the value passed in.');
        },
      },
    ],
  };

  const OTHER_REASONS = [WHY.elseNoCondition, WHY.quotes, WHY.assign, WHY.backwards, WHY.bracket];
  const others = (r, why) => r.sample(OTHER_REASONS.filter((reason) => reason !== why), 3);

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in an if and else',
    patterns: [
      {
        id: 'equals-sign',
        make(r) {
          const s = kit.pickScene(r);
          const n = s.a.name;
          const t = s.a.t;
          const lets = [`let ${n} = ${r.pick(kit.valuesOf(s.a))}`];
          const rest = (cond) => chainLines([{ cond, body: log(s.outcomes[0]) }], log(s.outcomes[1]));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${s.outcomes[0]}" only when ${s.a.noun} is exactly ${t}. Tap the line with the bug, then choose why it is wrong.`,
            code: lets.concat(rest(`${n} = ${t}`)),
            bugLines: [1],
            why: WHY.assign,
            others: others(r, WHY.assign),
            fixed: lets.concat(rest(`${n} == ${t}`)),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(s.a, '==', t)]) },
            explain: `It should be if(${n} == ${t}){`,
          });
        },
      },
      {
        id: 'word-without-quotes',
        make(r) {
          const w = kit.pickWordVar(r);
          const target = r.pick(w.values);
          const [m1, m2] = kit.pickScene(r).outcomes;
          const lets = [`let ${w.name} = ${lit(r.pick(w.values))}`];
          const rest = (cond) => chainLines([{ cond, body: log(m1) }], log(m2));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}" only when ${w.noun} is ${target}. Tap the line with the bug, then choose why it is wrong.`,
            code: lets.concat(rest(`${w.name} == ${target}`)),
            bugLines: [1],
            why: WHY.quotes,
            others: others(r, WHY.quotes),
            fixed: lets.concat(rest(`${w.name} == "${target}"`)),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(w, '==', target)]) },
            explain: `It should be if(${w.name} == "${target}"){`,
          });
        },
      },
      {
        id: 'comparison-backwards',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, r.pick(['>', '<']), s.a.t);
          const lets = [`let ${s.a.name} = ${r.pick(kit.valuesOf(s.a))}`];
          const rest = (cond) => chainLines([{ cond, body: log(s.outcomes[0]) }], log(s.outcomes[1]));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${s.outcomes[0]}" only when ${say(A)}. Tap the line with the bug, then choose why it is wrong.`,
            code: lets.concat(rest(kit.flipSide(A).text)),
            bugLines: [1],
            why: WHY.backwards,
            others: others(r, WHY.backwards),
            fixed: lets.concat(rest(A.text)),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A]) },
            explain: `It should be if(${A.text}){`,
          });
        },
      },
      {
        id: 'else-with-a-condition',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, r.pick(['>', '<']), s.a.t);
          const lets = [`let ${s.a.name} = ${r.pick(kit.valuesOf(s.a))}`];
          const [m1, m2] = s.outcomes;
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}" when ${say(A)}, and "${m2}" otherwise. Tap the line with the bug, then choose why it is wrong.`,
            code: lets.concat(ifBlock(A.text, log(m1)), [`else(${kit.flipSide(A).text}){`, `  ${log(m2)}`, '}']),
            bugLines: [4],
            why: WHY.elseNoCondition,
            others: others(r, WHY.elseNoCondition),
            fixed: lets.concat(chainLines([{ cond: A.text, body: log(m1) }], log(m2))),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A]) },
            explain: 'else runs whenever the if is false, so it is written with no condition: else{',
          });
        },
      },
    ],
  };

  const blankIf = (variable, op, value) => ['if(', tok(variable, 'var'), ' ', tok(op, 'op'), ' ', tok(value, 'num'), '){'];
  const blankBody = (message) => ['  console.log(', tok(lit(message), 'msg'), ')'];

  const blanksSlot = {
    id: 'blanks',
    skill: 'build',
    concept: 'Completing an if and else',
    patterns: [
      {
        id: 'number',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const [m1, m2] = s.outcomes;
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints "${m1}" when ${say(A)}. Otherwise, it should print "${m2}".`,
            lines: [
              { text: `let ${s.a.name} = ${s.a.t}`, run: `let ${s.a.name} = __in.${s.a.name}` },
              blankIf(s.a.name, A.op, s.a.t),
              blankBody(m1),
              { text: '}' },
              [tok('else', 'kw'), '{'],
              blankBody(m2),
              { text: '}' },
            ],
            must: ['op'],
            count: 3,
            pools: {
              op: ['>', '<', '>=', '<=', '=='], var: [s.a.name, s.b.name], num: s.a.thresholds, kw: ['if', 'else'], msg: s.outcomes.map(lit),
            },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A]) },
            explain: `if(${A.text}){ runs the first message, and else runs the other one.`,
          });
        },
      },
      {
        id: 'word',
        make(r) {
          const w = kit.pickWordVar(r);
          const target = r.pick(w.values);
          const [m1, m2, m3] = kit.pickScene(r).outcomes;
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints "${m1}" when ${w.noun} is ${target}. Otherwise, it should print "${m2}".`,
            lines: [
              { text: `let ${w.name} = "${target}"`, run: `let ${w.name} = __in.${w.name}` },
              ['if(', tok(w.name, 'var'), ' ', tok('==', 'op'), ' ', tok(`"${target}"`, 'str'), '){'],
              blankBody(m1),
              { text: '}' },
              [tok('else', 'kw'), '{'],
              blankBody(m2),
              { text: '}' },
            ],
            must: ['op', 'str'],
            count: 3,
            pools: {
              op: ['=', '!='], var: [w.name, 'word'], str: [target].concat(w.values.filter((v) => v !== target).map(lit)), kw: ['if', 'else'], msg: [m1, m2, m3].map(lit),
            },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(w, '==', target)]) },
            explain: `Comparing uses ==, and a word needs quotation marks: if(${w.name} == "${target}"){`,
          });
        },
      },
      {
        id: 'mouse-color',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          const isX = r.chance(0.5);
          const up = r.chance(0.5);
          const where = isX ? (up ? 'on the right side' : 'on the left side') : (up ? 'in the bottom half' : 'in the top half');
          const cut = isX ? c.cx : c.cy;
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${V} turns ${c1.name} when the mouse is ${where} of ${kit.canvasName(c)}, and ${c2.name} otherwise.`,
            lines: [
              ['if(', tok(isX ? 'mouseX' : 'mouseY', 'var'), ' ', tok(up ? '>' : '<', 'op'), ' ', tok(cut, 'num'), '){'],
              { text: `  ${kit.setColor(V, c1)}` },
              { text: '}' },
              [tok('else', 'kw'), '{'],
              { text: `  ${kit.setColor(V, c2)}` },
              { text: '}' },
            ],
            must: ['op'],
            count: 3,
            pools: {
              op: ['>', '<', '=='], var: ['mouseX', 'mouseY'], num: [cut, cut + 50, cut + 100], kw: ['if', 'else'],
            },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${V} = "none"`],
              hiddenSuffix: [`console.log(${V})`],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: `mouseX gets bigger going right, and mouseY gets bigger going down. So it should be if(${isX ? 'mouseX' : 'mouseY'} ${up ? '>' : '<'} ${cut}){`,
          });
        },
      },
      {
        id: 'anything-except',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, '!=', s.a.t);
          const [m1, m2] = s.outcomes;
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints "${m1}" when ${s.a.noun} is anything except ${s.a.t}. If it is exactly ${s.a.t}, it should print "${m2}".`,
            lines: [
              { text: `let ${s.a.name} = ${s.a.t}`, run: `let ${s.a.name} = __in.${s.a.name}` },
              blankIf(s.a.name, '!=', s.a.t),
              blankBody(m1),
              { text: '}' },
              [tok('else', 'kw'), '{'],
              blankBody(m2),
              { text: '}' },
            ],
            must: ['op'],
            count: 3,
            pools: {
              op: ['==', '>', '<'], var: [s.a.name, s.b.name], num: s.a.thresholds, kw: ['if', 'else'], msg: s.outcomes.map(lit),
            },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(s.a, '==', s.a.t)]) },
            explain: `!= means "not the same as": if(${A.text}){`,
          });
        },
      },
    ],
  };

  const SCRAMBLE_PROMPT = 'Put these lines in order so the code does this:';
  const DRAW_PREFIX = [{ text: 'function draw(){' }];
  const DRAW_SUFFIX = [{ text: '}' }];

  const parsonsSlot = {
    id: 'parsons',
    skill: 'build',
    concept: 'Putting scrambled if and else code in order',
    patterns: [
      {
        id: 'number-if-else',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const [m1, m2] = s.outcomes;
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              `If ${say(A)}, print "${m1}".`,
              `Otherwise, print "${m2}".`,
              'At the very end, always print "Finished".',
            ])}`,
            prefix: [{ text: `let ${s.a.name} = ${s.a.t}`, run: `let ${s.a.name} = __in.${s.a.name}` }],
            movable: chainLines([{ cond: A.text, body: log(m1) }], log(m2)).concat([log('Finished')]),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A]) },
            explain: 'The if comes first, then its else. "Finished" goes after both, so it always prints.',
          });
        },
      },
      {
        id: 'word-if-else',
        make(r) {
          const w = kit.pickWordVar(r);
          const target = r.pick(w.values);
          const [m1, m2] = kit.pickScene(r).outcomes;
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              'First, always print "Checking".',
              `If ${w.noun} is ${target}, print "${m1}".`,
              `Otherwise, print "${m2}".`,
            ])}`,
            prefix: [{ text: `let ${w.name} = "${target}"`, run: `let ${w.name} = __in.${w.name}` }],
            movable: [log('Checking')].concat(chainLines([{ cond: `${w.name} == "${target}"`, body: log(m1) }], log(m2))),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(w, '==', target)]) },
            explain: 'Code runs top to bottom, so "Checking" goes before the if.',
          });
        },
      },
      {
        id: 'circle-color',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          const op = r.pick(['>', '<']);
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              'Paint a gray background behind everything.',
              `On ${kit.canvasName(c)}, if the mouse is on the ${op === '>' ? 'right' : 'left'} side, make ${V} ${c1.name}. Otherwise, make it ${c2.name}.`,
              `Fill with ${V} and draw the circle on top of the background.`,
            ])}`,
            prefix: DRAW_PREFIX,
            movable: ['background(220)'].concat(
              chainLines([{ cond: `mouseX ${op} ${c.cx}`, body: kit.setColor(V, c1) }], kit.setColor(V, c2)),
              [`fill(${V})`, `ellipse(${c.cx}, ${c.cy}, 100, 100)`],
            ),
            suffix: DRAW_SUFFIX,
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${V}`, 'function setup(){', `  createCanvas(${c.w}, ${c.h})`, `  ${V} = color(255, 255, 255)`, '}'],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], []),
            },
            explain: 'background() goes before ellipse(), or it paints over the circle. Each color goes right after its condition.',
          });
        },
      },
      {
        id: 'shape-appears',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const op = r.pick(['>', '<']);
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              'Paint a gray background behind everything.',
              `On ${kit.canvasName(c)}, draw the circle only when the mouse is in the ${op === '>' ? 'bottom' : 'top'} half.`,
              'Always draw the square on top of the background.',
            ])}`,
            prefix: DRAW_PREFIX,
            movable: ['background(220)'].concat(
              ifBlock(`mouseY ${op} ${c.cy}`, `ellipse(${c.cx}, ${c.cy}, 80, 80)`),
              ['rect(10, 10, 50, 50)'],
            ),
            suffix: DRAW_SUFFIX,
            spec: {
              kind: 'sketch',
              hiddenPrefix: ['function setup(){', `  createCanvas(${c.w}, ${c.h})`, '}'],
              vectors: kit.mouseVectors(c.w, c.h, [], [c.cy]),
            },
            explain: 'Only the circle goes inside the if. The square stays outside it, so it always draws.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA1.1',
    title: 'Conditionals and If Statements',
    unit: 2,
    source: 'curriculum/02-unit-2/02-U2LA1.1-Conditionals-and-If-Statements.md',
    defaults: {
      minutes: 15, questions: 9, attempts: 2, practice: true,
    },
    notYetTaught: [
      [/else if/, 'else if (U2LA1.2)'],
      [/&&|\|\|/, '&& and || (U2LA1.3)'],
      [/\breturn\b/, 'return values (U2LA3.2)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
    ],
    slots: [compareSlot, ruleSlot, regionSlot, traceSlot, mouseSlot, flowSlot, bugSlot, blanksSlot, parsonsSlot],
    priority: ['parsons', 'traceIf', 'compare', 'blanks', 'region', 'lines', 'bug', 'rule', 'mouseRows'],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
