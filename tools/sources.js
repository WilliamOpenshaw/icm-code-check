// The order source files are combined in, shared by the build and the tests so the
// tests always exercise exactly what ships. Add new lesson files to LESSON_FILES.
const LOGIC_FILES = ['src/mini.js', 'src/engine.js', 'src/lessons/kit.js'];
const LESSON_FILES = [
  'src/lessons/u1kit.js',
  'src/lessons/u1la1.js',
  'src/lessons/u1la2.js',
  'src/lessons/u1la3.js',
  'src/lessons/u1la4.js',
  'src/lessons/unit1.js',
  'src/lessons/u2la1-1.js',
  'src/lessons/u2la1-2.js',
  'src/lessons/u2la1-3.js',
  'src/lessons/u2la2-1.js',
  'src/lessons/u2la2-2.js',
  'src/lessons/u2la3-1.js',
  'src/lessons/u2la3-2.js',
  'src/lessons/u2la3-3.js',
  'src/lessons/u2la4-1.js',
  'src/lessons/u2la4-2.js',
  'src/lessons/u2la5-1.js',
  'src/lessons/unit2.js',
  'src/lessons/u3la1.js',
  'src/lessons/u3la2.js',
  'src/lessons/u3la3.js',
  'src/lessons/unit3.js',
  'src/lessons/u4la1.js',
  'src/lessons/u4la2.js',
  'src/lessons/unit4.js',
];
const APP_FILES = ['src/backend.js', 'src/questions.js', 'src/display.js', 'src/app.js'];

module.exports = { LOGIC_FILES, LESSON_FILES, APP_FILES };
