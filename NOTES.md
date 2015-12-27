## TDD

```js
data =
  { 1: { name: 'Homer' },
    2: { name: 'Marge' },
    3: { name: 'Bart' } }

ss(data)
  .index('name')
  .index('name', '$eq')
  .reindex()  // update all indices
  .reindex(3) // update index by id
  .reindex([3, 4, 5])
  .reindexTo(newdata, 3) // immutable?
  .filter({ name: { $eq: 'Homer' } })
  .filter({ $and: [ ] })
  .indexOf({ ... })
  .filterRaw({ type: '$eq', key: 'name', value: 'Homer' })
  .filterRaw({ type: '$or', value: [
    { type: '$eq', key: 'name', value: 'Homer' },
    { type: '$eq', key: 'name', value: 'Marge' }
  ] })
```

Restrict:

```js
ss(data)
  .index('name')
  .restrict(data)  // => returns a new si object
```

```js

data =
  { 1: { name: 'Homer', age: 53 },
    2: { name: 'Marge', age: 49 },
    3: { name: 'Bart', age: 13 } }

ss(data)
  .index('age', 'numeric')
  .filter({ age: { $gt: 30 } })
```

Usage in scour:

```js
scour(data)
  .index('users.*', 'name')
  .index('users.*.photos.*', 'size')
  .go('users')
  .filter({ name: 'homer' })

scour.prototype.filter = function (conditions) {
  // check if there's a search index for this keypath
  searcher = this.searchers[keypath] || ss(this.data)
  results = searcher.filter(conditions)
  return this.reset(results, {
    searchers: {
      ...this.options.searchers,
      [keypath]: searcher.restrict(results)
    }
  })
}

scour.prototype.resetSearchers = function (data, options) {
  this.reset(data, options) ??
}

scour.prototype.index = function (keypath, field) {
  // for root
  this.searchers[keypath] = ss(this.data).index(field)
}

scour.prototype.set = function (keypath, value) {
  // check searchers if there's any collision
  var matchingSearchers = [...]

  matchingSearchers.each((key, searcher) => {
    this.searchers[key] = searcher.reindex(...)
  }
}
```
