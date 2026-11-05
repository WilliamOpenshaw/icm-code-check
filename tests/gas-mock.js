// A small in-memory stand-in for the Google services Code.gs uses, so the server code can
// be tested on this computer. It models values and rows only, not Google's formatting.
// Passing tests here do not prove the real Google deployment works.
(function (global) {
  class MockRange {
    constructor(sheet, row, col, numRows, numCols) {
      Object.assign(this, {
        sheet, row, col, numRows, numCols,
      });
    }
    getValues() {
      const out = [];
      for (let r = 0; r < this.numRows; r++) {
        const line = [];
        for (let c = 0; c < this.numCols; c++) {
          const row = this.sheet.data[this.row - 1 + r] || [];
          const value = row[this.col - 1 + c];
          line.push(value === undefined ? '' : value);
        }
        out.push(line);
      }
      return out;
    }
    setValues(values) {
      values.forEach((line, r) => line.forEach((value, c) => this.sheet.put(this.row + r, this.col + c, value)));
      return this;
    }
    setValue(value) {
      this.sheet.put(this.row, this.col, value);
      return this;
    }
    setFontWeight() { return this; }
    setNumberFormat() { return this; }
    setWrapStrategy() { return this; }
    // Like Google's version, this resets every cell in the range to unchecked.
    insertCheckboxes() {
      for (let r = 0; r < this.numRows; r++) {
        for (let c = 0; c < this.numCols; c++) this.sheet.put(this.row + r, this.col + c, false);
      }
      return this;
    }
    setFormula(formula) {
      this.sheet.put(this.row, this.col, formula);
      return this;
    }
    getColumn() { return this.col; }
  }

  class MockSheet {
    constructor(name) {
      this.name = name;
      this.data = [];
      this.rules = [];
    }
    put(row, col, value) {
      while (this.data.length < row) this.data.push([]);
      const line = this.data[row - 1];
      while (line.length < col) line.push('');
      line[col - 1] = value;
    }
    getName() { return this.name; }
    getLastRow() {
      for (let i = this.data.length - 1; i >= 0; i--) {
        if (this.data[i].some((v) => v !== '' && v !== undefined)) return i + 1;
      }
      return 0;
    }
    getLastColumn() { return this.data.reduce((max, line) => Math.max(max, line.length), 0); }
    getMaxRows() { return 1000; }
    getRange(a, b, c, d) {
      if (typeof a === 'string') {
        const letter = a.match(/[A-Z]+/)[0];
        const col = letter.charCodeAt(0) - 64;
        return new MockRange(this, 1, col, Math.max(this.getLastRow(), 1), 1);
      }
      return new MockRange(this, a, b, c === undefined ? 1 : c, d === undefined ? 1 : d);
    }
    appendRow(values) {
      const row = this.getLastRow() + 1;
      Array.from(values).forEach((value, i) => this.put(row, i + 1, value === undefined ? '' : value));
      return this;
    }
    setFrozenRows() { return this; }
    autoResizeColumns() { return this; }
    hideColumns() { return this; }
    getConditionalFormatRules() { return this.rules; }
    setConditionalFormatRules(rules) { this.rules = rules; return this; }
  }

  const book = {
    sheets: {},
    getSheetByName(name) { return this.sheets[name] || null; },
    insertSheet(name) {
      this.sheets[name] = new MockSheet(name);
      return this.sheets[name];
    },
  };

  const ruleBuilder = () => {
    const rule = { ranges: [] };
    const builder = {
      whenNumberGreaterThan() { return builder; },
      setBackground() { return builder; },
      setRanges(ranges) { rule.ranges = ranges; return builder; },
      build() { return { getRanges: () => rule.ranges }; },
    };
    return builder;
  };

  global.__visitor = { email: 'teacher@example.org' };
  global.Session = {
    getActiveUser: () => ({ getEmail: () => global.__visitor.email }),
    getEffectiveUser: () => ({ getEmail: () => 'teacher@example.org' }),
  };

  global.SpreadsheetApp = {
    getActiveSpreadsheet: () => book,
    flush() {},
    WrapStrategy: { CLIP: 'CLIP' },
    newConditionalFormatRule: ruleBuilder,
    getUi: () => ({
      createMenu: () => {
        const menu = { addItem: () => menu, addToUi: () => menu };
        return menu;
      },
    }),
  };
  global.LockService = {
    getScriptLock: () => ({ waitLock() {}, releaseLock() {} }),
  };
  let uuid = 0;
  global.Utilities = { getUuid: () => `uuid-${++uuid}` };
  global.HtmlService = {
    createHtmlOutputFromFile: () => {
      const output = { setTitle: () => output, addMetaTag: () => output };
      return output;
    },
  };
  global.__mockBook = book;
})(typeof window !== 'undefined' ? window : globalThis);
