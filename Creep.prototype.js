"use strict";

Creep.prototype.run = function () {
	timer.start("Creep.prototype.run()");

	//check for a role
	if (!this.memory.role) this.assignRole();
	else if (this.memory.role == 'supplier') roleSupplier.run(this);
	else if (this.memory.role == 'upgrader') roleUpgrader.run(this);
	else if (this.memory.role == 'builder') roleBuilder.run(this);

	timer.stop("Creep.prototype.run()");
};

Creep.prototype.assignRole = function () {
	timer.start("Creep.prototype.assignRole()");
	console.log('assigning a role');
	let roomCreeps = Room.getCreepsByRole(this.room.name);
	let roomCreepNeed = this.room.getCreepNeed();

	console.log(roomCreepNeed);

	//assign supplier
	if (!roomCreeps.supplier || roomCreeps.supplier.length < roomCreepNeed.supplier) {
		this.memory.role = 'supplier';
		timer.stop("Creep.prototype.assignRole()");
		return this.memory.role;
	}
	//assign builder
	if (!roomCreeps.upgrader || roomCreeps.upgrader.length < roomCreepNeed.upgrader) {
		this.memory.role = 'builder';
		timer.stop("Creep.prototype.assignRole()");
		return this.memory.role;
	}

	//assign maintainer
	if (!roomCreeps.builder || roomCreeps.builder.length < roomCreepNeed.builder) {
		this.memory.role = 'maintainer';
		timer.stop("Creep.prototype.assignRole()");
		return this.memory.role;
	}

	//assign upgrader
	if (!roomCreeps.builder || roomCreeps.builder.length < roomCreepNeed.builder) {
		this.memory.role = 'upgrader';
		timer.stop("Creep.prototype.assignRole()");
		return this.memory.role;
	}
	timer.stop("Creep.prototype.assignRole()");
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

if (Creep.prototype.hasOwnProperty('unit') === false) {
	Object.defineProperty(Creep.prototype, "unit", {
		get: function () {
			return this.memory.unit;
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

if (Creep.prototype.hasOwnProperty('energy') === false)
{
	Object.defineProperty(Creep.prototype , "energy" , {
		get: function ()
		{
			return this.carry[RESOURCE_ENERGY] || 0;
		}
	});
}


module.exports = function () {
};
