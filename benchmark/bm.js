function bm (suitename, options) {
  console.log(suitename)
  for (var key in options) {
    if (!options.hasOwnProperty(key)) continue
    try {
      var result = bm.runBenchmark(options[key])
      console.log('    x ' + result.rate + ' op/sec - ' + key)
    } catch (e) {
      console.log(e.stack)
    }
  }
}

bm.timeout = 3

bm.runBenchmark = function runBenchmark (fn) {
  var start = +new Date()
  var timeout = bm.timeout
  var elapsed
  var iterations = 0

  while (true) {
    fn()
    iterations += 1
    elapsed = (+new Date() - start) / 1000
    if (elapsed > timeout) break
  }

  var time = elapsed
  var rate = iterations / time

  return { time: time, rate: Math.round(rate), iterations: iterations }
}

module.exports = bm
