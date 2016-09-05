require('proof/redux')(9, prove)

function prove (assert) {
    var Recorder = require('../recorder')
    var expectations = [{
        name: 'callback', sequence: 0, message: 'created first'
    }, {
        name: 'callback', sequence: 1, message: 'created second'
    }, {
        name: 'calledback', sequence: 1, message: 'second called back first'
    }, {
        name: 'calledback', sequence: 0, message: 'first called back second'
    }, {
        name: 'callback', sequence: 2, message: 'recycled callack'
    }, {
        name: 'calledback', sequence: 2, message: 'recycled callback called back'
    }]
    var recorder = new Recorder({
        trace: function (name, record) {
            var expected = expectations.shift()
            assert({
                name: expected.name,
                sequence: expected.sequence
            }, {
                name: name,
                sequence: record.sequence
            }, expected.message)
        }
    })

    var callbacks = []

    callbacks.push(recorder.callback(function (error, result) {
        assert(result, 1, 'first called back')
    }))
    callbacks.push(recorder.callback(function (error) {
        assert(error.message, '2', 'second called back')
    }))

    callbacks.pop()(new Error('2'))
    callbacks.pop()(null, 1)

    callbacks.push(recorder.callback(function (error, one, two, three) {
        assert(three, 3, 'third called back')
    }))

    callbacks.pop()(null, 1, 2, 3)
}
