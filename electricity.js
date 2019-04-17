const request = require('request')

module.exports = function(RED) {
  function ElectricityNode(config) {
    RED.nodes.createNode(this, config)

    var CronJob = require('cron').CronJob
    var node = this
    var msg1 = {}
    var msg2 = {}

    // Get Request for new electricity data every hour
    new CronJob(
      '0 0 * * *',
      () => {
        getElectricityData()
      },
      null,
      true,
      'America/Los_Angeles'
    )

    // Get electricity data at start
    getElectricityData()

    function getElectricityData() {
      request('http://localhost:3000/api/electricity', function(error, response, body) {
        console.error('error:', error) // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received

        // If request was successful, parse JSON and format historical data for "chart" node
        if (!error && response.statusCode == '200') {
          let rawData = JSON.parse(body)
          let chartData = [[]]
          if (rawData.history) {
            const timestamps = Object.keys(rawData.history)
            const temps = Object.values(rawData.history)
            for (var i = 0; i < timestamps.length; i++) {
              //Only show historical data in the given timespan
              if (
                timestamps[i] >= new Date(config.from).getTime() &&
                timestamps[i] <= new Date(config.until).getTime()
              )
                chartData[0].push({ x: parseInt(timestamps[i]), y: temps[i] })
            }
          }

          // don't pass historical data on output 1
          msg1.payload = Object.assign({}, rawData)
          delete msg1.payload.history
          msg2.payload = [{ series: ['Electricity'], data: chartData, labels: [''] }]
          node.send([msg1, msg2])
        }
      })
    }
  }
  RED.nodes.registerType('electricity', ElectricityNode)
}
