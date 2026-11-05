// Injected into the app while recording the demo: a visible cursor, click pings, caption
// banners, full-screen title cards, a page recorder, and helpers that find the next
// control to click to answer the current question correctly.
(() => {
  if (window.__demo) return;
  const st = document.createElement('style');
  st.textContent = `
#demo-cursor { position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none; transform: translate(-200px, -200px); }
#demo-cursor svg { display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,.55)); }
.demo-ping { position: fixed; width: 36px; height: 36px; margin: -18px 0 0 -18px; border-radius: 50%; border: 3px solid #ffb020; z-index: 2147483646; pointer-events: none; animation: demo-ping .5s ease-out forwards; }
@keyframes demo-ping { from { transform: scale(.3); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
#demo-cap { position: fixed; left: 50%; bottom: 22px; transform: translate(-50%, 16px); opacity: 0; z-index: 2147483645; pointer-events: none;
  background: rgba(12,14,24,.94); color: #fff; border: 2px solid #7c8cff; border-radius: 16px; padding: 12px 28px; max-width: 80vw;
  font: 700 26px/1.25 system-ui, "Segoe UI", sans-serif; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,.45); transition: opacity .3s, transform .3s; }
#demo-cap small { display: block; font-weight: 400; font-size: 18px; color: #c9cfe3; margin-top: 4px; }
#demo-cap.show { opacity: 1; transform: translate(-50%, 0); }
#demo-cap.top { bottom: auto; top: 84px; }
#demo-full { position: fixed; inset: 0; z-index: 2147483644; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;
  background: radial-gradient(circle at 50% 38%, #34306e, #121420 72%); color: #fff; font-family: system-ui, "Segoe UI", sans-serif; text-align: center; opacity: 0; transition: opacity .45s; padding: 0 60px; }
#demo-full.show { opacity: 1; }
#demo-full h1 { font-size: 64px; margin: 0 0 14px; }
#demo-full h2 { font-size: 40px; margin: 0 0 18px; }
#demo-full p { font-size: 26px; color: #d3d8ec; margin: 6px 0; max-width: 1000px; }
#demo-full .url { margin-top: 28px; font-size: 27px; color: #5fe0b0; font-weight: 700; }
`;
  document.head.appendChild(st);
  const cursor = document.createElement('div');
  cursor.id = 'demo-cursor';
  cursor.innerHTML = '<svg width="26" height="30" viewBox="0 0 26 30"><path d="M2 2 L2 24 L8 18.5 L12.5 28 L16.5 26.2 L12.2 17 L20 17 Z" fill="#fff" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>';
  const cap = document.createElement('div'); cap.id = 'demo-cap';
  const full = document.createElement('div'); full.id = 'demo-full';
  document.documentElement.append(full, cap, cursor);

  let pos = { x: -200, y: -200 };
  const place = (x, y) => { pos = { x, y }; cursor.style.transform = `translate(${x - 2}px, ${y - 2}px)`; };
  addEventListener('mousemove', (e) => place(e.clientX, e.clientY), true);
  const ping = (x = pos.x, y = pos.y) => {
    const p = document.createElement('div'); p.className = 'demo-ping';
    p.style.left = x + 'px'; p.style.top = y + 'px';
    document.documentElement.appendChild(p); setTimeout(() => p.remove(), 600);
  };
  addEventListener('mousedown', (e) => ping(e.clientX, e.clientY), true);

  // Every test and practice the app builds is kept, so the helpers know the answers.
  const CC = window.CodeCheck;
  const build = CC.buildTest;
  CC.buildTest = (options) => { window.__test = build(options); return window.__test; };

  const all = (sel, parent) => Array.from((parent || document).querySelectorAll(sel));
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const box = (el) => {
    el.scrollIntoView({ block: 'nearest' });
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  };
  const pressed = (el) => el.getAttribute('aria-pressed') === 'true';
  const current = () => window.__test.questions[all('.nav-dot').findIndex((d) => d.classList.contains('current'))];
  const option = (i) => all('.options .option')[i];

  // The next element to click so the current question ends up answered, or null when done.
  // wrong: pick this choice instead of the right one.
  function nextTarget(wrong) {
    const q = current();
    switch (q.type) {
      case 'choice': {
        const i = wrong === undefined ? q.answer : wrong;
        return option(i).querySelector('input').checked ? null : option(i);
      }
      case 'rows': {
        const rows = all('.rows-table tbody tr');
        for (let i = 0; i < q.rows.length; i++) {
          const input = all('input', rows[i])[q.rows[i].answer];
          if (!input.checked) return input.closest('label') || input;
        }
        return null;
      }
      case 'region': {
        const cells = all('.cell');
        return cells.find((c, i) => pressed(c) !== q.cells.flat()[i]) || null;
      }
      case 'lines': {
        const lines = all('.tappable-panel .code-line');
        return lines.find((l, i) => l.matches('.tappable') && pressed(l) !== q.hits.includes(i)) || null;
      }
      case 'bug': {
        const line = all('.tappable-panel .code-line')[q.bugLines[0]];
        if (!pressed(line)) return line;
        return option(q.why).querySelector('input').checked ? null : option(q.why);
      }
      case 'blanks': {
        const blanks = all('.blank');
        const i = q.blanks.findIndex((b, n) => blanks[n].textContent.trim() !== b.answer);
        // A chip fills the next empty blank, so filling them in order needs only chips.
        if (i < 0) return null;
        return all('.bank .chip').find((c) => c.textContent.trim() === q.blanks[i].answer);
      }
      case 'parsons': {
        const target = q.solution.map((id) => q.lines[id].text);
        const rows = all('.sort-row');
        const text = (r) => r.querySelector('.line-text').textContent.trim();
        const i = rows.findIndex((r, n) => text(r) !== target[n]);
        if (i < 0) return null;
        const j = rows.findIndex((r, n) => n > i && text(r) === target[i]);
        return rows[j].querySelector('.move-up');
      }
      default:
        throw new Error(`Unknown type ${q.type}`);
    }
  }

  let rec = null;
  let warmStream = null;
  let chunks = [];
  window.__demo = {
    place, ping,
    caption(html, where) { cap.innerHTML = html; cap.classList.toggle('top', where === 'top'); cap.classList.add('show'); },
    hide() { cap.classList.remove('show'); },
    full(html) { full.innerHTML = html; full.classList.add('show'); },
    unfull() { full.classList.remove('show'); },
    // Center of the first visible element matching sel, optionally containing text.
    center(sel, text) {
      const el = all(sel).find((e) => visible(e) && (!text || e.textContent.includes(text)));
      if (!el) throw new Error(`not found: ${sel} ${text || ''}`);
      return box(el);
    },
    next(wrong) { const el = nextTarget(wrong); return el ? box(el) : null; },
    types() { return window.__test.questions.map((q) => q.type); },
    // Answers every question without the cursor, while a title card covers the screen.
    // wrongAt: the question number to answer with a wrong choice.
    solveRest(wrongAt) {
      const dots = all('.nav-dot');
      dots.forEach((dot, i) => {
        dot.click();
        const q = current();
        const wrong = i === wrongAt && q.type === 'choice' ? (q.answer + 1) % q.options.length : undefined;
        for (let n = 0; n < 60; n++) {
          const el = nextTarget(wrong);
          if (!el) break;
          el.click();
        }
      });
    },
    // Capturing shows a "sharing this tab" bar that shrinks the page. Start the capture
    // first to bring the bar up, so the window can be resized before recording.
    async warm() {
      warmStream = await navigator.mediaDevices.getDisplayMedia({ video: true, preferCurrentTab: true, audio: false });
      return [innerWidth, innerHeight];
    },
    async startRec(bitrate) {
      const size = { frameRate: 30, width: innerWidth, height: innerHeight };
      const stream = warmStream || await navigator.mediaDevices.getDisplayMedia({ video: size, preferCurrentTab: true, audio: false });
      await stream.getVideoTracks()[0].applyConstraints(size);
      const type = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1', 'video/mp4'].find((t) => MediaRecorder.isTypeSupported(t));
      rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: bitrate });
      chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.start(1000);
      const t = stream.getVideoTracks()[0].getSettings();
      return [type, t.width, t.height];
    },
    async stopRec(url) {
      await new Promise((r) => { rec.onstop = r; rec.stop(); });
      rec.stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType });
      await fetch(url, { method: 'PUT', body: blob });
      return blob.size;
    },
  };
})();
