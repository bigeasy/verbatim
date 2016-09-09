function Abstract () {
}

Abstract.prototype._invoke = function (record, vargs) {
    var callback = vargs.pop()
    var _vargs = Array.isArray(vargs[vargs.length - 1]) ? vargs.pop() : []
    var object = vargs.length == 2 ? vargs.shift() : null
    this.invoke(record, object, vargs[0], _vargs, callback)
}

Abstract.prototype.record = function () {
    var vargs = []
    for (var i = 0, I = arguments.length; i < I; i++) {
        vargs[i] = arguments[i]
    }
    this._invoke(true, vargs)
}

Abstract.prototype.rerun = function () {
    var vargs = []
    for (var i = 0, I = arguments.length; i < I; i++) {
        vargs[i] = arguments[i]
    }
    this._invoke(false, vargs)
}

module.exports = Abstract
