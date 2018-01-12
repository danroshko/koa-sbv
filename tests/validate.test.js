/* global test, expect */
const validate = require('../src/validate')
const assert = require('../src/assert')
const { range } = require('../src/range')
const { maybe } = require('../src/maybe')
const { either } = require('../src/either')
const { text } = require('../src/text')
const { define } = require('../src/validators')

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

  const spec = {
    a: 'string',
    b: 'number',
    c: 'int',
    d: 'uint',
    e: 'boolean',
    f: 'ObjectId',
    g: /^\d+$/
  }

  expect(validate(data, spec)).toEqual(data)
})

test('nested validation', () => {
  const data = {
    title: 'Title',
    subtitle: 'Sub',
    pages: 600,
    tags: ['tag1', 'tag2'],
    authors: [{ name: 'Bob', emails: ['bob@foo.baz'] }]
  }

  const spec = {
    title: 'string',
    subtitle: 'string',
    pages: 'uint',
    tags: ['string', 1, 5],
    authors: [{ name: 'string', emails: ['email'] }]
  }

  expect(validate(data, spec)).toEqual(data)
})

test('filters unspecified properties', () => {
  const data = {
    a: 'a',
    b: { c: 1, d: 2 },
    e: 'e'
  }

  const spec = {
    a: 'string',
    b: { c: 'number' }
  }

  expect(validate(data, spec)).toEqual({
    a: 'a',
    b: { c: 1 }
  })
})

test('range', () => {
  const data = {
    a: 0.33333333333,
    b: 42
  }

  const spec = {
    a: range(0, 1),
    b: range(0, 100, true)
  }

  expect(validate(data, spec)).toEqual(data)
})

test('maybe', () => {
  let data = {
    a: '123',
    c: { d: ['d'] }
  }

  let spec = {
    a: maybe('string'),
    b: maybe(['uint']),
    c: { d: maybe(['string']) }
  }

  expect(validate(data, spec)).toEqual(data)

  data = { a: 1 }
  spec = { a: maybe('int', 0), b: maybe('int', 0) }
  expect(validate(data, spec)).toEqual({ a: 1, b: 0 })
})

test('required parameters', () => {
  const data = { a: 1, b: { c: 3 } }

  const spec = {
    a: 'int',
    b: { c: 'int', d: 'int' }
  }

  expect(() => {
    validate(data, spec)
  }).toThrow('Missing required parameter b.d')
})

test('wrong parameter type', () => {
  const data = { a: 'qqqqqq' }
  const spec = { a: 'uint' }

  expect(() => {
    validate(data, spec)
  }).toThrow('Invalid value for a, expecting non-negative integer')
})

test('array length', () => {
  const data = { a: [1, 2, 3] }
  const spec = { a: ['int', { min: 5 }] }

  expect(() => {
    validate(data, spec)
  }).toThrow('expecting a to contain no less than 5 elements')
})

test('out of range', () => {
  const data = { a: 31.5 }

  expect(() => {
    validate(data, { a: range(20, 30) })
  }).toThrow('Invalid value for a, expecting value in range(20, 30, 0)')

  expect(() => {
    validate(data, { a: range(20, 40, 1) })
  }).toThrow('Invalid value for a, expecting value in range(20, 40, 1)')

  const spec = { a: range(20, 40, 0.5) }
  expect(validate(data, spec)).toEqual({ a: 31.5 })
})

test('either', () => {
  const data = { a: 'yes' }

  const spec = {
    a: either('yes', 'no', true, false)
  }

  expect(validate(data, spec)).toEqual({ a: 'yes' })

  expect(() => {
    validate(data, { a: either(1, 2) })
  }).toThrow('Invalid value for a, expecting one of the following: 1,2')
})

test('text', () => {
  let spec = { a: text(10) }
  let data = { a: '12345' }

  expect(validate(data, spec)).toEqual(data)

  data = { a: '12345678910' }
  expect(() => {
    validate(data, spec)
  }).toThrow('Invalid value for a, expecting string from 0 to 10 characters long')

  spec = { a: text(2, 3) }
  expect(validate({ a: '123' }, spec)).toEqual({ a: '123' })

  const expectedError = 'Invalid value for a, expecting string from 2 to 3 characters long'

  expect(() => {
    validate({ a: '1' }, spec)
  }).toThrow(expectedError)

  expect(() => {
    validate({ a: '1234' }, spec)
  }).toThrow(expectedError)
})

test('options', () => {
  let data = { a: 1 }
  let spec = { a: 'int', b: 'int' }
  let options = { notStrict: true }
  expect(validate(data, spec, options)).toEqual({ a: 1 })

  data = { a: '999.4553' }
  spec = { a: 'number' }
  options = { parseNumbers: true }
  expect(validate(data, spec, options)).toEqual({ a: 999.4553 })

  data = { a: '0.01' }
  spec = { a: ['number'] }
  options = { parseNumbers: true, makeArrays: true }
  expect(validate(data, spec, options)).toEqual({ a: [0.01] })
})

test('define new validators', () => {
  define('smallNumber', (val, name) => {
    assert(val < 20, `${name} is bigger than 20`)
    return val
  })

  const data = { a: 17, b: 30 }

  expect(validate(data, { a: 'smallNumber' })).toEqual({ a: 17 })

  expect(() => {
    validate(data, { b: 'smallNumber' })
  }).toThrow('b is bigger than 20')
})
