var util = require('util');
var extend = require('node.extend');

var IMAGE_URL_ROOT = 'https://raw.githubusercontent.com/landlessness/zetta-overall-trip-mock-driver/master/example/images/';
var IMAGE_EXTENSION = '.png';

var stateImageForDevice = function(device) {
  return IMAGE_URL_ROOT + device.type + '-' + device.state + IMAGE_EXTENSION;
}

module.exports = function(server) {
  // TODO: swap with server.ql and text
  var OverallTripQuery = server.where({type: 'overall-trip'});
  server.observe([OverallTripQuery], function(OverallTrip) {
    OverallTrip.style = extend(true, OverallTrip.style, {properties: {}});
    OverallTrip.style.properties = extend(true, OverallTrip.style.properties, {
      vehicleSpeed: {
        display: 'billboard',
        significantDigits: 1,
        symbol: 'km/h'
      }
    });
    var states = Object.keys(OverallTrip._allowed);
    for (i = 0; i < states.length; i++) {
      OverallTrip._allowed[states[i]].push('_update-state-image');
    }
    OverallTrip._transitions['_update-state-image'] = {
      handler: function(imageURL, tintMode, foregroundColor, cb) {
        if (tintMode !== 'template') {
          tintMode = 'original';
        }
        OverallTrip.style.properties = extend(true, OverallTrip.style.properties, {
          stateImage: {
            url: imageURL,
            tintMode: tintMode
          }
        });
        if (foregroundColor) {
          OverallTrip.style.properties.stateImage.foregroundColor = foregroundColor;
        }
        cb();
      },
      fields: [
        {name: 'imageURL', type: 'text'},
        {name: 'tintMode', type: 'text'},
        {name: 'foregroundColor', type: 'text'}
      ]
    };
    OverallTrip.call('_update-state-image', stateImageForDevice(OverallTrip), 'original', null);
    var stateStream = OverallTrip.createReadStream('state');
    stateStream.on('data', function(newState) {
      OverallTrip.call('_update-state-image', stateImageForDevice(OverallTrip), 'original', null);
    });
    OverallTrip.style.actions = extend(true, OverallTrip.style.actions, {'_update-state-image': {display: 'none'}});
  });
}