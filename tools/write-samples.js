// Writes one example of every question, with answers, for each test into docs/question-samples.
// Usage: node tools/write-samples.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadCodeCheck } = require('../tests/load');

const root = path.join(__dirname, '..');
const folder = path.join(root, 'docs', 'question-samples');
fs.mkdirSync(folder, { recursive: true });

loadCodeCheck().lessonOrder.forEach((id) => {
  const text = execFileSync(process.execPath, [path.join(__dirname, 'print-sample.js'), id, '--patterns'], { encoding: 'utf8', maxBuffer: 1 << 24 });
  const name = `${id.replace(/\s+/g, '-')}.txt`;
  fs.writeFileSync(path.join(folder, name), text.trimStart());
  console.log(`docs/question-samples/${name}`);
});
