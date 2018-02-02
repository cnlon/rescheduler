const createGreedyCollector = require('./helpers/createGreedyCollector')

const SYMBOL_ADD = Symbol('add')
const SYMBOL_CLEAR = Symbol('clear')
const GreedyCollector = createGreedyCollector()

/**
 * @typedef Deferred
 * @type {Object}
 * @property {function(*)} resolve
 * @property {function(Error)} reject
 *
 * @typedef Deferreds
 * @type {Object}
 * @property {function(Array): Deferred} get
 * @property {function(Array, Deferred)} set
 */

module.exports = class Rescheduler {

    /**
     * @param {function(Array<Array>, Deferreds): Array|Promise} map
     * @param {function(Rescheduler): {next:function(Array<Array>, Deferreds, Rescheduler)}} [Collector=GreedyCollector]
     */

    constructor (map, Collector = GreedyCollector) {
        /** @type {Array<Array>} */
        this.arglists = []
        /** @type {Deferreds} */
        this.deferreds = new WeakMap()
        this.map = map
        this.collector = Collector.call(this, this)
        this.collector.next()
    }

    /**
     * @param {...*}
     * @return {Promise}
     */

    run (...arglist) {
        arglist = this.collector.next(arglist).value || arglist
        if (typeof arglist['then'] === 'function') {
            return arglist
        }
        return this[SYMBOL_ADD](arglist)
    }

    /**
     * @param {Error=} error
     */

    async flush (error) {
        if (this.arglists.length === 0) {
            return
        }
        if (error) {
            return this.rejectAll(error)
        }
        const arglists = this[SYMBOL_CLEAR]()
        let results
        try {
            results = await this.map(arglists, this.deferreds)
        } catch (error) {
            this.rejectAll(error, arglists)
            return
        }
        if (!Array.isArray(results) || results.length === 0) {
            return
        }
        this.resolveAll(results, arglists)
    }

    /**
     * @param {Array} results
     * @param {Array<Array>=} arglists
     */

    resolveAll (results, arglists = this[SYMBOL_CLEAR]()) {
        let i = 0
        let arglist, deferred
        for (const result of results) {
            arglist = arglists[i++]
            deferred = this.deferreds.get(arglist)
            deferred.resolve(result)
        }
    }

    /**
     * @param {Error} error
     * @param {Array<Array>=} arglists
     */

    rejectAll (error, arglists = this[SYMBOL_CLEAR]()) {
        let deferred
        for (const arglist of arglists) {
            deferred = this.deferreds.get(arglist)
            deferred.reject(error)
        }
    }

    /**
     * @private
     * @param {Array} arglist
     * @param {Deferred} deferred
     * @return {Promise}
     */

    [SYMBOL_ADD] (arglist, deferred) {
        this.arglists.push(arglist)
        return new Promise((resolve, reject) => {
            this.deferreds.set(arglist, {resolve, reject})
        })
    }

    /**
     * @private
     * @return {Array<Array>}
     */

    [SYMBOL_CLEAR] () {
        return this.arglists.splice(0)
    }

    /**
     * @param {function(Array<Array>, Deferreds): Array|Promise} map
     * @param {function(function(), function(Error), Array<Array>, Deferreds, Rescheduler): {next:function()}} [Collector=GreedyCollector]
     * @return function(...*): Promise
     * @property {function(Error)} flush
     */

    static reschedule (...arglist) {
        const rescheduler = new Rescheduler(...arglist)
        const run = function run (...arglist) {
            return rescheduler.run(...arglist)
        }
        run.flush = error => rescheduler.flush(error)
        return run
    }
}
