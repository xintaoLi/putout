'use strict';

const {
    types,
    operator,
} = require('putout');

const {replaceWith} = operator;

const {
    isIdentifier,
    isLiteral,
} = types;

module.exports.report = () => 'Avoid useless "return"';

module.exports.include = () => [
    'ArrowFunctionExpression',
];

module.exports.fix = (path) => {
    const bodyPath = path.get('body');
    const returnPath = bodyPath.get('body.0');
    
    replaceWith(bodyPath, returnPath.node.argument);
};

module.exports.filter = (path) => {
    const bodyPath = path.get('body');
    
    if (!bodyPath.isBlockStatement())
        return false;
    
    const first = bodyPath.get('body.0');
    
    if (!first)
        return false;
    
    if (!first.isReturnStatement())
        return false;
    
    if (hasComments(first))
        return false;
    
    const argPath = first.get('argument');
    
    if (isChainCall(argPath))
        return false;
    
    if (!isSimpleArgs(argPath))
        return false;
    
    if (argPath.isNewExpression())
        return false;
    
    if (argPath.isAwaitExpression())
        return false;
    
    if (argPath.isTemplateLiteral())
        return false;
    
    if (argPath.isLogicalExpression())
        return false;
    
    return true;
};

const isChainCall = (path) => {
    if (!path.isCallExpression())
        return false;
    
    const calleePath = path.get('callee');
    
    if (calleePath.isMemberExpression())
        return true;
    
    const objectPath = calleePath.get('object');
    
    return objectPath.isCallExpression();
};

const isSimpleArgs = (path) => {
    if (!path.isCallExpression())
        return true;
    
    for (const arg of path.node.arguments) {
        if (isIdentifier(arg))
            continue;
        
        if (isLiteral(arg))
            continue;
        
        return false;
    }
    
    return true;
};

function hasComments(path) {
    const {comments} = path.node;
    
    if (!comments)
        return false;
    
    return comments.length;
}
