require('proof/redux')(1, prove)

function prove (assert) {
    var instance = require('../null').instance
    var callback = instance.callback(function (error, value) {
        assert(value, 1, 'called back')
    })
    callback(null, 1)
}
