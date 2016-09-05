function NullRecorder () {
}

NullRecorder.prototype.callback = function (callback) {
    return callback
}

NullRecorder.instance = new NullRecorder

module.exports = NullRecorder
