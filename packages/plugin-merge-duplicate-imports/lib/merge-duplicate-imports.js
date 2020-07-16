'use strict';

const {types} = require('putout');

const {entries} = Object;
const {
    isImportDefaultSpecifier,
    isImportNamespaceSpecifier,
} = types;

module.exports.report = () => `Duplicate imports should be avoided`;

module.exports.fix = ({path, imports}) => {
    const all = path.node.specifiers;
    
    for (const path of imports) {
        const {specifiers} = path.node;
        
        all.push(...specifiers);
        path.remove();
    }
};

module.exports.traverse = ({push, store}) => {
    return {
        ImportDeclaration(path) {
            store(path);
        },
        Program: {
            exit: () => {
                processImports(push, store());
            },
        },
    };
};

function processImports(push, imports) {
    const {get, add} = duplicatesStore();
    let importDefaultCount = 0;
    
    for (const path of imports) {
        const {
            source,
            specifiers,
        } = path.node;
        
        const {value} = source;
        
        if (specifiers.find(isImportNamespaceSpecifier))
            continue;
        
        add(value, path);
        importDefaultCount += specifiers.filter(isImportDefaultSpecifier).length;
    }
    
    if (importDefaultCount > 1)
        return;
    
    for (const [, list] of get()) {
        if (list.length === 1)
            continue;
        
        const [path, ...imports] = list;
        push({
            path,
            imports,
        });
    }
}
function duplicatesStore() {
    const duplicates = [];
    
    const get = () => entries(duplicates);
    const add = (value, path) => {
        duplicates[value] = duplicates[value] || [];
        duplicates[value].push(path);
    };
    
    return {
        get,
        add,
    };
}

