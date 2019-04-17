var should = require('should')
var helper = require('node-red-node-test-helper')
var temperatureNode = require('../temperature.js')
var json = require('./temperature.json')
describe('temperature Node', function() {
  afterEach(function() {
    helper.unload()
  })

  it('should be loaded', function(done) {
    var flow = [{ id: 'n1', type: 'temperature', name: 'test name' }]
    helper.load(temperatureNode, flow, function() {
      var n1 = helper.getNode('n1')
      n1.should.have.property('name', 'test name')
      done()
    })
  })

  it('should output date-temperature-map', function(done) {
    var flow = [
      { id: 'n1', type: 'temperature', name: 'test name', outputs: 2, wires: [['n2'], ['n3']] },
      { id: 'n2', type: 'helper' },
      { id: 'n3', type: 'helper' }
    ]
    helper.load(temperatureNode, flow, function() {
      var n2 = helper.getNode('n2')
      var n3 = helper.getNode('n3')
      var n1 = helper.getNode('n1')
      n3.on('input', function(msg) {
        msg.should.have.property('payload', json)
        done()
      })
    })
  })
})
