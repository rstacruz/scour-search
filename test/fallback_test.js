'use strict'

const si = require('../scour-search')

describe('filter (unindexed)', function () {
  const data = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cashew' },
    { name: 'Durian', rotten: 'no' },
    { name: 'Durian', rotten: 'yes' }
  ]

  const idx = si(data) // .index('name')

  it('$eq', function () {
    expect(idx.filter({ name: 'Apple' })).toEqual([ data[0] ])
  })

  it('$ne', function () {
    expect(idx.filter({ name: { $ne: 'Durian' } }))
      .toEqual([ data[0], data[1], data[2] ])
  })

  it('$not $ne', function () {
    expect(idx.filter({ $not: { name: { $ne: 'Apple' } } }))
      .toEqual([ data[0] ])
  })

  it('$nin', function () {
    expect(idx.filter({ name: { $nin: ['Cashew', 'Durian'] } }))
      .toEqual([ data[0], data[1] ])
  })

  it('$eq $and', function () {
    expect(idx.filter({ name: 'Durian', rotten: 'no' }))
     .toEqual([ data[3] ])
  })

  it('$eq $and, explicit', function () {
    expect(idx.filter({ $and: [ { name: 'Durian' }, { rotten: 'no' } ] }))
     .toEqual([ data[3] ])
  })

  it('$or', function () {
    expect(idx.filter({ $or: [ { name: 'Apple' }, { name: 'Banana' } ] }))
     .toEqual([ data[0], data[1] ])
  })

  it('$in', function () {
    expect(idx.filter({ name: { $in: [ 'Apple', 'Banana' ] } }))
     .toEqual([ data[0], data[1] ])
  })
})
