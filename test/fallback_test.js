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

  it('$exists: true', function () {
    const data = [ 'a', null, 'b', undefined ]
    expect(si(data).filter({ $exists: true })).toEqual([ 'a', 'b' ])
  })

  it('$exists: false', function () {
    const data = [ 'a', null, 'b', undefined ]
    expect(si(data).filter({ $exists: false })).toEqual([ null, undefined ])
  })

  it('$regex', function () {
    const data = [ 'aaa', 'bbb', 'ccc' ]
    expect(si(data).filter({ $regex: /a/ })).toEqual([ 'aaa' ])
  })

  describe('numeric', function () {
    const data = [ 10, 20, 30, 40 ]

    it('$gt', function () {
      expect(si(data).filter({ $gt: 30 })).toEqual([ 40 ])
    })

    it('$gte', function () {
      expect(si(data).filter({ $gte: 30 })).toEqual([ 30, 40 ])
    })

    it('$lt', function () {
      expect(si(data).filter({ $lt: 20 })).toEqual([ 10 ])
    })

    it('$lte', function () {
      expect(si(data).filter({ $lte: 20 })).toEqual([ 10, 20 ])
    })

    it('$mod', function () {
      expect(si(data).filter({ $mod: [20, 0] })).toEqual([ 20, 40 ])
    })
  })
})
