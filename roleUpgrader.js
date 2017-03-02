"use strict";

module.exports = {

	/** @param {Creep} creep **/
	run: function (creep) {
		timer.start("reoleUpgrader.run()");
		// decider
		if (creep.memory.upgrading && creep.carry.energy===0) {
			let roomCreeps = Room.getCreepsByRole(creep.room.name);
			let roomCreepNeed = creep.room.getCreepNeed();
			let suppliers = (roomCreeps.supplier || []).length;
			let builders = (roomCreeps.builder || []).length;
			let maintainers = (roomCreeps.maintainer || []).length;

			creep.memory.upgrading = false;
			creep.say('need more resources');

			// try reassigning if we are overbooked or other roles are looking lean
			if (roomCreeps.upgrader && (roomCreeps.upgrader.length > roomCreepNeed || (suppliers < roomCreepNeed.supplier|| builders < roomCreepNeed.builder|| maintainers < roomCreepNeed.maintainer)))
				creep.assignRole();
		} else if (!creep.memory.upgrading && creep.carry.energy===creep.carryCapacity) {
			creep.memory.upgrading = true;
			creep.say('upgrading');
		}

		// doer
		if (creep.memory.upgrading) {
			behaviorUpgrade.upgrade(creep);
		}
		else {
			behaviorEnergy.buy(creep);
		}
		timer.stop("reoleUpgrader.run()");
	}
};
