exports.serialize = function (object) {
    const seen = new Map, references = []
    function serialize (path, value, buffers) {
        switch (typeof value) {
        case 'object':
            if (seen.has(value)) {
                return [ '_reference', path, seen.get(value) ]
            }
            if (value === null) {
                return null
            } else if (Array.isArray(value)) {
                seen.set(value, path)
                const array = [ '_array' ]
                for (let i = 0, I = value.length; i < I; i++) {
                    array.push(serialize(path.concat(i), value[i], buffers))
                }
                return array
            } else if (value instanceof BigInt) {
                return [ '_bigint_object', String(value.valueOf()) ]
            } else if (value instanceof Date) {
                return [ '_date', value.getTime() ]
            } else if (Buffer.isBuffer(value)) {
                seen.set(value, path)
                const index = buffers.length
                buffers.push(value)
                return [ '_buffer', index ]
            } else {
                seen.set(value, path)
                const object = {}
                for (const name in value) {
                    object[name] = serialize(path.concat(name), value[name], buffers)
                }
                return object
            }
        case 'function':
            throw new Error
        case 'undefined':
            return [ '_undefined' ]
        case 'number':
            switch (value) {
            case Infinity:
                return [ '_infinity', 1 ]
            case -Infinity:
                return [ '_infinity', -1 ]
            default:
                return value
            }
        case 'bigint':
            return [ '_bigint', String(value) ]
        default:
            return value
        }
    }
    const buffers = []
    return [ Buffer.from(JSON.stringify(serialize([], object, buffers))) ].concat(buffers)
}

exports.deserialize = function (buffers) {
    const references = []
    function deserialize (value) {
        if (Array.isArray(value)) {
            switch (value[0]) {
            case '_array':
                value.shift()
                for (let i = 0, I = value.length; i < I; i++) {
                    value[i] = deserialize(value[i])
                }
                return value
            case '_date':
                return new Date(value[1])
            case '_infinity':
                return Infinity * value[1]
            case '_reference':
                value.shift()
                references.push(value)
                return null
            case '_buffer':
                return buffers[value[1]]
            case '_undefined':
                return function () {} ()
            case '_bigint':
                return BigInt(value[1])
            case '_bigint_object':
                return Object(BigInt(value[1]))
            }
        }
        if (value == null) {
            return null
        }
        if (typeof value == 'object') {
            for (const name in value) {
                value[name] = deserialize(value[name])
            }
        }
        return value
    }
    const object = deserialize(JSON.parse(buffers.shift().toString()))
    for (const [ to, from ] of references) {
        let value = object, i = 0
        for (const part of from) {
            value = value[part]
        }
        let collection = object
        for (let I = to.length - 1; i < I; i++) {
            collection = collection[to[i]]
        }
        collection[to[i]] = value
    }
    return object
}
