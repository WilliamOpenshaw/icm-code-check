// U2LA1.3: Logical Operators And/Or
// curriculum/02-unit-2/04-U2LA1.3-Logical-Operators-And-Or.md
//
// Twelve question slots. Each slot has several structurally different patterns of about
// the same difficulty, and each pattern randomizes names, numbers, and messages.
//
// Students at this point have seen: variables, functions with parameters, mouseX/mouseY,
// color(), if / else if / else, ==, !=, <, >, <=, >=, && and ||.
// They have NOT seen: return values, boolean variables, ! (not), mixing && with || in one
// condition, loops, or arrays. Do not use those here.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const {
    lit, side, flipSide, say, tok, log, chainLines, pickOp, join, yesNo, pickRange, firstTrue, chainMatters, ifBlock, numberedRules, letLines, sceneValues,
  } = kit;

  const OP_RULE = {
    '&&': '&& is true only when BOTH sides are true.',
    '||': '|| is true when AT LEAST ONE side is true.',
  };

  // Sides for "if(A1 op1 B1) ... else if(A2 op2 B2) ... else".
  function pickChainSides(r, s, op1, op2) {
    for (let tries = 0; tries < 500; tries++) {
      const A1 = side(s.a, pickOp(r), s.a.t);
      const B1 = side(s.b, pickOp(r), s.b.t);
      const A2 = side(s.a, pickOp(r), r.pick(s.a.thresholds));
      const B2 = side(s.b, pickOp(r), r.pick(s.b.thresholds));
      const vectors = kit.sceneVectors([A1, B1, A2, B2]);
      if (chainMatters([join(A1, op1, B1), join(A2, op2, B2)], vectors)) return { A1, B1, A2, B2, vectors };
    }
    throw new Error('Could not find a meaningful chain');
  }

  // ---- Slot: is the whole condition true or false? ----

  const TRUTH_OPTIONS = [{ text: 'true' }, { text: 'false' }];
  const TRUTH_PROMPT = 'For each row, decide whether the whole condition is true or false.';
  const ALL_COMBOS = [[true, true], [true, false], [false, true], [false, false]];

  function truthFromTwoSides(r, A, B, op) {
    const expr = join(A, op, B);
    for (let tries = 0; tries < 300; tries++) {
      const combos = [0, 1, 2, 3].map(() => r.pick(ALL_COMBOS));
      if (new Set(combos).size < 3) continue;
      const values = combos.map(([ta, tb]) => [kit.sideValue(r, A, ta), kit.sideValue(r, B, tb)]);

      // Every version has one value sitting exactly on its dividing value when it can.
      const edges = [];
      values.forEach((_, i) => {
        if (kit.isEdgeable(A) && kit.edgeTruth(A) === combos[i][0]) edges.push([i, 0, A]);
        if (kit.isEdgeable(B) && kit.edgeTruth(B) === combos[i][1]) edges.push([i, 1, B]);
      });
      if (edges.length) {
        const [i, col, s] = r.pick(edges);
        values[i][col] = s.t;
      }

      if (new Set(values.map(String)).size < 4) continue;
      const outcomes = values.map(([a, b]) => !!CC.evalExpr(expr, { [A.v.name]: a, [B.v.name]: b }));
      if (outcomes.every(Boolean) || outcomes.every((o) => !o)) continue;

      const notes = values.map(([a, b], i) => `${A.v.name} = ${lit(a)}, ${B.v.name} = ${lit(b)}: `
        + `${A.text} is ${yesNo(kit.sideTrue(A, a))}, ${B.text} is ${yesNo(kit.sideTrue(B, b))}, `
        + `so the condition is ${yesNo(outcomes[i])}.`);
      return kit.rowsQuestion({
        prompt: TRUTH_PROMPT,
        code: [expr],
        columns: [A.v.name, B.v.name],
        rows: values.map((cells, i) => ({ cells: cells.map(lit), answer: outcomes[i] ? 0 : 1 })),
        options: TRUTH_OPTIONS,
        explain: `${OP_RULE[op]}\n${notes.join('\n')}`,
      });
    }
    throw new Error(`Could not build rows for ${expr}`);
  }

  function truthFromRange(r, v, lowOp, highOp, op) {
    const { lo, hi } = pickRange(r, v);
    const A = side(v, lowOp, lo);
    const B = side(v, highOp, hi);
    const expr = join(A, op, B);
    const inside = kit.valuesOf(v).filter((n) => n > lo && n < hi);
    const below = kit.valuesOf(v).filter((n) => n < lo);
    const above = kit.valuesOf(v).filter((n) => n > hi);
    const values = r.shuffle([r.pick(below), r.pick(inside), r.pick([lo, hi]), r.pick(above)]);
    const outcomes = values.map((n) => !!CC.evalExpr(expr, { [v.name]: n }));
    const notes = values.map((n, i) => `${v.name} = ${n}: ${A.text} is ${yesNo(kit.sideTrue(A, n))}, `
      + `${B.text} is ${yesNo(kit.sideTrue(B, n))}, so the condition is ${yesNo(outcomes[i])}.`);
    return kit.rowsQuestion({
      prompt: TRUTH_PROMPT,
      code: [expr],
      columns: [v.name],
      rows: values.map((n, i) => ({ cells: [String(n)], answer: outcomes[i] ? 0 : 1 })),
      options: TRUTH_OPTIONS,
      explain: `${OP_RULE[op]}\n${notes.join('\n')}`,
    });
  }

  const truthSlot = {
    id: 'truth',
    skill: 'concepts',
    concept: 'Deciding whether && and || conditions are true or false',
    patterns: [
      {
        id: 'and-two-variables',
        make(r) {
          const s = kit.pickScene(r);
          return truthFromTwoSides(r, side(s.a, pickOp(r), s.a.t), side(s.b, pickOp(r), s.b.t), '&&');
        },
      },
      {
        id: 'or-two-variables',
        make(r) {
          const s = kit.pickScene(r);
          return truthFromTwoSides(r, side(s.a, pickOp(r), s.a.t), side(s.b, pickOp(r), s.b.t), '||');
        },
      },
      {
        id: 'and-inside-range',
        make(r) {
          const s = kit.pickScene(r);
          return truthFromRange(r, s.a, r.pick(['>', '>=']), r.pick(['<', '<=']), '&&');
        },
      },
      {
        id: 'or-outside-range',
        make(r) {
          const s = kit.pickScene(r);
          return truthFromRange(r, s.a, r.pick(['<', '<=']), r.pick(['>', '>=']), '||');
        },
      },
      {
        id: 'word-and-number',
        make(r) {
          const s = kit.pickScene(r);
          const w = kit.pickWordVar(r);
          const op = r.pick(['&&', '||']);
          return truthFromTwoSides(r, side(w, '==', r.pick(w.values)), side(s.a, pickOp(r), s.a.t), op);
        },
      },
      {
        id: 'mouse-position',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const op = r.pick(['&&', '||']);
          const A = side(kit.mouseVar('mouseX', c.w, c.cx), r.pick(['>', '<']), c.cx);
          const B = side(kit.mouseVar('mouseY', c.h, c.cy), r.pick(['>', '<']), c.cy);
          return truthFromTwoSides(r, A, B, op);
        },
      },
    ],
  };

  // ---- Slot: which condition matches this rule? ----

  const RULE_PROMPT = 'Which condition matches this rule?';

  const translateSlot = {
    id: 'translate',
    skill: 'concepts',
    concept: 'Choosing && or || to match a rule in words',
    patterns: [
      {
        id: 'both-true',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const B = side(s.b, pickOp(r), s.b.t);
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run only when ${say(A)} and ${say(B)}.`,
            correct: join(A, '&&', B),
            wrong: [join(A, '||', B), join(flipSide(A), '&&', B), join(A, '&&', flipSide(B))],
            exprOptions: true,
            explain: `The rule needs both things to be true, so it uses &&. Each comparison also has to point the same way as the rule: "${say(A)}" is ${A.text}.`,
          });
        },
      },
      {
        id: 'at-least-one',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const B = side(s.b, pickOp(r), s.b.t);
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run when at least one of these is true: ${say(A)}, or ${say(B)}.`,
            correct: join(A, '||', B),
            wrong: [join(A, '&&', B), join(flipSide(A), '||', B), join(A, '||', flipSide(B))],
            exprOptions: true,
            explain: `Only one of them has to be true, so the rule uses ||. "${say(B)}" is ${B.text}.`,
          });
        },
      },
      {
        id: 'between-two-values',
        make(r) {
          const v = kit.pickScene(r).a;
          const { lo, hi } = pickRange(r, v);
          const n = v.name;
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run only when ${v.noun} is above ${lo} and also below ${hi}.`,
            correct: `${n} > ${lo} && ${n} < ${hi}`,
            wrong: [`${n} > ${lo} || ${n} < ${hi}`, `${n} < ${lo} && ${n} > ${hi}`, `${n} < ${lo} || ${n} > ${hi}`],
            exprOptions: true,
            explain: `Being between two values means both comparisons must be true at once, so it uses &&: ${n} > ${lo} && ${n} < ${hi}. With ||, every number would pass.`,
          });
        },
      },
      {
        id: 'outside-two-values',
        make(r) {
          const v = kit.pickScene(r).a;
          const { lo, hi } = pickRange(r, v);
          const n = v.name;
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `The code should run when ${v.noun} is below ${lo} or above ${hi}.`,
            correct: `${n} < ${lo} || ${n} > ${hi}`,
            wrong: [`${n} < ${lo} && ${n} > ${hi}`, `${n} > ${lo} && ${n} < ${hi}`, `${n} > ${lo} || ${n} < ${hi}`],
            exprOptions: true,
            explain: `A number can't be below ${lo} and above ${hi} at the same time, so && would never be true. The rule needs ||.`,
          });
        },
      },
      {
        id: 'part-of-canvas',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const name = r.pick(kit.quadrantNames);
          const q = kit.QUADRANTS[name];
          const flip = (op) => (op === '>' ? '<' : '>');
          return kit.choiceQuestion(r, {
            prompt: RULE_PROMPT,
            rule: `On ${kit.canvasName(c)}, the code should run only when the mouse is in the ${name} part of the canvas.`,
            correct: `mouseX ${q.x} ${c.cx} && mouseY ${q.y} ${c.cy}`,
            wrong: [
              `mouseX ${q.x} ${c.cx} || mouseY ${q.y} ${c.cy}`,
              `mouseX ${q.x} ${c.cx} && mouseY ${flip(q.y)} ${c.cy}`,
              `mouseX ${flip(q.x)} ${c.cx} && mouseY ${q.y} ${c.cy}`,
            ],
            exprOptions: true,
            explain: `mouseX gets bigger to the right and mouseY gets bigger going DOWN the canvas. One part of the canvas needs both comparisons to be true, so it uses &&.`,
          });
        },
      },
    ],
  };

  // ---- Slot: what does this condition mean? ----

  const EXPLAIN_PROMPT = 'When does the code inside this if statement run?';

  const explainSlot = {
    id: 'explain',
    skill: 'concepts',
    concept: 'Reading a condition in plain English',
    patterns: [
      {
        id: 'canvas-and',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [name, other1, other2] = pickQuadrantSet(r);
          const q = kit.QUADRANTS[name];
          const xWord = q.x === '>' ? 'right side' : 'left side';
          const yWord = q.y === '>' ? 'bottom half' : 'top half';
          return kit.choiceQuestion(r, {
            prompt: `${EXPLAIN_PROMPT} The canvas is ${c.w} by ${c.h}.`,
            code: ifBlock(kit.quadCond(name, c), log('Hello!')),
            correct: `Only when the mouse is in the ${name} part of the canvas`,
            wrong: [
              `Only when the mouse is in the ${other1} part of the canvas`,
              `Only when the mouse is in the ${other2} part of the canvas`,
              `When the mouse is on the ${xWord} or in the ${yWord} (either one is enough)`,
            ],
            explain: `&& needs both comparisons to be true. mouseX ${q.x} ${c.cx} means the ${xWord}. mouseY ${q.y} ${c.cy} means the ${yWord}, because mouseY gets bigger going down.`,
          });
        },
      },
      {
        id: 'canvas-or',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const xOp = r.pick(['>', '<']);
          const yOp = r.pick(['>', '<']);
          const xWord = (op) => (op === '>' ? 'right side' : 'left side');
          const yWord = (op) => (op === '>' ? 'bottom half' : 'top half');
          const flip = (op) => (op === '>' ? '<' : '>');
          const corner = (x, y) => `${y === '>' ? 'bottom' : 'top'}-${x === '>' ? 'right' : 'left'}`;
          return kit.choiceQuestion(r, {
            prompt: `${EXPLAIN_PROMPT} The canvas is ${c.w} by ${c.h}.`,
            code: ifBlock(`mouseX ${xOp} ${c.cx} || mouseY ${yOp} ${c.cy}`, log('Hello!')),
            correct: `When the mouse is on the ${xWord(xOp)} or in the ${yWord(yOp)} (either one is enough)`,
            wrong: [
              `Only when the mouse is in the ${corner(xOp, yOp)} part of the canvas`,
              `Only when the mouse is in the ${corner(flip(xOp), flip(yOp))} part of the canvas`,
              `When the mouse is on the ${xWord(flip(xOp))} or in the ${yWord(flip(yOp))} (either one is enough)`,
            ],
            explain: `|| needs only one comparison to be true. So the code runs everywhere except the ${corner(flip(xOp), flip(yOp))} part, where both comparisons are false.`,
          });
        },
      },
      {
        id: 'variables-and',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const B = side(s.b, pickOp(r), s.b.t);
          return kit.choiceQuestion(r, {
            prompt: EXPLAIN_PROMPT,
            code: ifBlock(join(A, '&&', B), log(s.outcomes[0])),
            correct: `Only when ${say(A)} and ${say(B)}`,
            wrong: [
              `When at least one is true: ${say(A)}, or ${say(B)}`,
              `Only when ${say(flipSide(A))} and ${say(B)}`,
              `Only when ${say(A)} and ${say(flipSide(B))}`,
            ],
            explain: `&& means both comparisons must be true at the same time.`,
          });
        },
      },
      {
        id: 'variables-or',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const B = side(s.b, pickOp(r), s.b.t);
          return kit.choiceQuestion(r, {
            prompt: EXPLAIN_PROMPT,
            code: ifBlock(join(A, '||', B), log(s.outcomes[0])),
            correct: `When at least one is true: ${say(A)}, or ${say(B)}`,
            wrong: [
              `Only when ${say(A)} and ${say(B)}`,
              `When at least one is true: ${say(flipSide(A))}, or ${say(B)}`,
              `When at least one is true: ${say(A)}, or ${say(flipSide(B))}`,
            ],
            explain: `|| means one true comparison is enough.`,
          });
        },
      },
      {
        id: 'range',
        make(r) {
          const v = kit.pickScene(r).a;
          const { lo, hi } = pickRange(r, v);
          const n = v.name;
          return kit.choiceQuestion(r, {
            prompt: EXPLAIN_PROMPT,
            code: ifBlock(`${n} >= ${lo} && ${n} <= ${hi}`, log('In range')),
            correct: `When ${v.noun} is anywhere from ${lo} to ${hi}, including ${lo} and ${hi}`,
            wrong: [
              `When ${v.noun} is below ${lo} or above ${hi}`,
              `Only when ${v.noun} is exactly ${lo} or exactly ${hi}`,
              `For every value of ${n}, because one side is always true`,
            ],
            explain: `Both comparisons must be true, so ${n} has to be at least ${lo} and also at most ${hi}.`,
          });
        },
      },
    ],
  };

  function pickQuadrantSet(r) {
    return r.shuffle(kit.quadrantNames);
  }

  // ---- Slot: tap where the condition is true ----

  const REGION_PROMPT = 'Tap every part of the canvas where this condition is true.';

  const regionSlot = {
    id: 'region',
    skill: 'concepts',
    concept: 'Finding where a condition is true on the canvas',
    patterns: [
      {
        id: 'and-two-by-two',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const x = kit.pickCut(r, c.w);
          const y = kit.pickCut(r, c.h);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `mouseX ${r.pick(['>', '<'])} ${x} && mouseY ${r.pick(['>', '<'])} ${y}`,
            w: c.w,
            h: c.h,
            xs: [x],
            ys: [y],
            explain: '&& needs both comparisons to be true, so only one part of this canvas passes. Remember that mouseY gets bigger going down.',
          });
        },
      },
      {
        id: 'or-two-by-two',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const x = kit.pickCut(r, c.w);
          const y = kit.pickCut(r, c.h);
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `mouseX ${r.pick(['>', '<'])} ${x} || mouseY ${r.pick(['>', '<'])} ${y}`,
            w: c.w,
            h: c.h,
            xs: [x],
            ys: [y],
            explain: '|| needs only one comparison to be true, so every part passes except the one where both comparisons are false.',
          });
        },
      },
      {
        id: 'and-strip',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const vertical = r.chance(0.5);
          const [a, b] = kit.pickThirdCuts(r, vertical ? c.w : c.h);
          const name = vertical ? 'mouseX' : 'mouseY';
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `${name} > ${a} && ${name} < ${b}`,
            w: c.w,
            h: c.h,
            xs: vertical ? [a, b] : [],
            ys: vertical ? [] : [a, b],
            explain: `${name} must be above ${a} and below ${b} at the same time, so only the middle strip passes.`,
          });
        },
      },
      {
        id: 'or-strip',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const vertical = r.chance(0.5);
          const [a, b] = kit.pickThirdCuts(r, vertical ? c.w : c.h);
          const name = vertical ? 'mouseX' : 'mouseY';
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `${name} < ${a} || ${name} > ${b}`,
            w: c.w,
            h: c.h,
            xs: vertical ? [a, b] : [],
            ys: vertical ? [] : [a, b],
            explain: `${name} only has to pass one side, so both outer strips pass and the middle strip does not.`,
          });
        },
      },
      {
        id: 'and-three-by-three',
        make(r) {
          const c = r.pick(kit.CANVASES.filter((k) => k.w % 200 === 0 && k.h % 200 === 0));
          const xs = [c.w / 4, (3 * c.w) / 4];
          const ys = [c.h / 4, (3 * c.h) / 4];
          const useLowX = r.chance(0.5);
          const useLowY = r.chance(0.5);
          const xCond = useLowX ? `mouseX < ${xs[0]}` : `mouseX > ${xs[1]}`;
          const yCond = useLowY ? `mouseY < ${ys[0]}` : `mouseY > ${ys[1]}`;
          return kit.regionQuestion({
            prompt: REGION_PROMPT,
            condition: `${xCond} && ${yCond}`,
            w: c.w,
            h: c.h,
            xs,
            ys,
            explain: '&& needs both comparisons to be true, so only the corner where they overlap passes.',
          });
        },
      },
    ],
  };

  // ---- Slot: what does this chain print? ----

  // Finds values so the target branch runs and, when possible, a later condition is also
  // true. That way a student who thinks every true branch runs picks a wrong answer.
  function buildChainTrace(r, { makeConds, render, target }) {
    for (let tries = 0; tries < 500; tries++) {
      const { conds, vars, messages, sampleVars, argOrder } = makeConds();
      const values = sampleVars();
      const first = firstTrue(conds, values);
      if (first !== target) continue;
      const later = [];
      for (let i = first + 1; i < conds.length; i++) {
        if (CC.evalExpr(conds[i], values)) later.push(i);
      }
      if (first < conds.length - 1 && !later.length) continue;
      const code = render({ conds, values, messages, vars, argOrder });
      const result = CC.runCode(code.join('\n'), {});
      if (result.error) throw new Error(`Generated code failed: ${result.error}\n${code.join('\n')}`);
      if (result.logs.length !== 1 || result.logs[0] !== messages[first]) {
        throw new Error(`Key mismatch for\n${code.join('\n')}`);
      }
      const walk = conds.map((cond, i) => {
        if (i > first) return null;
        return `${i === 0 ? 'if' : 'else if'}(${cond}) is ${yesNo(i === first)}`;
      }).filter(Boolean);
      const finish = first === conds.length ? 'None were true, so the else runs.' : 'It stops at the first true condition and skips the rest.';
      const extra = first < conds.length
        ? `Both "${messages[first]}" and "${messages[later.length ? later[0] : first + 1]}" print`
        : 'Nothing prints';
      return kit.choiceQuestion(r, {
        prompt: 'What does this code print?',
        code,
        correct: messages[first],
        wrong: messages.filter((m) => m !== messages[first]).concat([extra]),
        explain: `${walk.join('. ')}. ${finish}`,
      });
    }
    throw new Error('Could not build a chain trace');
  }

  const pickTarget = (r) => r.pick([0, 1, 2, 3]);

  const chainBody = (conds, messages, pad) => chainLines(
    conds.map((cond, i) => ({ cond, body: log(messages[i]) })),
    log(messages[conds.length]),
    pad,
  );

  const traceChainSlot = {
    id: 'traceChain',
    skill: 'flow',
    concept: 'Following if / else if / else: the first true condition wins',
    patterns: [
      {
        id: 'and-then-or',
        make(r) {
          const target = pickTarget(r);
          return buildChainTrace(r, {
            target,
            makeConds() {
              const s = kit.pickScene(r);
              const a = () => side(s.a, pickOp(r), r.pick(s.a.thresholds));
              const b = () => side(s.b, pickOp(r), r.pick(s.b.thresholds));
              return {
                conds: [join(a(), '&&', b()), join(a(), '||', b()), a().text],
                messages: s.outcomes.slice(0, 4),
                sampleVars: sceneValues(r, s),
              };
            },
            render: ({ conds, messages, values }) => letLines(values).concat([''], chainBody(conds, messages)),
          });
        },
      },
      {
        id: 'or-then-and',
        make(r) {
          const target = pickTarget(r);
          return buildChainTrace(r, {
            target,
            makeConds() {
              const s = kit.pickScene(r);
              const a = () => side(s.a, pickOp(r), r.pick(s.a.thresholds));
              const b = () => side(s.b, pickOp(r), r.pick(s.b.thresholds));
              return {
                conds: [join(a(), '||', b()), join(a(), '&&', b()), b().text],
                messages: s.outcomes.slice(0, 4),
                sampleVars: sceneValues(r, s),
              };
            },
            render: ({ conds, messages, values }) => letLines(values).concat([''], chainBody(conds, messages)),
          });
        },
      },
      {
        id: 'words-and-numbers',
        make(r) {
          const target = pickTarget(r);
          return buildChainTrace(r, {
            target,
            makeConds() {
              const s = kit.pickScene(r);
              const w = kit.pickWordVar(r);
              const [w1, w2] = r.sample(w.values, 2);
              const a = () => side(s.a, pickOp(r), r.pick(s.a.thresholds));
              return {
                conds: [join(side(w, '==', w1), '&&', a()), join(side(w, '==', w2), '||', a()), a().text],
                messages: s.outcomes.slice(0, 4),
                sampleVars: () => ({ [w.name]: r.pick(w.values), [s.a.name]: r.pick(kit.valuesOf(s.a)) }),
              };
            },
            render: ({ conds, messages, values }) => letLines(values).concat([''], chainBody(conds, messages)),
          });
        },
      },
      {
        id: 'function-with-parameters',
        make(r) {
          const target = pickTarget(r);
          const fnName = r.pick(kit.FUNCTION_NAMES);
          return buildChainTrace(r, {
            target,
            makeConds() {
              const s = kit.pickScene(r);
              const a = () => side(s.a, pickOp(r), r.pick(s.a.thresholds));
              const b = () => side(s.b, pickOp(r), r.pick(s.b.thresholds));
              return {
                conds: [join(a(), '&&', b()), join(a(), '||', b()), a().text],
                messages: s.outcomes.slice(0, 4),
                sampleVars: sceneValues(r, s),
              };
            },
            render: ({ conds, messages, values }) => {
              const names = Object.keys(values);
              return [`function ${fnName}(${names.join(', ')}){`]
                .concat(chainBody(conds, messages, '  '), ['}', '', `${fnName}(${names.map((n) => lit(values[n])).join(', ')})`]);
            },
          });
        },
      },
    ],
  };

  // ---- Slot: where the mouse is decides the color ----

  const onLineNote = 'Check conditions from the top and stop at the first true one. A mouse exactly on a dividing line is not above or below it, so < and > are both false there.';

  const traceMouseSlot = {
    id: 'traceMouse',
    skill: 'flow',
    concept: 'Predicting what happens at different mouse positions',
    patterns: [
      {
        id: 'two-corners-and-else',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [q1, q2, q3] = pickQuadrantSet(r);
          const colors = r.sample(kit.COLORS, 3);
          const varName = r.pick(kit.COLOR_VARS.background);
          const code = chainLines(
            [{ cond: kit.quadCond(q1, c), body: kit.setColor(varName, colors[0]) },
              { cond: kit.quadCond(q2, c), body: kit.setColor(varName, colors[1]) }],
            kit.setColor(varName, colors[2]),
          );
          const inQ1 = kit.quadPoint(r, q1, c);
          return kit.colorRows(r, {
            code,
            varName,
            colors,
            points: [inQ1, kit.quadPoint(r, q2, c), kit.quadPoint(r, q3, c), { mouseX: c.cx, mouseY: inQ1.mouseY }],
            explain: onLineNote,
          });
        },
      },
      {
        id: 'thirds-of-the-canvas',
        make(r) {
          const h = r.pick([300, 450, 600]);
          const w = r.pick([300, 400, 600]);
          const [a, b] = [h / 3, (2 * h) / 3];
          const colors = r.sample(kit.COLORS, 3);
          const varName = r.pick(kit.COLOR_VARS.light);
          const code = chainLines(
            [{ cond: `mouseY < ${a}`, body: kit.setColor(varName, colors[0]) },
              { cond: `mouseY > ${a} && mouseY < ${b}`, body: kit.setColor(varName, colors[1]) }],
            kit.setColor(varName, colors[2]),
          );
          const x = () => r.int(1, w / 10 - 1) * 10;
          return kit.colorRows(r, {
            code,
            varName,
            colors,
            points: [
              { mouseX: x(), mouseY: a - 20 },
              { mouseX: x(), mouseY: a + 20 },
              { mouseX: x(), mouseY: b + 20 },
              { mouseX: x(), mouseY: a },
            ],
            explain: onLineNote,
          });
        },
      },
      {
        id: 'outer-edges-with-or',
        make(r) {
          const c = r.pick(kit.CANVASES.filter((k) => k.w % 200 === 0));
          const x1 = c.w / 4;
          const x2 = (3 * c.w) / 4;
          const colors = r.sample(kit.COLORS, 3);
          const varName = r.pick(kit.COLOR_VARS.background);
          const yOp = r.pick(['<', '>']);
          const code = chainLines(
            [{ cond: `mouseX < ${x1} || mouseX > ${x2}`, body: kit.setColor(varName, colors[0]) },
              { cond: `mouseY ${yOp} ${c.cy}`, body: kit.setColor(varName, colors[1]) }],
            kit.setColor(varName, colors[2]),
          );
          const midX = () => x1 + 10 * r.int(1, (x2 - x1) / 10 - 1);
          const upper = 10 * r.int(1, c.cy / 10 - 1);
          const lower = c.cy + 10 * r.int(1, (c.h - c.cy) / 10 - 1);
          return kit.colorRows(r, {
            code,
            varName,
            colors,
            points: [
              { mouseX: r.pick([10 * r.int(1, x1 / 10 - 1), x2 + 10]), mouseY: r.pick([upper, lower]) },
              { mouseX: midX(), mouseY: upper },
              { mouseX: midX(), mouseY: lower },
              { mouseX: midX(), mouseY: c.cy },
            ],
            explain: onLineNote,
          });
        },
      },
      {
        id: 'hover-over-a-box',
        make(r) {
          const c = r.pick(kit.CANVASES.filter((k) => k.w % 200 === 0 && k.h % 200 === 0));
          const x1 = c.w / 4;
          const x2 = (3 * c.w) / 4;
          const y1 = c.h / 4;
          const y2 = (3 * c.h) / 4;
          const colors = r.sample(kit.COLORS, 3);
          const varName = r.pick(kit.COLOR_VARS.shape);
          const code = chainLines(
            [{ cond: `mouseX > ${x1} && mouseX < ${x2} && mouseY > ${y1}`, body: kit.setColor(varName, colors[0]) },
              { cond: `mouseX < ${x1} || mouseX > ${x2}`, body: kit.setColor(varName, colors[1]) }],
            kit.setColor(varName, colors[2]),
          );
          const midX = () => x1 + 10 * r.int(1, (x2 - x1) / 10 - 1);
          return kit.colorRows(r, {
            code,
            varName,
            colors,
            points: [
              { mouseX: midX(), mouseY: y1 + 20 },
              { mouseX: r.pick([x1 - 20, x2 + 20]), mouseY: y1 + 20 },
              { mouseX: midX(), mouseY: y1 - 20 },
              { mouseX: x1, mouseY: y1 + 20 },
            ],
            explain: onLineNote,
          });
        },
      },
    ],
  };

  // ---- Slot: tap each line that runs ----

  const flowSlot = {
    id: 'flow',
    skill: 'flow',
    concept: 'Seeing which lines of code run',
    patterns: [
      {
        id: 'two-separate-ifs',
        make(r) {
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const a = () => side(s.a, pickOp(r), r.pick(s.a.thresholds));
            const b = () => side(s.b, pickOp(r), r.pick(s.b.thresholds));
            const values = sceneValues(r, s)();
            return letLines(values).concat(
              [log('Starting')],
              chainLines([{ cond: join(a(), '&&', b()), body: log(s.outcomes[0]) }]),
              chainLines([{ cond: join(a(), '||', b()), body: log(s.outcomes[1]) }], log(s.outcomes[2])),
              [log('Finished')],
            );
          }, 'Separate if statements are checked one after the other, so more than one can run. An else belongs only to the if right before it. Lines outside any if always run.');
        },
      },
      {
        id: 'chain-then-if',
        make(r) {
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const a = () => side(s.a, pickOp(r), r.pick(s.a.thresholds));
            const b = () => side(s.b, pickOp(r), r.pick(s.b.thresholds));
            const values = sceneValues(r, s)();
            return letLines(values).concat(
              chainLines(
                [{ cond: join(a(), '&&', b()), body: log(s.outcomes[0]) },
                  { cond: a().text, body: log(s.outcomes[1]) }],
                log(s.outcomes[2]),
              ),
              chainLines([{ cond: join(a(), '||', b()), body: log(s.outcomes[3]) }]),
              [log('Finished')],
            );
          }, 'Only one branch of an if / else if / else chain can run. The next if is a new decision, so it gets checked no matter what the chain did.');
        },
      },
      {
        id: 'function-called-once',
        make(r) {
          const fn = r.pick(kit.FUNCTION_NAMES);
          const other = r.pick(kit.FUNCTION_NAMES.filter((n) => n !== fn));
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const a = () => side(s.a, pickOp(r), r.pick(s.a.thresholds));
            const b = () => side(s.b, pickOp(r), r.pick(s.b.thresholds));
            const values = sceneValues(r, s)();
            const names = Object.keys(values);
            return [`function ${fn}(${names.join(', ')}){`].concat(
              chainLines([{ cond: join(a(), r.pick(['&&', '||']), b()), body: log(s.outcomes[0]) }], log(s.outcomes[1]), '  '),
              ['}', '', `function ${other}(){`, `  ${log(s.outcomes[2])}`, '}', ''],
              [log('Starting'), `${fn}(${names.map((n) => lit(values[n])).join(', ')})`],
            );
          }, 'Code inside a function only runs when the function is called. A function that is never called does nothing.');
        },
      },
      {
        id: 'value-changes-along-the-way',
        make(r) {
          return kit.buildFlow(r, () => {
            const s = kit.pickScene(r);
            const a = side(s.a, r.pick(['>', '>=']), r.pick(s.a.thresholds));
            const b = () => side(s.b, pickOp(r), r.pick(s.b.thresholds));
            const change = 2 * s.a.step * r.int(1, 3);
            const values = sceneValues(r, s)();
            return letLines(values).concat(
              chainLines([{ cond: join(a, '&&', b()), body: `${s.a.name} = ${s.a.name} - ${change}` }]),
              chainLines([{ cond: join(a, '||', b()), body: log(s.outcomes[0]) }], log(s.outcomes[1])),
              [log('Finished')],
            );
          }, 'Code runs from top to bottom. If an earlier line changes a variable, later conditions see the new value.');
        },
      },
    ],
  };

  // ---- Slot: find the bug and say why ----

  const { WHY } = kit;

  const bugSceneSetup = (r) => {
    const s = kit.pickScene(r);
    const A = side(s.a, pickOp(r), s.a.t);
    const B = side(s.b, pickOp(r), s.b.t);
    const display = (v) => `let ${v.name} = ${r.pick(kit.valuesOf(v))}`;
    return { s, A, B, lets: [display(s.a), display(s.b)] };
  };

  const bugSlot = {
    id: 'bug',
    skill: 'flow',
    concept: 'Finding and explaining bugs in conditions',
    patterns: [
      {
        id: 'or-should-be-and',
        make(r) {
          const { s, A, B, lets } = bugSceneSetup(r);
          const rest = (cond) => chainLines([{ cond, body: log(s.outcomes[0]) }], log(s.outcomes[1]));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${s.outcomes[0]}" only when ${say(A)} and ${say(B)}. Otherwise, it should print "${s.outcomes[1]}". Tap the line with the bug, then choose why it is wrong.`,
            code: lets.concat(rest(join(A, '||', B))),
            bugLines: [2],
            why: WHY.needsAnd,
            others: [WHY.needsOr, WHY.incomplete, WHY.elseCondition],
            fixed: lets.concat(rest(join(A, '&&', B))),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A, B]) },
            explain: `The if line should be: if(${join(A, '&&', B)}){`,
          });
        },
      },
      {
        id: 'and-should-be-or',
        make(r) {
          const { s, A, B, lets } = bugSceneSetup(r);
          const rest = (cond) => chainLines([{ cond, body: log(s.outcomes[0]) }], log(s.outcomes[1]));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${s.outcomes[0]}" when at least one of these is true: ${say(A)}, or ${say(B)}. Otherwise, it should print "${s.outcomes[1]}". Tap the line with the bug, then choose why it is wrong.`,
            code: lets.concat(rest(join(A, '&&', B))),
            bugLines: [2],
            why: WHY.needsOr,
            others: [WHY.needsAnd, WHY.incomplete, WHY.elseCondition],
            fixed: lets.concat(rest(join(A, '||', B))),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A, B]) },
            explain: `The if line should be: if(${join(A, '||', B)}){`,
          });
        },
      },
      {
        id: 'missing-variable',
        make(r) {
          const v = kit.pickScene(r).a;
          const { lo, hi } = pickRange(r, v);
          const message = r.pick(['In range', 'Just right', 'Looks good']);
          const otherwise = r.pick(['Out of range', 'Not this time', 'Try again']);
          const letLine = `let ${v.name} = ${r.pick(kit.valuesOf(v))}`;
          const rest = (cond) => chainLines([{ cond, body: log(message) }], log(otherwise));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${message}" only when ${v.noun} is above ${lo} and also below ${hi}. Tap the line with the bug, then choose why it is wrong.`,
            code: [letLine].concat(rest(`${v.name} > ${lo} && < ${hi}`)),
            bugLines: [1],
            why: WHY.incomplete,
            others: [WHY.needsOr, WHY.never, WHY.assign],
            fixed: [letLine].concat(rest(`${v.name} > ${lo} && ${v.name} < ${hi}`)),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>', lo), side(v, '<', hi)]) },
            explain: `The computer does not fill in the missing part the way a person would. Write it out: ${v.name} > ${lo} && ${v.name} < ${hi}`,
          });
        },
      },
      {
        id: 'mouseY-backwards',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const name = r.pick(kit.quadrantNames);
          const q = kit.QUADRANTS[name];
          const wrongY = q.y === '>' ? '<' : '>';
          const varName = r.pick(kit.COLOR_VARS.background);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const rest = (yOp) => chainLines(
            [{ cond: `mouseX ${q.x} ${c.cx} && mouseY ${yOp} ${c.cy}`, body: kit.setColor(varName, c1) }],
            kit.setColor(varName, c2),
          );
          const lets = [`let ${varName}`];
          return kit.bugQuestion(r, {
            prompt: `On ${kit.canvasName(c)}, this code should turn ${varName} ${c1.name} only when the mouse is in the ${name} part. Tap the line with the bug, then choose why it is wrong.`,
            code: lets.concat(rest(wrongY)),
            bugLines: [1],
            why: WHY.yDirection,
            others: [WHY.needsOr, WHY.incomplete, WHY.always],
            fixed: lets.concat(rest(q.y)),
            spec: {
              kind: 'snippet',
              hiddenSuffix: [`console.log(${varName})`],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: `The ${name} part needs mouseY ${q.y} ${c.cy}. A bigger mouseY means lower on the canvas.`,
          });
        },
      },
      {
        id: 'never-true',
        make(r) {
          const v = kit.pickScene(r).a;
          const { lo, hi } = pickRange(r, v);
          const message = r.pick(['Watch out', 'Too far', 'Out of bounds']);
          const otherwise = r.pick(['All good', 'Keep going', 'Safe']);
          const letLine = `let ${v.name} = ${r.pick(kit.valuesOf(v))}`;
          const rest = (cond) => chainLines([{ cond, body: log(message) }], log(otherwise));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${message}" when ${v.noun} is below ${lo} or above ${hi}. Tap the line with the bug, then choose why it is wrong.`,
            code: [letLine].concat(rest(`${v.name} < ${lo} && ${v.name} > ${hi}`)),
            bugLines: [1],
            why: WHY.never,
            others: [WHY.always, WHY.incomplete, WHY.elseCondition],
            fixed: [letLine].concat(rest(`${v.name} < ${lo} || ${v.name} > ${hi}`)),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '<', lo), side(v, '>', hi)]) },
            explain: `Nothing can be below ${lo} and above ${hi} at once. Use ||.`,
          });
        },
      },
      {
        id: 'always-true',
        make(r) {
          const v = kit.pickScene(r).a;
          const { lo, hi } = pickRange(r, v);
          const message = r.pick(['In range', 'Just right', 'Looks good']);
          const otherwise = r.pick(['Out of range', 'Not this time', 'Try again']);
          const letLine = `let ${v.name} = ${r.pick(kit.valuesOf(v))}`;
          const rest = (cond) => chainLines([{ cond, body: log(message) }], log(otherwise));
          return kit.bugQuestion(r, {
            prompt: `This code should print "${message}" only when ${v.noun} is above ${lo} and also below ${hi}. Tap the line with the bug, then choose why it is wrong.`,
            code: [letLine].concat(rest(`${v.name} > ${lo} || ${v.name} < ${hi}`)),
            bugLines: [1],
            why: WHY.always,
            others: [WHY.never, WHY.incomplete, WHY.elseCondition],
            fixed: [letLine].concat(rest(`${v.name} > ${lo} && ${v.name} < ${hi}`)),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>', lo), side(v, '<', hi)]) },
            explain: `Every number is above ${lo} or below ${hi}, so the else never runs. Use &&.`,
          });
        },
      },
      {
        id: 'unreachable-branch',
        make(r) {
          const v = kit.pickScene(r).a;
          const { lo, hi } = pickRange(r, v);
          const [m1, m2, m3] = r.sample(['Gold', 'Silver', 'Bronze', 'Blue ribbon', 'Red ribbon', 'Honorable mention'], 3);
          const letLine = `let ${v.name} = ${r.pick(kit.valuesOf(v))}`;
          const chain = (first, second, firstMsg, secondMsg) => chainLines(
            [{ cond: `${v.name} >= ${first}`, body: log(firstMsg) },
              { cond: `${v.name} >= ${second}`, body: log(secondMsg) }],
            log(m3),
          );
          return kit.bugQuestion(r, {
            prompt: `This code should print "${m1}" when ${v.noun} is at least ${hi}, "${m2}" when ${v.noun} is at least ${lo} but below ${hi}, and "${m3}" otherwise. "${m1}" never prints. Tap a line that causes the bug, then choose why it is wrong.`,
            code: [letLine].concat(chain(lo, hi, m2, m1)),
            bugLines: [1, 4],
            why: WHY.order,
            others: [WHY.needsAnd, WHY.incomplete, WHY.never],
            fixed: [letLine].concat(chain(hi, lo, m1, m2)),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([side(v, '>=', lo), side(v, '>=', hi)]) },
            explain: `Any value at least ${hi} is also at least ${lo}, so the first condition catches it. Check ${hi} first.`,
          });
        },
      },
      {
        id: 'else-with-condition',
        make(r) {
          const { s, A, B, lets } = bugSceneSetup(r);
          const code = lets.concat(
            [`if(${A.text}){`, `  ${log(s.outcomes[0])}`, '}', `else(${B.text}){`, `  ${log(s.outcomes[1])}`, '}'],
          );
          return kit.bugQuestion(r, {
            prompt: `This code should print "${s.outcomes[0]}" when ${say(A)}. If not, it should print "${s.outcomes[1]}" only when ${say(B)}. Tap the line with the bug, then choose why it is wrong.`,
            code,
            bugLines: [5],
            why: WHY.elseCondition,
            others: [WHY.needsAnd, WHY.incomplete, WHY.assign],
            fixed: lets.concat(chainLines(
              [{ cond: A.text, body: log(s.outcomes[0]) }, { cond: B.text, body: log(s.outcomes[1]) }],
            )),
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A, B]) },
            explain: `A condition after else needs else if: else if(${B.text}){`,
          });
        },
      },
    ],
  };

  // ---- Slot: complete one condition from a word bank ----

  const OP_POOL = ['>', '<', '>=', '<=', '=='];
  const CONN_POOL = ['&&', '||'];

  const blankCond = (A, op, B) => [
    tok(A.v.name, 'var'), ' ', tok(A.op, 'op'), ' ', tok(A.t, 'num'), ' ',
    tok(op, 'conn'), ' ',
    tok(B.v.name, 'var'), ' ', tok(B.op, 'op'), ' ', tok(B.t, 'num'),
  ];
  const sceneRunLines = (s) => [s.a, s.b].map((v) => ({
    text: `let ${v.name} = ${v.t}`,
    run: `let ${v.name} = __in.${v.name}`,
  }));
  const numberPool = (vars) => vars.reduce((all, v) => all.concat(v.thresholds || []), []);

  const blanksCondSlot = {
    id: 'blanksCond',
    skill: 'build',
    concept: 'Completing a condition with && or ||',
    patterns: [
      {
        id: 'mouse-part-of-canvas',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const name = r.pick(kit.quadrantNames);
          const q = kit.QUADRANTS[name];
          const color = r.pick(kit.COLORS);
          const varName = r.pick(kit.COLOR_VARS.background);
          const mouseX = kit.mouseVar('mouseX', c.w, c.cx);
          const mouseY = kit.mouseVar('mouseY', c.h, c.cy);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so ${varName} turns ${color.name} only when the mouse is in the ${name} part of ${kit.canvasName(c)}.`,
            lines: [
              ['if('].concat(blankCond(side(mouseX, q.x, c.cx), '&&', side(mouseY, q.y, c.cy)), ['){']),
              { text: `  ${kit.setColor(varName, color)}` },
              { text: '}' },
            ],
            must: ['conn'],
            count: 4,
            pools: { op: ['>', '<', '=='], conn: CONN_POOL, var: ['mouseX', 'mouseY'], num: [c.cx, c.cy, c.cx + 50, c.cy + 50] },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${varName} = "none"`],
              hiddenSuffix: [`console.log(${varName})`],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: `One part of the canvas needs both comparisons to be true: if(${kit.quadCond(name, c)}){`,
          });
        },
      },
      {
        id: 'both-must-be-true',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const B = side(s.b, pickOp(r), s.b.t);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints "${s.outcomes[0]}" only when ${say(A)} and ${say(B)}. Otherwise, it should print "${s.outcomes[1]}".`,
            lines: sceneRunLines(s).concat([
              ['if('].concat(blankCond(A, '&&', B), ['){']),
              { text: `  ${log(s.outcomes[0])}` },
              { text: '}' },
              { text: 'else{' },
              { text: `  ${log(s.outcomes[1])}` },
              { text: '}' },
            ]),
            must: ['conn'],
            count: 4,
            pools: { op: OP_POOL, conn: CONN_POOL, var: [s.a.name, s.b.name], num: numberPool([s.a, s.b]) },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A, B]) },
            explain: `The rule needs both, so: if(${join(A, '&&', B)}){`,
          });
        },
      },
      {
        id: 'either-can-be-true',
        make(r) {
          const s = kit.pickScene(r);
          const A = side(s.a, pickOp(r), s.a.t);
          const B = side(s.b, pickOp(r), s.b.t);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints "${s.outcomes[0]}" when at least one of these is true: ${say(A)}, or ${say(B)}. Otherwise, it should print "${s.outcomes[1]}".`,
            lines: sceneRunLines(s).concat([
              ['if('].concat(blankCond(A, '||', B), ['){']),
              { text: `  ${log(s.outcomes[0])}` },
              { text: '}' },
              { text: 'else{' },
              { text: `  ${log(s.outcomes[1])}` },
              { text: '}' },
            ]),
            must: ['conn'],
            count: 4,
            pools: { op: OP_POOL, conn: CONN_POOL, var: [s.a.name, s.b.name], num: numberPool([s.a, s.b]) },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A, B]) },
            explain: `One is enough, so: if(${join(A, '||', B)}){`,
          });
        },
      },
      {
        id: 'between-two-values',
        make(r) {
          const s = kit.pickScene(r);
          const v = s.a;
          const { lo, hi } = pickRange(r, v);
          const A = side(v, '>', lo);
          const B = side(v, '<', hi);
          return kit.blanksQuestion(r, {
            prompt: `Complete the code so it prints "${s.outcomes[0]}" only when ${v.noun} is above ${lo} and also below ${hi}.`,
            lines: [
              { text: `let ${v.name} = ${lo}`, run: `let ${v.name} = __in.${v.name}` },
              ['if('].concat(blankCond(A, '&&', B), ['){']),
              { text: `  ${log(s.outcomes[0])}` },
              { text: '}' },
            ],
            must: ['conn'],
            count: 4,
            pools: { op: ['>', '<', '=='], conn: CONN_POOL, var: [v.name, s.b.name], num: numberPool([v]) },
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A, B]) },
            explain: `Both comparisons must be true, and each needs the variable: if(${join(A, '&&', B)}){`,
          });
        },
      },
    ],
  };

  // ---- Slot: complete an if / else if / else chain from a word bank ----

  const KW_POOL = ['if', 'else if', 'else'];

  const blankChain = (branches, elseBody) => {
    const lines = [];
    branches.forEach((b, i) => {
      const head = i === 0 ? ['if('] : [tok('else if', 'kw'), '('];
      lines.push(head.concat(b.cond, ['){']));
      lines.push([`  `].concat(b.body));
      lines.push({ text: '}' });
    });
    lines.push([tok('else', 'kw'), '{']);
    lines.push([`  `].concat(elseBody));
    lines.push({ text: '}' });
    return lines;
  };
  const msgBody = (message) => ['console.log(', tok(lit(message), 'msg'), ')'];
  const fixedBody = (text) => [text];

  const chainPrompt = (rules) => `Complete the code so it follows these rules, in this order:\n${numberedRules(rules)}`;

  const blanksChainSlot = {
    id: 'blanksChain',
    skill: 'build',
    concept: 'Completing an if / else if / else chain',
    patterns: [
      {
        id: 'and-then-or',
        make(r) {
          const s = kit.pickScene(r);
          const { A1, B1, A2, B2, vectors } = pickChainSides(r, s, '&&', '||');
          const [m1, m2, m3] = s.outcomes;
          return kit.blanksQuestion(r, {
            prompt: chainPrompt([
              `If ${say(A1)} and ${say(B1)}, print "${m1}".`,
              `Otherwise, if ${say(A2)} or ${say(B2)}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ]),
            lines: sceneRunLines(s).concat(blankChain(
              [{ cond: blankCond(A1, '&&', B1), body: msgBody(m1) }, { cond: blankCond(A2, '||', B2), body: msgBody(m2) }],
              msgBody(m3),
            )),
            must: ['conn', 'kw'],
            count: 4,
            pools: {
              op: OP_POOL, conn: CONN_POOL, kw: KW_POOL, var: [s.a.name, s.b.name], num: numberPool([s.a, s.b]), msg: s.outcomes.map(lit),
            },
            spec: { kind: 'snippet', vectors },
            explain: '"and" in a rule means &&, and "or" means ||. A rule that starts with "otherwise, if" is an else if. "In every other case" is an else.',
          });
        },
      },
      {
        id: 'or-then-and',
        make(r) {
          const s = kit.pickScene(r);
          const { A1, B1, A2, B2, vectors } = pickChainSides(r, s, '||', '&&');
          const [m1, m2, m3] = s.outcomes;
          return kit.blanksQuestion(r, {
            prompt: chainPrompt([
              `If ${say(A1)} or ${say(B1)}, print "${m1}".`,
              `Otherwise, if ${say(A2)} and ${say(B2)}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ]),
            lines: sceneRunLines(s).concat(blankChain(
              [{ cond: blankCond(A1, '||', B1), body: msgBody(m1) }, { cond: blankCond(A2, '&&', B2), body: msgBody(m2) }],
              msgBody(m3),
            )),
            must: ['conn', 'kw'],
            count: 4,
            pools: {
              op: OP_POOL, conn: CONN_POOL, kw: KW_POOL, var: [s.a.name, s.b.name], num: numberPool([s.a, s.b]), msg: s.outcomes.map(lit),
            },
            spec: { kind: 'snippet', vectors },
            explain: '"or" in a rule means ||, and "and" means &&. A rule that starts with "otherwise, if" is an else if. "In every other case" is an else.',
          });
        },
      },
      {
        id: 'two-parts-of-the-canvas',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [q1, q2] = pickQuadrantSet(r);
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const varName = r.pick(kit.COLOR_VARS.background);
          const mx = kit.mouseVar('mouseX', c.w, c.cx);
          const my = kit.mouseVar('mouseY', c.h, c.cy);
          const cond = (name) => {
            const q = kit.QUADRANTS[name];
            return blankCond(side(mx, q.x, c.cx), '&&', side(my, q.y, c.cy));
          };
          return kit.blanksQuestion(r, {
            prompt: chainPrompt([
              `On ${kit.canvasName(c)}, if the mouse is in the ${q1} part, make ${varName} ${c1.name}.`,
              `Otherwise, if the mouse is in the ${q2} part, make ${varName} ${c2.name}.`,
              `In every other case, make ${varName} ${c3.name}.`,
            ]),
            lines: blankChain(
              [{ cond: cond(q1), body: fixedBody(kit.setColor(varName, c1)) },
                { cond: cond(q2), body: fixedBody(kit.setColor(varName, c2)) }],
              fixedBody(kit.setColor(varName, c3)),
            ),
            must: ['conn', 'kw'],
            count: 4,
            pools: { op: ['>', '<', '=='], conn: CONN_POOL, kw: KW_POOL, var: ['mouseX', 'mouseY'], num: [c.cx, c.cy, c.cx + 50, c.cy + 50] },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${varName} = "none"`],
              hiddenSuffix: [`console.log(${varName})`],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: 'Each part of the canvas needs two comparisons joined with &&. mouseY gets bigger going down.',
          });
        },
      },
      {
        id: 'thirds-of-the-canvas',
        make(r) {
          const h = r.pick([300, 450, 600]);
          const a = h / 3;
          const b = (2 * h) / 3;
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const varName = r.pick(kit.COLOR_VARS.light);
          const my = kit.mouseVar('mouseY', h, a);
          return kit.blanksQuestion(r, {
            prompt: chainPrompt([
              `On a canvas that is ${h} tall, if the mouse is above the line at y = ${a}, make ${varName} ${c1.name}.`,
              `Otherwise, if the mouse is between y = ${a} and y = ${b}, make ${varName} ${c2.name}.`,
              `In every other case, make ${varName} ${c3.name}.`,
            ]),
            lines: blankChain(
              [{ cond: [tok('mouseY', 'var'), ' ', tok('<', 'op'), ' ', tok(a, 'num')], body: fixedBody(kit.setColor(varName, c1)) },
                { cond: blankCond(side(my, '>', a), '&&', side(my, '<', b)), body: fixedBody(kit.setColor(varName, c2)) }],
              fixedBody(kit.setColor(varName, c3)),
            ),
            must: ['conn', 'kw'],
            count: 4,
            pools: { op: ['>', '<', '=='], conn: CONN_POOL, kw: KW_POOL, var: ['mouseX', 'mouseY'], num: [a, b, a + 50, b + 50] },
            spec: {
              kind: 'snippet',
              hiddenPrefix: [`let ${varName} = "none"`],
              hiddenSuffix: [`console.log(${varName})`],
              vectors: kit.mouseVectors(400, h, [], [a, b]),
            },
            explain: 'Above the line means a smaller mouseY. Between two lines needs two comparisons joined with &&.',
          });
        },
      },
    ],
  };

  // ---- Slot: put scrambled console code in order ----

  const SCRAMBLE_PROMPT = 'Put these lines in order so the code does this:';
  const sceneFixedLets = (r, s) => [s.a, s.b].map((v) => ({
    text: `let ${v.name} = ${r.pick(kit.valuesOf(v))}`,
    run: `let ${v.name} = __in.${v.name}`,
  }));

  const parsonsOffSlot = {
    id: 'parsonsOff',
    skill: 'build',
    concept: 'Putting scrambled if / else if / else code in order',
    patterns: [
      {
        id: 'and-then-or',
        make(r) {
          const s = kit.pickScene(r);
          const { A1, B1, A2, B2, vectors } = pickChainSides(r, s, '&&', '||');
          const [m1, m2, m3] = s.outcomes;
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              `If ${say(A1)} and ${say(B1)}, print "${m1}".`,
              `Otherwise, if ${say(A2)} or ${say(B2)}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ])}`,
            prefix: sceneFixedLets(r, s),
            movable: chainLines(
              [{ cond: join(A1, '&&', B1), body: log(m1) }, { cond: join(A2, '||', B2), body: log(m2) }],
              log(m3),
            ),
            spec: { kind: 'snippet', vectors },
            explain: 'An if comes first, then else if, then else. Each message goes right after the condition it belongs to.',
          });
        },
      },
      {
        id: 'or-then-and',
        make(r) {
          const s = kit.pickScene(r);
          const { A1, B1, A2, B2, vectors } = pickChainSides(r, s, '||', '&&');
          const [m1, m2, m3] = s.outcomes;
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              `If ${say(A1)} or ${say(B1)}, print "${m1}".`,
              `Otherwise, if ${say(A2)} and ${say(B2)}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ])}`,
            prefix: sceneFixedLets(r, s),
            movable: chainLines(
              [{ cond: join(A1, '||', B1), body: log(m1) }, { cond: join(A2, '&&', B2), body: log(m2) }],
              log(m3),
            ),
            spec: { kind: 'snippet', vectors },
            explain: 'An if comes first, then else if, then else. Each message goes right after the condition it belongs to.',
          });
        },
      },
      {
        id: 'change-the-value-first',
        make(r) {
          const s = kit.pickScene(r);
          const v = s.a;
          const change = v.step * r.int(1, 3);
          const A = side(v, r.pick(['>', '>=']), v.t);
          const B = side(s.b, pickOp(r), s.b.t);
          const [m1, m2] = s.outcomes;
          const vectors = kit.sceneVectors([A, side(v, '>=', v.t - change), B]);
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              `Add ${change} to ${v.name}.`,
              `Then, if ${say(A)} and ${say(B)}, print "${m1}".`,
              `In every other case, print "${m2}".`,
              'At the very end, always print "Finished".',
            ])}`,
            prefix: sceneFixedLets(r, s),
            movable: [`${v.name} = ${v.name} + ${change}`].concat(
              chainLines([{ cond: join(A, '&&', B), body: log(m1) }], log(m2)),
              [log('Finished')],
            ),
            spec: { kind: 'snippet', vectors },
            explain: 'Code runs top to bottom, so the value has to change before the if checks it. "Finished" goes after the whole if / else.',
          });
        },
      },
      {
        id: 'inside-a-function',
        make(r) {
          const s = kit.pickScene(r);
          const fn = r.pick(kit.FUNCTION_NAMES);
          let A1;
          let B1;
          let A2;
          do {
            A1 = side(s.a, pickOp(r), s.a.t);
            B1 = side(s.b, pickOp(r), s.b.t);
            A2 = side(s.a, pickOp(r), r.pick(s.a.thresholds));
          } while (!chainMatters([join(A1, '&&', B1), A2.text], kit.sceneVectors([A1, B1, A2])));
          const [m1, m2, m3] = s.outcomes;
          const callArgs = [s.a, s.b].map((v) => r.pick(kit.valuesOf(v)));
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              `Inside ${fn}, if ${say(A1)} and ${say(B1)}, print "${m1}".`,
              `Otherwise, if ${say(A2)}, print "${m2}".`,
              `In every other case, print "${m3}".`,
            ])}`,
            prefix: [{ text: `function ${fn}(${s.a.name}, ${s.b.name}){` }],
            movable: chainLines(
              [{ cond: join(A1, '&&', B1), body: log(m1) }, { cond: A2.text, body: log(m2) }],
              log(m3),
            ),
            suffix: [
              { text: '}' },
              { text: `${fn}(${callArgs.join(', ')})`, run: `${fn}(__in.${s.a.name}, __in.${s.b.name})` },
            ],
            spec: { kind: 'snippet', vectors: kit.sceneVectors([A1, B1, A2]) },
            explain: 'An if comes first, then else if, then else. Each message goes right after the condition it belongs to.',
          });
        },
      },
    ],
  };

  // ---- Slot: put a scrambled sketch in order ----

  const DRAW_PREFIX = [{ text: 'function draw(){' }];
  const DRAW_SUFFIX = [{ text: '}' }];

  const parsonsCanvasSlot = {
    id: 'parsonsCanvas',
    skill: 'build',
    concept: 'Ordering a p5 sketch that reacts to the mouse',
    patterns: [
      {
        id: 'background-by-corner',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [q1, q2] = pickQuadrantSet(r);
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.background);
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              `On ${kit.canvasName(c)}, if the mouse is in the ${q1} part, make ${V} ${c1.name}.`,
              `Otherwise, if the mouse is in the ${q2} part, make ${V} ${c2.name}.`,
              `In every other case, make ${V} ${c3.name}.`,
              `Paint the background with ${V}.`,
            ])}`,
            prefix: DRAW_PREFIX,
            movable: chainLines(
              [{ cond: kit.quadCond(q1, c), body: kit.setColor(V, c1) }, { cond: kit.quadCond(q2, c), body: kit.setColor(V, c2) }],
              kit.setColor(V, c3),
            ).concat([`background(${V})`]),
            suffix: DRAW_SUFFIX,
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${V}`, 'function setup(){', `  createCanvas(${c.w}, ${c.h})`, `  ${V} = color(255, 255, 255)`, '}'],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: 'The if, else if, and else stay together, with each color right after its condition. background() can go before or after them because draw() keeps repeating.',
          });
        },
      },
      {
        id: 'circle-color',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const [c1, c2] = r.sample(kit.COLORS, 2);
          const V = r.pick(kit.COLOR_VARS.shape);
          const xOp = r.pick(['>', '<']);
          const yOp = r.pick(['>', '<']);
          const cond = `mouseX ${xOp} ${c.cx} || mouseY ${yOp} ${c.cy}`;
          const xWord = xOp === '>' ? 'right side' : 'left side';
          const yWord = yOp === '>' ? 'bottom half' : 'top half';
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              'Paint a gray background behind everything.',
              `On ${kit.canvasName(c)}, if the mouse is on the ${xWord} or in the ${yWord}, make ${V} ${c1.name}.`,
              `In every other case, make ${V} ${c2.name}.`,
              `Fill with ${V} and draw the circle on top of the background.`,
            ])}`,
            prefix: DRAW_PREFIX,
            movable: ['background(220)'].concat(
              chainLines([{ cond, body: kit.setColor(V, c1) }], kit.setColor(V, c2)),
              [`fill(${V})`, `ellipse(${c.cx}, ${c.cy}, 100, 100)`],
            ),
            suffix: DRAW_SUFFIX,
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${V}`, 'function setup(){', `  createCanvas(${c.w}, ${c.h})`, `  ${V} = color(255, 255, 255)`, '}'],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: 'background() has to come before ellipse(), or it paints over the circle. Each color goes right after its condition.',
          });
        },
      },
      {
        id: 'background-by-thirds',
        make(r) {
          const h = r.pick([300, 450, 600]);
          const a = h / 3;
          const b = (2 * h) / 3;
          const [c1, c2, c3] = r.sample(kit.COLORS, 3);
          const V = r.pick(kit.COLOR_VARS.light);
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              `On a canvas that is ${h} tall, if the mouse is above the line at y = ${a}, make ${V} ${c1.name}.`,
              `Otherwise, if the mouse is between y = ${a} and y = ${b}, make ${V} ${c2.name}.`,
              `In every other case, make ${V} ${c3.name}.`,
              `Paint the background with ${V}.`,
            ])}`,
            prefix: DRAW_PREFIX,
            movable: chainLines(
              [{ cond: `mouseY < ${a}`, body: kit.setColor(V, c1) }, { cond: `mouseY > ${a} && mouseY < ${b}`, body: kit.setColor(V, c2) }],
              kit.setColor(V, c3),
            ).concat([`background(${V})`]),
            suffix: DRAW_SUFFIX,
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${V}`, 'function setup(){', `  createCanvas(400, ${h})`, `  ${V} = color(255, 255, 255)`, '}'],
              vectors: kit.mouseVectors(400, h, [], [a, b]),
            },
            explain: 'A smaller mouseY is higher on the canvas. Each color goes right after its condition, and the else comes last.',
          });
        },
      },
      {
        id: 'circle-size',
        make(r) {
          const c = r.pick(kit.CANVASES);
          const S = r.pick(kit.COLOR_VARS.size);
          const name = r.pick(kit.quadrantNames);
          const [big, small] = r.pick([[150, 50], [200, 80], [120, 40]]);
          return kit.parsonsQuestion(r, {
            prompt: `${SCRAMBLE_PROMPT}\n${numberedRules([
              'Paint a gray background behind everything.',
              `On ${kit.canvasName(c)}, if the mouse is in the ${name} part, make ${S} equal ${big}.`,
              `In every other case, make ${S} equal ${small}.`,
              `Draw a circle that is ${S} wide and ${S} tall on top of the background.`,
            ])}`,
            prefix: DRAW_PREFIX,
            movable: ['background(220)'].concat(
              chainLines([{ cond: kit.quadCond(name, c), body: `${S} = ${big}` }], `${S} = ${small}`),
              [`ellipse(${c.cx}, ${c.cy}, ${S}, ${S})`],
            ),
            suffix: DRAW_SUFFIX,
            spec: {
              kind: 'sketch',
              hiddenPrefix: [`let ${S}`, 'function setup(){', `  createCanvas(${c.w}, ${c.h})`, `  ${S} = 100`, '}'],
              vectors: kit.mouseVectors(c.w, c.h, [c.cx], [c.cy]),
            },
            explain: 'background() has to come before ellipse(), or it paints over the circle. Each size goes right after its condition.',
          });
        },
      },
    ],
  };

  CC.defineLesson({
    id: 'U2LA1.3',
    title: 'Logical Operators And/Or',
    unit: 2,
    source: 'curriculum/02-unit-2/04-U2LA1.3-Logical-Operators-And-Or.md',
    defaults: {
      minutes: 20, questions: 12, attempts: 2, practice: true,
    },
    notYetTaught: [
      [/\breturn\b/, 'return values (U2LA3.2)'],
      [/\bfor\b\s*\(|\bwhile\b\s*\(/, 'loops (Unit 3)'],
      [/\[/, 'arrays (Unit 3)'],
      [/!\w/, 'the ! operator'],
      [/\btrue\b|\bfalse\b/, 'boolean values in code'],
    ],
    slots: [
      truthSlot, translateSlot, explainSlot, regionSlot,
      traceChainSlot, traceMouseSlot, flowSlot, bugSlot,
      blanksCondSlot, blanksChainSlot, parsonsOffSlot, parsonsCanvasSlot,
    ],
    // When a teacher asks for fewer questions, slots are used in this order so a short
    // test still covers concepts, code flow, and writing code.
    priority: [
      'parsonsOff', 'blanksCond', 'traceChain', 'truth', 'region', 'flow',
      'blanksChain', 'bug', 'translate', 'traceMouse', 'parsonsCanvas', 'explain',
    ],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
