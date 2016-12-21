function cleanObject(object, ignoreShortKeys, counter) {
  var keys = Object.keys(object || {});
  var i = keys.length;
  var key;
  var value;
  var result = {};
  var counter = counter || 1;

  counter++;

  while (i--) {
    key = keys[i];
    value = object[key];
    if (ignoreShortKeys && key.length < 3 && !Array.isArray(object)) continue;

    if (typeof value == 'boolean' || typeof value == 'number' || (typeof value == 'string' && value.length)) {
      result[key] = value;
    } else if (value && typeof value == 'object' && Object.keys(value).length) {
      result[key] = cleanObject(value, ignoreShortKeys, counter);
    }
  }
  return result;
};

function replaceWildcard(path, wildcard, value) {
  return path.replace(new RegExp('{' + wildcard + '}'), value);
};

module.exports = {
  cleanObject: cleanObject,
  replaceWildcard: replaceWildcard
};