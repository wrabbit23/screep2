"use strict";

module.exports = {

	/** @param {Creep} creep **/

	//look for construction sites
	repair: function (creep) {
		timer.start("behaviorMaintain.repair()");
		let structuresWall = Room.getStructuresType(creep.room.name, STRUCTURE_ALL_WALL);
		let structuresNoWall = Room.getStructuresType(creep.room.name, STRUCTURE_ALL_NOWALL);
		let noWallRepairSites = _.filter(structuresNoWall, (s) => s.hits < (s.hitsMax * config.repairFactor));
		let wallRepairSites = _.filter(structuresWall, (s) => s.hits < (config.wallHP[creep.room.controller.level] * config.repairFactor));
		let repairSites = [...noWallRepairSites, ...wallRepairSites];

		if (repairSites.length) {
			let buildLocation = creep.pos.findClosestByPath(repairSites);
			if (creep.repair(buildLocation) === ERR_NOT_IN_RANGE) {
				creep.moveTo(buildLocation);
			}
			timer.stop("behaviorMaintain.repair()");
			return true;
		} else {
			creep.memory.repairing = false;
			creep.role = "upgrader";
			timer.stop("behaviorMaintain.repair()");
			return false;
		}

	}
};
