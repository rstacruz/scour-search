/**
 * Internal: stringify values for index keys. Used to prevent collisions with,
 * say, `'true'` and `true`.
 */

module.exports = function (object) {
  if (typeof object === 'string') return '_' + object
  if (typeof object === 'object') return JSON.stringify(object)
  return '' + object
}
module.exports = JSON.stringify
