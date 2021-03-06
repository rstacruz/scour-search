'use strict'

const operands = require('./operands')
const fallbacks = require('./fallbacks')

/*
 * Converts a MongoDB-style query to an AST (abstract syntax tree) that's
 * faster to search with.
 *
 *     toAST({ name: 'john' })
 *     { type: '$eq', key: 'name', value: 'john' }
 *
 *     toAST({ name: { $in: [ 'john', 'joe' ] })
 *     { type: '$or', value:
 *       [ { type: '$eq', key: 'name', value: 'john' },
 *         { type: '$eq', key: 'name', value: 'john' } ] }
 */

module.exports = function toAST (condition, prefix) {
  if (typeof condition !== 'object') {
    return { type: '$eq', key: prefix, value: condition }
  }
  if (Array.isArray(condition)) {
    return condition.map((condition) => toAST(condition, prefix))
  }

  var keys = Object.keys(condition)

  if (keys.length === 1) {
    var operand = operands[keys[0]] || fallbacks[keys[0]]
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

