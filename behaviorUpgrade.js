"use strict";

module.exports = {

	/** @param {Creep} creep **/

	//screep should upgrade the room
	upgrade: function (creep) {
		timer.start("behaviorUpgrade.run()");
		if (creep.upgradeController(creep.room.controller)===ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
		}
		timer.stop("behaviorUpgrade.run()");
	}
};
