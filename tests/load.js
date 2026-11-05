// Loads the same source files the app ships, in the same order, into one context.
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { LOGIC_FILES, LESSON_FILES } = require('../tools/sources');

const root = path.join(__dirname, '..');

function loadCodeCheck() {
  const context = vm.createContext({ console, crypto: globalThis.crypto });
  LOGIC_FILES.concat(LESSON_FILES).forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  });
  return vm.runInContext('CodeCheck', context);
}

// In sloppy mode, x = 5 creates a global, which would leak into the next program tested.
// A function added to a string becomes its source text, which the interpreter doesn't keep,
// so while a program runs, functions turn into the same short text in both.
function withCleanGlobals(run) {
  const before = new Set(Object.getOwnPropertyNames(globalThis));
  const functionToString = Function.prototype.toString;
  // eslint-disable-next-line no-extend-native
  Function.prototype.toString = () => '[function]';
  try {
    return run();
  } finally {
    // eslint-disable-next-line no-extend-native
    Function.prototype.toString = functionToString;
    Object.getOwnPropertyNames(globalThis).forEach((name) => {
      if (!before.has(name)) delete globalThis[name];
    });
  }
}

// Runs code as real, sloppy-mode JavaScript with the same p5 stand-ins and the same frame
// driver as the app, so the only thing being compared is the interpreter.
function makeRealRunner(CC) {
  return (code, vec, kind) => withCleanGlobals(() => {
    const v = vec || {};
    const record = {
      logs: [], shapes: [], bg: null, fill: 'white', weight: 1, canvas: null,
    };
    const hosts = CC.makeHostGlobals(v, record);
    const names = Object.keys(hosts);
    const setters = names.map((n) => `if (__name === '${n}') ${n} = __value;`).join(' ');
    const callbacks = ['preload', 'setup', 'draw', 'mousePressed', 'keyPressed', '__report'];
    const table = callbacks.map((n) => `${n}: typeof ${n} === 'function' ? ${n} : undefined`).join(', ');
    const tail = `\n;return { fns: { ${table} }, set: function (__name, __value) { ${setters} } };`;
    let error = false;
    // A scrambled loop can run forever. The interpreter stops those with an error, so this
    // stops them the same way instead of hanging the tests.
    let passes = 0;
    const guard = () => {
      passes += 1;
      if (passes > 20000) throw new Error('Too many steps');
    };
    const guarded = code.replace(/^(\s*(?:while|for)\s*\(.*\)\s*\{)/gm, '$1 __guard();');
    try {
      // eslint-disable-next-line no-new-func
      const made = new Function('__guard', ...names, guarded + tail)(guard, ...names.map((n) => hosts[n]));
      if (kind === 'sketch') {
        record.onCanvas = (w, h) => {
          made.set('width', w);
          made.set('height', h);
        };
        CC.driveSketch({
          has: (name) => !!made.fns[name],
          call: (name) => made.fns[name](),
          set: made.set,
        }, v);
      }
    } catch (err) {
      error = true;
    }
    return {
      logs: record.logs, shapes: record.shapes, bg: record.bg, canvas: record.canvas, error,
    };
  });
}

// From here on, every program and condition the app runs is also run as real JavaScript.
// Any disagreement fails loudly, so an answer key can't rest on an interpreter bug.
function auditAgainstJavaScript(CC) {
  const runReal = makeRealRunner(CC);
  const runMine = CC.runCode;
  const evalMine = CC.evalExpr;
  const stats = { programs: 0, conditions: 0 };
  const hostNames = Object.keys(CC.makeHostGlobals({}, {})).join('|');
  const redefinesP5 = new RegExp(`\\b(function|let)\\s+(${hostNames})\\b`);
  CC.runCode = (code, vec, kind) => {
    const mine = runMine(code, vec, kind);
    // A wrong word in a blank can redefine something like mouseX. That is never a right
    // answer, and it can't be compared, because this test supplies p5 in a different way.
    if (redefinesP5.test(code)) return mine;
    const real = runReal(code, vec, kind);
    stats.programs += 1;
    assert.strictEqual(!!mine.error, real.error, `Interpreter says ${mine.error}, JavaScript says ${real.error} for:\n${code}`);
    // Two programs that both fail count the same, whenever each one noticed the problem.
    if (!real.error) {
      assert.strictEqual(CC.behaviorKey(mine), CC.behaviorKey(real), `Different results for:\n${code}\nwith ${JSON.stringify(vec)}`);
    }
    return mine;
  };
  CC.evalExpr = (expr, vars) => {
    const mine = evalMine(expr, vars);
    const names = Object.keys(vars);
    // eslint-disable-next-line no-new-func
    const real = withCleanGlobals(() => new Function(...names, `return (${expr})`)(...names.map((n) => vars[n])));
    stats.conditions += 1;
    assert.strictEqual(JSON.stringify(mine), JSON.stringify(real), `Different result for ${expr} with ${JSON.stringify(vars)}`);
    return mine;
  };
  return stats;
}

module.exports = {
  loadCodeCheck, makeRealRunner, auditAgainstJavaScript, root,
};
