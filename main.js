// screep2
//
//
require('prototype.spawn')();
require('prototype.source')();
require('prototype.room')();

//
//
global.units = require("units");

//
//
golbal.creepController = require("creep-controller");

//
//=============---------
module.exports.loop = function () {

  console.log('we live');

  for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      creepController.run(creep);
  };

}
