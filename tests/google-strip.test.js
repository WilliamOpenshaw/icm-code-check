// Before serving a page, Google's HtmlService removes anything that looks like a comment, even
// inside a string. Seen on the real servers: `color(1, 2, 3) // red` lost its ending, which broke
// the whole script and left a blank page. So text in shipped code must write // as /\/.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { LOGIC_FILES, LESSON_FILES, APP_FILES } = require('../tools/sources');
const { root } = require('./load');

const stripLikeGoogle = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

LOGIC_FILES.concat(LESSON_FILES, APP_FILES).forEach((file) => {
  test(`${file} survives Google removing comments`, () => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotThrow(() => new vm.Script(stripLikeGoogle(source), { filename: file }));
    // Code that still parses could have lost part of a string, so check for that too.
    const lost = source.split('\n').filter((line) => {
      const at = line.indexOf('//');
      return at >= 0 && line.slice(0, at).trim() !== '' && (line.slice(0, at).split('`').length % 2 === 0
        || line.slice(0, at).split("'").length % 2 === 0);
    });
    assert.deepStrictEqual(lost, [], 'These lines have // inside a string');
  });
});

test('questions still show their comments after the change', () => {
  const { loadCodeCheck } = require('./load');
  const CC = loadCodeCheck();
  assert.strictEqual(CC.kit.setColor('dot', { name: 'red', rgb: [255, 0, 0] }).endsWith('// red'), true);
});
