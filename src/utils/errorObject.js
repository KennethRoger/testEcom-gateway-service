function throwError(message, status) {
  return Object.assign(new Error(message), { statusCode: status });
}

module.exports = throwError;