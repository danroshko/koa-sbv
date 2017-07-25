# koa-sbv
Request body validation middleware for koa2. Check [koa-validate](https://github.com/RocksonZeta/koa-validate) if you need more thorough validation, use this package if you need an easy way to validate nested arrays and objects or don't like the verbosity of other packages.


## Installation
```bash
$ npm install koa-sbv --save
```

## Usage
```javascript
const parser = require('koa-body')
const Koa = require('koa')
const validate = require('koa-sbv')
const router = require('koa-router')

const { maybe, range } = validate

const app = new Koa()

app.use(parser()).use(validate)

router.post('/books', async ctx => {
  // if validation fails throws an error with 400 status code and helpful message
  ctx.validate({
    title: 'string',
    subtitle: maybe('string'),   // 1.
    price: range(9, 19),         // 2.
    pages: 'uint',
    foo: /^fo*$/,
    tags: ['string', 1, 5],      // 3.
    authors: [{                  // 4.
      name: 'string',
      emails: maybe(['email'])
    }]
  })

  // now ctx.request.body contains only specified properties

  ctx.status = 200
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000)
```

1. use `maybe` for optional parameters
2. use `range(a, b, true)` for integers from `a` to `b` (inclusive)
3. `[type, minElements, maxElements]` - array validation, last 2 elements are optional
4. description of arrays and objects can be nested as deep as necessary

## Available validators
* string
* email
* number
* boolean
* percent - number between 0 and 100
* int - integer
* uint - non-negative integer
* ObjectId - mongodb ObjectId
* object - object with arbitrary structure
* array
* RegExp
* range
