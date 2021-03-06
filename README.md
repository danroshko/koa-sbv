# koa-sbv

[![Build Status](https://travis-ci.org/danroshko/koa-sbv.svg?branch=master)](https://travis-ci.org/danroshko/koa-sbv)
[![npm version](https://badge.fury.io/js/koa-sbv.svg)](https://badge.fury.io/js/koa-sbv)

Declarative body and query validation for koa that supports arbitrarily nested validation rules and tries to avoid verbosity of other packages.

## Installation

```bash
npm install koa-sbv
```

## Usage

- every parameter that wasn't declared will be removed.
- an error with 400 status code will be thrown if validation fails

### More convenient way

One way is to use koa-sbv middleware that patches `ctx` object and makes `ctx.validate` available in next middleware functions.

```javascript
const Koa = require('koa')
const parser = require('koa-body')
const sbv = require('koa-sbv')

const app = new Koa()

app.use(parser()).use(sbv.middleware)

/* ... */

router.post('/', async (ctx) => {
  ctx.validate(bodySchema)
})
```

### More functional way

Alternative option is to use pure validation function and manually pass request body or query.

```javascript
const { validate } = require('koa-sbv')

router.post('/', async (ctx) => {
  const body = validate(ctx.request.body, bodySchema, options)
  const query = validate(ctx.query, querySchema, options)
})
```

## Examples

### String validation

```javascript
const sbv = require('koa-sbv')

const validated = validate(body, {
  a: 'string', // arbitrary string
  c: sbv.string({ min: 1, max: 10 }), // from 1 to 10 characters long
  d: /^\d{5}$/, // use RegExp for more advanced validation
})
```

_Note:_ By default maximum allowed string length is 1e4, to allow longer strings explicitly pass `max` parameter.

### Number validation

```javascript
const sbv = require('koa-sbv')

const validated = validate(body, {
  a: 'number', // arbitrary number
  b: 'int', // integer
  c: 'uint', // non-negative integer
  d: sbv.number({ min: 0, max: 100 }), // any number from 0 to 100
  e: sbv.int({ max: 100 }), // any integer less than or equal 100
})
```

### Arrays and objects

- object literals are used to describe expected objects
- array literals are used to describe expected arrays, first element describes
  elements of the array and second argument is used to provide additional options
  - `min` - minimum length of an array, default 0
  - `max` - maximum allowed length, default 1e3
  - `len` - if an array should contain exactly `len` elements
- description can be nested as deep as necessary
- `dict` helper can be used to validate objects with arbitrary number of key/value pairs

```javascript
const { maybe, dict } = require('koa-sbv')

validate(body, {
  obj: { name: 'string', age: 'uint' },
  arr1: ['number'],
  arr2: ['number', { min: 1 }],
  arr3: [{ foo: 'string' }, { max: 10 }],
  map: dict('string', 'number'),
})
```

### Optional parameters

By default all parameters are required, use `maybe` wrapper for optional parameters

```javascript
const { maybe } = require('koa-sbv')

validate(body, {
  a: maybe('number'),
  b: maybe('number', 0), // second parameter is optional default value
  c: maybe(['string'], []),
})
```

Also `null` values are considered invalid by default, use `nullable` wrapper to allow them

```javascript
const { nullable } = require('koa-sbv')

validate(body, {
  a: nullable('number'),
  b: nullable(['string']),
})
```

### Additional validators

```javascript
const sbv = require('koa-sbv')

validate(body, {
  data: 'json', // any array or object
  email: 'email',
  _id: 'ObjectId', // mongodb ObjectId
  id: 'uuid', // UUID version 1-5
  ans: sbv.oneOf('yes', 'no', true, false),
})
```

### Custom validators

```javascript
const sbv = require('koa-sbv')

sbv.define('isEven', (value, name) => {
  sbv.assert(value % 2 === 0, `${name} is not even`)
  return value
})

sbv.define('isOdd', (value, name) => {
  sbv.assert(value % 2 === 1, `${name} is not odd`)
  return value
})

validate(body, {
  a: 'isEven',
  b: ['isOdd', { len: 10 }],
})
```

### Options object

By default all parameters are set to `false`

```javascript
const options = {
  notStrict: true,
  parseNumbers: true,
  makeArrays: true,
}

validate(data, schema, options)
```

- `notStrict` - make every parameter optional (otherwise it would be necessary to wrap everything in `maybe`)
- `parseNumbers` - try to parse arguments as numbers if they where declared as `number`, `int`, or `uint` (e.g. `'1' => 1, 'foo' => validation error`)
- `makeArrays` - make arrays from parameters if they were described as arrays (e.g. `'1' => ['1'], ['1', '2'] => ['1', '2']`)
