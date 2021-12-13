'use strict';

const {createTest} = require('@putout/test');
const plugin = require('.');

const test = createTest(__dirname, {
    'putout/convert-url-to-dirname': plugin,
});

test('plugin-putout: convert-url-to-dirname: report', (t) => {
    t.report('commonjs', `Use 'createTest(__dirname)' instead of 'createTest(import.meta.url)' in CommonJS'`);
    t.end();
});

test('plugin-putout: convert-url-to-dirname: transform', (t) => {
    t.transform('commonjs');
    t.end();
});

test('plugin-putout: convert-url-to-dirname: transform: esm', (t) => {
    t.noReport('esm');
    t.end();
});

test('plugin-putout: convert-url-to-dirname: no transform: dirname', (t) => {
    t.noReport('dirname');
    t.end();
});

