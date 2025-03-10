'use strict';

const {simpleImport} = require('./simple-import.js');
const tryToCatch = require('try-to-catch');

const {keys} = Object;
const eslintId = ' (eslint)';
const overrideConfigFile = process.env.ESLINT_CONFIG_FILE;
const noESLint = process.env.NO_ESLINT;
const noESLintWarnings = process.env.NO_ESLINT_WARNINGS;

const WARNING = 1;

const noConfigFound = (config, configError) => {
    if (configError && configError.messageTemplate === 'no-config-found')
        return true;
    
    if (configError)
        return false;
    
    if (!keys(config.rules).length)
        return true;
    
    return false;
};

const cutNewLine = ({message}) => ({
    message: message.replace(/\n.*/, ''),
});

module.exports = async ({name, code, fix, config, putout = false}) => {
    const noChanges = [
        code,
        [],
    ];
    
    if (noESLint)
        return noChanges;
    
    const [, ESLint] = await tryToCatch(simpleImport, './get-eslint.mjs');
    
    if (!ESLint)
        return noChanges;
    
    const {getESLint} = ESLint;
    const [eslintError, eslint] = await tryToCatch(getESLint, {
        name,
        fix,
        config,
        overrideConfigFile,
    });
    
    if (eslintError)
        return [
            code,
            [convertToPlace(cutNewLine(eslintError))],
        ];
    
    const [configError, finalConfig] = await tryToCatch(eslint.calculateConfigForFile, name);
    
    if (noConfigFound(finalConfig, configError))
        return noChanges;
    
    if (configError) {
        return [
            code,
            [convertToPlace(parseError(configError))],
        ];
    }
    
    !putout && disablePutout(finalConfig);
    
    // that's right, we disabled "putout" rules in "config"
    // and now it located in eslint's cache
    const results = await eslint.lintText(code, {
        filePath: name,
    });
    
    if (!results.length)
        return noChanges;
    
    const [report] = results;
    const {output} = report;
    const places = report.messages
        .map(convertToPlace)
        .filter(Boolean);
    
    return [
        output || code,
        places,
    ];
};

module.exports._noConfigFound = noConfigFound;

const parseRule = (rule) => rule || 'parser';

module.exports.convertToPlace = convertToPlace;
function convertToPlace({ruleId = 'parser', message, line = 0, column = 0, severity}) {
    const rule = `${parseRule(ruleId)}${eslintId}`;
    
    if (severity === WARNING && noESLintWarnings)
        return null;
    
    return {
        rule,
        message: replaceControlChars(message),
        position: {
            line,
            column,
        },
    };
}

function disablePutout(config) {
    if (!config.rules['putout/putout'])
        return;
    
    config.rules['putout/putout'] = 'off';
}

// when eslint config got errors, table formatter used for reporting
// can't show control characters and crash
//
// https://stackoverflow.com/questions/26741455/how-to-remove-control-characters-from-string
const replaceControlChars = (a) => a.replace(/[\x00-\x1F]/g, '. ');

function parseError(e) {
    const {
        messageTemplate,
        messageData,
        message,
    } = e;
    
    if (messageTemplate !== 'plugin-missing')
        return {
            message: replaceControlChars(message),
        };
    
    return {
        message: `Plugin missing: ${messageData.pluginName}`,
    };
}

