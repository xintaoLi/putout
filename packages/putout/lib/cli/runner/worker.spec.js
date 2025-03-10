'use strict';

const tryToCatch = require('try-to-catch');

const mockRequire = require('mock-require');

const {
    test,
    stub,
} = require('supertape');
const {join} = require('path');

const {simpleImport} = require('../simple-import');

const {
    reRequire,
    stopAll,
} = mockRequire;

test('putout: cli: runner: processor throw: raw', async (t) => {
    const name = join(__dirname, 'fixture/processor.throw');
    const throwProcessor = require('./fixture/processor-throw');
    
    mockRequire('../get-options', stub().returns({
        formatter: await simpleImport('@putout/formatter-json'),
        dir: '.',
        processors: [
            ['throw-processor', throwProcessor],
        ],
    }));
    
    const {places} = await runWorker({
        name,
        currentFormat: 'json-lines',
        formatterOptions: {},
        processorRunners: [throwProcessor],
    });
    
    stopAll();
    
    const expected = [{
        message: 'preProcess',
        position: {
            column: 1,
            line: 1,
        },
        rule: 'parser',
    }];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: cli: runner: getOptions: resolve called', async (t) => {
    const getOptions = stub().throws(Error('getOptions error'));
    
    mockRequire('../get-options', getOptions);
    const runWorker = reRequire('./worker.js');
    
    await tryToCatch(runWorker, {
        name: '1.js',
        currentFormat: 'json-lines',
        formatterOptions: {},
    });
    
    stopAll();
    
    const [args] = getOptions.args[0];
    
    t.match(args.name, '/');
    t.end();
});

test('putout: cli: runner: ignores', async (t) => {
    mockRequire('../get-options', stub().returns({
        formatter: await simpleImport('@putout/formatter-json'),
        dir: '.',
        ignore: [
            'fixture',
        ],
    }));
    
    const {places} = await runWorker({
        name: 'fixture/1.js',
        currentFormat: 'json-lines',
        formatterOptions: {},
    });
    
    stopAll();
    
    const expected = [];
    
    t.deepEqual(places, expected);
    t.end();
});

test('putout: cli: runner: processor: load', async (t) => {
    const name = join(__dirname, 'fixture/processor.throw');
    const processor = await import('@putout/processor-javascript');
    
    mockRequire('../get-options', stub().returns({
        formatter: await simpleImport('@putout/formatter-json'),
        dir: '.',
        processors: [
            ['processor-javascript', processor],
        ],
    }));
    
    const runProcessors = stub().resolves([Error('test')]);
    
    mockRequire('@putout/engine-processor', {
        runProcessors,
    });
    
    reRequire('./lint');
    
    await runWorker({
        name,
        currentFormat: 'json-lines',
        formatterOptions: {},
        processorRunners: [processor],
    });
    
    stopAll();
    
    const [args] = runProcessors.args[0];
    
    t.equal(args.load, simpleImport);
    t.end();
});

async function runWorker(options) {
    const {
        raw = false,
        rulesdir = '',
        formatterOptions = {},
        noConfig = false,
        transform = '',
        plugins = [],
        index = 0,
        fix = false,
        processorRunners = [],
        rawPlaces = [],
        name = '',
        length = 1,
        processFile = stub(),
        log = stub(),
        currentFormat = stub(),
        write = stub(),
        exit = stub(),
        readFile = stub().returns(''),
        writeFile = stub(),
        report = stub(),
        fileCache = getFileCache(),
    } = options;
    
    const run = reRequire('./worker.js');
    
    return await run({
        exit,
        raw,
        write,
        log,
        currentFormat,
        rulesdir,
        formatterOptions,
        noConfig,
        transform,
        plugins,
        index,
        fix,
        processFile,
        processorRunners,
        fileCache,
        rawPlaces,
        name,
        length,
        readFile,
        writeFile,
        report,
    });
}

function getFileCache() {
    const canUseCache = stub().returns(false);
    const getPlaces = stub().returns([]);
    const reconcile = stub();
    const setInfo = stub();
    
    const fileCache = {
        canUseCache,
        getPlaces,
        reconcile,
        setInfo,
    };
    
    return fileCache;
}

