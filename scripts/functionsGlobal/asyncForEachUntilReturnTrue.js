const asyncForEachUntilReturnTrue = async (array, callback) => {
    for (let i = 0; i < array.length; i++) {
        const res = await callback(array[i], i, array)
        
        if (res && res !== 'err')
            return i
        else if (res === 'err')
            return 'err'
    }
    return array.length
}

module.exports = asyncForEachUntilReturnTrue