var util = require('util')
var proxies = []
var Abstract = require('./abstract')

function Recorder (logger) {
    this._logger = logger
    this._sequence = 0
    this._callbacks = []
    Abstract.call(this)
}
util.inherits(Recorder, Abstract)

Recorder.prototype.callback = function (record, callback) {
    var proxy

    if (proxies.length == 0) {
        proxy = {
            logger: this._logger,
            sequence: this._sequence++,
            record: record,
            callback: callback,
            proxy: function () {
                var vargs = []
                for (var i = 0, I = arguments.length; i < I; i++) {
                    vargs[i] = arguments[i]
                }
                // Preserve Error as best we can. We're currently not preserving
                // the stack. We probably could, but why is anyone depending
                // upon the stack in code?
                if (vargs[0] instanceof Error) {
                    vargs[0] = JSON.parse(JSON.stringify(vargs[0], Object.keys(vargs[0]).concat('message')))
                }
                proxy.logger.trace('calledback', {
                    sequence: proxy.sequence,
                    $vargs: proxy.record ? vargs : null
                })
                proxy.callback.apply(null, vargs)
                proxies.push(proxy)
            }
        }
    } else {
        proxy = proxies.pop()
        proxy.record = record
        proxy.callback = callback
        proxy.sequence = this._sequence++
    }

    return proxy.proxy
}

Recorder.prototype.invoke = function (record, object, method, vargs, callback) {
    method.apply(object, vargs.concat(this.callback(record, callback)))
}

module.exports = Recorder
