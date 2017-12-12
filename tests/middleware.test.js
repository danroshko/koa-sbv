/* global test, expect */
const { middleware } = require('../index')

test('middleware should patch ctx', () => {
  const ctx = {}

  middleware(ctx, () => {
    expect(typeof ctx.validate).toBe('function')
  })
})

test('validate', () => {
  const ctx = {
    request: { body: { a: 1, b: 2 } }
  }

  middleware(ctx, () => {
    ctx.validate({ a: 'number' })
    expect(ctx.request.body).toEqual({ a: 1 })
  })
})
