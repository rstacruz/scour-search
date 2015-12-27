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
