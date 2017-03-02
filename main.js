// screep2
//
//
"use strict";


/***********************************************************************************************************************
 * Start global timers
 */
global.timer = require("timer");
timer.first(true);

/***********************************************************************************************************************
 * game prototypes
 */
require('Creep.prototype');
require('Source.prototype');
require('Room.prototype');
require('RoomPosition.prototype');
require('Spawn.prototype');
require('StructureContainer.prototype');
require('StructureController.prototype');
require('StructureStorage.prototype');
require('StructureTower.prototype');

/***********************************************************************************************************************
 * globals
 */
require("globals");

// global start --------------------------------------------------------------------------------------------------------
cpuManager.log(`>>>> Global Start : ${Game.time} <<<<`);

cacheManager.init();

// main loop -----------------------------------------------------------------------------------------------------------
module.exports.loop = function () {
	timer.first();
	timer.start('module.exports.loop()');
	//delete Memory.rooms[undefined]; // WTF WHY IS THIS HAPPENING!!!

	let active = false;
	let cpuMode = cpuManager.getThrottleMode();

	// cpu throttle
	active = cpuManager.getCPUActive(cpuMode);

	//--------------------------------------------------------------------------------------------------------------
	// Do stuffs
	cleanupMemory();
	if (active) {
		// update caches
		Room.buildCreepCache();
		// loop over rooms and run the roomController
		for (let name in Game.rooms) {
			let room = Game.rooms[name];
			if (room.isMine) {
				room.update();
				room.run();
			}
		}
	}

	//--------------------------------------------------------------------------------------------------------------
	// END
	cpuManager.tickTrack();
	timer.stop('module.exports.loop()');
	timer.last();
};

/**
 * Deletes memory for creeps that do not exist.
 */
function cleanupMemory() {
	timer.start("main.cleanupMemory()");
	_.forEach(Memory.creeps, (m, c) => {
		if (Game.creeps[c] === undefined) {
			let mem = Memory.creeps[c];
			if (mem !== undefined) {
				delete Memory.creeps[c];
			}
		}
	});
	timer.stop("main.cleanupMemory()");
};