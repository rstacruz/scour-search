const normalizeKeypath = require('../utilities/normalize_keypath')
const stringify = require('./stringify')
const each = require('../utilities/each')
const get = require('../utilities/get')

const fallbacks = {}

fallbacks['$eq'] = function ({ key, value }) {
  key = normalizeKeypath(key)
  return (item, _key) => get(item, key) === value
}

fallbacks['$and'] = function ({ key, value }, build) {
  var fns = value.map(build)

  return function (item, key) {
    for (var i = 0, len = fns.length; i < len; i++) {
      if (!fns[i](item, key)) return false
    }
    return true
  }
}

module.exports = fallbacks
