'use strict'

const si = require('../siftindex')

describe('operands', function () {
  const data = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cashew' },
    { name: 'Durian', rotten: false },
    { name: 'Durian', rotten: true }
  ]

  it('$eq', function () {
    const idx = si(data).index('name')
    const result = idx.filterAST({ type: '$eq', key: 'name', value: 'Durian' })

    expect(result).toEqual(['3', '4'])
  })

  it('$eq, unindexed', function () {
    const idx = si(data)
    const result = idx.filterAST({ type: '$eq', key: 'name', value: 'Durian' })

    expect(result).toEqual(['3', '4'])
  })

  it('$and', function () {
    const idx = si(data).index('name').index('rotten')
    const result = idx.filterAST({
      type: '$and', value: [
        { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'rotten', value: true },
      ]
    })

    expect(result).toEqual(['4'])
  })

  it('$not', function () {
    const idx = si(data).index('name')
    const result = idx.filterAST({ type: '$not',
      value: { type: '$eq', key: 'name', value: 'Durian' }
    })

    expect(result).toEqual(['0', '1', '2'])
  })

  it('$in', function () {
    const idx = si(data).index('name')
    const result = idx.filterAST({ type: '$in', key: 'name', value: ['Durian', 'Cashew'] })

    expect(result).toEqual(['2', '3', '4'])
  })

  it('$nin', function () {
    const idx = si(data).index('name')
    const result = idx.filterAST({ type: '$nin', key: 'name', value: ['Durian', 'Cashew'] })

    expect(result).toEqual(['0', '1'])
  })

  it('$or', function () {
    const idx = si(data).index('name')
    const result = idx.filterAST({
      type: '$or',
      value: [
        { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'name', value: 'Cashew' }
      ]
    })

    expect(result).toEqual(['2', '3', '4'])
  })
})
