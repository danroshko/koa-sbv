const assert = require('./assert')

class SbvType {
  validate(data, name) {
    throw new Error('Validation is not impemented')
  }
}

class SbvEnum extends SbvType {
  constructor(...values) {
    super()
    this.values = values
  }

  validate(data, name) {
    const msg = `Invalid value for ${name}, expecting one of the following: ${this.values}`
    assert(this.values.includes(data), msg)

    return data
  }
}

class SbvString extends SbvType {
  constructor({ min, max }) {
    super()
    this.min = min || 0
    this.max = max || 1e4
  }

  validate(data, name) {
    const msg = `Invalid value for ${name}, expecting string from ${this.min} to ${this.max} characters long`

    const valid = typeof data === 'string' && data.length >= this.min && data.length <= this.max
    assert(valid, msg)

    return data
  }
}

class SbvNumber extends SbvType {
  constructor({ min, max }) {
    super()
    this.min = min == null ? Number.NEGATIVE_INFINITY : min
    this.max = max == null ? Number.POSITIVE_INFINITY : max
  }

  validate(data, name) {
    const msg = `Invalid value for ${name}, expecting number from ${this.min} to ${this.max}`

    const valid = typeof data === 'number' && data >= this.min && data <= this.max
    assert(valid, msg)

    return data
  }
}

class SbvInteger extends SbvType {
  constructor({ min, max }) {
    super()
    this.min = min == null ? Number.NEGATIVE_INFINITY : min
    this.max = max == null ? Number.POSITIVE_INFINITY : max
  }

  validate(data, name) {
    const msg = `Invalid value for ${name}, expecting integer from ${this.min} to ${this.max}`

    const valid = Number.isInteger(data) && data >= this.min && data <= this.max
    assert(valid, msg)

    return data
  }
}

exports.SbvType = SbvType

exports.oneOf = (...values) => {
  return new SbvEnum(...values)
}

exports.string = (options) => {
  return new SbvString(options)
}

exports.number = (options) => {
  return new SbvNumber(options)
}

exports.int = (options) => {
  return new SbvInteger(options)
}
