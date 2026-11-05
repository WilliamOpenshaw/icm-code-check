// A tiny interpreter for the subset of JavaScript that test questions use.
// Answer keys and "does this arrangement work?" checks come from running code here,
// so the app never needs eval or new Function (Apps Script's sandbox may block them)
// and nothing a student does is ever executed as real code.
//
// Supported today: let/const, if/else if/else, while, for, functions and parameters, return,
// assignment, arithmetic, comparisons, && and ||, object literals, arrays and their
// methods, classes with new and this, typeof, and calls to host functions such as
// console.log and p5's. Every loop calls tick() so a scrambled loop cannot freeze a
// student's browser. Arrow functions are not supported, so they can only be displayed.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  class MiniError extends Error {
    constructor(kind, message, line) {
      super(message);
      this.name = kind;
      this.line = line;
    }
  }
  const syntaxError = (message, line) => new MiniError('SyntaxError', message, line);

  const RESERVED = new Set([
    'let', 'const', 'var', 'if', 'else', 'function', 'return', 'true', 'false', 'null',
    'while', 'for', 'do', 'class', 'new', 'this', 'typeof', 'switch', 'case', 'break',
    'continue', 'in', 'of', 'default', 'delete', 'void', 'try', 'catch', 'throw',
  ]);
  const OPERATORS = [
    '===', '!==', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=',
    '+', '-', '*', '/', '%', '<', '>', '=', '!', '(', ')', '{', '}', '[', ']', ',', '.', ';', ':',
  ];

  function tokenize(src) {
    const tokens = [];
    let i = 0;
    let line = 0;
    let newlineBefore = false;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '\n') { line++; newlineBefore = true; i++; continue; }
      if (ch === ' ' || ch === '\t' || ch === '\r') { i++; continue; }
      if (ch === '/' && src[i + 1] === '/') {
        while (i < src.length && src[i] !== '\n') i++;
        continue;
      }
      const push = (type, value) => {
        tokens.push({ type, value, line, nl: newlineBefore });
        newlineBefore = false;
      };
      if (/[0-9]/.test(ch)) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        push('num', Number(src.slice(i, j)));
        i = j;
        continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        let j = i;
        while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
        const word = src.slice(i, j);
        push(RESERVED.has(word) ? 'kw' : 'id', word);
        i = j;
        continue;
      }
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        let text = '';
        while (j < src.length && src[j] !== ch) {
          if (src[j] === '\n') throw syntaxError('Unterminated string', line);
          if (src[j] === '\\') { text += src[j + 1]; j += 2; continue; }
          text += src[j];
          j++;
        }
        if (j >= src.length) throw syntaxError('Unterminated string', line);
        push('str', text);
        i = j + 1;
        continue;
      }
      const op = OPERATORS.find((o) => src.startsWith(o, i));
      if (!op) throw syntaxError(`Unexpected character ${ch}`, line);
      push('op', op);
      i += op.length;
    }
    tokens.push({ type: 'eof', value: null, line, nl: true });
    return tokens;
  }

  const BINARY_PRECEDENCE = {
    '||': 1, '&&': 2,
    '==': 3, '!=': 3, '===': 3, '!==': 3,
    '<': 4, '>': 4, '<=': 4, '>=': 4,
    '+': 5, '-': 5,
    '*': 6, '/': 6, '%': 6,
  };
  const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=']);

  const isAssignable = (node) => node.k === 'Id' || node.k === 'Member' || node.k === 'Index';

  class Parser {
    constructor(src) {
      this.tokens = tokenize(src);
      this.pos = 0;
    }
    get tok() { return this.tokens[this.pos]; }
    isOp(v) { return this.tok.type === 'op' && this.tok.value === v; }
    isKw(v) { return this.tok.type === 'kw' && this.tok.value === v; }
    eatOp(v) {
      if (!this.isOp(v)) throw syntaxError(`Expected ${v}`, this.tok.line);
      this.pos++;
    }
    eatIdentifier() {
      if (this.tok.type !== 'id') throw syntaxError('Expected a name', this.tok.line);
      return this.tokens[this.pos++].value;
    }

    program() {
      const body = this.statementList(() => this.tok.type === 'eof', []);
      return { k: 'Block', body };
    }

    // Parses statements and rejects duplicate let declarations, which real JS treats as
    // an early error: the program fails before running anything. Declaring the same
    // function twice is allowed, and the last one wins. So is reusing a parameter's name.
    statementList(atEnd, parameterNames) {
      const lets = new Set();
      const others = new Set(parameterNames);
      const body = [];
      while (!atEnd()) {
        if (this.tok.type === 'eof') throw syntaxError('Missing }', this.tok.line);
        const stmt = this.statement();
        if (stmt.k === 'Class') {
          if (lets.has(stmt.name) || others.has(stmt.name)) throw syntaxError(`${stmt.name} was already declared`, stmt.line);
          lets.add(stmt.name);
        } else if (stmt.k === 'Let') {
          stmt.decls.forEach((d) => {
            if (lets.has(d.name) || others.has(d.name)) throw syntaxError(`${d.name} was already declared`, stmt.line);
            lets.add(d.name);
          });
        } else if (stmt.k === 'Function') {
          if (lets.has(stmt.name)) throw syntaxError(`${stmt.name} was already declared`, stmt.line);
          others.add(stmt.name);
        }
        body.push(stmt);
      }
      return body;
    }

    block(parameterNames) {
      this.eatOp('{');
      const body = this.statementList(() => this.isOp('}'), parameterNames || []);
      this.eatOp('}');
      return { k: 'Block', body };
    }

    endStatement() {
      if (this.isOp(';')) { this.pos++; return; }
      if (this.isOp('}') || this.tok.type === 'eof' || this.tok.nl) return;
      throw syntaxError('Unexpected code after statement', this.tok.line);
    }

    statement() {
      const line = this.tok.line;
      if (this.isOp('{')) return { ...this.block(), line };
      if (this.isOp(';')) { this.pos++; return { k: 'Empty', line }; }
      if (this.isKw('let') || this.isKw('const')) {
        const stmt = this.declaration(line);
        this.endStatement();
        return stmt;
      }
      if (this.isKw('while')) {
        this.pos++;
        this.eatOp('(');
        const test = this.expression();
        this.eatOp(')');
        return { k: 'While', test, body: this.loopBody(line), line };
      }
      if (this.isKw('for')) {
        this.pos++;
        this.eatOp('(');
        let init = null;
        if (this.isKw('let') || this.isKw('const')) init = this.declaration(line);
        else if (!this.isOp(';')) init = { k: 'Expr', expr: this.expression() };
        this.eatOp(';');
        const test = this.isOp(';') ? null : this.expression();
        this.eatOp(';');
        const update = this.isOp(')') ? null : this.expression();
        this.eatOp(')');
        return {
          k: 'For', init, test, update, body: this.loopBody(line), line,
        };
      }
      if (this.isKw('if')) {
        this.pos++;
        this.eatOp('(');
        const test = this.expression();
        this.eatOp(')');
        const then = this.statement();
        if (then.k === 'Let' || then.k === 'Function' || then.k === 'Class') {
          throw syntaxError('A declaration cannot be the body of if', line);
        }
        let otherwise = null;
        if (this.isKw('else')) {
          this.pos++;
          otherwise = this.statement();
          if (otherwise.k === 'Let' || otherwise.k === 'Function' || otherwise.k === 'Class') {
            throw syntaxError('A declaration cannot be the body of else', line);
          }
        }
        return { k: 'If', test, then, otherwise, line };
      }
      if (this.isKw('function')) {
        this.pos++;
        const name = this.eatIdentifier();
        return { ...this.functionRest(), k: 'Function', name, line };
      }
      if (this.isKw('class')) {
        this.pos++;
        const name = this.eatIdentifier();
        this.eatOp('{');
        const methods = [];
        while (!this.isOp('}')) {
          if (this.isOp(';')) { this.pos++; continue; }
          const t = this.tok;
          if (t.type !== 'id' && t.type !== 'kw') throw syntaxError('Expected a method', t.line);
          this.pos++;
          methods.push({ ...this.functionRest(), k: 'Method', name: t.value });
        }
        this.eatOp('}');
        if (methods.filter((f) => f.name === 'constructor').length > 1) throw syntaxError('Two constructors', line);
        return {
          k: 'Class', name, methods, line,
        };
      }
      if (this.isKw('return')) {
        this.pos++;
        let value = null;
        if (!this.isOp(';') && !this.isOp('}') && this.tok.type !== 'eof' && !this.tok.nl) {
          value = this.expression();
        }
        this.endStatement();
        return { k: 'Return', value, line };
      }
      if (this.tok.type === 'kw' && !['true', 'false', 'null', 'typeof', 'this', 'new'].includes(this.tok.value)) {
        throw syntaxError(`Unexpected ${this.tok.value}`, line);
      }
      // "name: statement" is a label in real JS. Scrambled object lines can form one.
      const after = this.tokens[this.pos + 1];
      if (this.tok.type === 'id' && after.type === 'op' && after.value === ':') {
        this.pos += 2;
        return this.statement();
      }
      const expr = this.expression();
      this.endStatement();
      return { k: 'Expr', expr, line };
    }

    declaration(line) {
      const isConst = this.tok.value === 'const';
      this.pos++;
      const decls = [];
      do {
        if (decls.length) this.eatOp(',');
        const name = this.eatIdentifier();
        let init = null;
        if (this.isOp('=')) { this.pos++; init = this.assignment(); }
        else if (isConst) throw syntaxError('const needs a value', line);
        decls.push({ name, init });
      } while (this.isOp(','));
      return {
        k: 'Let', decls, isConst, line,
      };
    }

    loopBody(line) {
      const body = this.statement();
      if (body.k === 'Let' || body.k === 'Function' || body.k === 'Class') {
        throw syntaxError('A declaration cannot be the body of a loop', line);
      }
      return body;
    }

    functionRest() {
      this.eatOp('(');
      const params = [];
      while (!this.isOp(')')) {
        if (params.length) this.eatOp(',');
        params.push(this.eatIdentifier());
      }
      this.eatOp(')');
      return { params, body: this.block(params) };
    }

    expression() {
      let node = this.assignment();
      while (this.isOp(',')) {
        this.pos++;
        node = { k: 'Sequence', first: node, then: this.assignment() };
      }
      return node;
    }

    assignment() {
      const left = this.binary(1);
      if (this.tok.type === 'op' && ASSIGN_OPS.has(this.tok.value)) {
        if (!isAssignable(left)) {
          throw syntaxError('Invalid assignment target', this.tok.line);
        }
        const op = this.tokens[this.pos++].value;
        return { k: 'Assign', op, target: left, value: this.assignment() };
      }
      return left;
    }

    binary(minPrecedence) {
      let left = this.unary();
      for (;;) {
        const t = this.tok;
        const prec = t.type === 'op' ? BINARY_PRECEDENCE[t.value] : undefined;
        if (prec === undefined || prec < minPrecedence) return left;
        this.pos++;
        const right = this.binary(prec + 1);
        left = t.value === '&&' || t.value === '||'
          ? { k: 'Logical', op: t.value, left, right }
          : { k: 'Binary', op: t.value, left, right };
      }
    }

    unary() {
      if (this.isKw('typeof')) {
        this.pos++;
        return { k: 'Typeof', arg: this.unary() };
      }
      if (this.isOp('!') || this.isOp('-') || this.isOp('+')) {
        const op = this.tokens[this.pos++].value;
        return { k: 'Unary', op, arg: this.unary() };
      }
      if (this.isOp('++') || this.isOp('--')) {
        const op = this.tokens[this.pos++].value;
        const target = this.unary();
        if (!isAssignable(target)) throw syntaxError('Invalid assignment target', this.tok.line);
        return { k: 'Update', op, target, prefix: true };
      }
      return this.postfix();
    }

    postfix() {
      let node = this.primary();
      for (;;) {
        if (this.isOp('(')) {
          this.pos++;
          const args = [];
          while (!this.isOp(')')) {
            if (args.length) this.eatOp(',');
            args.push(this.assignment());
          }
          this.eatOp(')');
          node = { k: 'Call', callee: node, args };
        } else if (this.isOp('.')) {
          this.pos++;
          const t = this.tok;
          if (t.type !== 'id' && t.type !== 'kw') throw syntaxError('Expected a name', t.line);
          this.pos++;
          node = { k: 'Member', object: node, name: t.value };
        } else if (this.isOp('[')) {
          this.pos++;
          const index = this.expression();
          this.eatOp(']');
          node = { k: 'Index', object: node, index };
        } else if ((this.isOp('++') || this.isOp('--')) && !this.tok.nl) {
          if (!isAssignable(node)) throw syntaxError('Invalid assignment target', this.tok.line);
          node = { k: 'Update', op: this.tokens[this.pos++].value, target: node, prefix: false };
        } else {
          return node;
        }
      }
    }

    primary() {
      const t = this.tok;
      if (t.type === 'num' || t.type === 'str') { this.pos++; return { k: 'Literal', value: t.value }; }
      if (t.type === 'id') { this.pos++; return { k: 'Id', name: t.value }; }
      if (t.type === 'kw') {
        if (t.value === 'true' || t.value === 'false') {
          this.pos++;
          return { k: 'Literal', value: t.value === 'true' };
        }
        if (t.value === 'null') { this.pos++; return { k: 'Literal', value: null }; }
      }
      if (t.type === 'kw' && t.value === 'this') { this.pos++; return { k: 'This' }; }
      if (t.type === 'kw' && t.value === 'new') {
        this.pos++;
        let callee = this.primary();
        while (this.isOp('.')) {
          this.pos++;
          callee = { k: 'Member', object: callee, name: this.tokens[this.pos++].value };
        }
        const args = [];
        if (this.isOp('(')) {
          this.pos++;
          while (!this.isOp(')')) {
            if (args.length) this.eatOp(',');
            args.push(this.assignment());
          }
          this.eatOp(')');
        }
        return { k: 'New', callee, args };
      }
      if (this.isOp('(')) {
        this.pos++;
        const inner = this.expression();
        this.eatOp(')');
        return inner;
      }
      if (this.isKw('function')) {
        this.pos++;
        if (this.tok.type === 'id') this.pos++;
        return { ...this.functionRest(), k: 'FunctionValue' };
      }
      if (this.isOp('{')) return this.objectLiteral();
      if (this.isOp('[')) return this.arrayLiteral();
      throw syntaxError(`Unexpected ${t.value === null ? 'end of code' : t.value}`, t.line);
    }
  }

  Parser.prototype.objectLiteral = function () {
    this.eatOp('{');
    const props = [];
    while (!this.isOp('}')) {
      const t = this.tok;
      if (!['id', 'kw', 'str', 'num'].includes(t.type)) throw syntaxError('Expected a key', t.line);
      this.pos++;
      this.eatOp(':');
      props.push({ key: String(t.value), value: this.assignment() });
      if (!this.isOp('}')) this.eatOp(',');
    }
    this.eatOp('}');
    return { k: 'Object', props };
  };

  Parser.prototype.arrayLiteral = function () {
    this.eatOp('[');
    const items = [];
    while (!this.isOp(']')) {
      items.push(this.assignment());
      if (!this.isOp(']')) this.eatOp(',');
    }
    this.eatOp(']');
    return { k: 'Array', items };
  };

  // ---- Running ----

  const UNINITIALIZED = Symbol('uninitialized');
  const MAX_STEPS = 100000;
  const MAX_DEPTH = 200;

  class Scope {
    constructor(parent) {
      this.parent = parent;
      this.vars = new Map();
    }
    find(name) {
      for (let s = this; s; s = s.parent) if (s.vars.has(name)) return s;
      return null;
    }
  }

  class ReturnSignal {
    constructor(value) { this.value = value; }
  }

  class MiniFunction {
    constructor(decl, scope) {
      this.decl = decl;
      this.scope = scope;
    }

    // Real JavaScript would give its source text here. tests/load.js makes the two match.
    toString() { return '[function]'; }
  }

  class MiniClass {
    constructor(decl, scope) {
      this.decl = decl;
      // A wrong answer can read these, so they match real JavaScript.
      this.name = decl.name;
      this.proto = {};
      const body = new Scope(scope);
      body.strict = true;
      decl.methods.forEach((method) => {
        const fn = new MiniFunction(method, body);
        fn.isMethod = true;
        if (method.name === 'constructor') this.ctor = fn;
        else this.proto[method.name] = fn;
      });
      this.proto = Object.setPrototypeOf(this.proto, Object.prototype);
    }

    toString() { return '[function]'; }
  }

  class Interpreter {
    constructor(hostGlobals) {
      this.globals = new Scope(null);
      Object.keys(hostGlobals || {}).forEach((name) => {
        this.globals.vars.set(name, { value: hostGlobals[name], isConst: false });
      });
      this.root = new Scope(this.globals);
      this.root.isFunctionLevel = true;
      // Only a wrong answer can reach this. Node names the global object this way.
      this.rootThis = Object.create({ toString: () => '[object global]' });
      this.hits = new Set();
      this.steps = 0;
      this.depth = 0;
    }

    tick() {
      if (++this.steps > MAX_STEPS) throw new MiniError('StepLimit', 'Too many steps');
    }

    // let and function names exist from the start of their block; reading a let early
    // is a ReferenceError, the same as real JS.
    hoist(stmts, scope) {
      stmts.forEach((s) => {
        if (s.k === 'Let') {
          s.decls.forEach((d) => scope.vars.set(d.name, { value: UNINITIALIZED, isConst: s.isConst }));
        } else if (s.k === 'Class') {
          scope.vars.set(s.name, { value: UNINITIALIZED, isConst: false });
        } else if (s.k === 'Function') {
          scope.vars.set(s.name, { value: new MiniFunction(s, scope), isConst: false });
        }
      });
    }

    runProgram(ast) {
      this.hoist(ast.body, this.root);
      try {
        ast.body.forEach((s) => this.exec(s, this.root));
      } catch (signal) {
        if (!(signal instanceof ReturnSignal)) throw signal;
      }
    }

    runBlock(block, scope) {
      this.hoist(block.body, scope);
      block.body.forEach((s) => this.exec(s, scope));
    }

    exec(stmt, scope) {
      this.tick();
      if (stmt.line !== undefined) this.hits.add(stmt.line);
      switch (stmt.k) {
        case 'Empty':
          return;
        case 'Function': {
          // A function declared in a block is visible outside it too, in sloppy-mode JS.
          let outer = scope;
          let strict = false;
          for (let s = scope; s; s = s.parent) if (s.strict) strict = true;
          while (outer.parent && !outer.isFunctionLevel) outer = outer.parent;
          if (!strict && outer !== scope && !(outer.vars.has(stmt.name) && !(outer.vars.get(stmt.name).value instanceof MiniFunction))) {
            outer.vars.set(stmt.name, { value: scope.vars.get(stmt.name).value, isConst: false });
          }
          return;
        }
        case 'Block':
          this.runBlock(stmt, new Scope(scope));
          return;
        case 'Class':
          scope.vars.get(stmt.name).value = new MiniClass(stmt, scope);
          return;
        case 'Let':
          stmt.decls.forEach((d) => {
            const value = d.init ? this.eval(d.init, scope) : undefined;
            scope.vars.get(d.name).value = value;
          });
          return;
        case 'If':
          if (this.eval(stmt.test, scope)) this.exec(stmt.then, scope);
          else if (stmt.otherwise) this.exec(stmt.otherwise, scope);
          return;
        case 'While':
          while (this.eval(stmt.test, scope)) {
            this.tick();
            this.exec(stmt.body, scope);
          }
          return;
        case 'For': {
          let loop = new Scope(scope);
          if (stmt.init) {
            this.hoist([stmt.init], loop);
            this.exec(stmt.init, loop);
          }
          while (!stmt.test || this.eval(stmt.test, loop)) {
            this.tick();
            this.exec(stmt.body, loop);
            // Each pass of a let loop gets its own copy of the variable, as in real JS.
            const next = new Scope(scope);
            loop.vars.forEach((slot, name) => next.vars.set(name, { ...slot }));
            loop = next;
            if (stmt.update) this.eval(stmt.update, loop);
          }
          return;
        }
        case 'Return':
          throw new ReturnSignal(stmt.value ? this.eval(stmt.value, scope) : undefined);
        case 'Expr':
          this.eval(stmt.expr, scope);
          return;
        default:
          throw new MiniError('Error', `Unknown statement ${stmt.k}`);
      }
    }

    read(name, scope) {
      const owner = scope.find(name);
      if (!owner) throw new MiniError('ReferenceError', `${name} is not defined`);
      const slot = owner.vars.get(name);
      if (slot.value === UNINITIALIZED) {
        throw new MiniError('ReferenceError', `${name} used before it was declared`);
      }
      return slot.value;
    }

    write(name, value, scope) {
      const owner = scope.find(name);
      if (!owner) {
        // Class code is always strict, so there a missing this. is an error.
        for (let s = scope; s; s = s.parent) {
          if (s.strict) throw new MiniError('ReferenceError', `${name} is not defined`);
        }
        // Sketches run in sloppy mode, where assigning to an unknown name creates a global.
        this.globals.vars.set(name, { value, isConst: false });
        return value;
      }
      const slot = owner.vars.get(name);
      if (slot.value === UNINITIALIZED) {
        throw new MiniError('ReferenceError', `${name} used before it was declared`);
      }
      if (slot.isConst) throw new MiniError('TypeError', `${name} is const`);
      slot.value = value;
      return value;
    }

    // Finds the object and key that a.b or a[b] refers to.
    locate(target, scope) {
      const obj = this.eval(target.object, scope);
      const key = target.k === 'Index' ? this.eval(target.index, scope) : target.name;
      if (obj === undefined || obj === null) throw new MiniError('TypeError', 'No such object');
      return { obj, key };
    }

    readTarget(target, scope) {
      if (target.k === 'Id') return this.read(target.name, scope);
      const { obj, key } = this.locate(target, scope);
      return obj[key];
    }

    writeTarget(target, value, scope) {
      if (target.k === 'Id') return this.write(target.name, value, scope);
      const { obj, key } = this.locate(target, scope);
      // As in ordinary JavaScript, setting a property on a string or number does nothing.
      if (typeof obj === 'object' || typeof obj === 'function') obj[key] = value;
      return value;
    }

    eval(node, scope) {
      switch (node.k) {
        case 'Literal': return node.value;
        case 'This': {
          const owner = scope.find('this');
          return owner ? owner.vars.get('this').value : this.rootThis;
        }
        case 'New': {
          const made = this.eval(node.callee, scope);
          const args = node.args.map((a) => this.eval(a, scope));
          this.tick();
          if (made instanceof MiniClass) {
            const obj = Object.create(made.proto);
            if (made.ctor) this.callFunction(made.ctor, args, obj);
            return obj;
          }
          if (made instanceof MiniFunction && !made.isMethod) {
            const obj = {};
            this.callFunction(made, args, obj);
            return obj;
          }
          throw new MiniError('TypeError', 'That is not a class');
        }
        case 'Id':
          if (node.name === 'undefined' && !scope.find('undefined')) return undefined;
          return this.read(node.name, scope);
        case 'Logical': {
          const left = this.eval(node.left, scope);
          if (node.op === '&&') return left ? this.eval(node.right, scope) : left;
          return left ? left : this.eval(node.right, scope);
        }
        case 'Binary': return applyBinary(node.op, this.eval(node.left, scope), this.eval(node.right, scope));
        case 'Unary': {
          const v = this.eval(node.arg, scope);
          if (node.op === '!') return !v;
          return node.op === '-' ? -v : +v;
        }
        case 'Assign': {
          if (node.op === '=') return this.writeTarget(node.target, this.eval(node.value, scope), scope);
          const current = this.readTarget(node.target, scope);
          const next = applyBinary(node.op[0], current, this.eval(node.value, scope));
          return this.writeTarget(node.target, next, scope);
        }
        case 'Update': {
          const before = Number(this.readTarget(node.target, scope));
          const after = node.op === '++' ? before + 1 : before - 1;
          this.writeTarget(node.target, after, scope);
          return node.prefix ? after : before;
        }
        case 'Member':
        case 'Index':
          return this.readTarget(node, scope);
        case 'Sequence':
          this.eval(node.first, scope);
          return this.eval(node.then, scope);
        case 'Typeof': {
          if (node.arg.k === 'Id' && !scope.find(node.arg.name)) return 'undefined';
          const v = this.eval(node.arg, scope);
          return v instanceof MiniFunction || v instanceof MiniClass ? 'function' : typeof v;
        }
        case 'Object': {
          const out = {};
          node.props.forEach((p) => { out[p.key] = this.eval(p.value, scope); });
          return out;
        }
        case 'Array':
          return node.items.map((item) => this.eval(item, scope));
        case 'FunctionValue':
          return new MiniFunction(node, scope);
        case 'Call': return this.evalCall(node, scope);
        default:
          throw new MiniError('Error', `Unknown expression ${node.k}`);
      }
    }

    evalCall(node, scope) {
      this.tick();
      let self;
      let fn;
      if (node.callee.k === 'Member' || node.callee.k === 'Index') {
        const { obj, key } = this.locate(node.callee, scope);
        self = obj;
        fn = obj[key];
      } else {
        fn = this.eval(node.callee, scope);
      }
      const args = node.args.map((a) => this.eval(a, scope));
      if (fn instanceof MiniFunction) return this.callFunction(fn, args, self);
      if (fn instanceof MiniClass) throw new MiniError('TypeError', 'A class needs new');
      if (typeof fn === 'function') return fn.apply(self, args);
      throw new MiniError('TypeError', 'That is not a function');
    }

    callFunction(fn, args, self) {
      if (this.depth >= MAX_DEPTH) throw new MiniError('RangeError', 'Too many nested calls');
      const scope = new Scope(fn.scope);
      scope.isFunctionLevel = true;
      let strict = false;
      for (let s = fn.scope; s; s = s.parent) if (s.strict) strict = true;
      scope.vars.set('this', { value: self === undefined && !strict ? this.rootThis : self, isConst: true });
      fn.decl.params.forEach((p, i) => scope.vars.set(p, { value: args[i], isConst: false }));
      this.depth++;
      try {
        this.runBlock(fn.decl.body, new Scope(scope));
      } catch (signal) {
        if (signal instanceof ReturnSignal) return signal.value;
        throw signal;
      } finally {
        this.depth--;
      }
      return undefined;
    }

    callGlobal(name, args) {
      const owner = this.root.find(name);
      const fn = owner ? owner.vars.get(name).value : undefined;
      if (fn instanceof MiniFunction) return this.callFunction(fn, args || []);
      return undefined;
    }

    // p5 changes values such as mouseX between frames.
    setGlobal(name, value) {
      this.globals.vars.set(name, { value, isConst: false });
    }

    hasFunction(name) {
      const owner = this.root.find(name);
      return !!owner && owner.vars.get(name).value instanceof MiniFunction;
    }
  }

  function applyBinary(op, a, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      case '%': return a % b;
      case '<': return a < b;
      case '>': return a > b;
      case '<=': return a <= b;
      case '>=': return a >= b;
      // eslint-disable-next-line eqeqeq
      case '==': return a == b;
      // eslint-disable-next-line eqeqeq
      case '!=': return a != b;
      case '===': return a === b;
      case '!==': return a !== b;
      default: throw new MiniError('Error', `Unknown operator ${op}`);
    }
  }

  CC.Mini = {
    parse(src) { return new Parser(src).program(); },
    // Evaluates one expression, such as a condition, with the given variables.
    evalExpression(expr, vars) {
      const parser = new Parser(expr);
      const node = parser.expression();
      if (parser.tok.type !== 'eof') throw syntaxError('Unexpected code after expression', 0);
      const interp = new Interpreter(vars);
      return interp.eval(node, interp.root);
    },
    Interpreter,
    MiniError,
  };
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
