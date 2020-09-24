module.exports = {
  testRegex: 'src(\\/|\\\\).*\\.test\\.js$',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
