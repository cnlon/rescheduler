const Rescheduler = require('../')
const doADullDoubleTask = require('./_doADullDoubleTask')

const r = new Rescheduler(async function (arglists) {
    return await doADullDoubleTask(arglists)
})
r.run('a').then(result => {
    console.log('a result: ' + result)
})
r.run('b').then(result => {
    console.log('b result: ' + result)
})
r.run('c').then(result => {
    console.log('c result: ' + result)
})
r.flush()
