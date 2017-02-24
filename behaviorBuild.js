"use strict";

module.exports = {

	/** @param {Creep} creep **/

	//look for construction sites
	build: function (creep) {
		let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
		if (targets.length) {
			creep.say("Build!");
			let buildLocation = creep.pos.findClosestByPath(targets)
			if (creep.build(buildLocation) == ERR_NOT_IN_RANGE) {
				creep.moveTo(buildLocation);
			}
		} else {
			creep.memory.building = false;
			return false;
		}

	}
};
