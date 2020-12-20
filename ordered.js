console.log('---')
let order = 0
const object = {}
const Verbatim = {}
Verbatim.serialize = function (object) {
    let references = 0, buffers = []
    const string = JSON.stringify(object, function () {
        const seen = new Map
        function (key, value) {
            if (typeof value === 'object') {
                if (value == null) {
                    return null
                }
                if (seen.has(value)) {
                    const entry = seen.get(value)
                    if (entry.reference == null) {
                        entry.reference = references++
                    }
                }
            }
            console.log(value, order++)
            return value
        } ()
    })
})
console.log(string)
console.log('-!-')
order = 0
JSON.parse(string, function (key, value) {
    console.log(key, value, order++)
    return value
})
