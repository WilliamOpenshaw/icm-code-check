// Records the README demo video by driving the Sheet simulator in a hidden Chrome window.
//   node tools/demo/record-demo.js            -> test-output/demo.mp4
//   node tools/demo/record-demo.js headed     (watch it happen)
// Needs Chrome or Edge, and a fresh `npm run build`. Then re-encode with ffmpeg, as
// CLAUDE.md describes.
const fs = require('fs');
const http = require('http');
const path = require('path');
const { launch, sleep } = require('./cdp');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = 8124;
const W = 1280;
const H = 720;
const LESSON = 'U2LA1.3';
// A practice seed whose first question is a code trace and whose second taps lines.
const PRACTICE_SEED = 'demo7';

// Serves the project, and saves the finished recording that the page sends back.
function serve() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.normalize(path.join(ROOT, urlPath));
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    if (req.method === 'PUT') {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      req.pipe(fs.createWriteStream(file)).on('finish', () => { res.writeHead(200); res.end(); });
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(PORT);
}

(async () => {
  const server = serve();
  const b = await launch({ width: W, height: H, headless: process.argv[2] !== 'headed' });
  const { send, evaluate } = b;
  const js = (fn, ...args) => evaluate(`(${fn})(${args.map((a) => JSON.stringify(a)).join(',')})`);
  try {
    await send('Page.navigate', { url: `http://localhost:${PORT}/tests/dist/sheet-simulator.html?open=${LESSON}` });
    for (let i = 0; !(await evaluate("!!document.querySelector('.home')")); i++) {
      if (i > 100) throw new Error('the app never loaded');
      await sleep(150);
    }
    await evaluate('localStorage.clear()');
    await evaluate(fs.readFileSync(path.join(__dirname, 'overlay.js'), 'utf8'));

    // ---- input helpers: real mouse and keyboard events through DevTools ----
    let cur = { x: W / 2, y: H / 2 };
    const mouse = (type, x, y, buttons = 0) => send('Input.dispatchMouseEvent', {
      type, x, y, buttons, button: type === 'mouseMoved' ? 'none' : 'left', clickCount: type === 'mouseMoved' ? 0 : 1,
    });
    const moveTo = async (p, ms = 420) => {
      const s0 = { ...cur };
      const t0 = Date.now();
      for (;;) {
        const t = Math.min(1, (Date.now() - t0) / ms);
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        cur = { x: Math.round(s0.x + (p.x - s0.x) * e), y: Math.round(s0.y + (p.y - s0.y) * e) };
        await mouse('mouseMoved', cur.x, cur.y);
        if (t >= 1) break;
        await sleep(12);
      }
    };
    const click = async (p, ms) => {
      await moveTo(p, ms);
      await sleep(80);
      await mouse('mousePressed', p.x, p.y, 1);
      await sleep(70);
      await mouse('mouseReleased', p.x, p.y);
      await sleep(160);
    };
    const type = async (text, cps = 12) => {
      for (const ch of text) {
        await send('Input.insertText', { text: ch });
        await sleep(1000 / cps);
      }
    };
    const at = (sel, text) => js((s, t) => __demo.center(s, t), sel, text || '');
    const button = (text) => at('button', text);
    const T0 = Date.now();
    const caption = (html, where) => {
      console.log(`${((Date.now() - T0) / 1000).toFixed(1)}s ${html.replace(/<.*/, '')}`);
      return js((h, w) => __demo.caption(h, w), html, where || '');
    };
    const hide = () => js(() => __demo.hide());
    const full = async (html, ms) => {
      await js((h) => __demo.full(h), html);
      await sleep(ms);
    };
    const unfull = async () => { await js(() => __demo.unfull()); await sleep(500); };
    // Picks a value in a dropdown. Native dropdown lists don't show up in the recording.
    const choose = async (nth, index) => {
      const p = await js((k) => {
        const r = document.querySelectorAll('select')[k].getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }, nth);
      await moveTo(p, 450);
      await js(() => __demo.ping());
      await js((k, i) => {
        const el = document.querySelectorAll('select')[k];
        el.selectedIndex = i;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, nth, index);
      await sleep(450);
    };
    // Answers the current question with the cursor, one click at a time.
    const answer = async (wrong, ms = 380) => {
      for (let n = 0; n < 40; n++) {
        const p = await js((w) => __demo.next(w), wrong);
        if (!p) return;
        await click(p, ms);
        await sleep(120);
      }
      throw new Error('question never finished');
    };
    const goTo = async (i) => {
      await js(() => window.scrollTo(0, 0));
      await click(await js((n) => __demo.center(`.nav-dot:nth-child(${n + 1})`), i), 450);
      await sleep(500);
    };

    await js(() => __demo.place(640, 460));
    await evaluate('__demo.warm()', true);
    await sleep(500);
    await b.fit();
    const mime = await evaluate('__demo.startRec(1600000)', true);
    console.log('recording as', mime, await evaluate('[innerWidth, innerHeight]'));

    // 1. Title
    await full('<h1>ICM Code Check</h1><p>Supervised, randomly generated tests and practice for the ICM JS (p5.js) course</p>', 3200);
    await unfull();

    // 2. Home
    await caption('Students practice any time, and take tests in class', 'top');
    await moveTo(await at('.home-tips'), 900);
    await sleep(1600);

    // 3. Sign in to a test
    await click(await button('Take the test'), 600);
    await sleep(900);
    await caption('Tests open with a start code from the teacher', 'top');
    await choose(0, 0);
    await choose(1, 1);
    await click(await at('.code-entry'), 450);
    await type('TESTME');
    await sleep(600);
    await moveTo(await at('.rules'), 600);
    await sleep(900);
    await click(await button('Start the test'), 500);
    await sleep(1200);

    // 4. The test
    await caption('The lesson, the student’s name, and the timer stay on screen', 'top');
    await moveTo(await at('.band-student'), 700);
    await sleep(1900);
    const types = await js(() => __demo.types());
    const shown = [];
    const scene = async (kind, html) => {
      const i = types.indexOf(kind);
      if (i < 0) return;
      shown.push(i);
      await goTo(i);
      await caption(html, 'top');
      await sleep(700);
      await answer(undefined, 300);
      await sleep(900);
    };
    await scene('blanks', 'Fill in code from a word bank<small>Students never type code, so a typo can’t look like a misunderstanding</small>');
    await scene('parsons', 'Put scrambled lines in order<small>Any order that really works earns full credit</small>');
    await scene('lines', 'Trace which lines of code run');
    await scene('region', 'Find where the mouse makes a condition true');
    await caption('Mark a question to come back to it', 'top');
    await click(await button('Mark for review'), 500);
    await sleep(1100);

    // Answer the rest behind a title card, with one wrong so the results have something to review.
    const wrongAt = types.findIndex((t, i) => t === 'choice' && !shown.includes(i));
    await hide();
    await js(() => __demo.full('<h2>Every student gets a different version</h2><p>Questions come in a mixed order, with new numbers, names, and answer choices</p>'));
    await sleep(600);
    await js((w) => __demo.solveRest(w), wrongAt);
    await sleep(2800);
    await unfull();

    // 5. Turn in
    await goTo(types.length - 1);
    await caption('Turning in sends the score to the teacher’s Google Sheet', 'top');
    await click(await button('Review and turn in'), 500);
    await sleep(1400);
    await click(await at('.dialog button', 'Turn in'), 500);
    await sleep(2000);

    // 6. Results
    await caption('Students see their score by skill, and what to review<small>They don’t see the answers, so a retake is still a fair test</small>');
    await moveTo(await at('.skills'), 800);
    await sleep(3600);
    await hide();
    await click(await button('Done'), 500);
    await sleep(800);

    // 7. Practice
    await js((seed) => { CodeCheck.newSeed = () => seed; }, PRACTICE_SEED);
    await click(await button('Practice'), 500);
    await sleep(800);
    await caption('Practice: a new random test every time, with answers explained', 'top');
    await choose(0, await js((id) => [...document.querySelector('select').options].findIndex((o) => o.value === id), LESSON));
    await sleep(500);
    await click(await button('Start practice'), 500);
    await sleep(1400);
    const q1 = await js(() => window.__test.questions[0]);
    await answer((q1.answer + 1) % q1.options.length, 600);
    await click(await button('Check answer'), 450);
    await sleep(300);
    await caption('A wrong answer shows the right one, and why', 'top');
    await js(() => document.querySelector('.feedback').scrollIntoView({ block: 'center' }));
    await sleep(3400);
    await click(await button('Next'), 450);
    await sleep(700);
    await caption('Then try again on the next question', 'top');
    await answer(undefined, 450);
    await click(await button('Check answer'), 450);
    await js(() => document.querySelector('.feedback').scrollIntoView({ block: 'center' }));
    await sleep(2200);

    // 8. Display controls
    await js(() => window.scrollTo(0, 0));
    await caption('Bigger text and dark mode on every screen');
    await click(await at('button[aria-label="Make text bigger"]'), 600);
    await sleep(500);
    await click(await at('button[aria-label="Make text bigger"]'), 250);
    await sleep(900);
    await click(await at('button[aria-label^="Switch to"]'), 600);
    await sleep(2000);
    await click(await at('button[aria-label^="Text size is"]'), 600);
    await sleep(1600);
    await hide();

    // 9. The teacher's side, and the ending
    await full('<h2>For the teacher</h2><p>A Google Sheet opens tests, sets the timer, and makes start codes.</p><p>It shows who is testing live, flags leaving the screen, and keeps a gradebook and class summaries by skill.</p><p>An offline copy works without Google.</p>', 6500);
    await full('<h1>ICM Code Check</h1><p>Free and open source</p><p>Practice for every lesson in Units 1 to 4</p><p class="url">williamopenshaw.github.io/icm-code-check</p>', 4200);

    const out = 'test-output/demo.mp4';
    const size = await evaluate(`__demo.stopRec('/${out}')`);
    console.log(`saved ${out} (${(size / 1048576).toFixed(2)} MB)`);
  } catch (e) {
    try { await evaluate("__demo.stopRec('/test-output/demo-partial.mp4')"); } catch (e2) { /* not recording */ }
    throw e;
  } finally {
    b.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
