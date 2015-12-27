# scour-search

> Indexed searching

```js
import ss from 'scour-search'

data =
  { 1: { name: 'Homer', gender: 'm' },
    2: { name: 'Marge', gender: 'f' },
    3: { name: 'Bart', gender: 'm' } }

search = ss(data)
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

Use `reindex()` to tell scour-search that there's updated data. It works immutably.

```js
data = { ... }

search = ss(data).index('name')

newData = { ...data, 4: { name: 'John' } }

search = search.reindex(newData, 4)
// `4` is the key of the new entry
```
