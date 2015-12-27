const cloneWithoutKeys = require('./clone_without_keys')
const assign = require('object-assign')
const each = require('../utilities/each')

const operands = {}

operands['$eq'] = function (idx, { key, value }) {
  return idx.getKeys(key, value)
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
