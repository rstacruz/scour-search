'use strict'

const test = require('tape')

test('todo', (t) => {
  t.ok(1, 'reindexing (!)')
  t.ok(1, 'ast')
  t.end()
})

test('todo: scour-ready', (t) => {
  t.ok(1, 'sane fallbacks')
  t.skip('reindexing by deleting keypath')
  t.skip('reindexing by similar keypath')
  // ...if you index `user.name` but `user` was changed
  t.skip('restricting')
  t.skip('index multiple')
  t.skip('indexOf')
  t.skip('count')
  t.end()
})

test('todo: operands', (t) => {
  t.ok(1, '$eq')
  t.ok(1, '$not')
  t.ok(1, '$in')
  t.ok(1, '$ne')
  t.ok(1, '$nin')
  t.end()
})

test('todo: boolean', (t) => {
  t.ok(1, '$and')
  t.ok(1, '$or')
  t.ok(1, '$nor')
  t.end()
})

test('todo: non-indexable operands', (t) => {
  t.ok(1, '$exists: true|false')
  t.ok(1, '$lt, $gt, $lte, $gte')
  t.ok(1, '$mod')
  t.ok(1, '$size')
  t.ok(1, '$regex')
  t.ok(1, '$where')
  t.skip('$all')
  t.skip('$type')
  t.skip('$elemMatch')
  t.end()
})
