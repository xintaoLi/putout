'use strict';

const test = require('supertape');
const putout = require('putout');
const montag = require('montag');

const {addArgs} = require('./add-args.js');

test('putout: operator: add-args', (t) => {
    const args = {
        compare: ['{compare}', 'test("__a", (__args) => __body)'],
    };
    
    const source = montag`
        test('', () => {
            compare(a, b);
        });
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        test('', (
            {
                compare
            }
        ) => {
            compare(a, b);
        });
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: a couple patterns', (t) => {
    const args = {
        compare: ['{compare}', [
            'test("__a", (__args) => __body)',
            'test.only("__a", (__args) => __body)',
        ]],
    };
    
    const source = montag`
        test('', () => {
            compare(a, b);
        });
        
        test.only('', () => {
            compare(a, b);
        });
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['addArgs-undefined-variables', addArgs(args)],
        ],
    });
    
    const expected = montag`
        test('', (
            {
                compare
            }
        ) => {
            compare(a, b);
        });
        
        test.only('', (
            {
                compare
            }
        ) => {
            compare(a, b);
        });
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: when argument already exist', (t) => {
    const args = {
        compare: ['{compare}', 'test("__a", (__args) => __body)'],
    };
    
    const source = montag`
        test('', ({compare, comparePlaces}) => {
            compare(a, b);
            comparePlaces(a, b);
        });
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['addArgs-undefined-variables', addArgs(args)],
        ],
    });
    
    const expected = montag`
        test('', ({compare, comparePlaces}) => {
            compare(a, b);
            comparePlaces(a, b);
        });
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: rename', (t) => {
    const args = {
        superCompare: ['{compare: superCompare}', 'test("__a", (__args) => __body)'],
    };
    
    const source = montag`
        test('', ({}) => {
            superCompare(a, b);
        });
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['addArgs-undefined-variables', addArgs(args)],
        ],
    });
    
    const expected = montag`
        test('', ({
            compare: superCompare
        }) => {
            superCompare(a, b);
        });
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: identifier', (t) => {
    const args = {
        t: ['t', 'test("__a", (__args) => __body)'],
    };
    
    const source = montag`
        test('', () => {
            t.end();
        });
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['addArgs-undefined-variables', addArgs(args)],
        ],
    });
    
    const expected = montag`
        test('', t => {
            t.end();
        });
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: options', (t) => {
    const args = {};
    
    const source = montag`
        test('', () => {
            t.end();
        });
    `;
    
    const {code} = putout(source, {
        rules: {
            'add-args': ['on', {
                args: {
                    t: ['t', 'test("__a", (__args) => __body)'],
                },
            }],
        },
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        test('', t => {
            t.end();
        });
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: has binding', (t) => {
    const args = {
        t: ['t', 'test("__a", (__args) => __body)'],
    };
    
    const source = montag`
        test('', (t) => {
            t.end();
        });
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['addArgs-undefined-variables', addArgs(args)],
        ],
    });
    
    t.equal(code, source);
    t.end();
});

test('putout: operator: add-args: wrong place', (t) => {
    const args = {
        t: ['t', 'test("__a", (__args) => __body)'],
    };
    
    const source = montag`
        const a = () => {
            t();
        };
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['addArgs-undefined-variables', addArgs(args)],
        ],
    });
    
    t.equal(code, source);
    t.end();
});

test('putout: operator: add-args: arg exist', (t) => {
    const args = {
        push: ['{push}', [
            'module.exports.traverse = (__args) => __a',
        ]],
    };
    
    const source = montag`
        module.exports.traverse = () => ({
            '__a.replace(/__b/g, __c)': (path, {push}) => {
                push(path);
            }
        });
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    t.equal(code, source);
    t.end();
});

test('putout: operator: add-args: not a function', (t) => {
    const args = {
        t: ['t', 'test("__a", (__args) => __body)'],
    };
    
    const source = montag`
        t();
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['addArgs-undefined-variables', addArgs(args)],
        ],
    });
    
    t.equal(code, source);
    t.end();
});

test('putout: operator: add-args: second', (t) => {
    const args = {
        indent: ['{indent}', 'module.exports.__a = (__args) => __body'],
    };
    
    const source = montag`
        module.exports.VariableDeclaration = (path) => {
            indent.inc();
        };
    `;
    
    const {code} = putout(source, {
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        module.exports.VariableDeclaration = (
            path,
            {
                indent
            }
        ) => {
            indent.inc();
        };
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: property', (t) => {
    const args = {
        maybe: ['{maybe}', 'module.exports.__a = (__args) => __body'],
    };
    
    const source = montag`
        module.exports.VariableDeclaration = (path, {print}) => {
            maybe.indent(is);
        };
    `;
    
    const {code} = putout(source, {
        fixCount: 1,
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        module.exports.VariableDeclaration = (path, {
            print,
            maybe
        }) => {
            maybe.indent(is);
        };
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: nested block', (t) => {
    const args = {
        maybe: ['{maybe}', 'module.exports.__a = (__args) => __body'],
    };
    
    const source = montag`
        module.exports.VariableDeclaration = (path, {print}) => {
            if (a) {
                maybe.indent(is);
            }
        };
    `;
    
    const {code} = putout(source, {
        fixCount: 1,
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        module.exports.VariableDeclaration = (path, {
            print,
            maybe
        }) => {
            if (a) {
                maybe.indent(is);
            }
        };
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: MemberExpression', (t) => {
    const args = {
        maybe: ['{maybe}', 'module.exports.__a = (__args) => __body'],
    };
    
    const source = montag`
        module.exports.VariableDeclaration = (path) => {
            if (a) {
                maybe.print.newline(is);
            }
        };
    `;
    
    const {code} = putout(source, {
        fixCount: 1,
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        module.exports.VariableDeclaration = (
            path,
            {
                maybe
            }
        ) => {
            if (a) {
                maybe.print.newline(is);
            }
        };
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: VariableDeclaration', (t) => {
    const args = {
        process: ['{process}', 'module.exports.__a = (__args) => __body'],
    };
    
    const source = montag`
        module.exports.VariableDeclaration = (path) => {
            const {PUTOUT_PROGRESS_BAR} = process.env;
            const {stderr} = process;
        };
    `;
    
    const {code} = putout(source, {
        fixCount: 1,
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        module.exports.VariableDeclaration = (path) => {
            const {PUTOUT_PROGRESS_BAR} = process.env;
            const {stderr} = process;
        };
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: AssignmentExpression', (t) => {
    const args = {
        process: ['{process}', 'module.exports.__a = (__args) => __body'],
    };
    
    const source = montag`
        module.exports.VariableDeclaration = (path) => {
            process.env.PUTOUT_PROGRESS_BAR = '0';
        };
    `;
    
    const {code} = putout(source, {
        fixCount: 1,
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    const expected = montag`
        module.exports.VariableDeclaration = (path) => {
            process.env.PUTOUT_PROGRESS_BAR = '0';
        };
    `;
    
    t.equal(code, expected);
    t.end();
});

test('putout: operator: add-args: no transform UnaryExpression', (t) => {
    const args = {
        process: ['{process}', 'module.exports.__a = (__args) => __body'],
    };
    
    const source = montag`
        module.exports.VariableDeclaration = (path) => {
            delete process.env.PUTOUT_PROGRESS_BAR;
        };
    `;
    
    const {code} = putout(source, {
        fixCount: 1,
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    t.equal(code, source);
    t.end();
});

test('putout: operator: add-args: FunctionDeclaration', (t) => {
    const args = {
        maybe: ['{maybe}', 'function __(path, {print}) {}'],
    };
    
    const source = montag`
        function BinaryExpression(path, {
            print,
            maybe,
        }) {
            maybe.print(isLogical, '(');
        }
    `;
    
    const {code} = putout(source, {
        fixCount: 1,
        plugins: [
            ['add-args', addArgs(args)],
        ],
    });
    
    t.equal(code, source);
    t.end();
});

