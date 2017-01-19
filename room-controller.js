var roomController = {

    /** @param {Room} room **/
    run: function(room) {

      //init the memory cache
      room.initMemCache(true);
      roomCreeps = room.getCreeps();

      //decide on population needs
      if (roomCreeps.length<1) {
        Game.getObjectById(room.memory.cache.structures.spawn[0]).spawnUnitByEnergy('worker', room.getSpawnEnergy().energy)
      }

      //run creeps in the room
      for (var name in roomCreeps) {
          var creep = roomCreeps[name];
          creepController.run(creep);
      };

  }
}
module.exports = roomController;
