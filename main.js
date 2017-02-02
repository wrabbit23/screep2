// screep2
//
//
require('prototype.room')();
require('prototype.source')();
require('prototype.spawn')();

require("constants");
//
//
global.lib = require("lib");
global.units = require("units");

//
//
global.creepController = require("creep-controller");
global.roomController = require("room-controller");
global.roleHarvester = require("role-harvester")
global.roleUpgrader = require("role-upgrader")
global.roleBuilder = require("role-builder")
global.behaviorEnergy = require("behavior-energy")
global.behaviorUpgrade = require("behavior-upgrade")
global.behaviorBuild = require("behavior-build")

//
//=============---------
module.exports.loop = function () {

  console.log('we live');

  for (var name in Game.rooms) {
    var room = Game.rooms[name];
    if (room.isMine()) {
      roomController.run(room);
    }
  };

}
