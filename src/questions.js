// Draws each question type and reports answers back to the app. In review mode the same
// screens are locked and show what was right, wrong, or missed. Everything here works
// with touch, mouse, and keyboard, and nothing relies on color alone.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'class') el.className = value;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === 'value' || key === 'checked' || key === 'disabled') el[key] = value;
      else el.setAttribute(key, value === true ? '' : value);
    });
    kids.flat(Infinity).forEach((kid) => {
      if (kid === null || kid === undefined || kid === false) return;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
    return el;
  }
  CC.h = h;

  // ---- Code display ----

  const TOKEN = /(\/\/.*$)|("[^"]*"|'[^']*')|\b(if|else|let|const|function|return|typeof|true|false|PROCEDURE|RETURN|DISPLAY|IF|ELSE)\b|(&&|\|\|)|(<=|>=|==|!=|<|>)|\b(\d+)\b|\b([A-Za-z_]\w*)(?=\()/g;
  const TOKEN_CLASSES = ['tk-comment', 'tk-string', 'tk-keyword', 'tk-logic', 'tk-compare', 'tk-number', 'tk-call'];

  function codeSpans(text) {
    const out = [];
    let last = 0;
    TOKEN.lastIndex = 0;
    let match = TOKEN.exec(text);
    while (match) {
      if (match.index > last) out.push(text.slice(last, match.index));
      const group = match.slice(1).findIndex((g) => g !== undefined);
      out.push(h('span', { class: TOKEN_CLASSES[group] }, match[0]));
      last = match.index + match[0].length;
      match = TOKEN.exec(text);
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }

  // Long lines wrap instead of scrolling sideways, which matters most at large text sizes.
  // The wrapped part sits a little further in than the start of its own line.
  const indentOf = (text) => text.length - text.trimStart().length;
  const codeText = (indent, ...content) => h('span', { class: 'code-text', style: `--indent:${indent}` }, ...content);
  const lineText = (text) => codeText(indentOf(text), codeSpans(text.trimStart()));

  const codeLine = (text) => h('div', { class: 'code-line' }, lineText(text));
  const codePanel = (lines) => h('div', { class: 'code' }, lines.map(codeLine));
  // Lines beside tappable ones need the same left space, or the code looks wrongly indented.
  const alignedLine = (text) => h('div', { class: 'code-line' },
    h('span', { class: 'tap-box tap-spacer', 'aria-hidden': 'true' }), lineText(text));

  const promptBlock = (q) => [
    h('p', { class: 'q-prompt' }, q.prompt),
    q.rule ? h('blockquote', { class: 'q-rule' }, q.rule) : null,
  ];

  const mark = (isRight) => h('span', { class: `mark ${isRight ? 'mark-right' : 'mark-wrong'}` }, isRight ? '✓ ' : '✗ ');

  // An answer choice that is code, which may run over several lines.
  const codeOption = (text) => text.split('\n').map((line) => h('span', { class: 'option-code-line' }, codeSpans(line)));

  // ---- Choice ----

  function renderChoice(q, ctx) {
    let picked = ctx.answer;
    const group = `q-${q.uid}`;
    const list = h('div', { class: 'options' }, q.options.map((option, i) => {
      const isKey = i === q.answer;
      const isPicked = picked === i;
      const stateClass = ctx.review
        ? (isKey ? 'is-key' : isPicked ? 'is-wrong' : '')
        : '';
      return h('label', { class: `option ${stateClass}` },
        h('input', {
          type: 'radio',
          name: group,
          checked: isPicked,
          disabled: ctx.locked,
          onchange: () => { picked = i; ctx.onChange(i); },
        }),
        h('span', { class: q.codeOptions ? 'option-text code-inline' : 'option-text' },
          ctx.review && (isKey || isPicked) ? mark(isKey) : null,
          q.codeOptions ? codeOption(option.text) : option.text));
    }));
    return [promptBlock(q), q.code ? codePanel(q.code) : null, list];
  }

  // ---- Number: type the value ----

  function renderNumber(q, ctx) {
    const id = `answer-${q.uid}`;
    const isRight = ctx.review && CC.grade(q, ctx.answer).credit === 1;
    return [
      promptBlock(q),
      q.code ? codePanel(q.code) : null,
      h('div', { class: 'number-answer' },
        h('label', { for: id }, 'Your answer'),
        h('input', {
          type: 'text',
          id,
          autocomplete: 'off',
          spellcheck: 'false',
          value: ctx.answer === undefined ? '' : ctx.answer,
          disabled: ctx.locked,
          oninput: (e) => ctx.onChange(e.target.value),
        }),
        ctx.review ? h('span', { class: isRight ? 'mark-right' : 'mark-wrong' }, isRight ? '✓' : `✗ The answer is ${q.answer}`) : null),
    ];
  }

  // ---- Rows: one choice per row ----

  function renderRows(q, ctx) {
    const answers = { ...(ctx.answer || {}) };
    const rows = q.rows.map((row, rowIndex) => {
      const picked = answers[rowIndex];
      return h('tr', {},
        row.cells.map((cell) => h('td', { class: 'row-value' }, h('code', { class: 'code-inline' }, codeSpans(cell)))),
        h('td', { class: 'row-answer' },
          h('div', { class: 'pills', role: 'radiogroup', 'aria-label': `Answer for row ${rowIndex + 1}` },
            q.options.map((option, i) => {
              const isKey = i === row.answer;
              const stateClass = ctx.review ? (isKey ? 'is-key' : picked === i ? 'is-wrong' : '') : '';
              return h('label', { class: `pill ${stateClass}` },
                h('input', {
                  type: 'radio',
                  name: `q-${q.uid}-row-${rowIndex}`,
                  checked: picked === i,
                  disabled: ctx.locked,
                  onchange: () => {
                    answers[rowIndex] = i;
                    ctx.onChange({ ...answers });
                  },
                }),
                option.swatch ? h('span', { class: 'swatch', style: `background:${option.swatch}` }) : null,
                h('span', {}, ctx.review && (isKey || picked === i) ? mark(isKey) : null, option.text));
            }))));
    });
    return [
      promptBlock(q),
      q.code ? codePanel(q.code) : null,
      h('div', { class: 'table-wrap' },
        h('table', { class: 'rows-table' },
          h('thead', {}, h('tr', {},
            q.columns.map((name) => h('th', { scope: 'col' }, h('code', {}, name))),
            h('th', { scope: 'col' }, 'Your answer'))),
          h('tbody', {}, rows))),
    ];
  }

  // ---- Region: tap parts of a canvas ----

  function renderRegion(q, ctx) {
    const picked = new Set(ctx.answer || []);
    const edgesX = [0].concat(q.xs, [q.w]);
    const edgesY = [0].concat(q.ys, [q.h]);
    const sizes = (edges) => edges.slice(1).map((e, i) => `${e - edges[i]}fr`).join(' ');

    const cells = [];
    q.cells.forEach((row, y) => row.forEach((isTrue, x) => {
      const key = `${y},${x}`;
      const label = `mouseX from ${edgesX[x]} to ${edgesX[x + 1]}, mouseY from ${edgesY[y]} to ${edgesY[y + 1]}`;
      const button = h('button', {
        type: 'button',
        class: 'cell',
        'aria-pressed': picked.has(key) ? 'true' : 'false',
        'aria-label': label,
        disabled: ctx.locked,
        onclick: () => {
          if (picked.has(key)) picked.delete(key);
          else picked.add(key);
          button.setAttribute('aria-pressed', picked.has(key) ? 'true' : 'false');
          button.classList.toggle('on', picked.has(key));
          ctx.onChange(Array.from(picked));
        },
      });
      if (picked.has(key)) button.classList.add('on');
      if (ctx.review) {
        if (isTrue && picked.has(key)) button.classList.add('cell-right');
        else if (isTrue) button.classList.add('cell-missed');
        else if (picked.has(key)) button.classList.add('cell-wrong');
        if (isTrue && !picked.has(key)) button.textContent = 'missed';
      }
      cells.push(button);
    }));

    const pct = (value, max) => `${(value / max) * 100}%`;
    const xLabels = edgesX.map((v) => h('span', { class: 'tick', style: `left:${pct(v, q.w)}` }, v));
    const yLabels = edgesY.map((v) => h('span', { class: 'tick', style: `top:${pct(v, q.h)}` }, v));

    return [
      promptBlock(q),
      codePanel(q.code),
      h('div', { class: 'canvas-box' },
        h('div', { class: 'canvas-corner' }),
        h('div', { class: 'axis axis-x' }, h('span', { class: 'axis-title' }, 'mouseX'), xLabels),
        h('div', { class: 'axis axis-y' }, h('span', { class: 'axis-title' }, 'mouseY'), yLabels),
        h('div', {
          class: 'canvas-grid',
          style: `grid-template-columns:${sizes(edgesX)};grid-template-rows:${sizes(edgesY)};aspect-ratio:${q.w}/${q.h}`,
        }, cells)),
    ];
  }

  // ---- Lines: tap the lines that run ----

  function renderLines(q, ctx) {
    const picked = new Set(ctx.answer || []);
    const rows = q.code.map((text, i) => {
      if (!q.selectable.includes(i)) return alignedLine(text);
      const didRun = q.hits.includes(i);
      const button = h('button', {
        type: 'button',
        class: 'code-line tappable',
        'aria-pressed': picked.has(i) ? 'true' : 'false',
        disabled: ctx.locked,
        onclick: () => {
          if (picked.has(i)) picked.delete(i);
          else picked.add(i);
          button.setAttribute('aria-pressed', picked.has(i) ? 'true' : 'false');
          ctx.onChange(Array.from(picked));
        },
      }, h('span', { class: 'tap-box', 'aria-hidden': 'true' }), lineText(text));
      if (ctx.review) {
        button.classList.add(didRun === picked.has(i) ? 'line-right' : 'line-wrong');
        button.lastChild.append(h('span', { class: 'line-note' }, didRun ? ' ← runs' : ' ← does not run'));
      }
      return button;
    });
    return [promptBlock(q), h('div', { class: 'code tappable-panel' }, rows)];
  }

  // ---- Bug: tap a line, then say why ----

  function renderBug(q, ctx) {
    const answer = { ...(ctx.answer || {}) };
    const buttons = new Map();
    const rows = q.code.map((text, i) => {
      if (!q.selectable.includes(i)) return alignedLine(text);
      const button = h('button', {
        type: 'button',
        class: 'code-line tappable',
        'aria-pressed': answer.line === i ? 'true' : 'false',
        disabled: ctx.locked,
        onclick: () => {
          answer.line = i;
          buttons.forEach((b, index) => b.setAttribute('aria-pressed', index === i ? 'true' : 'false'));
          ctx.onChange({ ...answer });
        },
      }, h('span', { class: 'tap-box round', 'aria-hidden': 'true' }), lineText(text));
      if (ctx.review) {
        if (q.bugLines.includes(i)) button.classList.add('line-right');
        else if (answer.line === i) button.classList.add('line-wrong');
        if (q.bugLines.includes(i)) button.lastChild.append(h('span', { class: 'line-note' }, ' ← the bug'));
      }
      buttons.set(i, button);
      return button;
    });
    const group = `q-${q.uid}-why`;
    return [
      promptBlock(q),
      h('div', { class: 'code tappable-panel' }, rows),
      h('p', { class: 'sub-prompt' }, 'Why is it wrong?'),
      h('div', { class: 'options' }, q.whyOptions.map((text, i) => {
        const isKey = i === q.why;
        const isPicked = answer.why === i;
        const stateClass = ctx.review ? (isKey ? 'is-key' : isPicked ? 'is-wrong' : '') : '';
        return h('label', { class: `option ${stateClass}` },
          h('input', {
            type: 'radio',
            name: group,
            checked: isPicked,
            disabled: ctx.locked,
            onchange: () => {
              answer.why = i;
              ctx.onChange({ ...answer });
            },
          }),
          h('span', { class: 'option-text' }, ctx.review && (isKey || isPicked) ? mark(isKey) : null, text));
      })),
    ];
  }

  // ---- Blanks: assign from a word bank ----

  function renderBlanks(q, ctx) {
    const tokens = { ...(ctx.answer || {}) };
    const blankButtons = [];
    let active = null;
    const fullCredit = ctx.review && CC.grade(q, tokens).credit === 1;

    const refresh = () => {
      blankButtons.forEach((button, i) => {
        const value = tokens[i];
        button.textContent = value === undefined ? '' : value;
        button.classList.toggle('filled', value !== undefined);
        button.classList.toggle('active', active === i);
        button.setAttribute('aria-label', value === undefined ? `Blank ${i + 1}, empty` : `Blank ${i + 1}: ${value}`);
        button.setAttribute('aria-pressed', active === i ? 'true' : 'false');
        if (ctx.review) {
          const right = fullCredit || value === q.blanks[i].answer;
          button.classList.add(right ? 'blank-right' : 'blank-wrong');
        }
      });
      clearButton.disabled = ctx.locked || active === null || tokens[active] === undefined;
    };

    const nextEmpty = (from) => {
      for (let step = 1; step <= q.blanks.length; step++) {
        const i = (from + step) % q.blanks.length;
        if (tokens[i] === undefined) return i;
      }
      return null;
    };

    const clearButton = h('button', {
      type: 'button',
      class: 'chip chip-clear',
      onclick: () => {
        delete tokens[active];
        ctx.onChange({ ...tokens });
        refresh();
      },
    }, 'Clear blank');

    const lines = q.lines.map((line) => h('div', { class: 'code-line' }, codeText(indentOf(line.parts[0].text || ''), line.parts.map((part, n) => {
      if (part.blank === undefined) return codeSpans(n === 0 ? part.text.trimStart() : part.text);
      const i = part.blank;
      const button = h('button', {
        type: 'button',
        class: 'blank',
        disabled: ctx.locked,
        onclick: () => {
          active = i;
          refresh();
        },
      });
      blankButtons[i] = button;
      return button;
    }))));

    const chips = q.bank.map((token) => h('button', {
      type: 'button',
      class: 'chip',
      disabled: ctx.locked,
      onclick: () => {
        if (active === null) active = nextEmpty(-1);
        if (active === null) return;
        tokens[active] = token;
        ctx.onChange({ ...tokens });
        active = nextEmpty(active);
        refresh();
      },
    }, h('code', { class: 'code-inline' }, codeSpans(token))));

    if (!ctx.locked) active = nextEmpty(-1);
    refresh();

    const parts = [
      promptBlock(q),
      h('div', { class: 'code' }, lines),
      ctx.locked ? null : h('p', { class: 'hint' }, 'Tap a blank, then tap a word to put in it. Words can be used more than once.'),
      ctx.locked ? null : h('div', { class: 'bank', role: 'group', 'aria-label': 'Word bank' }, chips, clearButton),
    ];
    if (ctx.review && !fullCredit) {
      parts.push(h('p', { class: 'sub-prompt' }, 'A correct answer:'), codePanel(CC.blanksDisplayLines(q, CC.blanksKey(q))));
    }
    return parts;
  }

  // ---- Parsons: put scrambled lines in order ----

  function renderParsons(q, ctx) {
    let order = (ctx.answer || q.order).slice();
    const prefixTexts = q.prefix.map((l) => l.text);
    const suffixTexts = q.suffix.map((l) => l.text);
    const live = h('div', { class: 'sr-only', 'aria-live': 'polite' });

    const indented = (text, level) => h('span', { class: 'indented', style: `--level:${level}` }, codeSpans(text));

    const list = h('div', { class: 'sortable', role: 'list' });
    const suffixBox = h('div', { class: 'code fixed-code' });
    const prefixBox = h('div', { class: 'code fixed-code' });

    const repaint = () => {
      const texts = prefixTexts.concat(order.map((id) => q.lines[id].text), suffixTexts);
      const levels = CC.kit.indentLevels(texts);
      prefixBox.replaceChildren(...prefixTexts.map((text, i) => h('div', { class: 'code-line' }, indented(text, levels[i]))));
      Array.from(list.children).forEach((row, i) => {
        const slot = row.querySelector('.line-text');
        slot.replaceChildren(indented(q.lines[order[i]].text, levels[prefixTexts.length + i]));
        row.querySelector('.line-number').textContent = i + 1;
        const up = row.querySelector('.move-up');
        const down = row.querySelector('.move-down');
        if (up) up.disabled = i === 0;
        if (down) down.disabled = i === order.length - 1;
      });
      const start = prefixTexts.length + order.length;
      suffixBox.replaceChildren(...suffixTexts.map((text, i) => h('div', { class: 'code-line' }, indented(text, levels[start + i]))));
    };

    const syncOrder = () => {
      order = Array.from(list.children).map((row) => Number(row.dataset.id));
      repaint();
    };

    // Rows always move by shifting their neighbors. Moving the row itself would detach
    // it from the page for an instant, which ends a drag and loses keyboard focus.
    const stepUp = (row) => list.insertBefore(row.previousElementSibling, row.nextElementSibling);
    const stepDown = (row) => list.insertBefore(row.nextElementSibling, row);

    const move = (row, delta) => {
      if (delta < 0 && !row.previousElementSibling) return;
      if (delta > 0 && !row.nextElementSibling) return;
      if (delta < 0) stepUp(row);
      else stepDown(row);
      syncOrder();
      ctx.onChange(order.slice());
      live.textContent = `Moved to line ${Array.from(list.children).indexOf(row) + 1} of ${order.length}.`;
    };

    const startDrag = (row, event) => {
      if (event.target.closest('button')) return;
      if (event.pointerType !== 'mouse' && !event.target.closest('.grip')) return;
      event.preventDefault();
      row.setPointerCapture(event.pointerId);
      row.classList.add('dragging');
      const onMove = (e) => {
        let moved = false;
        for (;;) {
          const above = row.previousElementSibling;
          const below = row.nextElementSibling;
          const midpoint = (el) => {
            const box = el.getBoundingClientRect();
            return box.top + box.height / 2;
          };
          if (above && e.clientY < midpoint(above)) stepUp(row);
          else if (below && e.clientY > midpoint(below)) stepDown(row);
          else break;
          moved = true;
        }
        if (moved) syncOrder();
        if (e.clientY < 70) window.scrollBy(0, -12);
        else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 12);
      };
      const onEnd = () => {
        row.classList.remove('dragging');
        row.removeEventListener('pointermove', onMove);
        row.removeEventListener('pointerup', onEnd);
        row.removeEventListener('pointercancel', onEnd);
        syncOrder();
        ctx.onChange(order.slice());
      };
      row.addEventListener('pointermove', onMove);
      row.addEventListener('pointerup', onEnd);
      row.addEventListener('pointercancel', onEnd);
    };

    order.forEach((id) => {
      const text = q.lines[id].text;
      const row = h('div', {
        class: `sort-row ${ctx.locked ? 'locked' : ''}`,
        role: 'listitem',
        tabindex: ctx.locked ? null : 0,
        'aria-label': `Code line: ${text}. Use the up and down arrow keys to move it.`,
        'data-id': id,
      },
      ctx.locked ? null : h('span', { class: 'grip', 'aria-hidden': 'true' }, '⋮⋮'),
      h('span', { class: 'line-number', 'aria-hidden': 'true' }),
      h('span', { class: 'line-text' }),
      ctx.locked ? null : h('span', { class: 'move-buttons' },
        h('button', {
          type: 'button', class: 'move move-up', 'aria-label': 'Move line up', onclick: () => move(row, -1),
        }, '↑'),
        h('button', {
          type: 'button', class: 'move move-down', 'aria-label': 'Move line down', onclick: () => move(row, 1),
        }, '↓')));
      if (!ctx.locked) {
        row.addEventListener('pointerdown', (e) => startDrag(row, e));
        row.addEventListener('keydown', (e) => {
          if (e.target !== row) return;
          if (e.key === 'ArrowUp') { e.preventDefault(); move(row, -1); }
          if (e.key === 'ArrowDown') { e.preventDefault(); move(row, 1); }
        });
      }
      list.append(row);
    });
    repaint();

    const lineArea = [
      prefixTexts.length ? prefixBox : null,
      list,
      suffixTexts.length ? suffixBox : null,
      live,
    ];
    if (ctx.review && CC.grade(q, order).credit < 1) {
      const solution = prefixTexts.concat(q.solution.map((id) => q.lines[id].text), suffixTexts);
      const levels = CC.kit.indentLevels(solution);
      lineArea.push(
        h('p', { class: 'sub-prompt' }, 'A correct order:'),
        h('div', { class: 'code' }, solution.map((text, i) => h('div', { class: 'code-line' }, indented(text, levels[i])))),
      );
    }
    return [
      h('div', { class: 'parsons-instructions' },
        promptBlock(q),
        ctx.locked ? null : h('p', { class: 'hint' }, 'Drag the lines, or use the arrows. The indenting updates by itself as you go.')),
      h('div', { class: 'parsons-lines' }, lineArea),
    ];
  }

  const RENDERERS = {
    choice: renderChoice,
    number: renderNumber,
    rows: renderRows,
    region: renderRegion,
    lines: renderLines,
    bug: renderBug,
    blanks: renderBlanks,
    parsons: renderParsons,
  };

  // ctx: { answer, onChange, locked, review }
  const SPLIT_TYPES = ['choice', 'number', 'rows', 'bug', 'region'];

  CC.renderQuestion = function (q, ctx) {
    const split = SPLIT_TYPES.includes(q.type) && q.code ? ' split' : '';
    return h('div', { class: `question q-${q.type}${split}` }, RENDERERS[q.type](q, ctx));
  };

  // Shown after a practice question is checked.
  CC.renderFeedback = function (q, answer) {
    const { credit } = CC.grade(q, answer);
    const heading = credit === 1 ? 'Correct!' : credit === 0.5 ? 'Close: half credit' : 'Not quite';
    const tone = credit === 1 ? 'good' : credit === 0.5 ? 'close' : 'miss';
    return h('div', { class: `feedback feedback-${tone}`, role: 'status' },
      h('strong', {}, heading),
      q.explain ? h('p', { class: 'explain' }, q.explain) : null);
  };
})(CodeCheck);
