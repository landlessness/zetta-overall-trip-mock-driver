var Device = require('zetta-device');
var util = require('util');

var TIMEOUT = 3000;
var INTERVAL = 1000;

function degToRad(x) {
  return x * ( Math.PI / 180 );
}

var InstantDriving = module.exports = function(opts) {
  Device.call(this);
  this.opts = opts || {};

  this.vehicleSpeed = 0;
  this._vehicleSpeedIncrement = 2;
  this._vehicleSpeedHigh = 321.0;
  this._vehicleSpeedTimeOut = null;
  this._vehicleSpeedCounter = 0;
  
  this.drivingConditionsRisk = 'low';

};
util.inherits(InstantDriving, Device);

InstantDriving.prototype.init = function(config) {
  var name = this.opts.name || 'Overall Trip';

  config
    .name(name)
    .type('overall-trip')
    .state('moderate')
    .when('low', {allow: ['make-driving-behavior-risk-moderate', 'make-driving-behavior-risk-high']})
    .when('moderate', {allow: ['make-driving-behavior-risk-high', 'make-driving-behavior-risk-low']})
    .when('high', {allow: ['make-driving-behavior-risk-low', 'make-driving-behavior-risk-moderate']})
    .map('make-driving-behavior-risk-low', this.makeDrivingBehaviorRiskLow)
    .map('make-driving-behavior-risk-moderate', this.makeDrivingBehaviorRiskModerate)
    .map('make-driving-behavior-risk-high', this.makeDrivingBehaviorRiskHigh)
    .monitor('drivingConditionsRisk')
    .monitor('vehicleSpeed')
    .monitor('distance')
    .monitor('tripDuration')
    .monitor('batteryPercentage')
    .monitor('enginePower')

  this._startMockData(function(){});

};

InstantDriving.prototype.makeDrivingBehaviorRiskLow = function(cb) {
  this.state = 'low';
  cb();
}

InstantDriving.prototype.makeDrivingBehaviorRiskModerate = function(cb) {
  this.state = 'moderate';
  cb();
}

InstantDriving.prototype.makeDrivingBehaviorRiskHigh = function(cb) {
  this.state = 'high';
  cb();
}

InstantDriving.prototype._startMockData = function(cb) {
  var self = this;
  this._vehicleSpeedTimeOut = setInterval(function() {
    self.vehicleSpeed = (Math.sin(degToRad(self._vehicleSpeedCounter)) + 1.0) * self._vehicleSpeedHigh / 2;
    self._vehicleSpeedCounter += self._vehicleSpeedIncrement;
    cb();
  }, INTERVAL);
}

InstantDriving.prototype._stopMockData = function(cb) {
  clearTimeout(this._vehicleSpeedTimeOut);
  cb();
}
