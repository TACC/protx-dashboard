const colorbrewerClassYlOrBr = {
  /* derived from https://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6 */
  6: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#d95f0e', '#993404'],
  /*
  5: ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'],
  4: ['#ffffd4', '#fed98e', '#fe9929', '#cc4c02'],
  3: [`#fff7bc`, `#fec44f`, `#d95f0e`],
  2: [`#fff7bc`, `#fec44f`],
  1: [`#fff7bc`]
    Workaround for https://jira.tacc.utexas.edu/browse/COOKS-329
  as instead of using custom colors for each number of classe (above) level we will
  repeat values defined for 6 classes as these are overridden in ProtxColors.css
  with updated values.  We really should just update the values here.
   */
  5: ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#993404'],

  4: ['#ffffd4', '#fee391', '#fe9929', '#993404'],
  3: [`#ffffd4`, `#fec44f`, `#993404`],
  2: [`#ffffd4`, `#993404`],
  1: [`#ffffd4`]
};

export {
  colorbrewerClassYlOrBr,
};
