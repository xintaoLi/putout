'use strict';

module.exports.report = () => 'Add new line before and after arguments in a function call';

module.exports.include = () => [
    'CallExpression',
];

module.exports.filter = ({node, text}) => {
    if (node.callee.type !== 'Identifier')
        return false;
    
    if (text.includes(`'`))
        return false;
    
    const {name} = node.callee;
    
    if (node.arguments.length < 3)
        return false;
    
    for (const arg of node.arguments) {
        if (/Function|Object|Array/.test(arg.type))
            return false;
    }
    
    const textPeace = text.replace(name, '');
    
    if (textPeace.length < 60)
        return false;
    
    const isOpenBracket = /^\(\n/.test(textPeace);
    const isCloseBracket = /\n\s*\)$/.test(textPeace);
    
    if (isOpenBracket && isCloseBracket)
        return false;
    
    return true;
};

module.exports.fix = ({text}) => {
    return text
        .replace('(', '(\n')
        .replace(/,\s?/g, ',\n')
        .replace(/\)$/, '\n)');
};

