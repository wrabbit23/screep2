// screep2
//
//
require('prototype.room')();
require('prototype.source')();
require('prototype.spawn')();

//
//
global.lib = require("lib");
global.units = require("units");

//
//
global.creepController = require("creep-controller");
global.roomController = require("room-controller");

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

  for (var name in Game.creeps) {
      var creep = Game.creeps[name];
      creepController.run(creep);
  };

}
