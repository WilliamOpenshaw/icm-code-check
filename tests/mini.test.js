// The interpreter must agree with real JavaScript, since answer keys depend on it.
const test = require('node:test');
const assert = require('node:assert');
const { loadCodeCheck, makeRealRunner } = require('./load');

const CC = loadCodeCheck();
const runReal = makeRealRunner(CC);

function assertAgrees(code, vec, kind) {
  const mine = CC.runCode(code, vec || {}, kind);
  const real = runReal(code, vec, kind);
  assert.strictEqual(!!mine.error, real.error, `Error mismatch (${mine.error}) on:\n${code}`);
  if (!real.error) assert.strictEqual(CC.behaviorKey(mine), CC.behaviorKey(real), `Different results on:\n${code}`);
}

test('agrees with JavaScript on conditions, functions, and errors', () => {
  [
    'let a = 5\nif(a > 3 && a < 10){\n  console.log("yes")\n}\nelse{\n  console.log("no")\n}',
    'let a = 5\nif(a > 7 || a == 5){\n  console.log("yes")\n}',
    'let fruit = "kiwi"\nif(fruit == "apple" || "pear"){\n  console.log("always")\n}',
    'let a = 5\nif(a > 3 && < 10){\n  console.log("yes")\n}',
    'console.log(a)\nlet a = 5',
    'console.log(missing)',
    'x = 5\nconsole.log(x)',
    'let a = 1\nlet a = 2',
    'function f(a, b){\n  if(a > b){\n    console.log("big")\n  }\n  else{\n    console.log("small")\n  }\n}\nf(3, 2)\nf(1, 2)',
    'f()\nfunction f(){\n  console.log("hoisted")\n}',
    'function f(a){\n  let a = 1\n}',
    'if(true){\n  let inner = 1\n}\nconsole.log(inner)',
    'let a = 1\nif(true){\n  let a = 2\n  console.log(a)\n}\nconsole.log(a)',
    'else{\n  console.log("x")\n}',
    'if(true){\n}\nelse if(false){\n}\nelse{\n}\nelse{\n}',
    '}\nif(true){',
    'if(true){\nconsole.log("never closed")',
    'console.log("a") console.log("b")',
    'let a = 2\na = a + 3\na += 1\na++\nconsole.log(a, a % 2, -a, !a)',
    'let s = "a" + 1\nconsole.log(s, 2 * 3 + 4, 2 + 3 * 4, (2 + 3) * 4)',
    'console.log(5 == "5", 5 === "5", 5 != "5", 5 !== "5", "b" > "a")',
    'console.log(1 && 2, 0 && 2, 1 || 2, 0 || 2)',
    'let bg = color(255, 0, 255) // magenta\nconsole.log(bg)',
    'const k = 1\nk = 2',
    'if(day = "Sat"){\n  console.log("assigned")\n}',
    'let u\nconsole.log(u)',
    'function f(){\n  console.log("a")\n  return\n  console.log("b")\n}\nf()',
    'let n = __in.value\nconsole.log(n)',
    'console.log(undefined)',
    'notAFunction()',
    'let n = 1\nn()',
    'function add(a, b){\n  return a + b\n}\nconsole.log(add(2, 3), add(add(1, 1), 1))',
    'function f(a){\n  a + 1\n}\nconsole.log(f(1))',
    'function f(a){\n  let ans = a * 2\n  return ans\n  console.log("never")\n}\nconsole.log(f(4))\nconsole.log(ans)',
    'function f(a){\n  if(a > 1){\n    return "big"\n  }\n  return "small"\n}\nconsole.log(f(2), f(0))',
  ].forEach((code) => assertAgrees(code, { inputs: { value: 3 } }));
});

test('agrees with JavaScript on objects, arrays, and typeof', () => {
  [
    'let o = {\n  a: 1,\n  b: "two",\n}\nconsole.log(o.a, o.b)\no.a = 5\no.c = 9\nconsole.log(o.a, o.c, o.missing)',
    'let o = { size: 5 }\no.size += 2\no.size -= 1\no.size++\nconsole.log(o.size)',
    'let o = { size: 5 }\nconsole.log(o.Size)',
    'let o = {\n  a = 1\n}',
    'let o = {\n  a: 1\n  b: 2\n}',
    'let o = {\n  a: 1,\n  b: 2\n}\nconsole.log(a.o)',
    'console.log(typeof 5, typeof "5", typeof true, typeof {}, typeof [1], typeof null, typeof missing)',
    'let x = 5\nconsole.log(typeof x)\nx = "five"\nconsole.log(typeof x)',
    'console.log(typeof (3 > 2), typeof ("a" != "b"), typeof (1 + 1), typeof ("a" + 1))',
    'let o = { a: 1 }\nconsole.log(typeof o.a, typeof o)',
    'function f(){\n  return 1\n}\nconsole.log(typeof f, typeof f())',
    'let a = [1, 2, 3]\nconsole.log(a[0], a[2], a.length, a[9])\na[1] = 7\nconsole.log(a[1], a)',
    'let o = { a: 1 }\nconsole.log(o["a"])',
    'weight: 5\nconsole.log("labels are legal")',
    'weight: 5,\nconsole.log("the comma keeps going")',
    'let o = 1, p = 2\nconsole.log(o, p)',
    'console.log((1, 2))',
    'function a(){\n  console.log(1)\n}\nfunction a(){\n  console.log(2)\n}\na()',
    'let a = 1\nfunction a(){\n}',
    'function a(){\n}\nlet a = 1',
    'function f(a){\n  function a(){\n    return 2\n  }\n  console.log(a())\n}\nf(1)',
    'let f = function(a){\n  return a + 1\n}\nconsole.log(f(1), typeof f)',
    'weight: 4,\nfunction draw(){\n}\nconsole.log("a function can be a value")',
    'if(true) let a = 1',
    '5 = x',
    'let o = { a: 1 }\no.a()',
    'let n\nn.a = 1',
    'let n\nconsole.log(n.a)',
  ].forEach((code) => assertAgrees(code, {}));
});

test('agrees with JavaScript when sketches run frame by frame', () => {
  const frames = [
    { mouseX: 10, mouseY: 20 },
    { mouseX: 30, mouseY: 40, mouseIsPressed: true },
    { mouseX: 50, mouseY: 60, mouseIsPressed: true },
    { mouseIsPressed: false },
    { mouseX: 70, mouseIsPressed: true, keyIsPressed: true, key: 'b' },
    { keyIsPressed: false },
  ];
  const report = 'function __report(){\n  console.log(count, frameCount, pmouseX, pmouseY, mouseX)\n}';
  [
    'let count = 0\nfunction draw(){\n  count = count + 1\n}',
    'let count = 0\nfunction draw(){\n  if(mouseIsPressed){\n    count += 1\n  }\n}',
    'let count = 0\nfunction mousePressed(){\n  count += 1\n}',
    'let count = 0\nfunction keyPressed(){\n  count += 10\n}\nfunction draw(){\n  if(keyIsPressed){\n    if(key == "b"){\n      count += 1\n    }\n  }\n}',
    'let count\nfunction setup(){\n  createCanvas(300, 200)\n  background(180)\n  count = width + height\n}\nfunction draw(){\n  ellipse(mouseX, mouseY, 10, 10)\n}',
    'let count = 0\nfunction setup(){\n  background(0)\n}\nfunction draw(){\n  background(220)\n  line(mouseX, mouseY, pmouseX, pmouseY)\n}',
    'let count = {\n  n: 0\n}\nfunction draw(){\n  strokeWeight(map(mouseX, 0, 100, 0, 10))\n  point(mouseX, mouseY)\n  count.n += 1\n  fill(255, 0, 0)\n  rect(1, 2, 3, 4)\n}',
    'let count = 0\nfunction draw(){\n  if(collidePointRect(mouseX, mouseY, 0, 0, 40, 40) && mouseIsPressed){\n    count = count + 1\n  }\n  if(collidePointCircle(mouseX, mouseY, 50, 50, 30)){\n    count = count + 100\n  }\n}',
  ].forEach((program) => assertAgrees(`${program}\n${report}`, { mouseX: 0, mouseY: 0, frames }, 'sketch'));
});

test('reports which lines ran', () => {
  const code = 'let a = 5\nif(a > 9){\n  console.log("no")\n}\nelse{\n  console.log("yes")\n}\nconsole.log("end")';
  const { hits } = CC.runCode(code, {});
  assert.ok(hits.has(5));
  assert.ok(hits.has(7));
  assert.ok(!hits.has(2));
});

test('stops runaway recursion instead of freezing', () => {
  const result = CC.runCode('function f(){\n  f()\n}\nf()', {});
  assert.ok(result.error);
});

test('p5 frame values behave as the lesson describes', () => {
  const code = 'function __report(){\n  console.log(frameCount, pmouseX, mouseX)\n}';
  const { logs } = CC.runCode(code, { mouseX: 1, frames: [{ mouseX: 5 }, { mouseX: 9 }, { mouseX: 12 }] }, 'sketch');
  assert.strictEqual(logs[0], '3 9 12');
  const draws = CC.runCode('let n = 0\nfunction draw(){\n  n = n + 1\n}\nfunction __report(){\n  console.log(n)\n}', { frames: [{}, {}, {}, {}] }, 'sketch');
  assert.strictEqual(draws.logs[0], '4');
  const clicks = CC.runCode('let n = 0\nfunction mousePressed(){\n  n = n + 1\n}\nfunction __report(){\n  console.log(n)\n}', {
    frames: [{ mouseIsPressed: true }, { mouseIsPressed: true }, { mouseIsPressed: false }, { mouseIsPressed: true }],
  }, 'sketch');
  assert.strictEqual(clicks.logs[0], '2', 'mousePressed runs once per click, not once per frame');
  assert.strictEqual(CC.p5Functions.map(25, 0, 100, 0, 200), 50);
  assert.strictEqual(CC.p5Functions.map(25, 0, 100, 200, 0), 150);
});

test('agrees with JavaScript on loops and array methods', () => {
  [
    'let x = 0\nwhile(x < 3){\n  console.log(x)\n  x = x + 1\n}',
    'for(let i = 0; i < 3; i++){\n  console.log(i)\n}',
    'for(i = 2; i > 0; i -= 1){\n  console.log(i)\n}\nconsole.log(i)',
    'for(let i = 0; i < 2; i++){\n  for(let j = 0; j < 2; j++){\n    console.log(i, j)\n  }\n}',
    'for(let i = 0; i < 1; i++){\n}\nconsole.log(i)',
    'let x = 0\nwhile(x < 3){\n  console.log(x)\n}',
    'for(let i = 0; i < 3;){\n  console.log("again")\n}',
    'let a = [1, 2]\na.push(3)\nconsole.log(a.length, a[2], a.indexOf(2))\na.splice(0, 1)\nconsole.log(a[0], a.length, a[9])',
    'let a = []\nfor(let i = 0; i < 3; i++){\n  a[i] = { y: i * 2 }\n}\nconsole.log(a[2].y, a.length)',
    'while(false)\n  let x = 1',
    'let a = [1, 2]\nfor(let i = 0; i < a.length; i++){\n  function show(){\n    console.log(a[i])\n  }\n}\nshow()',
    'let s = loadSound("a.wav")\ns.play()\nconsole.log(s.isPlaying())\ns.stop()\nconsole.log(s.isPlaying())',
  ].forEach((code) => assertAgrees(code, {}));
});

test('agrees with JavaScript on classes', () => {
  const good = 'class Pet{\n  constructor(n){\n    this.name = n\n    this.age = 1\n  }\n  birthday(){\n    this.age += 1\n    return this.age\n  }\n}\n';
  [
    `${good}let p = new Pet("Coco")\nconsole.log(p.name, p.birthday(), p.age, typeof p, typeof Pet)`,
    `let p = new Pet("Coco")\n${good}`,
    `${good}let p = Pet("Coco")`,
    `${good}let p = new Pet("a")\nconsole.log(p.missing)\np.missing()`,
    `${good}let a = [new Pet("a"), new Pet("b")]\nfor(let i = 0; i < a.length; i++){\n  a[i].birthday()\n  console.log(a[i].name, a[i].age)\n}`,
    'class Pet{\n  constructor(n){\n    name = n\n  }\n}\nlet p = new Pet("a")',
    'class Pet{\n  construtor(n){\n    this.name = n\n  }\n}\nlet p = new Pet("a")\nconsole.log(p.name)',
    'class Pet{\n  constructor{\n    this.name = 1\n  }\n}',
    'class Pet{\n  constructor(n)\n    this.name = n\n}',
    'class Pet{\n  constructor(){\n  }\n  constructor(){\n  }\n}',
    'class Pet{\n}\nclass Pet{\n}',
    'class Pet{\n  show(){\n    console.log(this.x)\n  }\n}\nlet p = new Pet()\np.x = 5\np.show()',
    'function Old(){\n  this.x = 2\n}\nlet o = new Old()\nconsole.log(o.x)',
    'push()\ntranslate(5, 6)\nellipse(0, 0, 1, 1)\npop()\nellipse(0, 0, 1, 1)',
    'angleMode(DEGREES)\nconsole.log(sin(90), sin(180), cos(0), cos(90))',
  ].forEach((code) => assertAgrees(code, {}));
});
