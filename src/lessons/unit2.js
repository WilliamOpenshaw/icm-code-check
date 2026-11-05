// The Unit 2 end-of-unit test. It draws question slots from across the unit's lessons, rather
// than having questions of its own, so it stays in step with them.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  CC.defineComposite({
    id: 'Unit 2 Review',
    title: 'End of Unit 2',
    unit: 2,
    source: 'curriculum/02-unit-2/01-Unit-2-Overview.md',
    defaults: {
      minutes: 30, questions: 16, attempts: 2, practice: false,
    },
    from: [
      ['U2LA1.3', 'truth'],
      ['U2LA1.2', 'chainTrace'],
      ['U2LA1.3', 'region'],
      ['U2LA2.1', 'frames'],
      ['U2LA2.1', 'objectRead'],
      ['U2LA2.2', 'compute'],
      ['U2LA3.1', 'classify'],
      ['U2LA3.2', 'trace'],
      ['U2LA3.2', 'returnMeaning'],
      ['U2LA4.1', 'inside'],
      ['U2LA4.2', 'counting'],
      ['U2LA5.1', 'sizeTrace'],
      ['U2LA1.3', 'parsonsOff'],
      ['U2LA4.2', 'parsons'],
      ['U2LA2.2', 'blanks'],
      ['U2LA5.1', 'blanks'],
    ],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
