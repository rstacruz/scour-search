'use strict'

const test = require('tape')
const toAST = require('../src').toAST

test('ast', (t) => {
  t.deepEqual(
    toAST({ name: { $eq: 'hello' } }),
    { type: '$eq', key: 'name', value: 'hello' },
    '$eq')

  t.deepEqual(
    toAST('hello'),
    { type: '$eq', key: undefined, value: 'hello' },
    'string')

  t.deepEqual(
    toAST({ name: 'hello' }),
    { type: '$eq', key: 'name', value: 'hello' },
    '$eq, inferred')

  t.deepEqual(
    toAST({ name: 'hello', id: 1 }),
    { type: '$and',
      value:
        [ { type: '$eq', key: 'name', value: 'hello' },
          { type: '$eq', key: 'id', value: 1 } ] },
    '$and inferred')

  t.deepEqual(
    toAST({ $not: { name: 'hello' } }),
    { type: '$not',
      key: undefined,
      value: { type: '$eq', key: 'name', value: 'hello' } },
    'unary $not')

  t.deepEqual(
    toAST({ $or: [ { name: 'hello' }, { name: 'hi' } ] }),
    { type: '$or',
      key: undefined,
      value:
        [ { type: '$eq', key: 'name', value: 'hello' },
          { type: '$eq', key: 'name', value: 'hi' } ] },
    'unary $or')

  t.end()
})
