var adhere = require('adhere')

exports.record = function (method) {
    return adhere(method, function (object, vargs) {
        object._verbatim.invoke(true, object, method, vargs, vargs.pop())
    })
}

exports.rerun = function (method) {
    return adhere(method, function (object, vargs) {
        object._verbatim.invoke(false, object, method, vargs, vargs.pop())
    })
}
