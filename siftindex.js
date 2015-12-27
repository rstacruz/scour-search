'use strict'

const each = require('./utilities/each')
const assign = require('object-assign')
const conditions = {}

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
    const key = '' + field + ':' + (type || '$eq')
    const index = {}
    this.indices[key] = index

    each(this.data, (value, key) => {
      const val = value[field]
      if (!index[val]) index[val] = {}
      index[val][key] = 1
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
    const result = filterCondition(this, condition)
    return result && Object.keys(result)
  }
}

function filterCondition (idx, condition) {
  var type = condition.type
  if (!type || !conditions[type]) return
  return conditions[type](idx, condition)
}

conditions['$eq'] = function (idx, condition) {
  return idx.getKeys(condition.key, condition.value)
}

conditions['$or'] = function (idx, condition) {
  var result = {}

  for (var i = 0, len = condition.value.length; i < len; i++) {
    const subcon = condition.value[i]
    const keys = filterCondition(idx, subcon)
    if (!keys) return
    assign(result, keys)
  }

  return result
}

conditions['$in'] = function (idx, condition) {
  return filterCondition(idx, {
    type: '$or',
    value: condition.value.map((value) =>
      ({ type: '$eq', key: condition.key, value }))
  })
}

module.exports = si
