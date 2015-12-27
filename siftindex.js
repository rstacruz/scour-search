'use strict'

const each = require('./utilities/each')
const cloneWithoutKeys = require('./utilities/clone_without_keys')
const assign = require('object-assign')
const normalizeKeypath = require('./utilities/normalize_keypath')
const get = require('./utilities/get')

const operands = {}
const indexers = {}
const fallbacks = {}

function si (source) {
  if (!(this instanceof si)) return new si(source)
  this.data = source
  this.indices = {}
}

si.operands = operands
si.indexers = indexers
si.fallbacks = fallbacks

si.prototype = {
  /**
   * Creates an index for the field `field`.
   */

  index (field, type) {
    field = normalizeKeypath(field)
    const indexKey = '' + field.join('.') + ':' + (type || '$eq')
    if (!this.indices[indexKey]) this.indices[indexKey] = {}

    each(this.data, (value, key) => {
      indexers['$eq'](value, key, field, this.indices[indexKey])
    })

    return this
  },

  /**
   * Returns keys matching a given value. Run it through `Object.keys` later.
   *
   *     getKeys('name', 'John') // => { '4': 1, '5': 1 }
   */

  getKeys (field, value, type) {
    const key = '' + field + ':' + (type || '$eq')
    if (!this.indices[key]) return

    const result = this.indices[key][value]
    if (typeof result === 'undefined') return {}

    return result
  },

  /**
   * Performs a query.
   */

  filterKeys (condition) {
    return this.filterAST(toAST(condition))
  },

  /**
   * Performs a query with a given AST.
   */

  filterAST (condition) {
    const result = filter(this, condition)
    return result && Object.keys(result)
  }
}

si.toAST = toAST

/*
 * { name: 'john' }
 * { name: { $eq: 'john' } }
 */

function toAST (condition, prefix) {
  if (typeof condition !== 'object') {
    return { type: '$eq', key: prefix, value: condition }
  }

  var keys = Object.keys(condition)
  var result = {}

  if (keys.length === 1) {
    var operand = operands[keys[0]]
    let value = condition[keys[0]]

    if (operand && operand.unary) {
      return { type: keys[0], key: prefix, value: toAST(value, prefix) }
    } else if (operand) {
      return { type: keys[0], key: prefix, value: condition[keys[0]] }
    }
  }

  var conditions = keys.map((key) =>
    toAST(condition[key], prefix ? `${prefix}.${key}` : key))

  return conditions.length === 1
    ? conditions[0]
    : { type: '$and', value: conditions }
}

function filter (idx, condition) {
  var type = condition.type
  if (!type) return

  return (operands[type] && operands[type](idx, condition)) ||
    (fallbacks[type] && fallbacks[type](idx, condition)) ||
    undefined
}

indexers['$eq'] = function (item, key, field, index) {
  const val = get(item, field)
  if (!index[val]) index[val] = {}
  index[val][key] = 1
}

operands['$eq'] = function (idx, { key, value }) {
  return idx.getKeys(key, value)
}

operands['$or'] = unary(function (idx, { value }) {
  var result = {}

  for (var i = 0, len = value.length; i < len; i++) {
    const subcon = value[i]
    const keys = filter(idx, subcon)
    if (!keys) return
    assign(result, keys)
  }

  return result
})

operands['$and'] = unary(function (idx, { value }) {
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

operands['$in'] = function (idx, { key, value }) {
  return filter(idx, {
    type: '$or',
    value: value.map((subvalue) =>
      ({ type: '$eq', key, value: subvalue }))
  })
}

operands['$not'] = unary(function (idx, { value }) {
  const subcon = value
  const result = filter(idx, subcon)

  return cloneWithoutKeys(idx.data, result)
})

operands['$nin'] = function (idx, { key, value }) {
  return filter(idx, {
    type: '$not',
    value: { type: '$in', key, value }
  })
}

fallbacks['$eq'] = function (idx, { key, value }) {
  var results = {}
  each(idx.data, (item, _key) => {
    if (get(item, normalizeKeypath(key)) === value) results[_key] = 1
  })
  return results
}

function unary (fn) {
  fn.unary = true
  return fn
}

module.exports = si
