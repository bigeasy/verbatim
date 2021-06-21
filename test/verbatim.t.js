require('proof')(20, okay => {
    const Verbatim = require('..')

    function cycle (value) {
        return Verbatim.deserialize(Verbatim.serialize(value))
    }

    okay(cycle(1), 1, 'number')
    okay(cycle(Infinity), Infinity, 'infinity')
    okay(cycle(-Infinity), -Infinity, 'negative infinity')
    okay(cycle(true), true, 'true')
    okay(cycle(false), false, 'false')
    okay(cycle(1.8282), 1.8282, 'float')
    okay(cycle(null), null, 'null')
    okay(cycle({ a: 1 }), { a: 1 }, 'object')
    okay(cycle([ 1 ]), [ 1 ], 'array')
    okay(cycle([][0]), [][0], 'undefined')
    okay(cycle(new Date(0)), new Date(0), 'date')
    okay(cycle(new Date(0)) instanceof Date, 'date type')
    const object = { a: 1 }
    okay(cycle({ a: [object], b: [object] }), { a: [{ a: 1 }], b: [{ a: 1 }] }, 'reference')
    const referenced = cycle({ a: [ object ], b: [ object ] })
    okay(referenced.a[0] === referenced.b[0], 'referenced same')
    const node = { node: null }
    node.node = node
    const recursive = cycle(node)
    okay(node.node === node, 'recursive')

    const test = []
    try {
        cycle(function () {})
    } catch (e) {
        test.push(true)
    }
    okay(test, [ true ], 'function')

    const buffered = Verbatim.serialize(Buffer.from('a'))
    okay(buffered.length, 2, 'buffer parts')
    const buffer = Verbatim.deserialize(buffered)
    okay(Buffer.isBuffer(buffer), 'is buffer')
    okay(buffer.toString(), 'a', 'buffer')

    okay(cycle({ a: null, b: null }), { a: null, b: null }, 'null should no created references')
})
