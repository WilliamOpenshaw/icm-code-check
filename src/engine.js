// Test engine: seeded randomness, running code, building a test from a lesson's
// question slots, and grading. Plain data goes in and out, so tests and the browser
// share all of this code.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  // ---- Seeded randomness: the same seed always rebuilds the same test ----

  function hashSeed(text) {
    let h = 1779033703 ^ text.length;
    for (let i = 0; i < text.length; i++) {
      h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  CC.makeRng = function (seedText) {
    const seed = String(seedText);
    let state = hashSeed(seed);
    const next = () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = {
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      pick: (list) => {
        if (!list.length) throw new Error('Cannot pick from an empty list');
        return list[Math.floor(next() * list.length)];
      },
      chance: (p) => next() < p,
      shuffle: (list) => {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      },
      sample: (list, n) => r.shuffle(list).slice(0, n),
      fork: (label) => CC.makeRng(`${seed}/${label}`),
    };
    return r;
  };

  // A short code that is easy to read aloud; no 0/O or 1/I.
  CC.newSeed = function () {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(8);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);
    return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
  };

  // ---- Running code ----

  CC.evalExpr = (expr, vars) => CC.Mini.evalExpression(expr, vars);

  // Mirrors p5.collide2D: touching an edge counts as colliding.
  const collide = {
    collidePointRect: (px, py, x, y, w, h) => px >= x && px <= x + w && py >= y && py <= y + h,
    collidePointCircle: (px, py, cx, cy, d) => Math.hypot(px - cx, py - cy) <= d / 2,
  };

  // Plain functions questions can use in a condition without running a whole program.
  CC.p5Functions = {
    ...collide,
    map: (v, a, b, c, d) => ((v - a) / (b - a)) * (d - c) + c,
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    floor: (v) => Math.floor(v),
    collidePointEllipse: (px, py, x, y, w, h) => ((px - x) / (w / 2)) ** 2 + ((py - y) / (h / 2)) ** 2 <= 1,
  };

  // The p5 world a question's code runs in. The tests run real JavaScript against these
  // same functions, so the interpreter and the language can be compared.
  CC.makeHostGlobals = function (vec, record) {
    const spot = () => ({ x: record.tx || 0, y: record.ty || 0, turn: record.turn || 0, mode: record.angleMode });
    const shape = (name) => (...args) => record.shapes.push([name, args, record.fill, record.weight, record.stroke, spot()]);
    const STYLES = ['fill', 'weight', 'stroke', 'tx', 'ty', 'turn', 'tint'];
    const stack = [];
    // Angles are rounded so that sin(180) in degrees comes out as exactly 0.
    const angle = (a) => (record.angleMode === 'DEGREES' ? (a * Math.PI) / 180 : a);
    const tidy = (v) => Math.round(v * 1e10) / 1e10;
    const paint = (...args) => `${record.colorMode || ''}${args.join(',')}`;
    return {
      ...CC.p5Functions,
      console: {
        log: (...args) => record.logs.push(args
          .map((a) => (typeof a === 'function' || (a && a.decl) ? '[function]' : String(a)))
          .join(' ')),
      },
      color: (...args) => `rgb(${args.join(',')})`,
      __in: vec.inputs || {},
      mouseX: vec.mouseX,
      mouseY: vec.mouseY,
      pmouseX: vec.pmouseX === undefined ? vec.mouseX : vec.pmouseX,
      pmouseY: vec.pmouseY === undefined ? vec.mouseY : vec.pmouseY,
      mouseIsPressed: !!vec.mouseIsPressed,
      keyIsPressed: !!vec.keyIsPressed,
      key: vec.key === undefined ? '' : vec.key,
      frameCount: 0,
      width: vec.width === undefined ? 400 : vec.width,
      height: vec.height === undefined ? 400 : vec.height,
      createCanvas: (w, h) => {
        record.canvas = [w, h];
        if (record.onCanvas) record.onCanvas(w, h);
      },
      background: (...c) => {
        record.bg = paint(...c);
        record.shapes = [];
      },
      fill: (...c) => { record.fill = paint(...c); },
      strokeWeight: (w) => { record.weight = w; },
      noStroke: () => { record.stroke = 'none'; },
      stroke: (...c) => { record.stroke = paint(...c); },
      noFill: () => { record.fill = 'none'; },
      colorMode: (mode) => { record.colorMode = mode; },
      angleMode: (mode) => { record.angleMode = mode; },
      rectMode: (mode) => { record.rectMode = mode; },
      push: () => { stack.push(STYLES.map((name) => record[name])); },
      pop: () => {
        const saved = stack.pop();
        if (saved) STYLES.forEach((name, i) => { record[name] = saved[i]; });
      },
      translate: (x, y) => { record.tx = (record.tx || 0) + x; record.ty = (record.ty || 0) + y; },
      rotate: (a) => { record.turn = (record.turn || 0) + a; },
      sin: (a) => tidy(Math.sin(angle(a))),
      cos: (a) => tidy(Math.cos(angle(a))),
      // Printed so that a question can check the frame rate was set.
      frameRate: (fps) => { record.logs.push(`frame rate ${fps}`); },
      abs: (v) => Math.abs(v),
      RGB: 'RGB',
      HSB: 'HSB',
      DEGREES: 'DEGREES',
      RADIANS: 'RADIANS',
      CENTER: 'CENTER',
      CORNER: 'CORNER',
      CLOSE: 'CLOSE',
      PI: Math.PI,
      // Always the middle of the range, so a program with random() has one right behavior.
      random: (a, b) => (b === undefined ? a / 2 : (a + b) / 2),
      triangle: shape('triangle'),
      quad: shape('quad'),
      arc: shape('arc'),
      beginShape: shape('beginShape'),
      vertex: shape('vertex'),
      endShape: shape('endShape'),
      ellipse: shape('ellipse'),
      rect: shape('rect'),
      circle: shape('circle'),
      line: shape('line'),
      point: shape('point'),
      text: (...args) => record.shapes.push(['text', args, record.fill, record.textSize, record.textFont]),
      textSize: (size) => { record.textSize = size; },
      textFont: (font) => { record.textFont = font && font.file ? font.file : font; },
      loadFont: (file) => ({ file }),
      loadImage: (file) => ({ file }),
      image: (img, ...args) => record.shapes.push(['image', img && img.file, args, record.tint]),
      tint: (...c) => { record.tint = paint(...c); },
      noTint: () => { record.tint = undefined; },
      // Playing a sound prints a line, so a question can check what plays and when.
      loadSound: (file) => {
        const sound = {
          file,
          playing: false,
          play() { sound.playing = true; record.logs.push(`play ${file}`); },
          stop() { sound.playing = false; record.logs.push(`stop ${file}`); },
          isPlaying() { return sound.playing; },
        };
        return sound;
      },
    };
  };

  const FRAME_VALUES = ['mouseX', 'mouseY', 'mouseIsPressed', 'keyIsPressed', 'key'];

  // Plays a sketch the way p5 does: setup() once, then draw() again and again, with the
  // mouse and keyboard changing between frames. vec.frames lists what changes on each
  // frame; without it, nothing changes for three frames, so a one-frame delay does not
  // count as a difference. A hidden __report() can print final values for a key.
  CC.driveSketch = function (api, vec) {
    if (api.has('preload')) api.call('preload');
    if (api.has('setup')) api.call('setup');
    let previous = {
      mouseX: vec.mouseX,
      mouseY: vec.mouseY,
      mouseIsPressed: !!vec.mouseIsPressed,
      keyIsPressed: !!vec.keyIsPressed,
      key: vec.key === undefined ? '' : vec.key,
    };
    let frameCount = 0;
    (vec.frames || [{}, {}, {}]).forEach((frame) => {
      const now = { ...previous, ...frame };
      api.set('pmouseX', previous.mouseX);
      api.set('pmouseY', previous.mouseY);
      FRAME_VALUES.forEach((name) => api.set(name, now[name]));
      if (now.mouseIsPressed && !previous.mouseIsPressed && api.has('mousePressed')) api.call('mousePressed');
      if (now.keyIsPressed && !previous.keyIsPressed && api.has('keyPressed')) api.call('keyPressed');
      frameCount += 1;
      api.set('frameCount', frameCount);
      if (api.has('draw')) api.call('draw');
      previous = now;
    });
    if (api.has('__report')) api.call('__report');
  };

  // The same few programs run many times while grading, so keep their parsed forms.
  const parsed = new Map();
  function parseCached(code) {
    if (!parsed.has(code)) {
      if (parsed.size > 300) parsed.clear();
      try {
        parsed.set(code, { ast: CC.Mini.parse(code) });
      } catch (err) {
        if (!(err instanceof CC.Mini.MiniError)) throw err;
        parsed.set(code, { error: err });
      }
    }
    const entry = parsed.get(code);
    if (entry.error) throw entry.error;
    return entry.ast;
  }

  // Runs code and describes what it did. Use kind 'sketch' to play setup() and draw().
  CC.runCode = function (code, vec, kind) {
    const v = vec || {};
    const record = {
      logs: [], shapes: [], bg: null, fill: 'white', weight: 1, canvas: null,
    };
    let hits = new Set();
    let error = null;
    try {
      const ast = parseCached(code);
      const interp = new CC.Mini.Interpreter(CC.makeHostGlobals(v, record));
      hits = interp.hits;
      record.onCanvas = (w, h) => {
        interp.setGlobal('width', w);
        interp.setGlobal('height', h);
      };
      interp.runProgram(ast);
      if (kind === 'sketch') {
        CC.driveSketch({
          has: (name) => interp.hasFunction(name),
          call: (name) => interp.callGlobal(name),
          set: (name, value) => interp.setGlobal(name, value),
        }, v);
      }
    } catch (err) {
      if (!(err instanceof CC.Mini.MiniError)) throw err;
      error = err.name;
    }
    return {
      logs: record.logs, shapes: record.shapes, bg: record.bg, canvas: record.canvas, hits, error,
    };
  };

  // A function passed where a number belongs is always wrong, so all functions look alike here.
  const plainFunctions = (key, value) => (typeof value === 'function' || (value && value.decl) ? 'a function' : value);
  CC.behaviorKey = (result) => JSON.stringify([result.logs, result.bg, result.shapes, result.canvas], plainFunctions);

  // True when the code matches the canonical program on every test vector.
  CC.sameBehavior = function (spec, canonicalCode, studentCode) {
    return spec.vectors.every((vec) => {
      const student = CC.runCode(studentCode, vec, spec.kind);
      if (student.error) return false;
      return CC.behaviorKey(student) === CC.behaviorKey(CC.runCode(canonicalCode, vec, spec.kind));
    });
  };

  // ---- Assembling answers into code ----

  const lineRun = (line) => (line.run === undefined ? line.text : line.run);

  CC.parsonsCode = function (q, order) {
    const middle = order.map((id) => lineRun(q.lines[id]));
    return []
      .concat(q.spec.hiddenPrefix || [], (q.prefix || []).map(lineRun), middle,
        (q.suffix || []).map(lineRun), q.spec.hiddenSuffix || [])
      .join('\n');
  };

  CC.blanksCode = function (q, tokens) {
    const lines = q.lines.map((line) => {
      if (line.run !== undefined) return line.run;
      return line.parts
        .map((p) => (p.blank === undefined ? p.text : (tokens[p.blank] === undefined ? '' : tokens[p.blank])))
        .join('');
    });
    return [].concat(q.spec.hiddenPrefix || [], lines, q.spec.hiddenSuffix || []).join('\n');
  };

  CC.blanksKey = (q) => q.blanks.map((b) => b.answer);

  CC.blanksDisplayLines = function (q, tokens) {
    return q.lines.map((line) => line.parts
      .map((p) => (p.blank === undefined ? p.text : (tokens[p.blank] === undefined ? '____' : tokens[p.blank])))
      .join(''));
  };

  // Longest common subsequence: lines already in the right relative order.
  function lcsLength(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length];
  }

  // How many lines must move to reach the canonical order. Identical lines such as }
  // are interchangeable because this compares their text.
  CC.parsonsMoves = function (q, order) {
    const texts = (ids) => ids.map((id) => q.lines[id].text);
    return order.length - lcsLength(texts(order), texts(q.solution));
  };

  // Used by lessons to start a scrambled question: never already working, and at least
  // two lines away from the answer so leaving it alone cannot earn partial credit.
  CC.scramble = function (r, q) {
    const canonical = CC.parsonsCode(q, q.solution);
    for (let tries = 0; tries < 300; tries++) {
      const order = r.shuffle(q.solution);
      if (CC.parsonsMoves(q, order) < 3) continue;
      if (CC.sameBehavior(q.spec, canonical, CC.parsonsCode(q, order))) continue;
      return order;
    }
    throw new Error('Could not scramble these lines');
  };

  // ---- Grading: every question is worth 1 point; one small mistake earns 1/2 ----

  const creditForMistakes = (mistakes) => (mistakes === 0 ? 1 : mistakes === 1 ? 0.5 : 0);

  CC.parseNumber = function (text) {
    const trimmed = String(text === undefined || text === null ? '' : text).trim();
    return trimmed === '' ? NaN : Number(trimmed);
  };

  const GRADERS = {
    choice(q, ans) {
      return { credit: ans === q.answer ? 1 : 0 };
    },
    number(q, ans) {
      return { credit: Math.abs(CC.parseNumber(ans) - q.answer) < 0.001 ? 1 : 0 };
    },
    rows(q, ans) {
      const picked = ans || {};
      const mistakes = q.rows.filter((row, i) => picked[i] !== row.answer).length;
      return { credit: creditForMistakes(mistakes), mistakes };
    },
    // With few parts, one mistake is most of the question, so half credit needs at least
    // six parts. Otherwise tapping nothing or everything could earn points.
    region(q, ans) {
      const picked = new Set(ans || []);
      const parts = q.cells.flat().length;
      let mistakes = 0;
      q.cells.forEach((row, y) => row.forEach((isTrue, x) => {
        if (picked.has(`${y},${x}`) !== isTrue) mistakes++;
      }));
      const earnsHalf = mistakes === 1 && parts >= 6 && picked.size > 0;
      return { credit: mistakes === 0 ? 1 : earnsHalf ? 0.5 : 0, mistakes };
    },
    lines(q, ans) {
      const picked = new Set(ans || []);
      let mistakes = 0;
      q.selectable.forEach((i) => {
        if (picked.has(i) !== q.hits.includes(i)) mistakes++;
      });
      const tappedNothingOrAll = picked.size === 0 || picked.size === q.selectable.length;
      return { credit: mistakes > 0 && tappedNothingOrAll ? 0 : creditForMistakes(mistakes), mistakes };
    },
    bug(q, ans) {
      const a = ans || {};
      const lineRight = q.bugLines.includes(a.line);
      const whyRight = a.why === q.why;
      return { credit: lineRight && whyRight ? 1 : lineRight || whyRight ? 0.5 : 0, lineRight, whyRight };
    },
    blanks(q, ans) {
      const tokens = ans || {};
      const key = CC.blanksKey(q);
      const allFilled = key.every((_, i) => tokens[i] !== undefined);
      if (allFilled && CC.sameBehavior(q.spec, CC.blanksCode(q, key), CC.blanksCode(q, tokens))) {
        return { credit: 1, mistakes: 0 };
      }
      const mistakes = Math.max(1, key.filter((token, i) => tokens[i] !== token).length);
      return { credit: creditForMistakes(mistakes), mistakes };
    },
    parsons(q, ans) {
      const order = ans || q.order;
      if (CC.sameBehavior(q.spec, CC.parsonsCode(q, q.solution), CC.parsonsCode(q, order))) {
        return { credit: 1, moves: 0 };
      }
      const moves = Math.max(1, CC.parsonsMoves(q, order));
      return { credit: moves === 1 ? 0.5 : 0, moves };
    },
  };

  CC.grade = (q, ans) => GRADERS[q.type](q, ans);

  CC.isAnswered = function (q, ans) {
    if (ans === undefined || ans === null) return false;
    switch (q.type) {
      case 'choice': return true;
      case 'number': return String(ans).trim() !== '';
      case 'rows': return q.rows.every((_, i) => ans[i] !== undefined);
      case 'region':
      case 'lines': return ans.length > 0;
      case 'bug': return ans.line !== undefined && ans.why !== undefined;
      case 'blanks': return q.blanks.every((_, i) => ans[i] !== undefined);
      case 'parsons': return true;
      default: return false;
    }
  };

  // ---- Lessons and test assembly ----

  CC.lessons = CC.lessons || {};
  CC.lessonOrder = CC.lessonOrder || [];

  CC.defineLesson = function (lesson) {
    const slotIds = lesson.slots.map((s) => s.id);
    lesson.priority.forEach((id) => {
      if (!slotIds.includes(id)) throw new Error(`Unknown slot ${id} in ${lesson.id}`);
    });
    CC.lessons[lesson.id] = lesson;
    CC.lessonOrder.push(lesson.id);
  };

  // A test built from slots in other lessons, such as an end-of-unit test.
  CC.defineComposite = function (test) {
    const slots = test.from.map(([lessonId, slotId]) => {
      const slot = CC.lessons[lessonId].slots.find((s) => s.id === slotId);
      if (!slot) throw new Error(`No slot ${slotId} in ${lessonId}`);
      return { ...slot, id: `${lessonId} ${slotId}` };
    });
    CC.defineLesson({
      ...test, composite: true, slots, priority: slots.map((slot) => slot.id),
    });
  };

  CC.SKILLS = [
    { id: 'concepts', label: 'Concepts' },
    { id: 'flow', label: 'Code flow' },
    { id: 'build', label: 'Writing code' },
  ];

  function makeQuestion(lesson, slot, pattern, r, uid) {
    // A rare mix of random values can fail to build, such as two identical answer choices.
    // Drawing again from the same seed keeps a student's test the same on any device.
    let q;
    for (let tries = 0; !q; tries++) {
      try {
        q = pattern.make(tries ? r.fork(`retry/${tries}`) : r);
      } catch (err) {
        if (tries >= 20) throw err;
      }
    }
    return { ...q, uid, slot: slot.id, pattern: pattern.id, skill: slot.skill, concept: slot.concept };
  }

  // options: { lessonId, seed, count, slotId } -- slotId limits practice to one kind of question.
  CC.buildTest = function (options) {
    const lesson = CC.lessons[options.lessonId];
    if (!lesson) throw new Error(`Unknown lesson ${options.lessonId}`);
    const seed = options.seed;
    const r = CC.makeRng(`${lesson.id}/${seed}`);
    const count = options.count || lesson.slots.length;
    const chosen = [];
    for (let i = 0; i < count; i++) {
      chosen.push(options.slotId || lesson.priority[i % lesson.priority.length]);
    }

    const used = {};
    const made = chosen.map((slotId, i) => {
      const slot = lesson.slots.find((s) => s.id === slotId);
      const taken = used[slotId] || (used[slotId] = []);
      const slotRng = r.fork(`${slotId}/${i}`);
      // A repeated slot takes each pattern once before reusing any of them.
      const fresh = slot.patterns.filter((p) => !taken.includes(p.id));
      const pattern = slotRng.pick(fresh.length ? fresh : slot.patterns);
      taken.push(pattern.id);
      return makeQuestion(lesson, slot, pattern, slotRng, `${slotId}#${i}`);
    });

    // Shuffled across all skills, so neighbors rarely reach the same kind of question together.
    const questions = r.fork('order').shuffle(made);
    return { lessonId: lesson.id, title: lesson.title, seed, questions };
  };

  const roundTo = (value, digits) => {
    const m = 10 ** digits;
    return Math.round(value * m) / m;
  };

  CC.scoreTest = function (test, answers) {
    const perQuestion = test.questions.map((q) => {
      const graded = CC.grade(q, answers[q.uid]);
      return { uid: q.uid, skill: q.skill, concept: q.concept, credit: graded.credit, graded };
    });
    const points = perQuestion.reduce((sum, p) => sum + p.credit, 0);
    const max = perQuestion.length;
    const skills = {};
    CC.SKILLS.forEach((skill) => {
      const group = perQuestion.filter((p) => p.skill === skill.id);
      const got = group.reduce((sum, p) => sum + p.credit, 0);
      skills[skill.id] = {
        got,
        max: group.length,
        percent: group.length ? roundTo((got / group.length) * 100, 1) : null,
      };
    });
    const missed = [];
    perQuestion.forEach((p) => {
      if (p.credit < 1 && !missed.includes(p.concept)) missed.push(p.concept);
    });
    return { points, max, percent: max ? roundTo((points / max) * 100, 1) : 0, skills, missed, perQuestion };
  };

  // ---- Plain-text answers for the teacher's records ----

  // "0,1" means row 0, column 1 of the canvas grid.
  const describeCells = (keys) => keys
    .map((key) => key.split(',').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(([y, x]) => `row ${y + 1} column ${x + 1}`)
    .join(', ');

  function describeAnswer(q, ans) {
    if ((ans === undefined || ans === null) && q.type !== 'parsons') return '(no answer)';
    switch (q.type) {
      case 'choice': return q.options[ans].text;
      case 'number': return String(ans).trim() || '(no answer)';
      case 'rows': return q.rows.map((_, i) => (ans[i] === undefined ? '-' : q.options[ans[i]].text)).join(' | ');
      case 'region': return describeCells(ans || []) || '(nothing selected)';
      case 'lines': return (ans || []).map((i) => q.code[i].trim()).join('\n') || '(nothing selected)';
      case 'bug':
        return `Line: ${ans.line === undefined ? '-' : q.code[ans.line].trim()}\nWhy: ${ans.why === undefined ? '-' : q.whyOptions[ans.why]}`;
      case 'blanks': return q.blanks.map((_, i) => ans[i] || '____').join(' | ');
      case 'parsons': return (ans || q.order).map((id) => q.lines[id].text).join('\n');
      default: return '';
    }
  }

  function describeKey(q) {
    switch (q.type) {
      case 'choice': return q.options[q.answer].text;
      case 'number': return String(q.answer);
      case 'rows': return q.rows.map((row) => q.options[row.answer].text).join(' | ');
      case 'region': {
        const on = [];
        q.cells.forEach((row, y) => row.forEach((v, x) => { if (v) on.push(`${y},${x}`); }));
        return describeCells(on);
      }
      case 'lines': return q.hits.map((i) => q.code[i].trim()).join('\n');
      case 'bug': return `Line: ${q.code[q.bugLines[0]].trim()}\nWhy: ${q.whyOptions[q.why]}`;
      case 'blanks': return CC.blanksKey(q).join(' | ');
      case 'parsons': return q.solution.map((id) => q.lines[id].text).join('\n');
      default: return '';
    }
  }

  // One compact record per question: enough to review a student's test after the fact,
  // even if the generators change in a later version.
  CC.detailRecords = function (test, answers, score) {
    return test.questions.map((q, i) => ({
      n: i + 1,
      slot: q.slot,
      pattern: q.pattern,
      credit: score.perQuestion[i].credit,
      prompt: q.prompt,
      answer: describeAnswer(q, answers[q.uid]),
      key: describeKey(q),
    }));
  };
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
