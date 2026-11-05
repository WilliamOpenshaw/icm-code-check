// The Unit 1 end-of-unit test. It draws question slots from across the unit's lessons.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  CC.defineComposite({
    id: 'Unit 1 Review',
    title: 'End of Unit 1',
    unit: 1,
    source: 'curriculum/01-unit-1/01-Unit-1-Overview.md',
    defaults: {
      minutes: 30, questions: 16, attempts: 2, practice: true,
    },
    from: [
      ['U1LA1.1', 'where'],
      ['U1LA1.2', 'order'],
      ['U1LA1.3', 'edges'],
      ['U1LA1.3', 'layers'],
      ['U1LA1.4', 'valueCounts'],
      ['U1LA2.1', 'rgb'],
      ['U1LA2.1', 'fillOrder'],
      ['U1LA3.1', 'compute'],
      ['U1LA3.2', 'trace'],
      ['U1LA3.2', 'scope'],
      ['U1LA4.1', 'define'],
      ['U1LA4.2', 'terms'],
      ['U1LA4.3', 'positions'],
      ['U1LA4.4', 'range'],
      ['U1LA1.3', 'parsons'],
      ['U1LA4.3', 'blanks'],
    ],
  });
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
