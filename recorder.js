var proxies = []

function Recorder (logger) {
    this._logger = logger
    this._sequence = 0
    this._callbacks = []
}

Recorder.prototype.callback = function (callback) {
    var proxy

    if (proxies.length == 0) {
        proxy = {
            logger: this._logger,
            callback: callback,
            sequence: this._sequence++,
            proxy: function () {
                var vargs = new Array
                for (var i = 0, I = arguments.length; i < I; i++) {
                    vargs[i] = arguments[i]
                }
                proxy.logger.trace('calledback', { sequence: proxy.sequence })
                proxy.callback.apply(null, vargs)
                proxies.push(proxy)
            }
        }
    } else {
        proxy = proxies.pop()
        proxy.callback = callback
        proxy.sequence = this._sequence++
    }

    this._logger.trace('callback', { sequence: proxy.sequence })

    return proxy.proxy
}

module.exports = Recorder
