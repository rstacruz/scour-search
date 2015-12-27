'use strict'

const toAST = require('../scour-search').toAST

describe('ast', function () {
  it('$eq', function () {
    expect(toAST({ name: { $eq: 'hello' } }))
      .toEqual({ type: '$eq', key: 'name', value: 'hello' })
  })

  it('$eq', function () {
    expect(toAST('hello'))
      .toEqual({ type: '$eq', key: undefined, value: 'hello' })
  })

  it('inferred $eq', function () {
    expect(toAST({ name: 'hello' }))
      .toEqual({ type: '$eq', key: 'name', value: 'hello' })
  })

  it('inferred $and', function () {
    expect(toAST({ name: 'hello', id: 1 }))
      .toEqual({
        type: '$and',
        value: [
          { type: '$eq', key: 'name', value: 'hello' },
          { type: '$eq', key: 'id', value: 1 }
        ]
      })
  })

  it('unary $not', function () {
    expect(toAST({ $not: { name: 'hello' } }))
      .toEqual({
        type: '$not',
        key: undefined,
        value: { type: '$eq', key: 'name', value: 'hello' }
      })
  })
})
