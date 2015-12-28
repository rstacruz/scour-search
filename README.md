# scour-search

> Indexed searching

```js
import Searcher from 'scour-search'

data =
  { 1: { name: 'Homer', gender: 'm' },
    2: { name: 'Marge', gender: 'f' },
    3: { name: 'Bart', gender: 'm' } }

search = Searcher(data)
  .index('name')

search.filter({ gender: 'm' })
// => { 1: { name: 'Homer', gender: 'm' },
//      3: { name: 'Bart', gender: 'm' } }
```

[![Status](https://travis-ci.org/rstacruz/scour-search.svg?branch=master)](https://travis-ci.org/rstacruz/scour-search "See test builds")

## MongoDB-style queries

Supported operations (fast): $or, $and, $not, $nor, $in, $nin, $eq, $ne.

Supported operations (slow): $lt, $gt, $gte, $lte, $exists, $regex, $where, $size, $mod.

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

## Arrays and objects

scour-search works for both Arrays and array-like Objects. Performance is much faster with Objects (see benchmarks).

```js
// array
data = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'FB', name: 'Facebook' }
]

// object
data = {
  aapl: { symbol: 'AAPL', name: 'Apple' },
  msft: { symbol: 'MSFT', name: 'Microsoft' },
  fb: { symbol: 'FB', name: 'Facebook' }
}
```

## Benchmarks

```js
searching (n=512)
      x 40596 op/sec  - indexed, array
      x 360458 op/sec - indexed, object
      x 20398 op/sec  - unindexed, array
      x 5797 op/sec   - via sift
      x 40354 op/sec  - native Array.filter()
```

## API

<!--api-->

## Searcher

> `Searcher(data)`

Creates a searcher object where you can search given data.

```js
import Searcher from 'scour-search'

data = [ { symbol: 'AAPL' }, { symbol: 'MSFT' } ]

search = Searcher(data)
search.filter({ symbol: 'AAPL' })

// Add indexing via .index()
search = search.index('symbol')
search.filter({ symbol: 'AAPL' })
```

### index

> `index(field, type)`

Creates an index for the field `field`. This allows searches against this
field to be faster.

This function is mutative; it will modify the current Searcher instance.

```js
data = [
  { name: 'John' }, { name: 'Paul' }
]

search = Searcher(data)
search.filter({ name: 'John' }) // ...slow (no index)

search = Searcher(data).index('name')
search.filter({ name: 'John' }) // ...fast
```

### reindex

> `reindex(newData, keys)`

Given new `newData`, update the indices for `keys`. The parameter `keys`
can be an array, a number, or a string.

The parameter `newData` *must* be different from `data`, but based off of
it. (scour-search is biased towards immutable workflows.)

```js
data = [ { name: 'john' } ]
search = Searcher(data).index('name')

// An addition at key `1`
newData = [ { name: 'john' }, { name: 'ringo' } ]
search = search.reindex(newData, 1)

// An deletion at key `1`
newData = [ { name: 'john' } ]
search = search.reindex(newData, 1)
```

### filter

> `filter(condition)`

Performs a query. Supports some MongoDB-style filters.

```js
search = Searcher(data)

search.filter({ name: 'John' })
search.filter({ name: { $eq: 'John' } })
search.filter({ name: { $in: ['John', 'George'] } })
```

### filterKeys

> `filterKeys(condition)`

Performs a query, and only returns keys.
<!--api:end-->

## Thanks

**scour-search** © 2015+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/scour-search/contributors
