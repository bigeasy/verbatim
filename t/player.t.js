require('proof/redux')(8, require('cadence')(prove))

function prove (async, assert) {
    var Player = require('../player')
    var expectations = [{
        name: 'calledback',
        sequence: 1,
        message: 'second called back first'
    }, {
        name: 'calledback',
        sequence: 0,
        message: 'first called back second'
    }, {
        name: 'calledback',
        sequence: 2,
        message: 'recycled callback called back'
    }, {
        name: 'calledback',
        sequence: 3,
        message: 'rerun callback called back'
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

    player.rerun(function (callback) {
        callbacks.push(callback)
    }, function (error, result) {
        assert(result, 1, 'first called back')
    })
    player.record(function () {
        throw new Error
    }, function (error) {
        assert(error.message, '2', 'second called back')
    })

    callbacks.pop()(null, 1)

    async(function () {
        player.play({ name: 'callback', sequence: 1 }, async())
    }, function () {
        player.play({ name: 'calledback', $vargs: [{ message: '2' }], sequence: 1 }, async())
    }, function () {
        player.play({ name: 'calledback', sequence: 0 }, async())
    }, function () {
        player.play({ name: 'calledback', $vargs: [ null, 1, 2, 3 ], sequence: 2 }, async())
        player.record(function () {
            throw new Error
        }, function (error, one, two, three) {
            assert(three, 3, 'third called back')
        })
    }, function () {
        player.play({ name: 'calledback', sequence: 3 }, async())
        player.rerun(function (callback) {
            callback(null, 1)
        }, function (error, one) {
            assert(one, 1, 'rerun called back')
        })
    })
}
