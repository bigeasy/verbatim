exports.serialize = function (object) {
    const seen = new Set, references = new Map
    let reference = 0
    function visit (value) {
        if (typeof value == 'object' && value != null) {
            if (seen.has(value)) {
                references.set(value, { reference: reference++, holder: null, written: false })
            } else {
                seen.add(value)
            }
            if (Array.isArray(value)) {
                for (let i = 0, I = value.length; i < I; i++) {
                    visit(value[i])
                }
            } else {
                for (const key in value) {
                    visit(value[key])
                }
            }
        }
    }
    visit(object)
    const json = JSON.stringify(object, function (key, value) {
        switch (typeof value) {
        case 'object':
            if (references.has(value)) {
                const entry = references.get(value)
                if (entry != null) {
                    if (entry.written) {
                        return [ '_reference', entry.reference ]
                    }
                    if (entry.holder == null) {
                        return entry.holder = [ '_reference', entry.reference, value ]
                    }
                    if (entry.holder === this) {
                        entry.written = true
                        return value
                    }
                }
            }
            if (object == null) {
                return null
            }
            if (Array.isArray(value)) {
                if (
                    value.length > 0 &&
                    typeof value[0] == 'string' &&
                    value[0][0] == '_'
                ) {
                    return [ '_array' ].concat(value)
                }
                return value
            }
            if (value instanceof Date) {
                return [ '_date', value.getTime() ]
            }
            if (Buffer.isBuffer(value)) {
                const index = buffers.length
                buffers.push(value)
                return [ '_buffer', index ]
            }
            return value
        case 'undefined':
            return [ '_undefined' ]
        default:
            return value
        }
    })
    const buffers = []
    return [ Buffer.from(json) ].concat(buffers)
}

exports.deserialize = function (buffers) {
    const references = []
    const object = JSON.parse(buffers.shift().toString(), function (key, value) {
        if (value == null) {
            return null
        }
        if (Array.isArray(value)) {
            if (value[0][0] != '_') {
                return value
            }
            switch (value[0]) {
            case '_array':
                value.shift()
                return value
            case '_date':
                return new Date(value[1])
            case '_reference':
                let reference = references[value[1]]
                if (reference == null) {
                    references[value[1]] = reference = { value: null, backlog: [] }
                }
                reference.backlog.push({ holder: this, key: key })
                if (value.length == 3) {
                    reference.value = value[2]
                }
                return null
            case '_buffer':
                return buffers[value[1]]
            case '_undefined':
                return function () {} ()
            default:
                return value
            }
        }
        return value
    })
    for (let i = 0, I = references.length; i < I; i++) {
        const reference = references[i]
        for (let j = 0, J = reference.backlog.length; j < J; j++) {
            const entry = references[i].backlog[j]
            entry.holder[entry.key] = reference.value
        }
    }
    return object
}
