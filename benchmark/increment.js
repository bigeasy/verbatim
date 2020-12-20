const Verbatim = require('../verbatim')
const _Verbatim = require('../_verbatim')

const Benchmark = require('benchmark').Benchmark

const suite = new Benchmark.Suite('frame')

const array = [], o = {}
for (i = 0; i < 1024; i++) {
    array.push(i)
    o[i] = i
}

const duplicate = { a: 1 }
const object = {
    b: duplicate, array, object: o
}

function _cycle (object) {
    return _Verbatim.deserialize(_Verbatim.serialize(object))
}

function cycle (object) {
    return Verbatim.deserialize(Verbatim.serialize(object))
}

let count = 0

for (var i = 0; i < 4; i++)  {
    suite.add({
        name: ' Verbatim ' + i,
        fn: function () {
            const copy = { ...object }
            copy[count++] = 1
            cycle(copy)
        }
    })
    suite.add({
        name: '_Verbatim ' + i,
        fn: function () {
            const copy = { ...object }
            copy[count++] = 1
            _cycle(copy)
        }
    })
}

suite.on('cycle', function(event) {
    console.log(String(event.target));
})

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})

suite.run()
