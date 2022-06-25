// @desc    this class is responsible for Operation errors (errors that i can predict)

class Boom extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;
  }
}

module.exports = Boom;
