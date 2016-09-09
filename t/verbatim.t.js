require('proof/redux')(4, prove)

function prove (assert) {
    var verbatim = require('..')

    var expectations = [
        { args: [ true, [ 1 ] ], message: 'record' },
        { args: [ false, [ 1 ] ], message: 'rerun' }
    ]

    function Service () {
        this._verbatim = {
            invoke: function (record, object, method, vargs, callback) {
                var expected = expectations.shift()
                assert([ record, vargs ], expected.args, expected.message)
                method.apply(object, vargs.concat(callback))
            }
        }
    }

    Service.prototype.recorded = verbatim.record(function (value, callback) {
        callback(null, value)
    })

    Service.prototype.rerun = verbatim.rerun(function (value, callback) {
        callback(null, value)
    })

    var service = new Service

    service.recorded(1, function (error, result) {
        assert(result, 1, 'recorded')
    })

    service.rerun(1, function (error, result) {
        assert(result, 1, 'reran')
    })
}
