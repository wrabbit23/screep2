"use strict";

module.exports = {

	/** @param {Creep} creep **/
	run: function (creep) {
		timer.start("roleSupplier.run()");
		if (creep.memory.delivering) {
			if (creep.carry.energy > 0) {
				if (!behaviorEnergy.deliver(creep)) {
					console.log(creep.name + ' cant deliver');
					creep.role = "upgrader";
				}
			} else {
				creep.memory.delivering = false;
			}
		} else if (creep.carry.energy < creep.carryCapacity) {
			behaviorEnergy.buy(creep);
		}
		else {
			creep.memory.delivering = true;
		}
		timer.stop("roleSupplier.run()");
	}
};
