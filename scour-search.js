'use strict'

const normalizeKeypath = require('./utilities/normalize_keypath')
const cloneWithoutKeys = require('./lib/clone_without_keys')
const toAST = require('./lib/to_ast')
const assign = require('object-assign')
const each = require('./utilities/each')
const get = require('./utilities/get')
const stringify = require('./lib/stringify')

const operands = require('./lib/operands')
const indexers = require('./lib/indexers')
const fallbacks = require('./lib/fallbacks')

/**
 * Searcher : Searcher(data)
 * (Class) Creates a searcher object where you can search given data.
 *
 *     import Searcher from 'scour-search'
 *
 *     data = [ { symbol: 'AAPL' }, { symbol: 'MSFT' } ]
 *
 *     search = Searcher(data)
 *     search.filter({ symbol: 'AAPL' })
 *
 *     // Add indexing via .index()
 *     search = search.index('symbol')
 *     search.filter({ symbol: 'AAPL' })
 */

function Search (source, options) {
  if (!(this instanceof Search)) return new Search(source)
  if (!options) options = {}
  this.data = source
  this.indices = options.indices || {}
}

Search.prototype = {
  /**
   * Creates an index for the field `field`. This allows searches against this
   * field to be faster.
   *
   * This function is mutative; it will modify the current Searcher instance.
   *
   *     data = [
   *       { name: 'John' }, { name: 'Paul' }
   *     ]
   *
   *     search = Searcher(data)
   *     search.filter({ name: 'John' }) // ...slow (no index)
   *
   *     search = Searcher(data).index('name')
   *     search.filter({ name: 'John' }) // ...fast
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
    return new Search(data, {
      indices: options.indices || this.indices
    })
  },

  /**
   * Given new `newData`, update the indices for `keys`. The parameter `keys`
   * can be an array, a number, or a string.
   *
   * The parameter `newData` *must* be different from `data`, but based off of
   * it. (scour-search is biased towards immutable workflows.)
   *
   *     data = [ { name: 'john' } ]
   *     search = Searcher(data).index('name')
   *
   *     // An addition at key `1`
   *     newData = [ { name: 'john' }, { name: 'ringo' } ]
   *     search = search.reindex(newData, 1)
   *
   *     // An deletion at key `1`
   *     newData = [ { name: 'john' } ]
   *     search = search.reindex(newData, 1)
   */

  reindex (newData, keys) {
    if (!Array.isArray(keys)) keys = [keys]
    const indices = assign({}, this.indices)

    each(keys, (key) => {
      each(this.indices, (_, indexKey) => {
        const parts = indexKey.split(':') // TODO support :
        const field = normalizeKeypath(parts[0])
        const type = parts[1]
        const item = newData[key]

        // Remove old ones
        if (this.data[key]) {
          var index = {}
          indexers[type](this.data[key], key, field, index)
          indices[indexKey] = cloneWithoutKeys(this.indices[indexKey], index)
        }

        // Insert new ones
        if (item) indexers[type](item, key, field, indices[indexKey])
      })
    })

    return this.dup(newData, { indices })
  },

  /**
   * Internal: Returns keys matching a given value. Run it through
   * `Object.keys` later.
   *
   *     getKeys('name', 'John') // => { '4': 1, '5': 1 }
   */

  getKeys (field, value, type) {
    const key = '' + field + ':' + (type || '$eq')
    if (!this.indices[key]) return

    const result = this.indices[key][stringify(value)]
    if (typeof result === 'undefined') return {}

    return result
  },

  /**
   * Performs a query. Supports some MongoDB-style filters.
   *
   *     search = Searcher(data)
   *
   *     search.filter({ name: 'John' })
   *     search.filter({ name: { $eq: 'John' } })
   *     search.filter({ name: { $in: ['John', 'George'] } })
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

/*
 * Exports
 */

Search.toAST = toAST
Search.operands = operands
Search.indexers = indexers
Search.fallbacks = fallbacks

module.exports = Search
