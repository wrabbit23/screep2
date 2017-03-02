"use strict";

Room.prototype.run = function () {
	timer.start("Room.prototype.run()");
	//console.log(`room-controller.run(): ${this.name}`);
	//init the memory cache
	let roomCreeps = Room.getCreeps(this.name);

	//decide on population needs
	let creepNeed = lib.clamp(_.sum(this.getCreepNeed()), 2, 12);

	// if we have less creeps than we need, spawn one
	if (roomCreeps.length < creepNeed) {
		if (roomCreeps.length <= 2)
			Game.getObjectById(this.memory.cache.structures.spawn[0]).spawnUnitByEnergy('worker', this.energyAvailable);
		else
			Game.getObjectById(this.memory.cache.structures.spawn[0]).spawnUnitByEnergy('worker', this.energyCapacityAvailable);
	}

	//console.log(`room-controller.run(): ${this.name} Creeps: ${roomCreeps.length} Needed: ${creepNeed}`);

	//run creeps in the room
	for (let name in roomCreeps) {
		let creep = roomCreeps[name];
		creep.run();
	}
	timer.stop("Room.prototype.run()");
};

/**
 *
 * @returns {module.exports.defaultCreepNeed|{harvester, upgrader, builder, maintainer}|*}
 */
Room.prototype.getCreepNeed = function () {
	timer.start("Room.prototype.getCreepNeed()");
	let wallHP = config.wallHP[Room.getControllerLevel(this.name)];
	let structuresNoWall = Room.getStructuresType(this.name , STRUCTURE_ALL_NOWALL);
	let noWallRepairSites = _.filter(structuresNoWall , (s) => s.hits < (s.hitsMax * config.repairFactor));
	let structuresWall = Room.getStructuresType(this.name , STRUCTURE_ALL_WALL);
	let wallRepairSites = _.filter(structuresWall , (s) => s.hits < (wallHP * config.repairFactor));
	let repairSites = [...noWallRepairSites, ...wallRepairSites];
	let spawns = Room.getSpawns(this.name);
	let extensions = Room.getStructuresType(this.name, STRUCTURE_EXTENSION);
	let secondaries = Room.getStructuresType(this.name, STRUCTURE_TOWER);
	if(this.storage instanceof StructureStorage)
		secondaries = [...secondaries, this.storage];

	let primaryDeliveryTargets = _.filter([...spawns, ...extensions ], structure => structure.energy < structure.energyCapacity);
	let secondaryDeliveryTargets = _.filter(secondaries, structure => structure.energy < structure.energyCapacity);

	timer.stop("Room.prototype.getCreepNeed()");
	return {
		supplier: lib.clamp(primaryDeliveryTargets.length + secondaryDeliveryTargets.length, 0, 4),
		builder: lib.clamp(Room.getConstructionIds(this.name).length, 0 , 6),
		maintainer: lib.clamp(repairSites.length, 0, 4),
		upgrader: 5,
	}
};


/***********************************************************************************************************************
 * cache functions
 */

Room.prototype.update = function () {
	timer.start("Room.prototype.update()");
	let forceRefresh = this.memory.cache === {};
	this.memory.lastSeen = Game.time;
	let reservation = {};

	// update ldh reservations
	if (this.controller instanceof StructureController && this.controller.reservation !== undefined) {
		if (this.controller.reservation.username === C.ME) {
			reservation.ticksToEnd = this.controller.reservation.ticksToEnd;
		}
		else {
			reservation.ticksToEnd = 0;
		}
	}
	else {
		reservation.ticksToEnd = 0;
	}

	this.memory.reservation = reservation;

	// update room caches
	this.updateStructureCache(forceRefresh);
	this.updateConstructionCache(forceRefresh);
	this.updateSourceCache(forceRefresh);
	this.updateSpawnCache(forceRefresh);
	this.updateDroppedCache(forceRefresh);
	this.updateFlagCache(forceRefresh);
	this.processVisuals();

	this.motivateRamparts();
	this.motivateTowers();
	this.safeModeFailsafe();

	timer.stop("Room.prototype.update()");
};

/**
 * Updates the memory structure cache to reduce the number of Room.find() calls for structures
 * @param forceRefresh
 */
Room.prototype.updateStructureCache = function (forceRefresh = false) {
	timer.start("Room.prototype.updateStructureCache()");
	// insure the memory object exists
	if (this.memory.cache === undefined) {
		this.memory.cache = {};
	}
	if (this.memory.cache.structures === undefined) {
		this.memory.cache.structures = {};
		forceRefresh = true;
	}

	if (Game.time % 10 === 0) {
		forceRefresh = true;
	}

	if (forceRefresh) {
		let structures = this.memory.cache.structures;
		let roomLevel = this.controllerLevel;
		let room = this;

		_.forEach(STRUCTURES, function (s) {
			//console.log(`Type: ${s} Level: ${roomLevel}`);
			if (CONTROLLER_STRUCTURES[s] !== undefined && CONTROLLER_STRUCTURES[s][roomLevel] >= 0) {
				//console.log(`Checking ${s}...`);
				let foundStructures = room.find(FIND_STRUCTURES, {filter: st => st.structureType === s});
				//console.log(`Found ${foundStructures}...`);

				// map structure ids to the memory object
				structures[s] = _.map(foundStructures, 'id');
			}
		});

		structures[STRUCTURE_ALL_NOWALL] = _.map(room.find(FIND_STRUCTURES, {filter: s => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART}), 'id');
		structures[STRUCTURE_ALL_WALL] = _.map(room.find(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART}), 'id');
	}
	timer.stop("Room.prototype.updateStructureCache()");
};

/**
 * updateSourceCache
 * @param forceRefresh
 */
Room.prototype.updateSourceCache = function (forceRefresh = false) {
	timer.start("Room.prototype.updateSourceCache()");
	// insure the memory object exists
	if (this.memory.cache.sources === undefined) {
		this.memory.cache.sources = {};
		forceRefresh = true;
	}

	if (Game.time % 100 === 0) {
		forceRefresh = true;
	}

	if (forceRefresh) {
		let foundSources = this.find(FIND_SOURCES);
		//console.log(`Found: ${foundSources}`);

		// map structure ids to the memory object
		this.memory.cache.sources = _.map(foundSources, 'id');
		//console.log(`Result ${this.memory.cache.sources}`);
	}
	timer.stop("Room.prototype.updateSourceCache()");
};

/**
 * updateSpawnCache
 * @param forceRefresh
 */
Room.prototype.updateSpawnCache = function (forceRefresh = false) {
	timer.start("Room.prototype.updateSpawnCache()");
	// insure the memory object exists
	if (this.memory.cache.sources === undefined) {
		this.memory.cache.spawns = {};
		forceRefresh = true;
	}

	if (Game.time % 100 === 0) {
		forceRefresh = true;
	}

	if (forceRefresh) {
		let foundSpawns;
		if (this.isMine) {
			foundSpawns = this.find(FIND_MY_SPAWNS);
		}
		else {
			foundSpawns = this.find(FIND_HOSTILE_SPAWNS);
		}

		// map structure ids to the memory object
		this.memory.cache.spawns = _.map(foundSpawns, 'id');
	}
	timer.stop("Room.prototype.updateSpawnCache()");
};

/**
 * updateConstructionCache
 * @param forceRefresh
 */
Room.prototype.updateConstructionCache = function (forceRefresh = false) {
	timer.start("Room.prototype.updateConstructionCache()");
	// insure the memory object exists
	if (this.memory.cache.construction === undefined) {
		this.memory.cache.construction = {};
		forceRefresh = true;
	}

	if (Game.time % 5 === 0) {
		forceRefresh = true;
	}

	if (forceRefresh) {
		let foundConstruction = this.find(FIND_CONSTRUCTION_SITES);
		//console.log(`Found: ${foundSources}`);

		// map structure ids to the memory object
		this.memory.cache.construction = _.map(foundConstruction, 'id');
		//console.log(`Result ${this.memory.cache.sources}`);
	}
	timer.stop("Room.prototype.updateConstructionCache()");
};

/**
 * updateDroppedCache
 * @param forceRefresh
 */
Room.prototype.updateDroppedCache = function (forceRefresh = false) {
	timer.start("Room.prototype.updateDroppedCache()");
	// insure the memory object exists
	if (this.memory.cache.dropped === undefined) {
		this.memory.cache.dropped = {};
		forceRefresh = true;
	}

	if (Game.time % 5 === 0) {
		forceRefresh = true;
	}

	if (forceRefresh) {
		let foundDropped = this.find(FIND_DROPPED_RESOURCES);
		//console.log(`Found: ${foundDropped}`);

		// map structure ids to the memory object
		this.memory.cache.dropped = _.map(foundDropped, 'id');
		//console.log(`Result ${this.memory.cache.sources}`);
	}
	timer.stop("Room.prototype.updateDroppedCache()");
};

/**
 * updateFlagCache
 * @param forceRefresh
 */
Room.prototype.updateFlagCache = function (forceRefresh = false) {
	timer.start("Room.prototype.updateFlagCache()");
	let roomName = this.name;
	// insure the memory object exists
	if (this.memory.cache.flags === undefined) {
		this.memory.cache.flags = {};
		forceRefresh = true;
	}

	if (Game.time % 5 === 0) {
		forceRefresh = true;
	}

	if (forceRefresh) {
		let foundFlags = this.find(FIND_FLAGS, {
			filter: (f) => {
				return f.room.name === roomName;
			}
		});
		let flagNames = _.map(foundFlags, 'name');
		//console.log(`Found: ${foundFlags}`);

		// map structure ids to the memory object
		this.memory.cache.flags = flagNames;
		//console.log(`Result ${JSON.stringify(this.memory.cache.flags)}`);
	}
	timer.stop("Room.prototype.updateFlagCache()");
};

/***********************************************************************************************************************
 * Military functions
 *
 */

/**
 * Activates safe mode if it needs too, should only be called on my rooms.
 */
Room.prototype.safeModeFailsafe = function () {
	timer.start("Room.prototype.safeModeFailsafe()");
	//let debug = false;
	let controller = this.controller;
	//safeMode	number	How many ticks of safe mode remaining, or undefined.
	let safeMode = controller.safeMode === undefined ? 0 : controller.safeMode;
	//safeModeAvailable	number	Safe mode activations available to use.
	let safeModeAvailable = controller.safeModeAvailable === undefined ? 0 : controller.safeModeAvailable;
	//safeModeCooldown	number	During this period in ticks new safe mode activations will be blocked, undefined if cooldown is inactive.
	let safeModeCooldown = controller.safeModeCooldown === undefined ? 0 : controller.safeModeCooldown;
	let hostiles = this.threat.threats[C.RELATION_HOSTILE].length;

	if (!safeMode && safeModeAvailable && !safeModeCooldown && (this.memory.threat.level === C.THREAT_PANIC)) {
		//lib.log("!!!!!!!!!!!!!!! ACTIVATING SAFE MODE !!!!!!!!!!!!!!!" , debug);
		controller.activateSafeMode();
	}
	//lib.log(">>>> Safe Mode Status: Hostiles: " + hostiles
	//	+ " SafeMode: " + safeMode
	//	+ " SafeModeAvailable: " + safeModeAvailable
	//	+ " SafeModeCooldown: " + safeModeCooldown , debug);
	timer.stop("Room.prototype.safeModeFailsafe()");
};

/**
 * Motivates towers in a room. should only be called on one of my rooms.
 */
Room.prototype.motivateRamparts = function () {
	timer.start("Room.prototype.motivateRamparts()");
	if (this.threat.threats[C.RELATION_HOSTILE].length > 0) {
		_(Room.getStructuresType(this.name, STRUCTURE_RAMPART)).filter({isPublic: true}).forEach(r => {
			r.setPublic(false)
		});
	}
	else if (this.threat.threats[C.RELATION_ALLY].length > 0) {

		let allies = _(this.threat.threats[C.RELATION_ALLY]).map(af.ogoid).filter().value();
		_.forEach(allies, ally => {
			_.forEach(Room.getStructuresType(this.name, STRUCTURE_RAMPART), r => {
				let allyRange = ally.pos.getRangeTo(r);
				if (!r.isPublic && allyRange < 2) {
					r.setPublic(true);
				}
				else if (r.isPublic && allyRange > 1) {
					r.setPublic(false);
				}
			});
		});
	} else if (Game.time % 10 === 0) {
		_.forEach(Room.getStructuresType(this.name, STRUCTURE_RAMPART), r => {
			if (r.isPublic) {
				r.setPublic(false);
			}
		});
	}
	timer.stop("Room.prototype.motivateRamparts()");
};

/**
 * Motivates towers in a room. should only be called on one of my rooms.
 */
Room.prototype.motivateTowers = function () {
	timer.start("Room.prototype.motivateTowers()");
	// find all towers
	let towers = Room.getStructuresType(this.name, STRUCTURE_TOWER);

	if (this.threat.level >= C.THREAT_ALERT) {
		// for each tower
		towers.forEach(function (tower) {
			//tower.autoRepair();
			tower.autoCreepHeal();
			tower.autoAttack();
		}, this);
	}
	else if (Game.time % 10 === 0) {
		// for each tower
		towers.forEach(function (tower) {
			tower.autoCreepHeal();

		}, this);
	}
	timer.start("Room.prototype.motivateTowers()");
};

/***********************************************************************************************************************
 * Misc
 */

/*
 * NOTES: sentences are broken down using | to separate pieces
 *        public will default to true
 * Room.prototype.sing(sentence, public)
 *   all creeps in the room will sing parts of the sentence
 *     from top left to bottom right. the sentence will repeat
 *     if there are more creeps than parts in the sentence
 */
Room.prototype.sing = function (sentence, isPublic) {
	if (isPublic === undefined) {
		isPublic = true;
	}
	let words = sentence.split(" ");
	let creeps = _.filter(Game.creeps, (c) => c.room.name === this.name);
	creeps = _.sortBy(creeps, function (c) {
		return (c.pos.x + (c.pos.y * 50))
	});

	for (let i in creeps) {
		creeps[i].say(words[i % words.length], isPublic);
	}
};

Room.prototype.processVisuals = function () {
	_.forEach(Room.getSpawns(this.name), spawn => spawn.processVisuals());

	if (this.storage instanceof StructureStorage) {
		this.storage.processVisuals();
	}

	if (this.controller) {
		this.controller.processVisuals();
	}
};

/***********************************************************************************************************************
 ***********************************************************************************************************************
 * Static functions
 */

/**
 *
 */
Room.buildCreepCache = function () {
	timer.start("Room.buildCreepCache()");

	// init caches
	global.cache.roomCreeps = {};
	global.cache.roomUnits = {};
	global.cache.homeRoomUnits = {};
	global.cache.roomRoleUnits = {};
	global.cache.roomRole = {};

	_.forEach(Game.creeps, creep => {
		let c = global.cache;
		let cmrm = creep.memory.room;
		let cmhR = creep.memory.homeRoom;
		let cmr = creep.memory.role;
		let cmu = creep.memory.unit;

		// global.cache.roomCreeps -------------------------------------------------------------------------------------
		// create room hash if needed
		if (c.roomCreeps[cmrm] === undefined) {
			c.roomCreeps[cmrm] = [];
		}
		// add creep to cache
		c.roomCreeps[cmrm].push(creep);

		// c.roomUnits.units --------------------------------------------------------------------------------
		// create room hash if needed
		if (c.roomUnits[cmrm] === undefined) {
			c.roomUnits[cmrm] = {};
		}
		// create units hash if needed
		if (c.roomUnits[cmrm].units === undefined) {
			c.roomUnits[cmrm].units = {};
		}
		// create unit array if needed
		if (c.roomUnits[cmrm].units[cmu] === undefined) {
			c.roomUnits[cmrm].units[cmu] = [];
		}
		// add creep to cache
		c.roomUnits[cmrm].units[cmu].push(creep);

		// c.homeRoomUnits.units ----------------------------------------------------------------------------
		// create room hash if needed
		if (c.homeRoomUnits[cmhR] === undefined) {
			c.homeRoomUnits[cmhR] = {};
		}
		// create units hash if needed
		if (c.homeRoomUnits[cmhR].units === undefined) {
			c.homeRoomUnits[cmhR].units = {};
		}
		// create unit array if needed
		if (c.homeRoomUnits[cmhR].units[cmu] === undefined) {
			c.homeRoomUnits[cmhR].units[cmu] = [];
		}
		// add creep to cache
		c.homeRoomUnits[cmhR].units[cmu].push(creep);

		// c.roomRoleUnits.motivations.units ----------------------------------------------------------
		// create room hash if needed
		if (c.roomRoleUnits[cmrm] === undefined) {
			c.roomRoleUnits[cmrm] = {};
		}
		// create motivation hash if needed
		if (c.roomRoleUnits[cmrm].roles === undefined) {
			c.roomRoleUnits[cmrm].roles = {};
		}
		// create motivation value if needed
		if (c.roomRoleUnits[cmrm].roles[cmr] === undefined) {
			c.roomRoleUnits[cmrm].roles[cmr] = {};
		}
		// create units hash if needed
		if (c.roomRoleUnits[cmrm].roles[cmr].units === undefined) {
			c.roomRoleUnits[cmrm].roles[cmr].units = {};
		}
		// create units array if needed
		if (c.roomRoleUnits[cmrm].roles[cmr].units[cmu] === undefined) {
			c.roomRoleUnits[cmrm].roles[cmr].units[cmu] = [];
		}
		// add creep to cache
		c.roomRoleUnits[cmrm].roles[cmr].units[cmu].push(creep);

		// c.roomRoleUnits.motivations.units ----------------------------------------------------------
		// create room hash if needed
		if (c.roomRole[cmrm] === undefined) {
			c.roomRole[cmrm] = {};
		}
		// create motivation hash if needed
		if (c.roomRole[cmrm].roles === undefined) {
			c.roomRole[cmrm].roles = {};
		}
		if (c.roomRole[cmrm].roles[cmr] === undefined) {
			c.roomRole[cmrm].roles[cmr] = [];
		}
		// add creep to cache
		c.roomRole[cmrm].roles[cmr].push(creep);

	});

	timer.stop("Room.buildCreepCache()");
};

/**
 *
 * @param roomName
 * @returns {boolean}
 */
Room.getIsMine = function (roomName) {
	let result = false;
	let room = Game.rooms[roomName];
	if (room instanceof Room) {
		result = room.isMine;
	}
	return result;
};


/**
 * getControllerLevel
 * @param roomName
 * @returns {*}
 */
Room.getControllerLevel = function (roomName) {
	if (Game.rooms[roomName] instanceof Room) {
		let room = Game.rooms[roomName];
		if (room.memory.controllerLevel === undefined || Game.time !== room.memory.controllerLevel.lastUpdated) {
			room.memory.controllerLevel = {
				level: 0,
				lastUpdated: Game.time
			};

			if (room.controller instanceof StructureController) {
				room.memory.controllerLevel.level = room.controller.level;
			}
		}

		return room.memory.controllerLevel.level;
	}
	else {
		return _.get(Memory, `rooms.${roomName}.controllerLevel.level`, 0);
	}
};

/**
 *
 * @param roomName
 * @param structureType
 * @returns {Array}
 */
Room.getStructureIdsType = function (roomName, structureType) {
	return _.get(Memory, `rooms.${roomName}.cache.structures.${structureType}`, []);
};

/**
 *
 * @param roomName
 * @param structureType
 * @returns {T[]}
 */
Room.getStructuresType = function (roomName, structureType) {
	let ids = this.getStructureIdsType(roomName, structureType);
	return _(ids).map(af.goid).filter().value();
};

/**
 *
 * @param roomName
 * @returns {Array}
 */
Room.getConstructionIds = function (roomName) {
	return _.get(Memory, `rooms.${roomName}.cache.construction`, []);
};

/**
 *
 * @param roomName
 * @returns {T[]}
 */
Room.getConstruction = function (roomName) {
	let ids = this.getConstructionIds(roomName);
	return _(ids).map(af.goid).filter().value();
};

/**
 *
 * @param roomName
 * @returns {Array}
 */
Room.getSourceIds = function (roomName) {
	return _.get(Memory, `rooms.${roomName}.cache.sources`, []);
};

/**
 *
 * @param roomName
 * @returns {T[]}
 */
Room.getSources = function (roomName) {
	let ids = this.getSourceIds(roomName);
	return _(ids).map(af.goid).filter().value();
};

/**
 *
 * @param roomName
 * @returns {Array}
 */
Room.getDroppedIds = function (roomName) {
	return _.get(Memory, `rooms.${roomName}.cache.dropped`, []);
};

/**
 *
 * @param roomName
 * @returns {T[]}
 */
Room.getDropped = function (roomName) {
	let ids = this.getDroppedIds(roomName);
	return _(ids).map(af.goid).filter().value();
};

/**
 *
 * @param roomName
 * @returns {Array}
 */
Room.getFlagNames = function (roomName) {
	return _.get(Memory, `rooms.${roomName}.cache.flags`, []);
};

/**
 *
 * @param roomName
 * @returns {T[]}
 */
Room.getFlags = function (roomName) {
	let ids = this.getFlagNames(roomName);
	return _(ids).map(af.goid).filter().value();
};

/**
 *
 * @param roomName
 * @returns {Array}
 */
Room.getSpawnIds = function (roomName) {
	return _.get(Memory, `rooms.${roomName}.cache.structures.spawn`, []);
};

/**
 *
 * @param roomName
 * @returns {T[]}
 */
Room.getSpawns = function (roomName) {
	let ids = this.getSpawnIds(roomName);
	return _(ids).map(af.goid).filter().value();
};

Room.getThreat = function (roomName) {
	let room = Game.rooms[roomName];
	if (room instanceof Room) {
		return room.threat;
	}
	else {
		return _.get(Memory, `rooms.${roomName}.threat`, {
			lastSeen: 0,
			count: 0,
			threats: [],
			level: C.THREAT_STANDBY,
			breach: false,
			lastUpdated: 0
		});
	}
};

/***********************************************************************************************************************
 * Creep finding functions
 */

/**
 *
 * @param roomName
 * @returns {*}
 */
Room.getCreeps = function (roomName) {
	return _.has(global, `cache.roomCreeps["${roomName}"]`) ? global.cache.roomCreeps[roomName] : [];
};

/**
 *
 * @param roomName
 */
Room.countCreeps = function (roomName) {
	return Room.getCreeps(roomName).length;
};

/**
 *
 * @param roomName
 * @param unitName
 * @returns {Array}
 */
Room.getUnits = function (roomName, unitName) {
	return _.get(global, `cache.roomUnits.${roomName}.units.${unitName}`, []);
};

/**
 *
 * @param roomName
 * @param unitName
 * @returns {Number}
 */
Room.countUnits = function (roomName, unitName) {
	return Room.getUnits(roomName, unitName).length;
};

/**
 *
 * @param roomName
 * @param unitName
 */
Room.getHomeRoomUnits = function (roomName, unitName) {
	return _.get(global, `cache.homeRoomUnits.${roomName}.units.${unitName}`, []);
};

/**
 *
 * @param roomName
 * @param unitName
 * @returns {Number}
 */
Room.countHomeRoomUnits = function (roomName, unitName) {
	return Room.getHomeRoomUnits(roomName, unitName).length;
};

/**
 *
 * @param roomName
 * @param roleName
 * @param unitName
 * @returns {number}
 */
Room.countRoleUnits = function (roomName, roleName, unitName) {
	return _.get(global, `cache.roomRoleUnits.${roomName}.roles["${roleName}"].units.${unitName}.length`, 0);
};

/**
 *
 * @param roomName
 * @param roleName
 * @returns {T[]|string[]}
 */
Room.getRoleCreeps = function (roomName, roleName) {
	return _.get(global, `cache.roomRole.${roomName}.roles["${roleName}"]`, []);
};


/**
 * returns a hash of roles with creeps
 * @param roomName
 */
Room.getCreepsByRole = function (roomName) {
	return _.get(global, `cache.roomRole.${roomName}.roles`, {});
};

/***********************************************************************************************************************
 ***********************************************************************************************************************
 * properties
 */
if (Room.prototype.hasOwnProperty('breach') === false) {
	Object.defineProperty(Room.prototype, "breach", {
		get: function () {
			if (this.memory.breach === undefined || Game.time > this.memory.breach.lastUpdated + 10) {
				let result = false;
				let spawn;

				spawn = Room.getSpawns(this.name)[0];
				if (spawn instanceof Spawn) {
					result = !spawn.pos.isEnclosed();
				}

				this.memory.breach = {breach: result, lastUpdated: Game.time};
			}

			return this.memory.breach.breach;
		}
	});
}

if (Room.prototype.hasOwnProperty('containerEnergy') === false) {
	Object.defineProperty(Room.prototype, "containerEnergy", {
		get: function () {
			if (this.memory.containerEnergy === undefined || Game.time !== this.memory.containerEnergy.lastUpdated) {
				this.memory.containerEnergy = {
					energy: 0,
					energyCapacity: 0,
					lastUpdated: Game.time
				};

				_.forEach(Room.getStructuresType(this.name, STRUCTURE_CONTAINER), ex => {
					result.energy += ex.store[RESOURCE_ENERGY];
					result.energyCapacity += ex.storeCapacity;
				});
			}
		}
	});
}

if (Room.prototype.hasOwnProperty('controllerLevel') === false) {
	Object.defineProperty(Room.prototype, "controllerLevel", {
		get: function () {
			return Room.getControllerLevel(this.name);
		}
	});
}

if (Room.prototype.hasOwnProperty('energy') === false) {
	Object.defineProperty(Room.prototype, "energy", {
		get: function () {
			if (this.memory.energy === undefined || Game.time !== this.memory.energy.lastUpdated) {
				this.memory.storageEnergy = {
					energy: 0,
					energyCapacity: 0,
					lastUpdated: Game.time
				};

				result.energy += this.containerEnergy.energy;
				result.energyCapacity += this.containerEnergy.energyCapacity;

				result.energy += this.storageEnergy.energy;
				result.energyCapacity += this.storageEnergy.energyCapacity;
			}
		}
	});
}

if (Room.prototype.hasOwnProperty('extenderEnergy') === false) {
	Object.defineProperty(Room.prototype, "extenderEnergy", {
		get: function () {
			if (this.memory.extenderEnergy === undefined || Game.time !== this.memory.extenderEnergy.lastUpdated) {
				this.memory.extenderEnergy = {
					energy: 0,
					energyCapacity: 0,
					lastUpdated: Game.time
				};

				_.forEach(Room.getStructuresType(this.name, STRUCTURE_EXTENSION), ex => {
					this.memory.extenderEnergy.energy += ex.energy;
					this.memory.extenderEnergy.energyCapacity += ex.energyCapacity;
				});
			}

			return this.memory.extenderEnergy;
		}
	});
}

if (Room.prototype.hasOwnProperty('isMine') === false) {
	Object.defineProperty(Room.prototype, "isMine", {
		get: function () {
			let result = false;
			if (this.controller instanceof StructureController && this.controller.my && this.controller.level > 0) {
				result = true;
			}
			return result;
		}
	});
}

if (Room.prototype.hasOwnProperty('isOtherOwned') === false) {
	Object.defineProperty(Room.prototype, "isOtherOwned", {
		get: function () {
			return (
				( this.controller !== undefined )
				&& ( this.controller.my !== true )
				&& ( this.controller.owner !== undefined )
				&& ( this.controller.owner.username !== utils.getUsername() )
			);
		}
	});
}

if (Room.prototype.hasOwnProperty('maxHarvesters') === false) {
	Object.defineProperty(Room.prototype, "maxHarvesters", {
		get: function () {
			if (this.memory.maxHarvesters === undefined || Game.time !== this.memory.maxHarvesters.lastUpdated) {
				this.memory.maxHarvesters = {
					max: 0,
					lastUpdated: Game.time
				};

				_.forEach(Room.getSources(this.name), s => {
					this.memory.maxHarvesters.max += s.getMaxHarvesters();
				});
			}
		}
	});
}

if (Room.prototype.hasOwnProperty('mineral') === false) {
	/**
	 * Set to true to allow room to spawn units for a siege.
	 */
	Object.defineProperty(Room.prototype, "mineral", {
		get: function () {
			if (this.memory.mineralId === undefined) {
				let min = this.find(FIND_MINERALS, 1)[0];
				if (min instanceof Mineral) {
					this.memory.mineralId = min.id;
				}
				return min;
			}

			return Game.getObjectById(this.memory.mineralId) || undefined;
		}
	});
}

if (Room.prototype.hasOwnProperty('ownedName') === false) {
	Object.defineProperty(Room.prototype, "ownedName", {
		get: function () {
			return ( this.controller && this.controller.owner && this.controller.owner.username );
		}
	});
}

if (Room.prototype.hasOwnProperty('relation') === false) {
	Object.defineProperty(Room.prototype, "relation", {
		get: function () {
			if (this.memory.relation === undefined || Game.time !== this.memory.relation.lastUpdated) {
				this.memory.relation = {
					relation: C.RELATION_NEUTRAL,
					lastUpdated: Game.time
				};
				if (this.controller instanceof StructureController) {
					this.memory.relation.relation = diplomacyManager.status(this.controller.owner);
				}
				else {
					this.memory.relation.relation = C.RELATION_NEUTRAL;
				}
			}

			return this.memory.relation.relation;
		}
	});
}

if (Room.prototype.hasOwnProperty('storageEnergy') === false) {
	Object.defineProperty(Room.prototype, "storageEnergy", {
		get: function () {
			return this.storage instanceof StructureStorage ? this.storage.energy : 0;
		}
	});
}

if (Room.prototype.hasOwnProperty('threat') === false) {
	Object.defineProperty(Room.prototype, "threat", {
		get: function () {
			//let debug = false;
			let updateCondition = false;

			if (this.memory.threat === undefined || Game.time !== this.memory.threat.lastUpdated) {
				updateCondition = true;
			}

			if (updateCondition) {
				let timeSinceSeen;
				let threatsRaw;

				// init memory if need be
				this.memory.threat = {
					lastSeen: 0,
					count: 0,
					threats: {},
					level: C.THREAT_STANDBY,
					breach: false,
					lastUpdated: Game.time
				};

				timeSinceSeen = Game.time - this.memory.threat.lastSeen;

				// update aggressives based on our current status
				this.memory.threat.threats = this.threats;
				this.memory.threat.breach = this.breach;

				//console.log(`this.threats: ${JSON.stringify(this.threats)}`);
				//console.log(`mem threats: ${JSON.stringify(this.memory.threat.threats)}`);

				//lib.log("!!!!!!!!ALERT: " + (timeSinceSeen > config.alertTime) , debug);

				// based on threats, update our status
				if (timeSinceSeen > config.alertTime && this.memory.threat.threats[C.RELATION_HOSTILE].length === 0) {
					//lib.log("Standby", debug);
					this.memory.threat.level = C.THREAT_STANDBY;
					this.memory.threat.count = this.threat.threats[C.RELATION_HOSTILE].length;
				}
				else if (timeSinceSeen < config.alertTime && this.memory.threat.threats[C.RELATION_HOSTILE].length === 0) {
					//lib.log("Alert", debug);
					this.memory.threat.level = C.THREAT_ALERT;
					this.memory.threat.count = this.memory.threat.threats[C.RELATION_HOSTILE].length;
				}
				else if (this.memory.threat.threats[C.RELATION_HOSTILE].length > 0) {
					//lib.log("THREAT", debug);
					threatsRaw = _(this.memory.threat.threats[C.RELATION_HOSTILE]).map(af.ogoid).filter().value();

					let isPlayer = _.some(threatsRaw, (o) => o.owner.username !== "Invader" && o.owner.username !== "Source Keeper");
					let link = roomLink(this.name);

					if (isPlayer) {
						this.memory.threat.level = C.THREAT_PLAYER;
						console.log("!!!> PLAYER THREAT: " + link);
					}
					else {
						this.memory.threat.level = C.THREAT_NPC;
						console.log("!!!> NPC THREAT! " + link);
					}

					if (this.memory.threat.level >= C.THREAT_NPC && this.memory.threat.breach) {
						this.memory.threat.level = C.THREAT_PANIC;
						console.log("!!!> WALL BREACH! " + link);
					}

					this.memory.threat.lastSeen = Game.time;
					this.memory.threat.count = this.memory.threat.threats[C.RELATION_HOSTILE].length;
				}
			}

			//lib.log(`Result: ${this.name} ${JSON.stringify(this.memory.threat)}`, debug);
			return this.memory.threat;
		}
	});
}

if (Room.prototype.hasOwnProperty('threats') === false) {
	Object.defineProperty(Room.prototype, "threats", {
		get: function () {
			let result = _(this.find(FIND_HOSTILE_CREEPS))
				.map((c) => {
					return {
						id: c.id,
						status: diplomacyManager.status(c.owner.username),
						owner: c.owner.username
					};
				})
				.groupBy('status')
				.value();
			result[C.RELATION_HOSTILE] = result[C.RELATION_HOSTILE] || [];
			result[C.RELATION_NEUTRAL] = result[C.RELATION_NEUTRAL] || [];
			result[C.RELATION_NAP] = result[C.RELATION_NAP] || [];
			result[C.RELATION_ALLY] = result[C.RELATION_ALLY] || [];
			result[C.RELATION_ME] = result[C.RELATION_ME] || [];
			return result;
		}
	});
}

/***********************************************************************************************************************
 * Export
 */
module.exports = function () {
};
