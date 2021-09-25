/* global test, expect */
const sbv = require('../index')
const { validate, assert, maybe, nullable, dict, define, setMaxArrLength } = sbv

test('basic validation', () => {
  const data = {
    a: 'a',
    b: 12.34,
    c: -73253453,
    d: 11,
    e: false,
    f: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    g: '456789',
  }

  const spec = {
    a: 'string',
    b: 'number',
    c: 'int',
    d: 'uint',
    e: 'boolean',
    f: 'ObjectId',
    g: /^\d+$/,
  }

  expect(validate(data, spec)).toEqual(data)
})

test('nested validation', () => {
  const data = {
    title: 'Title',
    subtitle: 'Sub',
    pages: 600,
    tags: ['tag1', 'tag2'],
    authors: [{ name: 'Bob', emails: ['bob@foo.baz'] }],
  }

  const spec = {
    title: 'string',
    subtitle: 'string',
    pages: 'uint',
    tags: ['string', 1, 5],
    authors: [{ name: 'string', emails: ['email'] }],
  }

  expect(validate(data, spec)).toEqual(data)
})

test('filters unspecified properties', () => {
  const data = {
    a: 'a',
    b: { c: 1, d: 2 },
    e: 'e',
  }

  const spec = {
    a: 'string',
    b: { c: 'number' },
  }

  expect(validate(data, spec)).toEqual({
    a: 'a',
    b: { c: 1 },
  })
})

test('number and int', () => {
  const data = {
    a: 0.33333333333,
    b: 42,
  }

  const spec = {
    a: sbv.number({ min: 0, max: 1 }),
    b: sbv.int({ min: 0, max: 100 }),
  }

  expect(validate(data, spec)).toEqual(data)
})

test('json allows arrays and objects', () => {
  const data = {
    a: { id: 42 },
    b: [2, 3, 4],
  }

  const spec = { a: 'json', b: 'json' }
  expect(validate(data, spec)).toEqual(data)
})

test('json does not allow primitive types', () => {
  const data = { a: 8 }
  const spec = { a: 'json' }

  expect(() => validate(data, spec)).toThrow('Invalid value for a, expecting array or object')
})

test('maybe without default values', () => {
  const data = {
    a: '123',
    c: { d: ['d'] },
  }

  const spec = {
    a: maybe('string'),
    b: maybe(['uint']),
    c: { d: maybe(['string']) },
  }

  expect(validate(data, spec)).toEqual(data)
})

test('maybe with default values', () => {
  const data = { a: 1 }
  const spec = { a: maybe('int', 0), b: maybe('int', 0) }
  expect(validate(data, spec)).toEqual({ a: 1, b: 0 })
})

test('nullable allows nulls', () => {
  const data = { a: 10, b: '123', c: null }

  const spec = {
    a: nullable('number'),
    b: nullable('string'),
    c: nullable('string'),
  }

  expect(validate(data, spec)).toEqual({ a: 10, b: '123', c: null })
})

test('required parameters', () => {
  const data = { a: 1, b: { c: 3 } }

  const spec = {
    a: 'int',
    b: { c: 'int', d: 'int' },
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
    a: sbv.oneOf('yes', 'no', true, false),
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

test('uuid', () => {
  let spec = { id: 'uuid' }

  const data1 = { id: 'a528246f-d032-4b6c-b99f-b45193b09307' }
  const data2 = { id: '3c297221-cacc-4f74-9618-08e7da0e1b54' }
  const data3 = { id: '8ce553be-3969-4cce-87bd-75babdf43f93' }

  expect(validate(data1, spec)).toEqual(data1)
  expect(validate(data2, spec)).toEqual(data2)
  expect(validate(data3, spec)).toEqual(data3)

  expect(() => {
    validate({ id: 'a528246f' }, spec)
  }).toThrow('Invalid value for id, expecting valid UUID')

  expect(() => {
    validate({ id: 1234567 }, spec)
  }).toThrow('Invalid value for id, expecting valid UUID')

  expect(() => {
    validate({ id: '8ce553be-zzzz-vvvv-eeee-75babdf43f93' }, spec)
  }).toThrow('Invalid value for id, expecting valid UUID')
})

test('dict', () => {
  const spec = { props: dict('string', 'number') }

  const data1 = { props: {} }
  const data2 = { props: { a: 0 } }
  const data3 = { props: { a: 0, b: 1, c: 2 } }

  expect(validate(data1, spec)).toEqual(data1)
  expect(validate(data2, spec)).toEqual(data2)
  expect(validate(data3, spec)).toEqual(data3)

  expect(() => {
    validate({ props: { a: 'a' } }, spec)
  }).toThrow('Invalid value for props.a, expecting number')

  const spec2 = dict('string', ['string'])

  const data4 = {}
  const data5 = { foo: [], bar: ['1', '2', '3'] }
  expect(validate(data4, spec2)).toEqual(data4)
  expect(validate(data5, spec2)).toEqual(data5)
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

test('default array length', () => {
  setMaxArrLength(100)

  const data = { a: new Array(90).fill(1) }
  const spec = { a: ['number'] }
  expect(validate(data, spec)).toEqual(data)

  data.a = new Array(120).fill(1)
  expect(() => validate(data, spec)).toThrow('expecting a to contain less than 100 elements')

  setMaxArrLength(1e4)
  expect(validate(data, spec)).toEqual(data)

  data.a = new Array(2e4).fill(1)
  expect(() => validate(data, spec)).toThrow('expecting a to contain less than 10000 elements')
})
