const normalizeKeypath = require('../utilities/normalize_keypath')
const stringify = require('./stringify')
const each = require('../utilities/each')
const get = require('../utilities/get')

const fallbacks = {}

fallbacks['$eq'] = function ({ key, value }) {
  key = normalizeKeypath(key)
  return (item, _key) => get(item, key) === value
}

fallbacks['$ne'] = function ({ key, value }) {
  key = normalizeKeypath(key)
  return (item, _key) => get(item, key) !== value
}

fallbacks['$or'] = function ({ key, value }, build) {
  var fns = value.map(build)

  return function (item, key) {
    for (var i = 0, len = fns.length; i < len; i++) {
      if (fns[i](item, key)) return true
    }
    return false
  }
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

fallbacks['$in'] = function ({ key, value }, build) {
  return build({
    type: '$or',
    value: value.map((value) => ({ type: '$eq', key: key, value }))
  })
}

fallbacks['$not'] = function ({ key, value }, build) {
  const fn = build(value)
  return (item, _key) => !fn(item, _key)
}

fallbacks['$nin'] = function ({ key, value }, build) {
  return build({
    type: '$and',
    value: value.map((value) => ({ type: '$ne', key: key, value }))
  })
}

module.exports = fallbacks
