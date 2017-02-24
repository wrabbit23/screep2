"use strict";

module.exports = {

	/** @param {Creep} creep **/

	//look for construction sites
	repair: function (creep) {
		let structuresWall = Room.getStructuresType(roomName, STRUCTURE_ALL_WALL);
		let noWallRepairSites = _.filter(structuresNoWall, (s) => s.hits < (s.hitsMax * config.repairFactor));
		let wallRepairSites = _.filter(structuresWall, (s) => s.hits < (wallHP * config.repairFactor));
		let repairSites = [...noWallRepairSites, ...wallRepairSites];

		if (repairSites.length) {
			let buildLocation = creep.pos.findClosestByPath(repairSites);
			if (creep.repair(buildLocation) === ERR_NOT_IN_RANGE) {
				creep.moveTo(buildLocation);
			}
		} else {
			creep.memory.repairing = false;
			creep.assignRole();
			return false;
		}

	}
};
