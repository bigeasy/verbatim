require('proof/redux')(1, prove)

function prove (assert) {
    var instance = new (require('../null'))
    instance.record(function (callback) {
        callback(null, 1)
    }, function (error, result) {
        assert(result, 1, 'null')
    })
}
