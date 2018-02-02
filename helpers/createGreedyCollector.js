function* GreedyCollector () {
    while (true) {
        yield
    }
}

module.exports = function createGreedyCollector () {
    return GreedyCollector
}
