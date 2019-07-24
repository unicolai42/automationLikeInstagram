const asyncForEach = async (array, callback) => {
    for (let i = 0; i < array.length; i++) {
        const res = await callback(array[i], i, array)
        if (res === 'err')
            return 'err'
    }
}

module.exports = asyncForEach