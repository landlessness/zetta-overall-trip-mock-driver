var zetta = require('zetta');
var Automobile = require('../index');
var style = require('./apps/style');
var argv = require('minimist')(process.argv.slice(2));

var increment = argv['i'];

zetta()
  .use(Automobile, {increment: increment})
  .use(style)
  .link('http://dev.zettaapi.org')
  .listen(1337);
