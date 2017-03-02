"use strict";

module.exports = {

	/** @param {Creep} creep **/
	run: function (creep) {
		timer.start("roleMaintainer.run()");
		//build if you can, harvest if you must
		if (creep.memory.repairing) {
			if (creep.energy > 0) {
				if (creep.memory.repairing) {
					creep.say('im repairing');
					behaviorMaintain.repair(creep);
				}
			} else {
				creep.memory.repairing = false;
			}
		} else {
			if (creep.energy === creep.carryCapacity) {
				creep.memory.repairing = true;
			} else {
				behaviorEnergy.buy(creep);
			}
		}
		timer.stop("roleMaintainer.run()");
	}
};
