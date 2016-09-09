require('proof')(3, prove)

function prove (assert) {
    var slice = [].slice
    var util = require('util')
    var Abstract = require('../abstract')

    function Implementation () {
        Abstract.call(this)
    }
    util.inherits(Implementation, Abstract)

    var object = { unlikely: true }

    var expectations = [
        { vargs: [ true, object, 'function', [ 'a' ], 'function' ], message: 'record' },
        { vargs: [ true, null, 'function', [], 'function' ], message: 'defaults' },
        { vargs: [ false, null, 'function', [], 'function' ], message: 'rerun' }
    ]

    Implementation.prototype.invoke = function () {
        var expected = expectations.shift()
        var vargs = slice.call(arguments)
        vargs[2] = typeof vargs[2]
        vargs[4] = typeof vargs[4]
        assert(vargs, expected.vargs, expected.message)
    }

    var implementation = new Implementation

    implementation.record(object, function () {}, [ 'a' ], function () {})
    implementation.record(function () {}, function () {})
    implementation.rerun(function () {}, function () {})
}
