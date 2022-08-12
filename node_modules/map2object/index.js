/**
 * The method transforms a Map into a basic Object.
 *
 * @param  {Map}    map
 * @return {object}
 */
module.exports = function(map) {
    if (!(map instanceof Map)) {
        throw new Error('Expecting Map, got ' + typeof map);
    }

    const object = {};

    map.forEach(function(value, key) {
        if (typeof key === 'object') {
            throw new Error('Cannot convert map to object: key is an object');
        }

        if (object.hasOwnProperty(key)) {
            throw new Error('Cannot convert map to object: overrided key ' + key);
        }
        object[key] = value;
    });

    return object;
};
