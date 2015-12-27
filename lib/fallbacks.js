const normalizeKeypath = require('../utilities/normalize_keypath')
const stringify = require('./stringify')
const each = require('../utilities/each')
const get = require('../utilities/get')

const fallbacks = {}

fallbacks['$eq'] = function (idx, { key, value }) {
  var results = {}
  value = stringify(value)
  each(idx.data, (item, _key) => {
    if (stringify(get(item, normalizeKeypath(key))) === value) results[_key] = 1
  })
  return results
}

module.exports = fallbacks
