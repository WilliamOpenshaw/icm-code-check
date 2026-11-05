// Prints a readable copy of a generated test, with answers, for reviewing question quality.
// Usage: node tools/print-sample.js [lessonId] [seed]
//        node tools/print-sample.js U2LA1.3 --patterns    (one of every pattern)
const { loadCodeCheck } = require('../tests/load');

const CC = loadCodeCheck();
const lessonId = process.argv[2] || 'U2LA1.3';
const seedArg = process.argv[3] || 'SAMPLE-1';

function codeBlock(lines) {
  return (lines || []).map((line) => `      ${line}`).join('\n');
}

function show(q, label) {
  const out = [`\n=== ${label} ===`, q.prompt];
  if (q.rule) out.push(`  RULE: ${q.rule}`);
  switch (q.type) {
    case 'choice':
      if (q.code) out.push(codeBlock(q.code));
      q.options.forEach((o, i) => out.push(`  ${i === q.answer ? '*' : ' '} ${o.text.replace(/\n/g, '\n      ')}`));
      break;
    case 'number':
      if (q.code) out.push(codeBlock(q.code));
      out.push(`  answer: ${q.answer}`);
      break;
    case 'rows':
      if (q.code) out.push(codeBlock(q.code));
      out.push(`  ${q.columns.join(' | ')}`);
      q.rows.forEach((row) => out.push(`  ${row.cells.join(' | ')}  =>  ${q.options[row.answer].text}`));
      out.push(`  options: ${q.options.map((o) => o.text).join(', ')}`);
      break;
    case 'region':
      out.push(codeBlock(q.code));
      out.push(`  canvas ${q.w} x ${q.h}, x cuts [${q.xs}], y cuts [${q.ys}]`);
      q.cells.forEach((row) => out.push(`  ${row.map((v) => (v ? '[X]' : '[ ]')).join('')}`));
      break;
    case 'lines':
      q.code.forEach((line, i) => {
        const mark = !q.selectable.includes(i) ? '   ' : q.hits.includes(i) ? '[X]' : '[ ]';
        out.push(`  ${mark} ${line}`);
      });
      break;
    case 'bug':
      q.code.forEach((line, i) => out.push(`  ${q.bugLines.includes(i) ? 'BUG' : '   '} ${line}`));
      q.whyOptions.forEach((w, i) => out.push(`  ${i === q.why ? '*' : ' '} ${w}`));
      break;
    case 'blanks':
      out.push(codeBlock(CC.blanksDisplayLines(q, {})));
      out.push(`  key: ${CC.blanksKey(q).join('  ')}`);
      out.push(`  bank: ${q.bank.join('  ')}`);
      break;
    case 'parsons':
      out.push(codeBlock(q.prefix.map((l) => l.text)));
      out.push('      --- scrambled ---');
      out.push(codeBlock(q.order.map((id) => q.lines[id].text)));
      out.push('      --- solution ---');
      out.push(codeBlock(q.solution.map((id) => q.lines[id].text)));
      out.push(codeBlock(q.suffix.map((l) => l.text)));
      break;
    default:
  }
  if (q.explain) out.push(`  WHY: ${q.explain.replace(/\n/g, '\n       ')}`);
  console.log(out.join('\n'));
}

if (seedArg === '--patterns') {
  const lesson = CC.lessons[lessonId];
  lesson.slots.forEach((slot) => slot.patterns.forEach((pattern) => {
    show(pattern.make(CC.makeRng(`print/${slot.id}/${pattern.id}`)), `${slot.id} / ${pattern.id}`);
  }));
} else {
  const test = CC.buildTest({ lessonId, seed: seedArg, count: CC.lessons[lessonId].defaults.questions });
  test.questions.forEach((q, i) => show(q, `Q${i + 1} ${q.slot} / ${q.pattern}`));
}
