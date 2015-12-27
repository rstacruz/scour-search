# scour-search

> Indexed searching

```js
data =
  { 1: { name: 'Homer', gender: 'm' },
    2: { name: 'Marge', gender: 'f' },
    3: { name: 'Bart', gender: 'm' } }

search = si(data)
  .index('name')

search.filter({ name: 'Homer' })
// => { 1: { name: 'Homer', gender: 'm' } }

search.filter({ gender: 'm' })
// => { 1: { name: 'Homer', gender: 'm' },
//      3: { name: 'Bart', gender: 'm' } }
```

## MongoDB-style queries

Supported operations: $or, $and, $not, $in, $nin, $eq, $ne

```js
search.filter({ $or: [ {name: 'Homer'}, {gender: 'f'} ] })
```

## Updating data

scour-search works immutably

```js
data = { ... }

search = si(data).index('name')

newData = { ...data, 4: { name: 'John' } }

search = search.reindex(newData, 4)  // `4` is new
```

## TDD

```js
data =
  { 1: { name: 'Homer' },
    2: { name: 'Marge' },
    3: { name: 'Bart' } }

si(data)
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
  .filterRaw({ type: '$or', operands: [
    { type: '$eq', key: 'name', value: 'Homer' },
    { type: '$eq', key: 'name', value: 'Marge' }
  ] })
```

Restrict:

```js
si(data)
  .index('name')
```

```js

data =
  { 1: { name: 'Homer', age: 53 },
    2: { name: 'Marge', age: 49 },
    3: { name: 'Bart', age: 13 } }

si(data)
  .index('age', 'numeric')
  .filter({ age: { $gt: 30 } })
```
