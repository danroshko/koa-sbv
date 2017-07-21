/* global test, expect */
const assert = require('assert')
const validate = require('../src/validate')
const validators = require('../src/validators')

function makeCtx (body) {
  return {
    validate: validate,
    throw (status, msg) {
      throw new Error(msg)
    },
    assert (value, status, message) {
      assert(value, message)
    },
    request: { body }
  }
}

test('basic validation', () => {
  const data = {
    a: 'a',
    b: 'b',
    c: 12.34,
    d: 7,
    f: false,
    g: 'aaaaaaaaaaaaaaaaaaaaaaaa'
  }
  const ctx = makeCtx(data)

  ctx.validate({
    a: 'string!',
    b: 'string',
    c: 'number',
    d: 'int',
    e: 'string',
    f: 'boolean',
    g: 'ObjectId'
  })

  expect(ctx.request.body).toEqual(data)
})

test('nested validation', () => {
  const data = {
    title: 'Title',
    subtitle: 'Sub',
    pages: 600,
    tags: ['tag1', 'tag2'],
    authors: [{ name: 'Bob', emails: ['bob@foo.baz'] }]
  }

  const ctx = makeCtx(data)

  ctx.validate({
    title: 'string!',
    subtitle: 'string',
    pages: 'uint!',
    tags: ['string', 1, 5],
    authors: [{ name: 'string!', emails: ['email'] }]
  })

  expect(ctx.request.body).toEqual(data)
})

test('filters unspecified properties', () => {
  const ctx = makeCtx({
    a: 'a',
    b: { c: 1, d: 2 },
    e: 'e'
  })

  ctx.validate({
    a: 'string!',
    b: { c: 'number' }
  })

  expect(ctx.request.body).toEqual({
    a: 'a',
    b: { c: 1 }
  })
})

test('custom validators', () => {
  validators.evenNumber = function (val, name) {
    const isValid = typeof val === 'number' && val % 2 === 0
    assert(isValid, `Ivalid value for ${name}: expecting even number`)
  }

  const data = { numbers: [2, 4, 8] }
  const ctx = makeCtx(data)

  ctx.validate({ numbers: ['evenNumber', 3, 3] })

  expect(ctx.request.body).toEqual(data)
})

test('required parameters', () => {
  const ctx = makeCtx({ a: 1, b: { c: 3 } })

  expect(() => {
    ctx.validate({
      a: 'int!',
      b: { c: 'int!', d: 'int!' }
    })
  }).toThrow('Invalid value for b.d, expecting integer')
})

test('wrong parameter type', () => {
  const ctx = makeCtx({ a: 'qqqqqq' })

  expect(() => {
    ctx.validate({ a: 'uint' })
  }).toThrow('Invalid value for a, expecting non-negative integer')
})

test('array length', () => {
  const ctx = makeCtx({ a: [1, 2, 3] })

  expect(() => {
    ctx.validate({ a: ['int', 5] })
  }).toThrow('expecting a to contain no less than 5 elements')
})
