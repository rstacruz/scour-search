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
    it('$nor', done)
  })

  describe('non-indexable operands', function () {
    it('$exists: true|false', done)
    it('$lt, $gt, $lte, $gte', done)
    it('$mod', done)
    it('$size', done)
    it('$regex', done)
    it('$where', done)
    it('$all')
    it('$type')
    it('$elemMatch')
  })
})

function done () {}
