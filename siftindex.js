'use strict'

const each = require('./utilities/each')
const cloneWithoutKeys = require('./utilities/clone_without_keys')
const assign = require('object-assign')
const normalizeKeypath = require('./utilities/normalize_keypath')
const get = require('./utilities/get')

const conditions = {}
const indexers = {}
const fallbacks = {}

function si (source) {
  if (!(this instanceof si)) return new si(source)
  this.data = source
  this.indices = {}
}

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

  filter2 (condition) {
    const result = filter(this, condition)
    return result && Object.keys(result)
  }
}

function filter (idx, condition) {
  var type = condition.type
  if (!type) return

  return (conditions[type] && conditions[type](idx, condition)) ||
    (fallbacks[type] && fallbacks[type](idx, condition)) ||
    undefined
}

indexers['$eq'] = function (item, key, field, index) {
  const val = get(item, field)
  if (!index[val]) index[val] = {}
  index[val][key] = 1
}

conditions['$eq'] = function (idx, { key, value }) {
  return idx.getKeys(key, value)
}

conditions['$or'] = function (idx, { value }) {
  var result = {}

  for (var i = 0, len = value.length; i < len; i++) {
    const subcon = value[i]
    const keys = filter(idx, subcon)
    if (!keys) return
    assign(result, keys)
  }

  return result
}

conditions['$and'] = function (idx, { value }) {
  var result = {}

  for (var i = 0, len = value.length; i < len; i++) {
    const subcon = value[i]
    const keys = filter(idx, subcon)
    if (!keys) return
    if (i === 0) assign(result, keys)
    else {
      each(keys, (_, key) => { delete result[key] })
    }
  }

  return result
}

conditions['$in'] = function (idx, { key, value }) {
  return filter(idx, {
    type: '$or',
    value: value.map((subvalue) =>
      ({ type: '$eq', key, value: subvalue }))
  })
}

conditions['$not'] = function (idx, { value }) {
  const subcon = value
  const result = filter(idx, subcon)

  return cloneWithoutKeys(idx.data, result)
}

conditions['$nin'] = function (idx, { key, value }) {
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

module.exports = si
