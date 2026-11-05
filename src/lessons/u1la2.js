// U1LA2.1: Intro to Color with RGB && HSB, plus both optional extras: Color && Data Storage
// (binary and hexadecimal) and Color Palette Practice. The teacher asked for these to be one test.
// Students have NOT seen: variables, custom functions, or conditionals.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const { tok } = kit;
  const { slot, choice } = U;

  const PRIMARY = [['red', '255, 0, 0'], ['green', '0, 255, 0'], ['blue', '0, 0, 255'], ['yellow', '255, 255, 0'], ['magenta', '255, 0, 255'], ['cyan', '0, 255, 255'], ['white', '255, 255, 255'], ['black', '0, 0, 0']];
  const hexPair = (r) => r.pick('0123456789ABCDEF'.split('')) + r.pick('0123456789ABCDEF'.split(''));
  const hexValue = (text) => parseInt(text, 16);

  function colorRows(r) {
    const picks = r.sample(PRIMARY, 4);
    const options = r.shuffle(picks.map((p) => p[0]).concat(r.sample(PRIMARY.filter((p) => !picks.includes(p)), 1).map((p) => p[0])));
    return kit.rowsQuestion({
      prompt: 'What color does each fill make?',
      columns: ['Code'],
      rows: picks.map((p) => ({ cells: [`fill(${p[1]})`], answer: options.indexOf(p[0]) })),
      options: options.map((text) => ({ text })),
      explain: 'Screens mix light: red and green make yellow, green and blue make cyan, red and blue make magenta, and all three make white.',
    });
  }

  U.lesson('U1LA2.1', 'Intro to Color with RGB && HSB', '07-U1LA2.1-Intro-to-Color-with-RGB-and-HSB.md', 20, 12, U.NO_LOGIC.concat([[/\blet\b/, 'variables (U1LA3.2)']]), [
    slot('mixing', 'concepts', 'Knowing how computers mix color', {
      additive(r) {
        return choice(r, 'How does a computer screen mix color?', 'Additive mixing: it adds red, green, and blue light', ['Subtractive mixing: tints absorb light, like paint', 'It blends tiny drops of colored ink', 'It only ever shows the three colors red, green, and blue'], 'Screens add light, so mixing all three makes white.');
      },
      allThree(r) {
        return choice(r, 'Three see-through circles of red, green, and blue overlap on a screen. What color is the center?', 'White', ['Black', 'Brown', 'Gray'], 'All three lights together make white, unlike paint.');
      },
      twoLights(r) {
        const [a, b, c] = r.pick([['red', 'green', 'yellow'], ['green', 'blue', 'cyan'], ['red', 'blue', 'magenta']]);
        return choice(r, `On a screen, what color do ${a} and ${b} light make?`, c, ['yellow', 'cyan', 'magenta', 'brown'].filter((x) => x !== c), 'Additive mixing combines the two lights.');
      },
    }),
    slot('rgb', 'concepts', 'Reading RGB colors and transparency', {
      colors: colorRows,
      fourth(r) {
        const a = r.int(20, 200);
        return choice(r, `What does ${a} control in this call?`, 'Opacity: how see-through the color is', ['How bright the red is', 'The size of the shape', 'The outline of the shape'], 'An optional fourth value sets opacity, from 0 to 255 in RGB mode.', { code: [`fill(255, 255, 0, ${a})`] });
      },
      opaque(r) {
        return choice(r, 'Which fill is the most see-through?', `fill(0, 0, 255, ${r.int(5, 40)})`, [`fill(0, 0, 255, ${r.int(100, 150)})`, `fill(0, 0, 255, ${r.int(200, 255)})`, 'fill(0, 0, 255)'], 'Lower opacity values are more see-through.', { codeOptions: true });
      },
    }),
    slot('hsb', 'concepts', 'Knowing how HSB color works', {
      parts(r) {
        const rows = r.shuffle([['Where the color is on the rainbow', 0], ['How vivid the color is', 1], ['How much white or black is in it', 2]]);
        return kit.rowsQuestion({ prompt: 'Which part of HSB does each describe?', columns: ['Description'], rows: rows.map(([text, answer]) => ({ cells: [text], answer })), options: [{ text: 'hue' }, { text: 'saturation' }, { text: 'brightness' }], explain: 'Hue is the shade, saturation the vividness, and brightness the amount of white or black.' });
      },
      ranges(r) {
        return choice(r, 'What is the range of hue in HSB mode?', '0 to 360', ['0 to 100', '0 to 255', '0 to 1'], 'Hue goes around the color wheel. Saturation and brightness go from 0 to 100.');
      },
      mustDeclare(r) {
        const h = r.int(1, 359);
        return choice(r, `You want fill(${h}, 80, 90) to be read as HSB. What do you need first?`, 'colorMode(HSB)', ['angleMode(DEGREES)', 'background(HSB)', 'Nothing, since p5 uses HSB by default'], 'RGB is the default, so HSB has to be declared.', { codeOptions: true });
      },
    }),
    slot('hexData', 'concepts', 'Understanding bits, bytes, and hexadecimal', {
      bytes(r) {
        const bytes = r.int(2, 6);
        return kit.numberQuestion({ prompt: `A byte is 8 bits. How many bits are in ${bytes} bytes?`, answer: bytes * 8, explain: `${bytes} × 8.` });
      },
      hexToNumber(r) {
        const text = hexPair(r);
        return kit.numberQuestion({ prompt: `What is the hexadecimal value ${text} as a regular number? Remember that A is 10 and F is 15.`, answer: hexValue(text), explain: `Multiply the first digit by 16, and add the second: ${hexValue(text[0])} × 16 + ${hexValue(text[1])}.` });
      },
      biggerHex(r) {
        let a; let b;
        do { a = hexPair(r); b = hexPair(r); } while (a === b);
        const big = hexValue(a) > hexValue(b) ? a : b;
        return choice(r, `Which hexadecimal value is bigger, ${a} or ${b}?`, big, [big === a ? b : a, 'They are equal', 'Hexadecimal values can\'t be compared'], 'Compare the 16s place first, and then the 1s place.');
      },
    }),
    slot('palette', 'concepts', 'Using color palette vocabulary', {
      accent(r) {
        return choice(r, 'What is an accent color?', 'A color used sparingly for emphasis', ['The color used the most in a design', 'The color of the background only', 'Any color that is very dark'], 'Accent colors draw attention, so they work best in small amounts.');
      },
      complementary(r) {
        const [a, b] = r.pick([['red', 'green'], ['blue', 'orange']]);
        return choice(r, `${a} and ${b} are opposite each other on the color spectrum. What are they called?`, 'Complementary colors', ['Analogous colors', 'Accent colors', 'Primary colors'], 'Complementary colors sit directly opposite each other.');
      },
      analogous(r) {
        return choice(r, r.pick(['Red, orange, and red-orange', 'Yellow, green, and yellow-green']) + ' sit next to each other on the color wheel. What are they called?', 'Analogous colors', ['Complementary colors', 'Secondary colors', 'Additive colors'], 'Analogous colors are neighbors on the wheel.');
      },
    }),
    slot('fillOrder', 'flow', 'Predicting which shapes get which color', {
      firstShape(r) {
        const [a, b] = r.sample(PRIMARY.slice(0, 6), 2);
        const code = [`fill(${a[1]})`, 'ellipse(100, 100, 50, 50)', `fill(${b[1]})`, 'rect(200, 100, 50, 50)'];
        const fillUsed = U.shapesOf(code).shapes[0][2].replace(/,/g, ', ');
        return choice(r, 'What color is the ellipse?', PRIMARY.find((p) => p[1] === fillUsed)[0], [b[0], 'white', 'black'].filter((x) => x !== a[0]), 'A fill colors what is drawn after it.', { code });
      },
      carriesOn(r) {
        const [a] = r.sample(PRIMARY.slice(0, 6), 1);
        const code = [`fill(${a[1]})`, 'ellipse(100, 100, 50, 50)', 'rect(200, 100, 50, 50)'];
        const count = U.shapesOf(code).shapes.filter((s) => s[2].replace(/,/g, ', ') === a[1]).length;
        return kit.numberQuestion({ prompt: `How many shapes come out ${a[0]}?`, code, answer: count, explain: 'A fill stays on until another fill changes it.' });
      },
      fillAfter(r) {
        const [a, b] = r.sample(PRIMARY.slice(0, 6), 2);
        return choice(r, 'A student wants the first shape to be one color and the second another, but this code doesn\'t do that. What color is the second shape?', a[0], [b[0], 'white', 'black'].filter((x) => x !== a[0]), 'Each fill only reaches shapes drawn after it.', { code: [`fill(${a[1]})`, 'rect(10, 10, 50, 50)', 'rect(100, 10, 50, 50)', `fill(${b[1]})`] });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in color code', {
      fillAfterShape(r) {
        const [a] = r.sample(PRIMARY.slice(0, 6), 1);
        return U.bug(r, { prompt: `The ellipse should be ${a[0]}.`, code: ['ellipse(200, 200, 50, 50)', `fill(${a[1]})`], fixed: [`fill(${a[1]})`, 'ellipse(200, 200, 50, 50)'], line: [0, 1], why: 4, explain: 'Set the color before you draw the shape.' });
      },
      modeMissing(r) {
        const h = r.int(1, 359);
        const body = [`fill(${h}, 80, 90)`, 'rect(10, 10, 50, 50)'];
        return U.bug(r, { prompt: 'This should use HSB colors, but its first line is wrong.', code: ['colorMode(RGB)'].concat(body), fixed: ['colorMode(HSB)'].concat(body), line: 0, why: 5, explain: 'It should be colorMode(HSB).' });
      },
      strokeNotFill(r) {
        const [a] = r.sample(PRIMARY.slice(0, 6), 1);
        return U.bug(r, { prompt: `The inside of the circle should be ${a[0]}, but only the outline changes.`, code: [`stroke(${a[1]})`, 'ellipse(200, 200, 80, 80)'], fixed: [`fill(${a[1]})`, 'ellipse(200, 200, 80, 80)'], line: 0, why: 5, explain: 'stroke colors the outline, and fill colors the inside.' });
      },
    }),
    slot('blanks', 'build', 'Completing color code', {
      rgb(r) {
        const [a] = r.sample(PRIMARY.slice(0, 6), 1);
        const [x, y, z] = a[1].split(', ');
        return kit.blanksQuestion(r, { prompt: `Complete the code so the rectangle is ${a[0]}.`, lines: [[tok('fill', 'fn'), '(', tok(x, 'n'), ', ', tok(y, 'n'), ', ', tok(z, 'n'), ')'], ['rect(10, 10, 80, 80)']], must: ['n'], count: 3, pools: { fn: ['stroke', 'background'], n: ['128', '0', '255'] }, spec: U.spec(), explain: 'The order is red, green, and then blue.' });
      },
      outline(r) {
        const [a, b] = r.sample(PRIMARY.slice(0, 6), 2);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the circle is filled ${a[0]} and has a ${b[0]} outline.`, lines: [[tok('fill', 'fn'), `(${a[1]})`], [tok('stroke', 'fn'), `(${b[1]})`], ['ellipse(100, 100, 50, 50)']], must: ['fn'], count: 2, pools: { fn: ['background', 'colorMode'] }, spec: U.spec(), explain: 'fill is the inside, and stroke is the outline.' });
      },
      hsb(r) {
        const h = r.int(1, 359); const s = r.int(30, 99); const b = r.int(30, 99);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the background uses HSB with a hue of ${h}, a saturation of ${s}, and a brightness of ${b}.`, lines: [['colorMode(', tok('HSB', 'm'), ')'], ['background(', tok(h, 'n'), ', ', tok(s, 'n'), ', ', tok(b, 'n'), ')']], must: ['m', 'n'], count: 3, pools: { m: ['RGB', 'CENTER'], n: [h + 1] }, spec: U.spec(), explain: 'Declare the mode first, and then give hue, saturation, and brightness.' });
      },
    }),
    slot('parsons', 'build', 'Putting color code in order', {
      twoColors(r) {
        const [a, b] = r.sample(PRIMARY.slice(0, 6), 2);
        return U.drawParsons(r, { rules: ['Paint a gray background.', `Draw a ${a[0]} circle.`, `Then draw a ${b[0]} rectangle with no outline.`], lines: ['background(220)', `fill(${a[1]})`, 'ellipse(100, 100, 50, 50)', 'noStroke()', `fill(${b[1]})`, 'rect(200, 80, 50, 50)'], explain: 'Each style has to come before the shape it applies to.' });
      },
      outlined(r) {
        const [a, b] = r.sample(PRIMARY.slice(0, 6), 2);
        return U.drawParsons(r, { rules: ['Paint a gray background.', `Set a ${a[0]} fill and a ${b[0]} outline with a stroke weight of 4, in that order.`, 'Then draw the ellipse.'], lines: ['background(200)', `fill(${a[1]})`, `stroke(${b[1]})`, 'strokeWeight(4)', 'ellipse(200, 200, 90, 90)'], explain: 'Set all of the styles first, and then draw.' });
      },
      hsbMode(r) {
        const h = r.int(1, 359);
        return U.drawParsons(r, { rules: ['Switch to HSB color mode.', `Paint a background with a hue of ${h}.`, 'Set the fill to a dark gray with no saturation.', 'Draw a rectangle.', 'Draw a circle on top of it.'], lines: ['colorMode(HSB)', `background(${h}, 50, 90)`, 'fill(0, 0, 20)', 'rect(50, 50, 100, 100)', 'ellipse(100, 100, 50, 50)'], explain: 'The color mode has to be set before any colors that use it.' });
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
