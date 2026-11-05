// The Unit 4 end-of-unit test. It draws question slots from across the unit's lessons, leaving
// out the sine and cosine lessons, which the course marks as skippable. One slot comes from
// Unit 3, for spaced review.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  CC.defineComposite({
    id: 'Unit 4 Review',
    title: 'End of Unit 4',
    unit: 4,
    source: 'curriculum/04-unit-4/01-Unit-4-Overview.md',
    defaults: {
      minutes: 30, questions: 16, attempts: 2, practice: false,
    },
    from: [
      ['U3LA2.3', 'trace'],
      ['U4LA1.1', 'trace'],
      ['U4LA1.2', 'operators'],
      ['U4LA1.2', 'bounce'],
      ['U4LA2.1', 'terms'],
      ['U4LA2.1', 'trace'],
      ['U4LA2.2', 'trace'],
      ['U4LA2.3', 'trace'],
      ['U4LA2.3', 'cart'],
      ['U4LA2.4', 'where'],
      ['U4LA2.4', 'trace'],
      ['U4LA3.1', 'trace'],
      ['U4LA4.1', 'landing'],
      ['U4LA4.2', 'values'],
      ['U4LA2.1', 'parsons'],
      ['U4LA3.1', 'blanks'],
    ],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
