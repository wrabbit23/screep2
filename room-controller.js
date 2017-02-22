"use strict";

module.exports = {
		/** @param {Room} room **/
		run: function (room) {

			//init the memory cache
			let roomCreeps = Room.getCreeps(room.name);

			//decide on population needs
			let creepNeed = _.sum(room.getCreepNeed());

			if (roomCreeps.length < creepNeed) {
				Game.getObjectById(room.memory.cache.structures.spawn[0]).spawnUnitByEnergy('worker', room.energyAvailable);
			}

			//run creeps in the room
			for (let name in roomCreeps) {
				let creep = roomCreeps[name];
				creepController.run(creep);
			}
		}
};

