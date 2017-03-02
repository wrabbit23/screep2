"use strict";

module.exports = {

	/** @param {Creep} creep **/
	run: function (creep) {
		timer.start("roleBuilder.run()");
		//build if you can, harvest if you must
		if (creep.memory.building) {
			if (creep.energy > 0) {
				if (creep.memory.building) {
					creep.say('im building');
					behaviorBuild.build(creep);
				}
			} else {
				creep.memory.building = false;
			}
		} else {
			if (creep.energy === creep.carryCapacity) {
				creep.memory.building = true;
			} else {
				behaviorEnergy.buy(creep);
			}
		}
		timer.stop("roleBuilder.run()");
	}
};
