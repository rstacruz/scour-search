/**
 * Clones an object but misses a key.
 */

module.exports = function cloneWithoutKeys (object, keys) {
  var result = {}
  for (var k in object) {
    if (object.hasOwnProperty(k) && !keys[k]) {
      result[k] = object[k]
    }
  }
  return result
}
