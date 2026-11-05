// U3LA2.1 to U3LA2.4: creating and reading arrays, floor() and random(), loops with arrays,
// objects in arrays, and updating and deleting. Students have NOT seen classes (Unit 4).
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const U3 = CC.u3;
  const { tok } = kit;
  const { slot, choice } = U;

  const LISTS = [
    ['groceryList', ['bread', 'juice', 'pasta', 'rice', 'beans', 'pizza']],
    ['pets', ['cat', 'dog', 'fish', 'bird', 'hamster', 'turtle']],
    ['fortunes', ['Good luck', 'Try again', 'Go outside', 'Call a friend', 'Take a nap', 'Say yes']],
    ['colors', ['red', 'teal', 'gold', 'pink', 'gray', 'navy']],
  ];
  const pickList = (r, min = 3, max = 6) => {
    const [name, items] = r.pick(LISTS);
    return { name, items: r.sample(items, r.int(min, max)) };
  };
  const arr = (items) => `[${items.map((t) => (typeof t === 'number' ? t : `"${t}"`)).join(', ')}]`;
  const nums = (r, n) => r.sample(Array.from({ length: 40 }, (_, i) => (i + 2) * 5), n);
  const NUM_NAMES = ['buildingPop', 'scores', 'sizes', 'prices'];
  const noClasses = [[/\bclass\s/, 'classes (Unit 4)']];

  U3.lesson('U3LA2.1', 'Introduction to Arrays', '06-U3LA2.1-Introduction-to-Arrays.md', 15, 9, noClasses, [
    slot('terms', 'concepts', 'Knowing the words for arrays', {
      parts(r) {
        const { name, items } = pickList(r);
        return U3.rows(r, 'What is each of these in this code?', [[name, 0], ['0', 1], [`"${items[0]}"`, 2]], ['array name', 'index', 'element'], 'The index is a position, and the element is the data there.', [`let ${name} = ${arr(items)}`, `console.log(${name}[0])`], 'Part');
      },
      zero(r) {
        return choice(r, 'What does it mean that arrays are zero-indexed?', 'The first element is at index 0', ['Every array starts out empty', 'The last element is always 0', 'Arrays can only hold numbers'], 'Counting starts at 0, not 1.');
      },
      why(r) {
        const n = r.int(10, 100);
        return choice(r, `Why use an array rather than ${n} separate variables?`, 'It keeps related data together under one name', ['An array makes each value bigger', 'Variables can\'t hold strings', 'Arrays draw the values on the canvas'], 'An array is an ordered list of data.');
      },
    }),
    slot('read', 'flow', 'Reading values from an array', {
      index(r) {
        const { name, items } = pickList(r, 4, 6); const i = r.int(0, items.length - 1);
        const code = [`let ${name} = ${arr(items)}`, `console.log(${name}[${i}])`];
        return kit.traceChoice(r, { code, wrong: items.map((t) => [t]), explain: `Count from 0: index ${i} is element number ${i + 1}.` });
      },
      length(r) {
        const { name, items } = pickList(r, 3, 6);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${arr(items)}`, `console.log(${name}.length)`], explain: '.length counts the elements. It doesn\'t start at 0.' });
      },
      lastIndex(r) {
        const { name, items } = pickList(r, 3, 6);
        return kit.numberQuestion({ prompt: 'What is the index of the last element in this array?', code: [`let ${name} = ${arr(items)}`], answer: items.length - 1, explain: 'The last index is always one less than the length.' });
      },
    }),
    slot('math', 'flow', 'Using array values in code', {
      add(r) {
        const name = r.pick(NUM_NAMES); const v = nums(r, 4);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${arr(v)}`, `console.log(${name}[0] + ${name}[2])`], explain: 'Index 0 is the first, and index 2 is the third.' });
      },
      viaVariable(r) {
        const name = r.pick(NUM_NAMES); const v = nums(r, 4); const i = r.int(0, 2);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${arr(v)}`, `let spot = ${i}`, `console.log(${name}[spot + 1])`], explain: `spot + 1 is ${i + 1}.` });
      },
      inShape(r) {
        const name = r.pick(NUM_NAMES); const v = nums(r, 3);
        const code = [`let ${name} = ${arr(v)}`, `ellipse(${name}[1], ${name}[2], ${name}[0], 40)`];
        return kit.numberQuestion({ prompt: 'What is the x value of the ellipse?', code, answer: U.shapesOf(code).shapes[0][1][0], explain: 'An array element can go anywhere its value could.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs when reading arrays', {
      oneBased(r) {
        const { name, items } = pickList(r, 3, 5);
        return U3.bug(r, { prompt: `This should print the first element, "${items[0]}".`, code: [`let ${name} = ${arr(items)}`, `console.log(${name}[1])`], fixed: [`let ${name} = ${arr(items)}`, `console.log(${name}[0])`], line: 1, why: 4, explain: 'The first element is at index 0.' });
      },
      pastEnd(r) {
        const { name, items } = pickList(r, 3, 5);
        return U3.bug(r, { prompt: `This should print the last element, but it prints undefined.`, code: [`let ${name} = ${arr(items)}`, `console.log(${name}[${items.length}])`], fixed: [`let ${name} = ${arr(items)}`, `console.log(${name}[${items.length - 1}])`], line: 1, why: 2, explain: 'The last index is one less than the length.' });
      },
      lengthCaps(r) {
        const { name, items } = pickList(r, 3, 5);
        return U3.bug(r, { prompt: 'This should print how many elements there are.', code: [`let ${name} = ${arr(items)}`, `console.log(${name}.Length)`], fixed: [`let ${name} = ${arr(items)}`, `console.log(${name}.length)`], line: 1, why: 7, explain: 'It is .length, all lowercase.' });
      },
    }),
    slot('blanks', 'build', 'Completing array code', {
      create(r) {
        const { name, items } = pickList(r, 3, 3);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${name} holds "${items.join('", "')}", and prints the second one.`, lines: [[`let ${name} = `, tok('[', 'b'), `"${items[0]}", "${items[1]}", "${items[2]}"`, tok(']', 'c')], [`console.log(${name}[`, tok(1, 'n'), '])']], must: ['n', 'b'], count: 3, pools: { b: ['(', '{'], c: [')', '}'], n: [2, 0] }, spec: U.spec(), explain: 'Square brackets make an array. The second element is at index 1.' });
      },
      read(r) {
        const { name, items } = pickList(r, 4, 5); const i = r.int(0, items.length - 1);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it prints "${items[i]}", and then how many elements there are.`, lines: [[`let ${name} = ${arr(items)}`], ['console.log(', tok(name, 'v'), '[', tok(i, 'n'), '])'], [`console.log(${name}.`, tok('length', 'p'), ')']], must: ['n', 'p'], count: 3, pools: { v: ['width'], n: [i + 1, i + 7], p: ['size', 'count'] }, spec: U.spec([{ width: 400 }]), explain: 'Name, then index in square brackets.' });
      },
      nums(r) {
        const name = r.pick(NUM_NAMES); const v = nums(r, 3);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the circle's x is the first number, and its width is the last number.`, lines: [[`let ${name} = ${arr(v)}`], [`ellipse(${name}[`, tok(0, 'n'), `], 100, ${name}[`, tok(2, 'n'), '], 50)']], must: ['n'], count: 2, pools: { n: [1, 3] }, spec: U.spec(), explain: 'Indexes go 0, 1, 2.' });
      },
    }),
    slot('parsons', 'build', 'Putting array code in order', {
      printOrder(r) {
        const { name, items } = pickList(r, 4, 4);
        return U3.parsons(r, [`Make ${name} hold the list.`, 'Print the first element, then the last.', 'Print the length, and then "Done".'], [`let ${name} = ${arr(items)}`, `console.log(${name}[0])`, `console.log(${name}[3])`, `console.log(${name}.length)`, 'console.log("Done")'], 'The array has to exist before anything reads it.');
      },
      colors(r) {
        return U3.parsons(r, ['Make palette hold a red and a blue color.', 'Fill with the first color, and draw an ellipse.', 'Fill with the second color, and draw a rectangle.'], ['let palette = [color(255, 0, 0), color(0, 0, 255)]', 'fill(palette[0])', `ellipse(${r.int(50, 200)}, 100, 50, 50)`, 'fill(palette[1])', `rect(${r.int(50, 200)}, 200, 50, 50)`], 'Each fill comes before the shape it colors.');
      },
      sizes(r) {
        const v = nums(r, 3);
        return U3.parsons(r, [`Make sizes hold ${v.join(', ')}.`, 'Draw circles using the sizes in order, from index 0 to index 2.', 'Print the length.'], [`let sizes = ${arr(v)}`, 'ellipse(100, 100, sizes[0], sizes[0])', 'ellipse(200, 100, sizes[1], sizes[1])', 'ellipse(300, 100, sizes[2], sizes[2])', 'console.log(sizes.length)'], 'Indexes go up from 0.');
      },
    }),
  ]);

  U3.lesson('U3LA2.2', 'Arrays with floor() and random()', '07-U3LA.2.2-Arrays-with-floor-and-random.md', 12, 8, noClasses, [
    slot('range', 'concepts', 'Knowing what floor() and random() give', {
      possible(r) {
        const n = r.int(3, 8);
        return U3.rows(r, 'Could this expression give each number?', [['0', 0], [String(n - 1), 0], [String(n), 1], ['1.5', 1]], ['yes', 'no'], `floor rounds down, so the results are whole numbers from 0 to ${n - 1}.`, [`floor(random(${n}))`], 'Number');
      },
      whyFloor(r) {
        return choice(r, 'Why use floor() with random() to pick from an array?', 'random() gives decimals, but an index has to be a whole number', ['random() only works with floor()', 'floor() makes the array longer', 'floor() puts the array in order'], 'A value like 3.14 is not a position in an array.');
      },
      hardcoded(r) {
        const n = r.int(3, 9);
        return choice(r, `Why use .length rather than typing random(${n})?`, 'It keeps working when the array gets longer or shorter', ['It runs faster', 'It always picks the first element', `${n} isn't a valid number`], `${n} would be a hardcoded value.`);
      },
    }),
    slot('compute', 'flow', 'Working out floor() values', {
      floorIt(r) {
        const v = r.int(1, 30) + r.pick([0.2, 0.5, 0.9]);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`console.log(floor(${v}))`], explain: 'floor always rounds down.' });
      },
      maxIndex(r) {
        const { name, items } = pickList(r, 3, 6);
        return kit.numberQuestion({ prompt: 'What is the largest index this could pick?', code: [`let ${name} = ${arr(items)}`, `let pick = floor(random(${name}.length))`], answer: items.length - 1, explain: 'random stops just short of the length, and floor rounds down.' });
      },
      afterFloor(r) {
        const { name, items } = pickList(r, 4, 6); const v = r.int(0, items.length - 1) + 0.6;
        const code = [`let ${name} = ${arr(items)}`, `let spot = floor(${v})`, `console.log(${name}[spot])`];
        return kit.traceChoice(r, { code, wrong: items.map((t) => [t]), explain: `floor(${v}) is ${Math.floor(v)}.` });
      },
    }),
    slot('bug', 'flow', 'Finding bugs when picking randomly', {
      noFloor(r) {
        const { name, items } = pickList(r, 3, 5);
        // The stand-in random() gives the middle of the range, so this one needs an odd length.
        const list = items.length % 2 ? items : items.concat(['extra']);
        const odd = (e) => [`let ${name} = ${arr(list)}`, `let spot = ${e}`, `console.log(${name}[spot])`];
        return U3.bug(r, { prompt: 'This should print a random element, but sometimes it prints undefined.', code: odd(`random(${name}.length)`), fixed: odd(`floor(random(${name}.length))`), line: 1, why: 5, explain: 'Wrap it in floor().' });
      },
      plusOne(r) {
        const { name, items } = pickList(r, 3, 5);
        const lines = (e) => [`let ${name} = ${arr(items)}`, `let spot = floor(random(${e}))`, `console.log(spot)`];
        return U3.bug(r, { prompt: 'spot should always be a valid index.', code: lines(`${name}.length + 4`), fixed: lines(`${name}.length`), line: 1, why: 2, explain: 'Use the length with nothing added.' });
      },
      spelled(r) {
        const { name, items } = pickList(r, 3, 5);
        const lines = (e) => [`let ${name} = ${arr(items)}`, `let spot = ${e}(random(${name}.length))`, 'console.log(spot)'];
        return U3.bug(r, { prompt: 'This should give a whole number index.', code: lines('Floor'), fixed: lines('floor'), line: 1, why: 7, explain: 'It is floor(), all lowercase.' });
      },
    }),
    slot('blanks', 'build', 'Completing a random pick', {
      pick(r) {
        const { name, items } = pickList(r, 3, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it picks a random element of ${name}, and prints it.`, lines: [[`let ${name} = ${arr(items)}`], ['let spot = ', tok('floor', 'f'), '(', tok('random', 'f'), `(${name}.`, tok('length', 'p'), '))'], [`console.log(${name}[`, tok('spot', 'v'), '])']], must: ['f', 'p'], count: 3, pools: { f: ['fill', 'console'], p: ['size', 'count'], v: ['width'] }, spec: U.spec([{ width: 400 }]), explain: 'random picks a decimal, floor rounds it down, and that indexes the array.' });
      },
      color(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the code so the ellipse gets a random color from the palette.', lines: [['let palette = [color(255, 0, 0), color(0, 0, 255), color(0, 200, 0)]'], ['let spot = floor(random(palette.', tok('length', 'p'), '))'], [tok('fill', 'f'), '(palette[', tok('spot', 'v'), '])'], [`ellipse(${r.int(50, 300)}, 100, 50, 50)`]], must: ['p', 'f'], count: 3, pools: { p: ['size', 'width'], f: ['stroke', 'background'], v: ['width', 'height'] }, spec: U.spec([{ width: 400, height: 300 }]), explain: 'fill uses the element at the random index.' });
      },
      setupOnce(r) {
        const { name, items } = pickList(r, 3, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the code so a fortune gets picked once, in setup(), rather than on every frame.`, lines: [[`let ${name} = ${arr(items)}`], ['let spot'], ['function ', tok('setup', 'f'), '(){'], [`  spot = floor(random(${name}.length))`], ['}'], ['function ', tok('draw', 'f'), '(){'], [`  text(${name}[spot], 100, 100)`], ['}']], must: ['f'], count: 2, pools: { f: ['preload', 'mousePressed'] }, spec: { kind: 'sketch', vectors: [{}] }, explain: 'setup() runs once, and draw() runs over and over.' });
      },
    }),
    slot('parsons', 'build', 'Putting a random pick in order', {
      fortune(r) {
        const { name, items } = pickList(r, 3, 5);
        return U3.parsons(r, [`Make ${name} hold the list.`, 'Pick a random index, and store it in spot.', 'Store the element at that index in result.', 'Print result, and then the index.'], [`let ${name} = ${arr(items)}`, `let spot = floor(random(${name}.length))`, `let result = ${name}[spot]`, 'console.log(result)', 'console.log(spot)'], 'Each value has to exist before the next line can use it.');
      },
      sketch(r) {
        const { name, items } = pickList(r, 3, 5);
        return U3.parsons(r, ['Declare spot outside the functions.', 'In setup(), pick its random index once.', 'In draw(), show that element as text.'], ['function setup(){', `spot = floor(random(${name}.length))`, '}', 'function draw(){', `text(${name}[spot], 100, 100)`, '}'], 'Picking in setup() keeps it from changing.', [{ text: `let ${name} = ${arr(items)}` }, { text: 'let spot' }], [], { kind: 'sketch', vectors: [{}] });
      },
      colorPick(r) {
        return U3.parsons(r, ['Make palette hold three colors.', 'Pick a random index in spot.', 'Fill with that color.', 'Draw a circle, and then print spot.'], ['let palette = [color(255, 0, 0), color(0, 0, 255), color(0, 200, 0)]', 'let spot = floor(random(palette.length))', 'fill(palette[spot])', `ellipse(${r.int(50, 300)}, 100, 50, 50)`, 'console.log(spot)'], 'The color is picked before the shape gets drawn.');
      },
    }),
  ]);

  const loopArr = (name) => `for(let i = 0; i < ${name}.length; i++){`;

  U3.lesson('U3LA2.3', 'Loops and Arrays', '09-U3LA2.3-Loops-and-Arrays.md', 20, 12, noClasses, [
    slot('concept', 'concepts', 'Understanding how loops go through arrays', {
      why(r) {
        const { name } = pickList(r);
        return choice(r, `Why does this loop use i < ${name}.length?`, 'It reaches every element without going past the end', ['It makes the array longer', 'It only reads the first element', 'It puts the array in order'], 'The last index is one less than the length.', { code: [loopArr(name), `  console.log(${name}[i])`, '}'] });
      },
      iterate(r) {
        return choice(r, 'What does it mean to iterate through an array?', 'To go through its elements one by one', ['To delete its first element', 'To make a copy of its name', 'To sort it from A to Z'], 'A for loop is the usual way to do it.');
      },
      objects(r) {
        return choice(r, 'Why might you store object literals in an array?', 'Each one can hold several values for one item', ['Arrays can\'t hold numbers', 'It makes the canvas bigger', 'Objects run faster than variables'], 'One object can hold the color, position, and size for one ellipse.');
      },
    }),
    slot('trace', 'flow', 'Tracing a loop over an array', {
      prints(r) {
        const { name, items } = pickList(r, 3, 4);
        const code = [`let ${name} = ${arr(items)}`, loopArr(name), `  console.log(${name}[i])`, '}'];
        const logs = kit.printed(code);
        return kit.traceChoice(r, { code, wrong: [logs.slice().reverse(), logs.slice(1), logs.slice(0, -1)], explain: 'i goes from 0 up to the last index.' });
      },
      sum(r) {
        const name = r.pick(NUM_NAMES); const v = nums(r, r.int(3, 5));
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${arr(v)}`, 'let total = 0', loopArr(name), `  total = total + ${name}[i]`, '}', 'console.log(total)'], explain: 'Each element gets added once.' });
      },
      spacing(r) {
        const { name, items } = pickList(r, 3, 5); const d = r.pick([30, 50, 70]);
        const code = [`let ${name} = ${arr(items)}`, loopArr(name), `  ellipse(i * ${d}, 200, 20, 20)`, '}'];
        const { shapes } = U.shapesOf(code);
        return kit.numberQuestion({ prompt: 'What is the x value of the last ellipse?', code, answer: shapes[shapes.length - 1][1][0], explain: `i ends at ${items.length - 1}, so multiply by ${d}.` });
      },
    }),
    slot('objectsIn', 'flow', 'Reading objects in an array', {
      prop(r) {
        const [a, b] = nums(r, 2); const [c, d] = nums(r, 2);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['let bubbles = [', `  { x: ${a}, y: ${b} },`, `  { x: ${c}, y: ${d} }`, ']', 'console.log(bubbles[1].x)'], explain: 'Index 1 is the second object, and .x reads from it.' });
      },
      loopProp(r) {
        const v = nums(r, 3);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['let items = [', `  { w: ${v[0]} },`, `  { w: ${v[1]} },`, `  { w: ${v[2]} }`, ']', 'let total = 0', loopArr('items'), '  total = total + items[i].w', '}', 'console.log(total)'], explain: 'Each pass reads .w from a different object.' });
      },
      populate(r) {
        const n = r.int(3, 6); const m = r.int(2, 9);
        return kit.printedNumber({ prompt: 'What number does this print?', code: ['let dots = []', `for(let i = 0; i < ${n}; i++){`, `  dots[i] = { y: i * ${m} }`, '}', `console.log(dots[${n - 1}].y + dots.length)`], explain: 'The loop fills the empty array with one object per pass.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in loops over arrays', {
      startsAtOne(r) {
        const { name, items } = pickList(r, 3, 5);
        const code = (s) => [`let ${name} = ${arr(items)}`, `for(let i = ${s}; i < ${name}.length; i++){`, `  console.log(${name}[i])`, '}'];
        return U3.bug(r, { prompt: 'This should print every element, but it misses the first.', code: code(1), fixed: code(0), line: 1, why: 4, explain: 'Start at index 0.' });
      },
      goesPast(r) {
        const { name, items } = pickList(r, 3, 5);
        const code = (c) => [`let ${name} = ${arr(items)}`, `for(let i = 0; i ${c} ${name}.length; i++){`, `  console.log(${name}[i])`, '}'];
        return U3.bug(r, { prompt: 'This prints undefined at the end.', code: code('<='), fixed: code('<'), line: 1, why: 2, explain: 'The last index is less than the length.' });
      },
      noIndex(r) {
        const { name, items } = pickList(r, 3, 5);
        const code = (e) => [`let ${name} = ${arr(items)}`, loopArr(name), `  console.log(${e})`, '}'];
        return U3.bug(r, { prompt: 'This should print each element once, but it prints the first one every time.', code: code(`${name}[0]`), fixed: code(`${name}[i]`), line: 2, why: 4, explain: 'Use i as the index.' });
      },
    }),
    slot('blanks', 'build', 'Completing loops over arrays', {
      each(r) {
        const { name, items } = pickList(r, 3, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the loop so it prints every element of ${name}.`, lines: [[`let ${name} = ${arr(items)}`], ['for(let i = ', tok(0, 'n'), `; i < ${name}.`, tok('length', 'p'), '; i++){'], [`  console.log(${name}[`, tok('i', 'v'), '])'], ['}']], must: ['p', 'v'], count: 3, pools: { n: [1, 2], p: ['size', 'count'], v: ['width', 'height'] }, spec: U.spec([{ width: 400, height: 300 }]), explain: 'From 0, up to the length, using i as the index.' });
      },
      fillEach(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the loop so each ellipse gets the matching color from the palette.', lines: [['let palette = [color(255, 0, 0), color(0, 0, 255), color(0, 200, 0)]'], [loopArr('palette')], ['  ', tok('fill', 'f'), '(palette[', tok('i', 'v'), '])'], ['  ellipse(', tok('i', 'v'), ` * ${r.pick([40, 50, 60])}, 200, 50, 50)`], ['}']], must: ['f', 'v'], count: 3, pools: { f: ['stroke', 'background'], v: ['width', 'height'] }, spec: U.spec([{ width: 400, height: 300 }]), explain: 'i picks the color, and also places the ellipse.' });
      },
      make(r) {
        const n = r.int(3, 8); const m = r.int(2, 9);
        return kit.blanksQuestion(r, { prompt: `Complete the code so dots fills up with ${n} objects, each with a y of i times ${m}.`, lines: [['let dots = ', tok('[]', 'e')], [`for(let i = 0; i < `, tok(n, 'n'), '; i++){'], ['  dots[', tok('i', 'v'), '] = { y: i * ', tok(m, 'n'), ' }'], ['}'], ['console.log(dots.length, dots[1].y)']], must: ['e', 'v'], count: 3, pools: { e: ['0', '""'], v: ['width', 'height'], n: [n + 2, m + 3] }, spec: U.spec([{ width: 400, height: 300 }]), explain: 'Start with an empty array, and assign into it by index.' });
      },
    }),
    slot('parsons', 'build', 'Putting loops over arrays in order', {
      sum(r) {
        const v = nums(r, 3);
        return U3.parsons(r, [`Make scores hold ${v.join(', ')}.`, 'Start total at 0.', 'Loop over scores, adding each one to total.', 'Print total after the loop.'], [`let scores = ${arr(v)}`, 'let total = 0', loopArr('scores'), 'total = total + scores[i]', '}', 'console.log(total)'], 'total needs to exist before the loop, and print after it.');
      },
      draw(r) {
        const v = nums(r, 3);
        return U3.parsons(r, [`Make bubbles an array of objects with x values of ${v.join(', ')}.`, 'Loop over it, drawing an ellipse at each x.'], ['let bubbles = [', `{ x: ${v[0]} },`, `{ x: ${v[1]} },`, `{ x: ${v[2]} }`, ']', loopArr('bubbles'), 'ellipse(bubbles[i].x, 100, 20, 20)', '}'], 'The array closes before the loop starts.');
      },
      populate(r) {
        const n = r.int(3, 6);
        return U3.parsons(r, ['Start dots as an empty array.', `Loop ${n} times, storing an object with x equal to i * 10 at index i.`, 'Then loop over dots, drawing an ellipse at each x.'], ['let dots = []', `for(let i = 0; i < ${n}; i++){`, 'dots[i] = { x: i * 10 }', '}', `for(let j = 0; j < dots.length; j++){`, 'ellipse(dots[j].x, 50, 5, 5)', '}'], 'The array has to be filled before it gets drawn.');
      },
    }),
  ]);

  U3.lesson('U3LA2.4', 'Updating and Deleting from Arrays', '10-U3LA2.4-Updating-and-Deleting-from-Arrays.md', 15, 9, noClasses, [
    slot('methods', 'concepts', 'Knowing what array methods do', {
      each(r) {
        return U3.rows(r, 'What does each one do?', [['.splice(2, 1)', 0], ['.indexOf(item)', 1], ['.push(item)', 2]], ['removes an element', 'finds an element\'s position', 'adds to the end'], 'CRUD stands for create, read, update, and delete.', undefined, 'Method');
      },
      spliceArgs(r) {
        const a = r.int(0, 5); const b = r.int(1, 3);
        return choice(r, `What does ${b} mean in this call?`, `How many elements to remove`, ['Which index to start at', 'How long the array will be afterward', 'Which value to search for'], `This goes to index ${a}, and removes ${b}.`, { code: [`bubbleList.splice(${a}, ${b})`] });
      },
      forEachMeaning(r) {
        const fn = r.pick(['ellipse(bubble.x, bubble.y, 20, 20)', 'console.log(bubble.x)']);
        return choice(r, 'What does this do?', 'It runs the code once for each item in bubbleList', ['It only runs the code for the first item', 'It deletes each item in bubbleList', 'It sorts bubbleList'], 'forEach is another way to go through a list.', { code: ['bubbleList.forEach(bubble => {', `  ${fn}`, '})'] });
      },
    }),
    slot('trace', 'flow', 'Tracing changes to an array', {
      pushLen(r) {
        const { name, items } = pickList(r, 2, 4);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${arr(items)}`, `${name}.push("new")`, `${name}.push("newer")`, `console.log(${name}.length)`], explain: 'Each push adds one to the end.' });
      },
      splicePos(r) {
        const { name, items } = pickList(r, 4, 6); const i = r.int(0, items.length - 2);
        const code = [`let ${name} = ${arr(items)}`, `${name}.splice(${i}, 1)`, `console.log(${name}[${i}])`];
        return kit.traceChoice(r, { code, wrong: items.map((t) => [t]), explain: 'The rest of the list shifts over to fill the gap.' });
      },
      indexFind(r) {
        const { name, items } = pickList(r, 3, 6); const i = r.int(0, items.length - 1);
        return kit.printedNumber({ prompt: 'What number does this print?', code: [`let ${name} = ${arr(items)}`, `console.log(${name}.indexOf("${items[i]}"))`], explain: 'indexOf gives the position, counting from 0.' });
      },
    }),
    slot('click', 'flow', 'Following a click that deletes an element', {
      popped(r) {
        const base = 10 * r.int(3, 9); const code = [`let bubbles = [{ x: ${base} }, { x: ${base + 100} }, { x: ${base + 200} }]`, 'function mousePressed(){', '  for(let i = 0; i < bubbles.length; i++){', '    if(collidePointCircle(mouseX, 100, bubbles[i].x, 100, 40)){', '      bubbles.splice(i, 1)', '    }', '  }', '}'];
        const hit = base + 100 * r.int(0, 2);
        return kit.printedNumber({ prompt: `The user clicks at mouseX = ${hit}. How many bubbles are left?`, code, run: `${code.join('\n')}\nfunction __report(){\n  console.log(bubbles.length)\n}`, vec: { mouseX: 0, mouseY: 100, frames: [{ mouseX: hit, mouseIsPressed: true }] }, kind: 'sketch', explain: 'Only the clicked bubble gets removed.' });
      },
      missed(r) {
        const base = 10 * r.int(3, 9); const code = [`let bubbles = [{ x: ${base} }, { x: ${base + 100} }, { x: ${base + 200} }]`, 'function mousePressed(){', '  for(let i = 0; i < bubbles.length; i++){', '    if(collidePointCircle(mouseX, 100, bubbles[i].x, 100, 40)){', '      bubbles.splice(i, 1)', '    }', '  }', '}'];
        const off = base + 50 + 100 * r.int(0, 2);
        return kit.printedNumber({ prompt: `The user clicks at mouseX = ${off}. How many bubbles are left?`, code, run: `${code.join('\n')}\nfunction __report(){\n  console.log(bubbles.length)\n}`, vec: { mouseX: 0, mouseY: 100, frames: [{ mouseX: off, mouseIsPressed: true }] }, kind: 'sketch', explain: 'That click isn\'t on a bubble, so nothing gets removed.' });
      },
      added(r) {
        const n = r.int(2, 5);
        const name = r.pick(['dots', 'stars', 'marks', 'spots']); const code = [`let ${name} = []`, 'function mousePressed(){', `  ${name}.push({ x: mouseX })`, '}'];
        const frames = [];
        for (let i = 0; i < n; i++) frames.push({ mouseX: 10 * i, mouseIsPressed: true }, { mouseIsPressed: false });
        return kit.printedNumber({ prompt: `The user clicks ${n} times. How many elements does ${name} have now?`, code, run: `${code.join('\n')}\nfunction __report(){\n  console.log(${name}.length)\n}`, vec: { mouseX: 0, mouseY: 100, frames }, kind: 'sketch', explain: 'Each click pushes one object.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs when changing arrays', {
      wrongCount(r) {
        const { name, items } = pickList(r, 4, 6);
        const code = (n) => [`let ${name} = ${arr(items)}`, `${name}.splice(1, ${n})`, `console.log(${name}.length)`];
        return U3.bug(r, { prompt: 'This should remove only one element.', code: code(3), fixed: code(1), line: 1, why: 3, explain: 'The second value says how many to remove.' });
      },
      pushCaps(r) {
        const { name, items } = pickList(r, 2, 4);
        const code = (m) => [`let ${name} = ${arr(items)}`, `${name}.${m}("new")`, `console.log(${name}.length)`];
        return U3.bug(r, { prompt: 'This should add one element to the end.', code: code('add'), fixed: code('push'), line: 1, why: 7, explain: 'The array method is .push().' });
      },
      wrongIndex(r) {
        const { name, items } = pickList(r, 3, 5);
        const code = (n) => [`let ${name} = ${arr(items)}`, `${name}.splice(${n}, 1)`, `console.log(${name}[0])`];
        return U3.bug(r, { prompt: `This should delete the first element, "${items[0]}".`, code: code(1), fixed: code(0), line: 1, why: 4, explain: 'The first element is at index 0.' });
      },
    }),
    slot('blanks', 'build', 'Completing code that changes an array', {
      push(r) {
        const { name, items } = pickList(r, 2, 4);
        return kit.blanksQuestion(r, { prompt: `Complete the code so "new" goes on the end of ${name}, and its length gets printed.`, lines: [[`let ${name} = ${arr(items)}`], [`${name}.`, tok('push', 'm'), '("new")'], [`console.log(${name}.`, tok('length', 'p'), ')']], must: ['m'], count: 2, pools: { m: ['splice', 'indexOf'], p: ['size'] }, spec: U.spec(), explain: '.push adds to the end.' });
      },
      remove(r) {
        const { name, items } = pickList(r, 4, 6); const i = r.int(0, items.length - 1);
        return kit.blanksQuestion(r, { prompt: `Complete the code so "${items[i]}" is removed from ${name}.`, lines: [[`let ${name} = ${arr(items)}`], [`let theIndex = ${name}.`, tok('indexOf', 'm'), `("${items[i]}")`], [`${name}.`, tok('splice', 'm'), '(', tok('theIndex', 'v'), ', ', tok(1, 'n'), ')'], [`console.log(${name}.length, ${name}[0])`]], must: ['m'], count: 3, pools: { m: ['push', 'floor'], v: ['width'], n: [2, 3] }, spec: U.spec([{ width: 400 }]), explain: 'Find its position, and then remove one element there.' });
      },
      click(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the code so each click adds an object to dots.', lines: [['let dots = []'], ['function ', tok('mousePressed', 'f'), '(){'], ['  dots.', tok('push', 'm'), '({ x: ', tok('mouseX', 'v'), ` + ${r.int(1, 9)} })`], ['}'], ['function __report(){'], ['  console.log(dots.length, dots[0].x)'], ['}']], must: ['f', 'm'], count: 3, pools: { f: ['setup', 'keyPressed'], m: ['splice', 'indexOf'], v: ['mouseY', 'width'] }, spec: { kind: 'sketch', vectors: [{ mouseX: 0, mouseY: 9, width: 400, frames: [{ mouseX: 20, mouseIsPressed: true }, { mouseIsPressed: false }, { mouseX: 40, mouseIsPressed: true }] }] }, explain: 'mousePressed() runs once per click.' });
      },
    }),
    slot('parsons', 'build', 'Putting array changes in order', {
      addRemove(r) {
        const { name, items } = pickList(r, 3, 4);
        return U3.parsons(r, [`Make ${name} hold the list.`, 'Add "new" to the end.', 'Print the length.', 'Remove the first element.', 'Print the length again.'], [`let ${name} = ${arr(items)}`, `${name}.push("new")`, `console.log(${name}.length)`, `${name}.splice(0, 1)`, `console.log(${name}.length)`], 'The order changes what gets printed.');
      },
      findDelete(r) {
        const { name, items } = pickList(r, 4, 5); const i = r.int(0, items.length - 1);
        return U3.parsons(r, [`Make ${name} hold the list.`, `Find the position of "${items[i]}", and store it.`, 'Remove one element at that position.', 'Print the length, and then "Done".'], [`let ${name} = ${arr(items)}`, `let theIndex = ${name}.indexOf("${items[i]}")`, `${name}.splice(theIndex, 1)`, `console.log(${name}.length)`, 'console.log("Done")'], 'You have to know the position before you can remove it.');
      },
      bubblePop(r) {
        const v = nums(r, 3);
        return U3.parsons(r, ['In mousePressed(), go through bubbles.', 'If the mouse is on a bubble, remove that bubble.'], ['function mousePressed(){', 'for(let i = 0; i < bubbles.length; i++){', 'if(collidePointCircle(mouseX, 100, bubbles[i].x, 100, 30)){', 'bubbles.splice(i, 1)', '}', '}', '}'], 'The check goes inside the loop, and the removal goes inside the check.', [{ text: `let bubbles = [{ x: ${v[0]} }, { x: ${v[1]} }, { x: ${v[2]} }]` }], [], { kind: 'sketch', hiddenSuffix: ['function __report(){', '  console.log(bubbles.length)', '}'], vectors: [{ mouseX: 0, mouseY: 100, frames: [{ mouseX: v[0], mouseIsPressed: true }] }, { mouseX: 0, mouseY: 100, frames: [{ mouseX: 400, mouseIsPressed: true }] }] });
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
