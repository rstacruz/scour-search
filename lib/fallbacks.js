const normalizeKeypath = require('../utilities/normalize_keypath')
const stringify = require('./stringify')
const each = require('../utilities/each')
const get = require('../utilities/get')

const fallbacks = {}

fallbacks['$eq'] = binaryOperator((a, b) => a === b)
fallbacks['$lt'] = binaryOperator((a, b) => a < b)
fallbacks['$gt'] = binaryOperator((a, b) => a > b)
fallbacks['$lte'] = binaryOperator((a, b) => a <= b)
fallbacks['$gte'] = binaryOperator((a, b) => a >= b)
fallbacks['$mod'] = binaryOperator((a, b) => a % b[0] === b[1])

function binaryOperator (fn) {
  return function ({ key, value }) {
    key = normalizeKeypath(key)
    return (item, _key) => fn(get(item, key), value)
  }
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

fallbacks['$regex'] = function ({ key, value }) {
  key = normalizeKeypath(key)
  return (item, _key) => value.test(get(item, key))
}

fallbacks['$exists'] = function ({ key, value }) {
  key = normalizeKeypath(key)
  if (value) return (item, _key) => get(item, key) != null
  else return (item, _key) => get(item, key) == null
}

module.exports = fallbacks
