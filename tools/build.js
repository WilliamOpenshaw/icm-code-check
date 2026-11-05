// Combines the source files into the files you actually use:
//   test-offline.html         one file that runs in a browser with no setup
//   apps-script/Index.html    paste into Apps Script as Index
//   apps-script/Code.gs       paste into Apps Script as Code
//   site/index.html           the practice-only page that GitHub Pages publishes
// Run with: node tools/build.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { LOGIC_FILES, LESSON_FILES, APP_FILES } = require('./sources');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function write(file, content) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(`${file}  ${(Buffer.byteLength(content) / 1024).toFixed(0)} KB`);
}

// Node-only lines would be harmless in a browser, but leaving them out keeps the page clean.
const stripNodeExport = (source) => source.replace(/^if \(typeof module !== 'undefined'\) module\.exports = CodeCheck;\s*$/m, '');

const logicFiles = LOGIC_FILES.concat(LESSON_FILES);
const scripts = logicFiles.concat(APP_FILES)
  .map((file) => `// ---- ${file} ----\n${stripNodeExport(read(file))}`)
  .join('\n')
  .replace(/<\/script/gi, '<\\/script');

function page(extraBeforeApp) {
  return read('src/index.template.html')
    .replace('/*STYLES*/', () => read('src/styles.css'))
    .replace('<!--BEFORE_APP-->', () => extraBeforeApp || '')
    .replace('/*SCRIPTS*/', () => scripts);
}

// The Sheet's Tests tab is filled in from each lesson's defaults.
const context = vm.createContext({ console, crypto: globalThis.crypto });
logicFiles.forEach((file) => vm.runInContext(read(file), context, { filename: file }));
const catalog = vm.runInContext(`CodeCheck.lessonOrder.map((id) => {
  const l = CodeCheck.lessons[id];
  return { id, title: l.title, minutes: l.defaults.minutes, questions: l.defaults.questions, attempts: l.defaults.attempts, practice: l.defaults.practice };
})`, context);

write('test-offline.html', page());
write('apps-script/Index.html', page());
write('site/index.html', page('<script>var CodeCheck = { practiceOnly: true }</script>'));
write('apps-script/Code.gs', read('src/server/Code.gs').replace('/*CATALOG*/[]', () => JSON.stringify(catalog, null, 2)));

// A local stand-in for Google, used only to test the Sheet version on this computer.
const simulator = [
  '<script>', read('tests/gas-mock.js').replace(/<\/script/gi, '<\\/script'), '</script>',
  '<script>', read('apps-script/Code.gs').replace(/<\/script/gi, '<\\/script'), '</script>',
  '<script>', read('tests/gas-browser-shim.js').replace(/<\/script/gi, '<\\/script'), '</script>',
].join('\n');
write('tests/dist/sheet-simulator.html', page(simulator));
