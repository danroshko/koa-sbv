# koa-sbv
[![NPM](https://nodei.co/npm/koa-sbv.png)](https://npmjs.org/package/koa-sbv)

Declarative request body validation for koa (doesn't support koa v1.x).

## Installation
```bash
$ npm install koa-sbv --save
```

```javascript
const Koa = require('koa')
const parser = require('koa-body')
const validate = require('koa-sbv')

const app = new Koa()

app.use(parser()).use(validate)

...

```

## Usage
**Basic validation**
* all parameters are required by default, use `maybe` wrapper for optional parameters.
* every parameter that wasn't declared will be removed from `ctx.request.body`.
* an error with 400 status code and helpful message will be thrown if validation fails

```javascript
const { maybe } = require('koa-sbv')

router.post('/basic', async (ctx) => {
  ctx.validate({
    a: 'string',
    b: 'email',
    c: 'number',
    d: maybe('int'),
    e: maybe('uint'),
    f: /^\d{5}$/,
    g: 'boolean'
  })
})
```

**Arrays and objects**
* use object literals to describe expected objects
* use array literals to describe expected arrays, pass options as a second argument
  * `min` - minimum length of an array, default 0
  * `max` - maximum allowed length
  * `len` - if an array should contain exactly `len` elements
* description can be nested as deep as necessary

```javascript
const { maybe } = require('koa-sbv')

router.post('/nested', async (ctx) => {
  ctx.validate({
    obj1: { name: 'string' },
    obj2: maybe({ age: 'uint' }),
    arr1: ['number'],
    arr2: ['number', { min: 1 }],
    arr3: [maybe({ foo: 'string' }), { max: 10 }]
  })
})
```

**Range and either**
* `range(start, stop, step)`
* `either(...args)`

```javascript
const { range, either } = require('koa-sbv')

router.post('/additional', async (ctx) => {
  ctx.validate({
    range1: range(0, 100),
    range2: range(0, 100, 1),
    ans: either('yes', 'no', true, false)
  })
})
```

**Functions**
```javascript
const { assert } = require('koa-sbv')

function isEven (value, name) {
  assert(value % 2 === 0, `${name} is not even`)
}

function isOdd (value, name) {
  assert(value % 2 === 1, `${name} is not odd`)
}

router.post('/func', async (ctx) => {
  ctx.validate({
    a: isEven,
    b: [isOdd, { len: 10 }]
  })
})
```
