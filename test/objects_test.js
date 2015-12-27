'use strict'

const si = require('../siftindex')

describe('objects', function () {
  const data = {
    a: { name: 'Apple' },
    b: { name: 'Banana' },
    c: { name: 'Cashew' },
    d: { name: 'Durian', rotten: 'no' },
    d2: { name: 'Durian', rotten: 'yes' }
  }

  describe('filterKeys', function () {
    it('works for single results', function () {
      const idx = si(data).index('name')
      expect(idx.filterKeys({ name: 'Apple' })).toEqual(['a'])
    })

    it('works for and', function () {
      const idx = si(data).index('name').index('rotten')
      expect(idx.filterKeys({ name: 'Durian', rotten: 'yes' })).toEqual(['d2'])
    })

    it('works for and (2)', function () {
      const idx = si(data).index('name')
      expect(idx.filterKeys({ name: 'Durian', rotten: 'no' })).toEqual(['d'])
    })
  })

  describe('filter', function () {
    it('works', function () {
      const idx = si(data).index('name')
      expect(idx.filter({ name: 'Apple' }))
        .toEqual({ a: { name: 'Apple' } })
    })
  })
})
