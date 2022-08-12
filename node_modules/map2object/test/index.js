const assert = require('assert');
const map2object = require('..');

suite('throws if bad type', function() {
    test('number', function() {
        assert.throws(
            function() {
                map2object(2);
            },
            'Expecting Map, got number'
        );
    });

    test('string', function() {
        assert.throws(
            function() {
                map2object('test');
            },
            'Expecting Map, got string'
        );
    });

    test('object', function() {
        assert.throws(
            function() {
                map2object({});
            },
            'Expecting Map, got object'
        );
    });
});

suite('convert to object', function() {
    test('a empty map', function() {
        const map = new Map();
        const object = map2object(map);
        assert.deepStrictEqual(object, {});
    });

    test('a map with a value [string, null]', function() {
        const map = new Map([['test', null]]);
        const object = map2object(map);
        assert.deepStrictEqual(object, { test: null });
    });

    test('a map with a value [string, boolean]', function() {
        const map = new Map([['test', true]]);
        const object = map2object(map);
        assert.deepStrictEqual(object, { test: true });
    });

    test('a map with a value [string, number], number = 0', function() {
        const map = new Map([['test', 0]]);
        const object = map2object(map);
        assert.deepStrictEqual(object, { test: 0 });
    });

    test('a map with several values [string, number]', function() {
        const map = new Map([['test1', 1], ['test-1', -1]]);
        const object = map2object(map);
        assert.deepStrictEqual(object, { test1: 1, 'test-1': -1 });
    });

    test('a map with a value [number, string]', function() {
        const map = new Map([[1, 'test']]);
        const object = map2object(map);
        assert.deepStrictEqual(object, { '1': 'test' });
    });
});

suite('throws if map cannot be converted', function() {
    test('a map with two different keys "1" and 1', function() {
        assert.throws(
            function() {
                const map = new Map([[1, 'test'], ['1', 'test']]);
                map2object(map);
            },
            'Cannot convert map to object: overrided key 1'
        );
    });

    test('a map with two an object as key', function() {
        assert.throws(
            function() {
                const map = new Map([[{}, 'test']]);
                map2object(map);
            },
            'Cannot convert map to object: key is an object'
        );
    });
});
