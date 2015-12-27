/* eslint-disable new-cap */
'use strict'

const normalizeKeypath = require('./utilities/normalize_keypath')
const cloneWithoutKeys = require('./lib/clone_without_keys')
const toAST = require('./lib/to_ast')
const assign = require('object-assign')
const each = require('./utilities/each')
const get = require('./utilities/get')
const stringify = JSON.stringify

const operands = require('./lib/operands')
const indexers = {}
const fallbacks = {}

function si (source, options) {
  if (!(this instanceof si)) return new si(source)
  if (!options) options = {}
  this.data = source
  this.indices = options.indices || {}
}

si.prototype = {
  /**
   * Creates an index for the field `field`.
   */

  index (field, type) {
    field = normalizeKeypath(field)
    const indexKey = '' + field.join('.') + ':' + (type || '$eq')

    var index = {}
    each(this.data, (value, key) => {
      indexers['$eq'](value, key, field, index, 1)
    })

    this.indices[indexKey] = index
    return this
  },

  dup (data, options) {
    return new si(data, {
      indices: options.indices || this.indices
    })
  },

  /**
   * Reindex
   *
   *     data = [ { name: 'john' } ]
   *     search = si(data).index('name')
   *
   *     newData = [ { name: 'ringo' } ]
   *     search = search.reindex(newData, [0])
   */

  reindex (newData, items) {
    if (!Array.isArray(items)) items = [items]
    const indices = assign({}, this.indices)

    each(items, (key) => {
      each(this.indices, (_, indexKey) => {
        const parts = indexKey.split(':') // TODO support :
        const field = normalizeKeypath(parts[0])
        const type = parts[1]
        const item = newData[key]

        // Remove old ones
        var index = {}
        indexers[type](this.data[key], key, field, index)
        indices[indexKey] = cloneWithoutKeys(this.indices[indexKey], index)

        // Insert new ones
        indexers[type](item, key, field, indices[indexKey])
      })
    })

    return this.dup(newData, { indices })
  },

  /**
   * Returns keys matching a given value. Run it through `Object.keys` later.
   *
   *     getKeys('name', 'John') // => { '4': 1, '5': 1 }
   */

  getKeys (field, value, type) {
    const key = '' + field + ':' + (type || '$eq')
    value = stringify(value)
    if (!this.indices[key]) return

    const result = this.indices[key][value]
    if (typeof result === 'undefined') return {}

    return result
  },

  /**
   * Performs a query.
   */

  filter (condition) {
    var keys = this.filterRaw(toAST(condition))
    keys = Object.keys(keys)

    if (Array.isArray(this.data)) {
      return keys.map((key) => this.data[key])
    } else {
      var result = {}
      keys.forEach((key) => { result[key] = this.data[key] })
      return result
    }
  },

  /**
   * Performs a query, and only returns keys.
   */

  filterKeys (condition) {
    return Object.keys(this.filterRaw(toAST(condition)))
  },

  filterRaw (ast) {
    return filter(this, ast)
  }
}

function filter (idx, condition) {
  var type = condition.type
  if (!type) return

  return (operands[type] && operands[type](idx, condition, filter)) ||
    (fallbacks[type] && fallbacks[type](idx, condition, filter)) ||
    undefined
}

indexers['$eq'] = function (item, key, field, index) {
  const val = stringify(get(item, field))
  if (!index[val]) index[val] = {}
  index[val][key] = 1
}

fallbacks['$eq'] = function (idx, { key, value }) {
  var results = {}
  value = stringify(value)
  each(idx.data, (item, _key) => {
    if (stringify(get(item, normalizeKeypath(key))) === value) results[_key] = 1
  })
  return results
}

/*
 * export
 */

si.toAST = toAST
si.operands = operands
si.indexers = indexers
si.fallbacks = fallbacks

module.exports = si
