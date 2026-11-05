// Shared builders for the Unit 1 tests, which are mostly about drawing rather than logic.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = {};
  CC.u1 = U;

  U.at = (r, lo, hi) => 10 * r.int(lo, hi);
  U.spec = (vectors) => ({ kind: 'snippet', vectors: vectors || [{}] });

  // Words about where something is, on any canvas size.
  U.place = (x, y, w, h) => `${y < h / 2 ? 'top' : 'bottom'}-${x < w / 2 ? 'left' : 'right'}`;
  U.PLACES = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  U.placeQuestion = (r, {
    prompt, code, x, y, w, h, explain,
  }) => {
    const correct = U.place(x, y, w, h);
    return kit.choiceQuestion(r, {
      prompt,
      code,
      correct: `Near the ${correct} corner`,
      wrong: U.PLACES.filter((p) => p !== correct).map((p) => `Near the ${p} corner`),
      explain,
    });
  };
  // Keeps a point clearly inside one corner region.
  U.cornerPoint = (r, w, h) => [
    r.chance(0.5) ? 10 * r.int(2, w / 40) : w - 10 * r.int(2, w / 40),
    r.chance(0.5) ? 10 * r.int(2, h / 40) : h - 10 * r.int(2, h / 40),
  ];
  U.canvas = (r) => r.pick([[400, 400], [600, 400], [500, 300], [800, 600]]);

  U.choice = (r, prompt, correct, wrong, explain, extra) => kit.choiceQuestion(r, {
    prompt, correct, wrong, explain, ...(extra || {}),
  });

  // Runs drawing code and reports the shapes it made, in the order they were drawn.
  U.shapesOf = (code, vec) => {
    const result = CC.runCode(code.join('\n'), vec || {}, 'snippet');
    if (result.error) throw new Error(`Generated code failed: ${result.error}\n${code.join('\n')}`);
    return result;
  };

  // Put drawing lines in order, inside draw().
  U.drawParsons = (r, {
    rules, lines, explain, vectors, hidden,
  }) => kit.parsonsQuestion(r, {
    prompt: `Put these lines in order so the code does this:\n${kit.numberedRules(rules)}`,
    prefix: [{ text: 'function draw(){' }],
    movable: lines,
    suffix: [{ text: '}' }],
    spec: { kind: 'sketch', hiddenPrefix: hidden || [], vectors: vectors || [{ mouseX: 120, mouseY: 80 }] },
    explain,
  });

  U.FIND_BUG = 'Tap the line with the bug, then choose why it is wrong.';
  // Reasons that fit drawing code. Questions add their own right answer.
  U.REASONS = [
    'The values are in the wrong order for what this function expects.',
    'This function is missing a value it needs.',
    'Capital letters count, so the computer can\'t find a function with this spelling.',
    'Code runs from top to bottom, so this line is in the wrong place.',
    'This colors what is drawn after it, not what was drawn before it.',
    'This uses the wrong function, setting, or value for what the code should do.',
  ];
  U.bug = (r, {
    prompt, code, fixed, line, why, vectors, explain,
  }) => {
    const reason = U.REASONS[why];
    return kit.bugQuestion(r, {
      prompt: `${prompt} ${U.FIND_BUG}`,
      code,
      bugLines: Array.isArray(line) ? line : [line],
      why: reason,
      others: r.sample(U.REASONS.filter((text) => text !== reason), 3),
      fixed,
      spec: U.spec(vectors),
      explain,
    });
  };

  // Builds a slot from named patterns: { name(r) { return question } }.
  U.slot = (id, skill, concept, patterns) => ({
    id,
    skill,
    concept,
    patterns: Object.keys(patterns).map((name) => ({ id: name, make: patterns[name] })),
  });

  // Unit 1 has already been taught, so its practice starts available.
  U.lesson = (id, title, file, minutes, questions, notYetTaught, slots) => CC.defineLesson({
    id,
    title,
    unit: 1,
    source: `curriculum/01-unit-1/${file}`,
    defaults: {
      minutes, questions, attempts: 2, practice: true,
    },
    notYetTaught,
    slots,
    priority: slots.map((slot) => slot.id),
  });

  U.NO_LOGIC = [
    [/\bif\s*\(|\belse\b/, 'conditionals (Unit 2)'],
    [/\bfor\s*\(|\bwhile\s*\(/, 'loops (Unit 3)'],
    [/\breturn\b/, 'return values (Unit 2)'],
  ];
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
