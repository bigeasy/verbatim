var util = require('util')
var cadence = require('cadence')
var Abstract = require('./abstract')

function Player (logger) {
    this._logger = logger
    this._completions = {}
    this._continuations = {}
    this._sequence = 0
    Abstract.call(this)
}
util.inherits(Player, Abstract)

Player.prototype.play = cadence(function (async, entry) {
    if (entry.name == 'calledback') {
        var vargs = entry.$vargs
        var completion = this._completions[entry.sequence]
        if (completion == null) {
            async([function () {
                delete this._continuations[entry.sequence]
            }], function () {
                this._continuations[entry.sequence] = {
                    vargs: vargs,
                    callback: async()
                }
            })
        } else {
            completion.call(null, vargs)
        }
    }
})

Player.prototype.invoke = function (record, object, method, vargs, callback) {
    var sequence = this._sequence++
    if (record) {
        this._completed(sequence, record, object, method, null, callback)
    } else {
        method.apply(object, vargs.concat(function () {
            var vargs = []
            for (var i = 0, I = arguments.length; i < I; i++) {
                vargs[i] = arguments[i]
            }
            this._completed(sequence, record, object, method, vargs, callback)
        }.bind(this)))
    }
}

Player.prototype._completed = function (sequence, record, object, method, vargs, callback) {
    var continuation = this._continuations[sequence]
    if (continuation == null) {
        this._completions[sequence] = function ($vargs) {
            this._logger.trace('calledback', {
                sequence: sequence,
                vargs: record ? $vargs : null
            })
            callback.apply(null, record ? $vargs : vargs)
            delete this._completions[sequence]
        }.bind(this)
    } else {
        this._logger.trace('calledback', {
            sequence: sequence,
            $vargs: record ? continuation.vargs : null
        })
        callback.apply(null, record ? continuation.vargs : vargs)
        continuation.callback()
    }
}

module.exports = Player
