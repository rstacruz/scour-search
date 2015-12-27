'use strict'

describe('todo', function () {
  it('reindexing (!)', done)
  it('ast', done)
  it('reindexing by deleting keypath')
  it('reindexing by similar keypath')
  // ...if you index `user.name` but `user` was changed
  it('restricting')

  describe('operands', function () {
    it('$eq', done)
    it('$not', done)
    it('$in', done)
    it('$ne', done)
    it('$nin', done)
  })

  describe('boolean', function () {
    it('$and', done)
    it('$or', done)
    it('$nor')
  })

  describe('non-indexable operands', function () {
    it('$exists: true|false')
    it('$lt, $gt, $lte, $gte')
    it('$mod')
    it('$size')
    it('$all')
    it('$type')
    it('$regex')
    it('$where')
    it('$elemMatch')
  })
})

function done () {}
