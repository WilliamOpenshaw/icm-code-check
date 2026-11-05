// Stands in for google.script.run in the local simulator, so the page talks to the real
// Code.gs functions over a mock sheet. Values pass through JSON, like the real service,
// which also means Date objects would fail here the same way they fail with Google.
(function () {
  setup();
  const tests = __mockBook.getSheetByName('Tests');
  const query = new URLSearchParams(window.location.search);
  // sheet-simulator.html?open=U2LA4.2 opens that test instead of the first one.
  const openRow = Math.max(2, tests.data.findIndex((row) => row[0] === query.get('open')) + 1);
  tests.getRange(openRow, 3).setValue(true);
  tests.getRange(openRow, 8).setValue('TESTME');
  const roster = __mockBook.getSheetByName('Roster');
  roster.put(4, 3, 50);

  // sheet-simulator.html?fail=4 makes the first four server calls fail.
  const failNext = { count: Number(query.get('fail') || 0) };
  window.__failNextCalls = (n) => { failNext.count = n; };

  // A lesson the Sheet lists but this page has no questions for.
  tests.appendRow(['U9LA9.9', 'Not built yet', true, true, 20, 12, 2, 'NOPE']);

  function makeRunner(success, failure) {
    const runner = {
      withSuccessHandler: (fn) => makeRunner(fn, failure),
      withFailureHandler: (fn) => makeRunner(success, fn),
    };
    ['apiConfig', 'apiStart', 'apiResume', 'apiEvent', 'apiSubmit'].forEach((name) => {
      runner[name] = (...args) => {
        setTimeout(() => {
          if (failNext.count > 0) {
            failNext.count -= 1;
            if (failure) failure(new Error('Simulated network failure'));
            return;
          }
          try {
            const result = window[name](...JSON.parse(JSON.stringify(args)));
            if (success) success(JSON.parse(JSON.stringify(result)));
          } catch (err) {
            if (failure) failure(err);
          }
        }, 30);
      };
    });
    return runner;
  }
  window.google = { script: { run: makeRunner(null, null) } };
})();
