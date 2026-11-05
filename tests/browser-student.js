// Paste-in helper for checking the app in a real browser: it answers a whole test by
// clicking the actual on-screen controls, so it proves every control records the right
// answer. It rebuilds the same test from the seed to know the answers.
// Usage in the page: await __autoStudent({ lessonId, seed, count })
window.__autoStudent = async function ({ lessonId, seed, count }) {
  const CC = window.CodeCheck;
  const test = CC.buildTest({ lessonId, seed, count });
  const all = (selector, parent) => Array.from((parent || document).querySelectorAll(selector));
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  const button = (text) => all('button').find((b) => b.textContent.trim().startsWith(text));
  const log = [];

  for (let n = 0; n < test.questions.length; n++) {
    const q = test.questions[n];
    const shown = document.querySelector('.question');
    if (!shown.classList.contains(`q-${q.type}`)) {
      throw new Error(`Question ${n + 1} should be ${q.type} but the page shows ${shown.className}`);
    }
    if (q.prompt && !document.querySelector('.q-prompt').innerText.startsWith(q.prompt.slice(0, 20))) {
      throw new Error(`Question ${n + 1} is not the expected question`);
    }
    switch (q.type) {
      case 'choice':
        all('.options .option input')[q.answer].click();
        break;
      case 'number': {
        const input = document.querySelector('.number-answer input');
        input.value = String(q.answer);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        break;
      }
      case 'rows':
        q.rows.forEach((row, i) => all('input', all('.rows-table tbody tr')[i])[row.answer].click());
        break;
      case 'region': {
        const cells = all('.cell');
        let index = 0;
        q.cells.forEach((line) => line.forEach((isTrue) => {
          if (isTrue) cells[index].click();
          index += 1;
        }));
        break;
      }
      case 'lines': {
        const lines = all('.tappable-panel .code-line');
        q.hits.forEach((i) => lines[i].click());
        break;
      }
      case 'bug':
        all('.tappable-panel .code-line')[q.bugLines[0]].click();
        all('.options .option input')[q.why].click();
        break;
      case 'blanks':
        q.blanks.forEach((blank, i) => {
          all('.blank')[i].click();
          const chip = all('.bank .chip').find((c) => c.textContent.trim() === blank.answer);
          if (!chip) throw new Error(`No word bank chip for ${blank.answer}`);
          chip.click();
        });
        break;
      case 'parsons': {
        const target = q.solution.map((id) => q.lines[id].text);
        for (let i = 0; i < target.length; i++) {
          let rows = all('.sort-row');
          let j = rows.findIndex((r, k) => k >= i && r.querySelector('.line-text').textContent.trim() === target[i]);
          if (j < 0) throw new Error(`Missing line ${target[i]}`);
          while (j > i) {
            rows[j].querySelector('.move-up').click();
            rows = all('.sort-row');
            j -= 1;
          }
        }
        break;
      }
      default:
        throw new Error(`Unknown type ${q.type}`);
    }
    log.push(`${n + 1}:${q.type}`);
    await tick();
    const next = button('Next') || button('Review and turn in');
    next.click();
    await tick();
  }
  return log;
};
