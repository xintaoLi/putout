'use strict';

const prepare = (plugin, context, options) => (node) => {
    const {filter, report} = plugin;
    
    const source = context.getSourceCode();
    const filename = context.getFilename();
    const getText = source.getText.bind(source);
    const getCommentsBefore = source.getCommentsBefore.bind(source);
    const getCommentsAfter = source.getCommentsAfter.bind(source);
    const getCommentsInside = source.getCommentsInside.bind(source);
    
    const getSpacesBeforeNode = createGetSpacesBeforeNode({
        getText,
    });
    
    const getSpacesAfterNode = createGetSpacesAfterNode({
        getText,
    });
    
    const text = getText(node);
    
    const result = filter({
        text,
        node,
        options,
        getText,
        getCommentsBefore,
        getCommentsAfter,
        getCommentsInside,
        getSpacesBeforeNode,
        getSpacesAfterNode,
        filename,
    });
    
    if (!result)
        return;
    
    const fix = prepareFix(plugin.fix, {
        filename,
        node,
        text,
        getText,
    });
    
    context.report({
        node,
        message: report(node),
        fix,
    });
};

const prepareFix = (fix, {node, text, getText, filename}) => (fixer) => {
    const fixed = fix({
        node,
        text,
        getText,
        filename,
    });
    
    return [
        fixer.replaceText(node, fixed),
    ];
};

module.exports.createPlugin = (plugin) => {
    const meta = getMeta(plugin);
    
    return {
        meta,
        create(context) {
            const {options} = context;
            const prepared = prepare(plugin, context, options);
            const names = plugin.include({options});
            
            return getTraversers(names, prepared);
        },
    };
};

function getMeta(plugin) {
    const {
        type = 'layout',
        recommended = true,
        fixable = 'whitespace',
    } = plugin;
    
    return {
        type,
        docs: {
            recommended,
        },
        schema: {},
        fixable,
    };
}

function getTraversers(names, plugin) {
    const traversers = {};
    
    for (const name of names)
        traversers[name] = plugin;
    
    return traversers;
}

const createGetSpacesBeforeNode = ({getText}) => (node, text = getText(node)) => {
    let spaces = '';
    let i = 0;
    
    if (node === node.parent?.body?.[0].expression)
        return '';
    
    while (!spaces || /^[ \n]+$/.test(spaces))
        spaces = getText(node, ++i)
            .replace(text, '');
    
    return spaces.slice(1);
};
module.exports.createGetSpaceBeforeNode = createGetSpacesBeforeNode;

const createGetSpacesAfterNode = ({getText}) => (node, text = getText(node)) => {
    const reg = /^[ \n;]+$/;
    
    if (isLastNodeInBody(node))
        return '';
    
    let spaces = '';
    let i = 0;
    
    while (!spaces || reg.test(spaces))
        spaces = getText(node, 0, ++i)
            .replace(text, '');
    
    return spaces.slice(0, -1);
};

module.exports.createGetSpacesAfterNode = createGetSpacesAfterNode;

function isLastNodeInBody(node) {
    if (node.parent.body) {
        const {length} = node.parent.body;
        const n = length - 1;
        
        if (node === node.parent?.body?.[n]) {
            return true;
        }
    }
    
    return false;
}

