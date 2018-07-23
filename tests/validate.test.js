/* global test, expect */
const sbv = require('../index')
const { validate, assert, maybe, define } = sbv

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

test('number and int', () => {
  const data = {
    a: 0.33333333333,
    b: 42
  }

  const spec = {
    a: sbv.number({ min: 0, max: 1 }),
    b: sbv.int({ min: 0, max: 100 })
  }

  expect(validate(data, spec)).toEqual(data)
})

test('maybe without default values', () => {
  const data = {
    a: '123',
    c: { d: ['d'] }
  }

  const spec = {
    a: maybe('string'),
    b: maybe(['uint']),
    c: { d: maybe(['string']) }
  }

  expect(validate(data, spec)).toEqual(data)
})

test('maybe with default values', () => {
  const data = { a: 1 }
  const spec = { a: maybe('int', 0), b: maybe('int', 0) }
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
    validate(data, { a: sbv.number({ min: 20, max: 30 }) })
  }).toThrow('Invalid value for a, expecting number from 20 to 30')

  expect(() => {
    validate(data, { a: sbv.int({ min: 20, max: 40 }) })
  }).toThrow('Invalid value for a, expecting integer from 20 to 40')
})

test('enum', () => {
  const data = { a: 'yes' }

  const spec = {
    a: sbv.oneOf('yes', 'no', true, false)
  }

  expect(validate(data, spec)).toEqual({ a: 'yes' })

  expect(() => {
    validate(data, { a: sbv.oneOf(1, 2) })
  }).toThrow('Invalid value for a, expecting one of the following: 1,2')
})

test('string', () => {
  let spec = { a: sbv.string({ max: 10 }) }
  let data = { a: '12345' }

  expect(validate(data, spec)).toEqual(data)

  data = { a: '12345678910' }
  expect(() => {
    validate(data, spec)
  }).toThrow('Invalid value for a, expecting string from 0 to 10 characters long')

  spec = { a: sbv.string({ min: 2, max: 3 }) }
  expect(validate({ a: '123' }, spec)).toEqual({ a: '123' })

  const expectedError = 'Invalid value for a, expecting string from 2 to 3 characters long'

  expect(() => {
    validate({ a: '1' }, spec)
  }).toThrow(expectedError)

  expect(() => {
    validate({ a: '1234' }, spec)
  }).toThrow(expectedError)
})

test('notStrict option', () => {
  const data = { a: 1 }
  const spec = { a: 'int', b: 'int' }
  const options = { notStrict: true }
  expect(validate(data, spec, options)).toEqual({ a: 1 })
})

test('parseNumbers option', () => {
  const data = { a: '999.4553' }
  const spec = { a: 'number' }
  const options = { parseNumbers: true }
  expect(validate(data, spec, options)).toEqual({ a: 999.4553 })
})

test('makeArrays option', () => {
  const data = { a: '0.01' }
  const spec = { a: ['number'] }
  const options = { parseNumbers: true, makeArrays: true }
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
