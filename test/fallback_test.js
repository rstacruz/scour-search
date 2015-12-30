'use strict'

const test = require('tape')
const si = require('../src')
var data, idx

test('.filter() unindexed', (t) => {
  data =
    [ { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Cashew' },
      { name: 'Durian', rotten: 'no' },
      { name: 'Durian', rotten: 'yes' } ]

  idx = si(data) // .index('name')

  t.deepEqual(
    idx.filter({ name: 'Apple' }),
    [ data[0] ],
    '$eq (inferred)')

  t.deepEqual(
    idx.filter({ name: { $ne: 'Durian' } }),
    [ data[0], data[1], data[2] ],
    '$ne')

  t.deepEqual(
    idx.filter({ $not: { name: { $ne: 'Apple' } } }),
    [ data[0] ],
    '$not $ne')

  t.deepEqual(
    idx.filter({ name: { $nin: ['Cashew', 'Durian'] } }),
    [ data[0], data[1] ],
    '$nin')

  t.deepEqual(
    idx.filter({ name: 'Durian', rotten: 'no' }),
    [ data[3] ],
   '$eq $and')

  t.deepEqual(
    idx.filter({ $and: [ { name: 'Durian' }, { rotten: 'no' } ] }),
    [ data[3] ],
   '$eq $and (explicit)')

  t.deepEqual(
    idx.filter({ $or: [ { name: 'Apple' }, { name: 'Banana' } ] }),
    [ data[0], data[1] ],
   '$or')

  t.deepEqual(
    idx.filter({ $nor: [ { name: 'Apple' }, { name: 'Banana' } ] }),
    [ data[2], data[3], data[4] ],
   '$nor')

  t.deepEqual(
    idx.filter({ name: { $in: [ 'Apple', 'Banana' ] } }),
    [ data[0], data[1] ],
    '$in')

  data = [ 'a', null, 'b', undefined ]
  t.deepEqual(
    si(data).filter({ $exists: true }),
    [ 'a', 'b' ],
    '$exists: true')

  data = [ 'a', null, 'b', undefined ]
  t.deepEqual(
    si(data).filter({ $exists: false }),
    [ null, undefined ],
    '$exists: false')

  data = [ 'aaa', 'bbb', 'ccc' ]
  t.deepEqual(
    si(data).filter({ $regex: /a/ }),
    [ 'aaa' ],
    '$regex')

  t.deepEqual(
    si([ [0], [0, 0] ]).filter({ $size: 1 }),
    [ [0] ],
    '$size')

  t.end()
})

test('.filter() numeric', (t) => {
  data = [ 10, 20, 30, 40 ]

  t.deepEqual(si(data).filter({ $gt: 30 }), [ 40 ], '$gt')
  t.deepEqual(si(data).filter({ $gte: 30 }), [ 30, 40 ], '$gte')
  t.deepEqual(si(data).filter({ $lt: 20 }), [ 10 ], '$lt')
  t.deepEqual(si(data).filter({ $lte: 20 }), [ 10, 20 ], '$lte')
  t.deepEqual(si(data).filter({ $mod: [20, 0] }), [ 20, 40 ], '$mod')
  t.deepEqual(si(data).filter({ $where: (v, k) => v === 20 && k === 1 }), [20], '$where')
  t.end()
})
