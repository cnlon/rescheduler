module.exports = function doADullDoubleTask (arglists) {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = arglists.map(arglist => {
                return arglist[0] + arglist[0]
            })
            resolve(results)
        }, 1000)
    })
}
