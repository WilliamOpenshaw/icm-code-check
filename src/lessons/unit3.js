// The Unit 3 end-of-unit test. It draws question slots from across the unit's lessons, leaving
// out the optional ml5 lesson. One slot comes from Unit 2, for spaced review.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  CC.defineComposite({
    id: 'Unit 3 Review',
    title: 'End of Unit 3',
    unit: 3,
    source: 'curriculum/03-unit-3/01-Unit-3-Overview.md',
    defaults: {
      minutes: 30, questions: 16, attempts: 2, practice: false,
    },
    from: [
      ['U2LA3.2', 'trace'],
      ['U3LA1.1', 'parts'],
      ['U3LA1.1', 'count'],
      ['U3LA1.2', 'trace'],
      ['U3LA1.2', 'uses'],
      ['U3LA1.3', 'count'],
      ['U3LA1.3', 'order'],
      ['U3LA2.1', 'read'],
      ['U3LA2.2', 'range'],
      ['U3LA2.3', 'trace'],
      ['U3LA2.3', 'objectsIn'],
      ['U3LA2.4', 'trace'],
      ['U3LA3.1', 'preload'],
      ['U3LA4.1', 'flow'],
      ['U3LA1.2', 'parsons'],
      ['U3LA2.3', 'blanks'],
    ],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
