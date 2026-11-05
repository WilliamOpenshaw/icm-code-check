// Checks that text stays readable in both light and dark mode, by the WCAG AA contrast
// rules: 4.5 to 1 for text, and 3 to 1 for the edges of controls.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { root } = require('./load');

const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');

function tokensIn(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `Could not find ${selector} in styles.css`);
  const body = css.slice(start, css.indexOf('\n}', start));
  const tokens = {};
  body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g, (_, name, value) => {
    tokens[name] = value;
    return '';
  });
  return tokens;
}

const light = tokensIn(':root');
const dark = { ...light, ...tokensIn(':root[data-theme="dark"]') };

function luminance(hex) {
  const channel = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const CODE_TOKENS = ['code-ink', 'tk-comment', 'tk-string', 'tk-keyword', 'tk-logic', 'tk-compare', 'tk-number', 'tk-call'];
const CARD_TOKENS = ['ctk-comment', 'ctk-string', 'ctk-keyword', 'ctk-logic', 'ctk-compare', 'ctk-number', 'ctk-call'];

const TEXT_PAIRS = [
  ['ink', 'paper'], ['ink', 'card'], ['ink', 'subtle'], ['ink', 'hover'], ['ink', 'accent-soft'],
  ['ink', 'good-soft'], ['ink', 'bad-soft'], ['ink', 'warn-soft'], ['ink', 'cell-bg'],
  ['ink-soft', 'paper'], ['ink-soft', 'card'], ['ink-soft', 'subtle'],
  ['on-accent', 'accent'], ['on-accent', 'accent-hover'],
  ['on-band', 'band-test'], ['on-band', 'band-practice'],
  ['accent-ink', 'card'], ['accent-ink', 'paper'],
  ['good', 'card'], ['good', 'good-soft'],
  ['bad', 'card'], ['bad', 'bad-soft'],
  ['warn', 'card'], ['warn-ink', 'warn-soft'],
  ['cell-on-ink', 'cell-on'],
  ['code-soft', 'code-bg'], ['code-note', 'code-bg'],
  ...CODE_TOKENS.flatMap((t) => [[t, 'code-bg'], [t, 'code-hover']]),
  ...CARD_TOKENS.flatMap((t) => [[t, 'card'], [t, 'subtle'], [t, 'accent-soft'], [t, 'good-soft'], [t, 'bad-soft']]),
];

// Selected and fixed code rows must stay readable, at least for the main text.
const TEXT_ON_SPECIAL_ROWS = [['code-ink', 'code-select'], ['code-ink', 'code-fixed']];

const EDGE_PAIRS = [
  ['control-line', 'card'], ['control-line', 'paper'], ['cell-line', 'cell-bg'], ['canvas-line', 'card'], ['code-soft', 'code-bg'],
];

function check(name, tokens, pairs, minimum) {
  pairs.forEach(([fg, bg]) => {
    assert.ok(tokens[fg], `Missing token --${fg}`);
    assert.ok(tokens[bg], `Missing token --${bg}`);
    const ratio = contrast(tokens[fg], tokens[bg]);
    assert.ok(ratio >= minimum, `${name}: --${fg} on --${bg} is only ${ratio.toFixed(2)} to 1, and needs ${minimum}`);
  });
}

[['light mode', light], ['dark mode', dark]].forEach(([name, tokens]) => {
  test(`${name}: text is readable`, () => {
    check(name, tokens, TEXT_PAIRS, 4.5);
    check(name, tokens, TEXT_ON_SPECIAL_ROWS, 4.5);
  });
  test(`${name}: control edges are visible`, () => {
    check(name, tokens, EDGE_PAIRS, 3);
  });
});

test('every color used in the styles comes from a defined token', () => {
  const used = new Set([...css.matchAll(/var\(--([\w-]+)/g)].map((m) => m[1]));
  const defined = new Set([...css.matchAll(/^\s*--([\w-]+):/gm)].map((m) => m[1]));
  // These are set on the elements themselves, and they are sizes rather than colors.
  ['text-scale', 'indent', 'level'].forEach((name) => defined.add(name));
  used.forEach((name) => assert.ok(defined.has(name), `--${name} is used but never defined`));
});

test('the bands look the same in both modes, so a teacher can spot them from across the room', () => {
  const darkOnly = tokensIn(':root[data-theme="dark"]');
  ['band-test', 'band-practice'].forEach((name) => {
    assert.strictEqual(darkOnly[name], undefined, `--${name} should not change in dark mode`);
  });
});
