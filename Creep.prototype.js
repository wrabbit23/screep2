"use strict";

Creep.prototype.run = function () {
	timer.start("Creep.prototype.run()");

	//check for a role
	if (!this.memory.role) this.assignRole();
	else if (this.memory.role==='supplier') roleSupplier.run(this);
	else if (this.memory.role==='upgrader') roleUpgrader.run(this);
	else if (this.memory.role==='builder') roleBuilder.run(this);
	else if (this.memory.role==='maintainer') roleMaintainer.run(this);

	timer.stop("Creep.prototype.run()");
};

Creep.prototype.assignRole = function () {
	timer.start("Creep.prototype.assignRole()");

	let roomCreeps = Room.getCreepsByRole(this.room.name);
	let roomCreepNeed = this.room.getCreepNeed();

	//assign supplier
	if (!roomCreeps.supplier || roomCreeps.supplier.length < roomCreepNeed.supplier) {
		this.role = 'supplier';
	}
	//assign builder
	else if (!roomCreeps.builder || roomCreeps.builder.length < roomCreepNeed.builder) {
		this.role = 'builder';
	}

	//assign maintainer
	else if (!roomCreeps.maintainer || roomCreeps.maintainer.length < roomCreepNeed.maintainer) {
		this.role = 'maintainer';
	}

	//assign upgrader
	else {
		this.role = 'upgrader';
	}

	console.log(`assigning ${this.role} role to ${this.name}`);
	timer.stop("Creep.prototype.assignRole()");
	return this.role;
};

/*
 * NOTES: sentences are broken down using | to separate pieces
 *        public will default to true
 *
 * Creep.prototype.sing(sentence, public)
 *   creep will sing a different part of sentence per tick
 */
Creep.prototype.sing = function (sentence, pub) {
	timer.start("Creep.prototype.sing()");
	if (pub === undefined) {
		pub = false;
	}
	let words = sentence.split(" ");
	this.say(words[Game.time % words.length], pub);
	timer.stop("Creep.prototype.sing()");
};


/***********************************************************************************************************************
 ***********************************************************************************************************************
 * properties
 */
if (Creep.prototype.hasOwnProperty('bodyStringCompressed') === false) {
	Object.defineProperty(Creep.prototype, "bodyStringCompressed", {
		get: function () {
			let body = this.body;
			let compressed = {};
			for (let i = 0, leni = body.length; i < leni; ++i) {
				let abbrev = _.capitalize(body[i].type.substring(0, 1));
				if (body[i].type === CLAIM) {
					abbrev = 'CL';
				}
				compressed[abbrev] = ( compressed[abbrev] || 0 ) + 1;
			}
			let str = '';
			for (let abbrev in compressed) {
				str += compressed[abbrev] + abbrev;
			}

			Object.defineProperty(this, 'bodyStringCompressed', {
				value: str,
				writable: false,
				configurable: false,
				enumerable: false,
			});

			return str;
		},
		configurable: true,
		enumerable: false,
	});
}

if (Creep.prototype.hasOwnProperty('carrying') === false) {
	Object.defineProperty(Creep.prototype, "carrying", {
		get: function () {
			timer.start("Creep.prototype.carrying");
			let result = 0;

			if (this.carryCapacity > 0) {
				result = _.sum(this.carry);
			}

			timer.stop("Creep.prototype.carrying");
			return result;
		}
	});
}

if (Creep.prototype.hasOwnProperty('energy') === false) {
	Object.defineProperty(Creep.prototype, "energy", {
		get: function () {
			return this.carry[RESOURCE_ENERGY] || 0;
		}
	});
}

if (Creep.prototype.hasOwnProperty('role') === false) {
	Object.defineProperty(Creep.prototype, "role", {
		get: function () {
			return this.memory.role;
		},
		set: function (value) {
			this.memory.role = value;
		}
	});
}

if (Creep.prototype.hasOwnProperty('spawnTime') === false) {
	Object.defineProperty(Creep.prototype, "spawnTime", {
		get: function () {
			return this.memory.spawnTime;
		}
	});
}

if (Creep.prototype.hasOwnProperty('unit') === false) {
	Object.defineProperty(Creep.prototype, "unit", {
		get: function () {
			return this.memory.unit;
		}
	});
}

module.exports = function () {
};
