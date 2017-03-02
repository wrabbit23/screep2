"use strict";

module.exports = {

	/** @param {Creep} creep **/

	//look for construction sites
	build: function (creep) {
		timer.start("behaviorBuild.build()");
		let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
		if (targets.length) {
			creep.say("Build!");
			let buildTarget = creep.pos.findClosestByRange(targets);
			let buildResult = creep.build(buildTarget);
			if (buildResult === ERR_NOT_IN_RANGE) {
				creep.moveTo(buildTarget);
			}
			else if (buildResult === OK && buildTarget.structureType === STRUCTURE_RAMPART)
			{
				creep.role = "maintainer";
			}
			timer.stop("behaviorBuild.build()");
			return true;
		} else {
			creep.memory.building = false;
			creep.role = "upgrader";
			timer.stop("behaviorBuild.build()");
			return false;
		}

	}
};
