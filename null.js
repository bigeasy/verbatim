var util = require('util')
var Abstract = require('./abstract')

function Null () {
    Abstract.call(this)
}
util.inherits(Null, Abstract)

Null.prototype.invoke = function (record, object, method, vargs, callback) {
    method.apply(object, vargs.concat(callback))
}

module.exports = Null
