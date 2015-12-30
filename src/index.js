'use strict'

const normalizeKeypath = require('../utilities/normalize_keypath')
const cloneWithoutKeys = require('./clone_without_keys')
const toAST = require('./to_ast')
const assign = require('object-assign')
const each = require('../utilities/each')
const stringify = require('./stringify')

const operands = require('./operands')
const indexers = require('./indexers')
const fallbacks = require('./fallbacks')

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
    var ast = toAST(condition)
    var keys = this.filterRaw(ast)
    if (!keys) return this.filterFallback(ast)
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
   * Returns the index. If it's not found, returns `-1`. For arrays, it will
   * return a numeric index. For objects, it will return the key string of the
   * match.
   *
   *     search = Searcher([ { id: 'AAPL' }, { id: 'GOOG' } ])
   *     search.indexOf({ id: 'GOOG' })      // => 1
   *
   *     search = Searcher({ aapl: { name: 'Apple' } })
   *     search.indexOf({ name: 'Apple' })   // => 'aapl'
   */

  indexOf (condition) {
    var ast = toAST(condition)
    var keys = this.filterRaw(ast)

    if (!keys) return this.indexOfFallback(ast)

    var key = Object.keys(keys)[0]
    if (typeof key === 'undefined') return -1
    return Array.isArray(this.data) ? +key : key
  },

  /**
   * Internal: a version of indexOf() that uses fallbacks (slow).
   */

  indexOfFallback (ast) {
    var fn = buildFallback(ast)
    var Break = {}
    var key
    try {
      each(this.data, (item, _key) => {
        if (fn(item, _key)) { key = _key; throw Break }
      })
    } catch (e) {
      if (e !== Break) throw e
    }
    if (typeof key === 'undefined') return -1
    return Array.isArray(this.data) ? +key : key
  },

  /**
   * Internal: filters using fallbacks.
   */

  filterFallback (ast) {
    var fn = buildFallback(ast)
    if (!fn) return

    if (Array.isArray(this.data)) {
      let result = []
      each(this.data, (item, key) => { if (fn(item, key)) result.push(item) })
      return result
    } else {
      let result = {}
      each(this.data, (item, key) => { if (fn(item, key)) result[key] = item })
      return result
    }
  },

  /**
   * Performs a query, and only returns keys.
   */

  filterKeys (condition) {
    var ast = toAST(condition)
    var result = this.filterRaw(ast)
    if (result) return Object.keys(result)

    var fn = buildFallback(ast)
    if (!fn) return

    result = []
    each(this.data, (item, key) => { if (fn(item, key)) result.push('' + key) })
    return result
  },

  filterRaw (ast) {
    var result = filter(this, ast)
    if (typeof result !== 'undefined') return result
  },

  filterRawFallback (ast) {
    var results = {}
    var fn = buildFallback(ast)
    if (!fn) return

    each(this.data, (item, key) => {
      if (fn(item, key)) results[key] = 1
    })
    return results
  }
}

Search.build = function (condition) {
  return buildFallback(toAST(condition))
}

/**
 * Internal: filters by a given condition (`{ type, key, value }`).
 */

function filter (idx, condition) {
  var type = condition.type
  if (!type || !operands[type]) return

  return operands[type](idx, condition, filter)
}

function buildFallback (condition) {
  var type = condition.type
  if (!type || !fallbacks[type]) return

  var fn = fallbacks[type](condition, buildFallback)
  return fn
}

/*
 * Internal: Exports
 */

Search.toAST = toAST
Search.operands = operands
Search.indexers = indexers
Search.fallbacks = fallbacks

module.exports = Search
