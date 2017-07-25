module.exports = function (value, msg) {
  if (value) return

  const err = new Error(msg)
  err.status = 400
  err.expose = true
  throw err
}
