"use strict";

global.cacheManager = require("cacheManager");
global.cpuManager = require("cpuManager");
global.diplomacyManager = require("diplomacyManager");
global.lib = require("lib");
global.logging = require("logging");

global.roleSupplier = require("roleSupplier");
global.roleUpgrader = require("roleUpgrader");
global.roleBuilder = require("roleBuilder");
global.roleBuilder = require("roleBuilder");
global.roleMaintainer = require("roleMaintainer");
global.behaviorEnergy = require("behaviorEnergy");
global.behaviorUpgrade = require("behaviorUpgrade");
global.behaviorBuild = require("behaviorBuild");
global.behaviorMaintain = require("behaviorMaintain");

// settings
global.config = require("config");
global.units = require("units");

// constants
global.C = require("C");
global.RAMPART_UPKEEP = RAMPART_DECAY_AMOUNT / REPAIR_POWER / RAMPART_DECAY_TIME;
global.ROAD_UPKEEP = ROAD_DECAY_AMOUNT / REPAIR_POWER / ROAD_DECAY_TIME;
global.CONTAINER_UPKEEP = CONTAINER_DECAY / REPAIR_POWER / CONTAINER_DECAY_TIME_OWNED;
global.REMOTE_CONTAINER_UPKEEP = CONTAINER_DECAY / REPAIR_POWER / CONTAINER_DECAY_TIME;
global.STRUCTURE_ALL_NOWALL = "allNoWall";
global.STRUCTURE_ALL_WALL = "allWall";

global.STRUCTURES = [STRUCTURE_SPAWN , STRUCTURE_EXTENSION , STRUCTURE_ROAD , STRUCTURE_WALL , STRUCTURE_RAMPART , STRUCTURE_KEEPER_LAIR , STRUCTURE_PORTAL ,
	STRUCTURE_CONTROLLER , STRUCTURE_LINK , STRUCTURE_STORAGE , STRUCTURE_TOWER , STRUCTURE_OBSERVER , STRUCTURE_POWER_BANK , STRUCTURE_POWER_SPAWN , STRUCTURE_EXTRACTOR ,
	STRUCTURE_LAB , STRUCTURE_TERMINAL , STRUCTURE_CONTAINER , STRUCTURE_NUKER];

// anon functions
global.af = {
	goid: id => Game.getObjectById( id ),
	ogoid: o => Game.getObjectById( o.id ),
};
