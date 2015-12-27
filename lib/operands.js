const cloneWithoutKeys = require('./clone_without_keys')
const assign = require('object-assign')
const each = require('../utilities/each')

/**
 * Internal: operands.
 *
 * Every operand is passed the `idx` (an `si` instance), a `condition`
 * (consisting of `{ type, key, value }`), and the `filter` function.
 *
 *     operands['$eq'] = function (idx, condition, filter) {
 *       var { key, value, type } = condition
 *
 *       // key   === 'name'
 *       // value === 'Homer'
 *       // type  === '$eq'
 *       // idx   === [si (data, indices)]
 *     }
 *
 * They're expected to return a result of keys in the same format
 * `si#getKeys()` returns.
 *
 *     { '23': 1, '45': 1, '70': 1 }
 */

const operands = {}

operands['$eq'] = function (idx, { key, value }) {
  return idx.getKeys(key, value)
}

operands['$ne'] = function (idx, { key, value }, filter) {
  return filter(idx, {
    type: '$not',
    value: { type: '$eq', key, value }
  })
}

operands['$or'] = unary(function (idx, { value }, filter) {
  var result = {}

  for (var i = 0, len = value.length; i < len; i++) {
    const subcon = value[i]
    const keys = filter(idx, subcon)
    if (!keys) return
    assign(result, keys)
  }

  return result
})

operands['$and'] = unary(function (idx, { value }, filter) {
  var result = {}

  for (var i = 0, len = value.length; i < len; i++) {
    const subcon = value[i]
    const keys = filter(idx, subcon)
    if (!keys) return
    if (i === 0) assign(result, keys)
    else {
      each(result, (_, key) => { if (!keys[key]) delete result[key] })
    }
  }

  return result
})

operands['$in'] = function (idx, { key, value }, filter) {
  return filter(idx, {
    type: '$or',
    value: value.map((subvalue) =>
      ({ type: '$eq', key, value: subvalue }))
  })
}

operands['$not'] = unary(function (idx, { value }, filter) {
  const subcon = value
  const result = filter(idx, subcon)

  return cloneWithoutKeys(idx.data, result)
})

operands['$nin'] = function (idx, { key, value }, filter) {
  return filter(idx, {
    type: '$not',
    value: { type: '$in', key, value }
  })
}

module.exports = operands

function unary (fn) {
  fn.unary = true
  return fn
}
