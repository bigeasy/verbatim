require('proof/redux')(6, prove)

function prove (assert) {
    var Recorder = require('../recorder')
    var expectations = [{
        sequence: 1,
        name: 'calledback',
        vargs: [{ message: '2' }],
        message: 'second called back first'
    }, {
        name: 'calledback',
        sequence: 0,
        vargs: [ null, 1 ],
        message: 'first called back second'
    }, {
        name: 'calledback',
        sequence: 2,
        vargs: null,
        message: 'recycled callback called back'
    }]
    var recorder = new Recorder({
        trace: function (name, record) {
            var expected = expectations.shift()
            assert({
                sequence: record.sequence,
                name: name,
                vargs: record.$vargs
            }, {
                sequence: expected.sequence,
                name: expected.name,
                vargs: expected.vargs
            }, expected.message)
        }
    })

    var callbacks = []

    recorder.record(function (callback) {
        callbacks.push(callback)
    }, function (error, result) {
        assert(result, 1, 'first called back')
    })
    recorder.record(function (callback) {
        callbacks.push(callback)
    }, function (error) {
        assert(error.message, '2', 'second called back')
    })

    callbacks.pop()(new Error('2'))
    callbacks.pop()(null, 1)

    recorder.rerun(function (callback) {
        callbacks.push(callback)
    }, function (error, one, two, three) {
        assert(three, 3, 'third called back')
    })

    callbacks.pop()(null, 1, 2, 3)
}
