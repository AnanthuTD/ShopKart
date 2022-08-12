'use strict';

const assert = require('assert');
const stringify = require('..');

describe('convert to map with an object without replacer', () => {
  it('a empty map', () => {
    const map = new Map();
    const json = stringify(map);
    assert.strictEqual(json, '{}');
  });

  it('a map with a value', () => {
    const map = new Map([[1, 'test']]);
    const json = stringify(map);
    assert.strictEqual(json, '{"1":"test"}');
  });

  it('a map nested map in an object', () => {
    const map = new Map([[1, 'test']]);
    const json = stringify({ map });
    assert.strictEqual(json, '{"map":{"1":"test"}}');
  });

  it('a map nested map in an other map', () => {
    const mapNested = new Map([['test', 'value']]);
    const map = new Map([['map', mapNested]]);
    const json = stringify(map);
    assert.strictEqual(json, '{"map":{"test":"value"}}');
  });
});

describe('convert to map with an object with replacer', () => {
  it('a map with a value', () => {
    let replacerCalled = 0;
    const map = new Map([[1, 'test']]);
    const json = stringify(map, (key, value) => {
      replacerCalled++;
      return value;
    });
    assert.strictEqual(replacerCalled, 2);
    assert.strictEqual(json, '{"1":"test"}');
  });
});
