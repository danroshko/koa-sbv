const assert = require('assert')
const validators = require('./validators')

module.exports = function (spec) {
  const ctx = this
  const data = ctx.request.body

  const isEmpty = Object.keys(data).length === 0
  ctx.assert(!isEmpty, 400, 'Empty request body')

  try {
    ctx.request.body = validate(data, spec)
  } catch (err) {
    if (err.status !== 500) {
      ctx.throw(400, err.message)
    } else {
      throw err
    }
  }
}

function validate (data, spec, name) {
  if (typeof spec === 'string') {
    const required = spec.endsWith('!')
    spec = spec.replace('!', '')

    if (data == null && !required) return null

    const validator = validators[spec]
    if (typeof validator !== 'function') {
      internalError('Unknown validator ' + spec)
    }

    validator(data, name)
    return data
  }

  if (Array.isArray(spec)) {
    const min = spec[1] || 0
    const max = spec[2] || 10000
    assert(Array.isArray(data), `expecting ${name} to be an array`)

    let msg = `expecting ${name} to contain no less than ${min} elements`
    assert(data.length >= min, msg)

    msg = `expecting ${name} to contain less than ${max} elements`
    assert(data.length <= max, msg)

    return data.map((row, i) => {
      return validate(row, spec[0], `${name}[${i}]`)
    })
  }

  if (typeof spec === 'object' && spec != null) {
    const result = {}
    const msg = `expecting ${name} to be an object`
    assert(typeof data === 'object', msg)

    for (let prop in spec) {
      const newName = name ? `${name}.${prop}` : prop
      const value = validate(data[prop], spec[prop], newName)
      if (value != null) {
        result[prop] = value
      }
    }
    return result
  }

  internalError('Check your specification for ' + name)
}

function internalError (message) {
  const err = new Error(message)
  err.status = 500
  throw err
}
