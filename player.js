var slice = [].slice
var cadence = require('cadence')

function Player (logger) {
    this._logger = logger
    this._completions = {}
    this._continuations = {}
    this._sequence = 0
}

Player.prototype.play = cadence(function (async, entry) {
    if (entry.name == 'calledback') {
        var completion = this._completions[entry.sequence]
        if (completion == null) {
            async([function () {
                delete this._continuations[entry.sequence]
            }], function () {
                this._continuations[entry.sequence] = async()
            })
        } else {
            completion.call()
        }
    }
})

Player.prototype.callback = function (callback) {
    var sequence = this._sequence++, player = this, logger = player._logger
    logger.trace('callback', { sequence: sequence })
    return function () {
        var vargs = slice.call(arguments)
        var continuation = player._continuations[sequence]
        if (continuation == null) {
            player._completions[sequence] = completion
        } else {
            completion()
            continuation()
        }
        function completion () {
            logger.trace('calledback', { sequence: sequence })
            callback.apply(null, vargs)
            delete player._completions[sequence]
        }
    }
}

module.exports = Player
