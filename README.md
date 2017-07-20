# koa-sbv
Request body validation middleware for koa2
* validates arrays and objects that can be arbitrarily nested
* removes unspecified properties from request body

## Installation
```bash
$ npm install danroshko/koa-sbv --save
```

## Usage
```javascript
const parser = require('koa-body')
const koa = require('koa')
const validate = require('koa-sbv')
const router = require('koa-router')

const app = new Koa()

app.use(parser({ urlencoded: false })).use(validate)

router.post('/books', async ctx => {
  // if validation fails throws an error with 400 status code and helpful error message
  ctx.validate({
    title: 'string!',                     // required
    subtitle: 'string',                   // optional
    pages: 'uint!',
    tags: ['string', 1, 5],               // array of strings (1 to 5 elements)
    authors: [                            // array of objects (may be empty)
      { name: 'string!', emails: ['email'] }
    ]
  })

  // now ctx.request.body contains only specified properties

  ctx.status = 200
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000)
```

## Available validators
* string
* email
* number
* percent
* int
* uint

## Adding your own validators
```javascript
const validate = require('koa-sbv')
const assert = require('assert')

validate.validators.evenNumber = function(val, name) {
  const isValid = typeof val === 'number' && val % 2 === 0
  assert(isValid, `Ivalid value for ${name}: expecting even number`)
}

app.use(parser({ urlencoded: false })).use(validate)

router.post('/numbers', async ctx => {
  ctx.validate({
    numbers: ['evenNumber', 10, 10] // exactly 10 even numbers
  })
})
```
