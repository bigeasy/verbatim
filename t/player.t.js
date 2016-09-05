require('proof/redux')(9, require('cadence')(prove))

function prove (async, assert) {
    var Player = require('../player')
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
    var player = new Player({
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

    callbacks.push(player.callback(function (error, result) {
        assert(result, 1, 'first called back')
    }))
    callbacks.push(player.callback(function (error) {
        assert(error.message, '2', 'second called back')
    }))

    callbacks.shift()(null, 1)
    callbacks.shift()(new Error('2'))

    async(function () {
        player.play({ name: 'callback', sequence: 1 }, async())
    }, function () {
        player.play({ name: 'calledback', sequence: 1 }, async())
    }, function () {
        player.play({ name: 'calledback', sequence: 0 }, async())
    }, function () {
        player.play({ name: 'calledback', sequence: 2 }, async())

        callbacks.push(player.callback(function (error, one, two, three) {
            assert(three, 3, 'third called back')
        }))

        callbacks.pop()(null, 1, 2, 3)
    })
}
