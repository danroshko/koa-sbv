/* global test, expect */
const validate = require('../src/validate')
const assert = require('../src/assert')
const { range } = require('../src/range')
const { maybe } = require('../src/maybe')
const { either } = require('../src/either')

function makeCtx (body) {
  return {
    validate: validate,
    request: { body }
  }
}

test('basic validation', () => {
  const data = {
    a: 'a',
    b: 12.34,
    c: -73253453,
    d: 11,
    e: false,
    f: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    g: '456789'
  }
  const ctx = makeCtx(data)

  ctx.validate({
    a: 'string',
    b: 'number',
    c: 'int',
    d: 'uint',
    e: 'boolean',
    f: 'ObjectId',
    g: /^\d+$/
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
    title: 'string',
    subtitle: 'string',
    pages: 'uint',
    tags: ['string', 1, 5],
    authors: [{ name: 'string', emails: ['email'] }]
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
    a: 'string',
    b: { c: 'number' }
  })

  expect(ctx.request.body).toEqual({
    a: 'a',
    b: { c: 1 }
  })
})

test('range', () => {
  const ctx = makeCtx({
    a: 0.33333333333,
    b: 42
  })

  ctx.validate({
    a: range(0, 1),
    b: range(0, 100, true)
  })

  expect(ctx.request.body).toEqual({
    a: 0.33333333333,
    b: 42
  })
})

test('maybe', () => {
  const ctx = makeCtx({
    a: '123',
    c: { d: ['d'] }
  })

  ctx.validate({
    a: maybe('string'),
    b: maybe(['uint']),
    c: { d: maybe(['string']) }
  })

  expect(ctx.request.body).toEqual({
    a: '123',
    c: { d: ['d'] }
  })
})

test('required parameters', () => {
  const ctx = makeCtx({ a: 1, b: { c: 3 } })

  expect(() => {
    ctx.validate({
      a: 'int',
      b: { c: 'int', d: 'int' }
    })
  }).toThrow('Missing required parameter b.d')
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
    ctx.validate({ a: ['int', { min: 5 }] })
  }).toThrow('expecting a to contain no less than 5 elements')
})

test('out of range', () => {
  const ctx = makeCtx({ a: 31.5 })

  expect(() => {
    ctx.validate({ a: range(20, 30) })
  }).toThrow('Invalid value for a, expecting value in range(20, 30, 0)')

  expect(() => {
    ctx.validate({ a: range(20, 40, 1) })
  }).toThrow('Invalid value for a, expecting value in range(20, 40, 1)')

  ctx.validate({ a: range(20, 40, 0.5) })
  expect(ctx.request.body).toEqual({ a: 31.5 })
})

test('either', () => {
  const ctx = makeCtx({ a: 'yes' })

  ctx.validate({
    a: either('yes', 'no', true, false)
  })

  expect(ctx.request.body).toEqual({ a: 'yes' })

  expect(() => {
    ctx.validate({ a: either(1, 2) })
  }).toThrow('Invalid value for a, expecting one of the following: 1,2')
})

test('functions', () => {
  const ctx = makeCtx({ a: 8 })

  function isEven (value, name) {
    assert(value % 2 === 0, `${name} is not even`)
  }

  function isOdd (value, name) {
    assert(value % 2 === 1, `${name} is not odd`)
  }

  expect(() => {
    ctx.validate({ a: isOdd })
  }).toThrow('a is not odd')

  ctx.validate({ a: isEven })
  expect(ctx.request.body).toEqual({ a: 8 })
})
