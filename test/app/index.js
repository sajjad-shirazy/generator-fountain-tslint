const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');
chai.use(spies);
const _ = require('lodash');
const test = require('ava');
const TestUtils = require('fountain-generator').TestUtils;

let context;
const pkg = {
  devDependencies: {
    tslint: '^3.2.1',
    typescript: '^2.0.10',
    '@types/es6-shim': '^0.31.32',
    '@types/jasmine': '^2.5.38'
  }
};

test.before(() => {
  context = TestUtils.mock('app');
  require('../../generators/app/index');
  process.chdir('../../');
});

test.beforeEach(() => {
  context.mergeJson['package.json'] = null;
  context.copyTemplate['package.json'] = null;
  context.copyTemplate['tsconfig.json'] = null;
  context.copyTemplate['gulp_tasks/scripts.js'] = null;
});

test('Configure package.json when modules is webpack', t => {
  const expected = _.merge({}, pkg, {devDependencies: {'tslint-loader': '^2.1.0'}});
  TestUtils.call(context, 'configuring.pkg', {modules: 'webpack'});
  t.deepEqual(context.mergeJson['package.json'], expected);
});

test('Configure package.json when modules is systemjs', t => {
  const expected = _.merge({}, pkg, {devDependencies: {'gulp-tslint': '^4.2.2'}});
  TestUtils.call(context, 'configuring.pkg', {modules: 'systemjs'});
  t.deepEqual(context.mergeJson['package.json'], expected);
});

test('Configure package.json when framework is angular2 and modules is systemjs', t => {
  const expected = _.merge({}, pkg, {
    devDependencies: {
      'gulp-tslint': '^4.2.2',
      'codelyzer': '^0.0.25'
    }
  });
  TestUtils.call(context, 'configuring.pkg', {framework: 'angular2', modules: 'systemjs'});
  t.deepEqual(context.mergeJson['package.json'], expected);
});

test('Copy tslint.json', t => {
  TestUtils.call(context, 'configuring.tslint');
  t.true(context.copyTemplate['tslint.json'].length > 0);
});

test('wireing(): not call replaceInFileWithTemplate when modules is webpack', () => {
  context.replaceInFileWithTemplate = () => {};
  const spy = chai.spy.on(context, 'replaceInFileWithTemplate');
  TestUtils.call(context, 'writing.wireing', {modules: 'webpack'});
  expect(spy).not.to.have.been.called();
});

test('wireing(): call copyTemplate twice when modules is systemjs', t => {
  const spy = chai.spy.on(context, 'copyTemplate');
  TestUtils.call(context, 'writing.wireing', {modules: 'systemjs'});
  expect(spy).to.have.been.called.with('gulp_tasks/scripts-full.js', 'gulp_tasks/scripts.js');
  t.true(context.copyTemplate['gulp_tasks/scripts.js'].length > 0);
});

test('wireing(): call replaceInFileWithTemplate twice when modules is inject', () => {
  context.replaceInFileWithTemplate = () => {};
  const spy = chai.spy.on(context, 'replaceInFileWithTemplate');
  TestUtils.call(context, 'writing.wireing', {modules: 'inject'});
  expect(spy).to.have.been.called.with('gulp_tasks/scripts-require.js', 'gulp_tasks/scripts.js');
  expect(spy).to.have.been.called.with('gulp_tasks/scripts-stream.js', 'gulp_tasks/scripts.js');
});

test(`wireing(): copy 'gulp_tasks/scripts.js' when modules is webpack`, t => {
  TestUtils.call(context, 'writing.wireing', {modules: 'systemjs'});
  t.true(context.copyTemplate['gulp_tasks/scripts.js'].length > 0);
});

test(`copy 'tsconfig.json' when modules is webpack`, t => {
  TestUtils.call(context, 'writing.tsConf', {modules: 'webpack'});
  t.true(context.copyTemplate['tsconfig.json'].length > 0);
});
