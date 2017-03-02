"use strict";
Spawn.prototype.spawnUnitByEnergy = function (unitName, energy) {
	let parts = [];
	let energyLeft = energy;
	let energyBudget = this.room.energyCapacityAvailable;

	if (units[unitName].mode===1) {
		units[unitName].parts.forEach(function (part) {

			let partEnergy = energy * part.weight;
			let numberParts = Math.floor(partEnergy / BODYPART_COST[part.part]);

			if (numberParts < part.minimum)
				numberParts = part.minimum;
			for (let x = 0; x < numberParts; x++) {
				if (energyLeft >= BODYPART_COST[part.part]) {
					parts.push(part.part);
					energyLeft -= BODYPART_COST[part.part];
				}
			}
		}, this);
	} else if (units[unitName].mode===2) {
		parts = units[unitName].parts;
	}

	parts = this.shuffle(parts);

	if (parts.length > 2) {
		//attempt to spawn a creep
		let name = this.createCreep(parts, undefined, units[unitName].memory);
		if (_.isString(name)) {
			let creep = Game.creeps[name];
			creep.memory.room = this.room.name;
			creep.memory.homeRoom = this.room.name;
			creep.memory.spawn = this.name;
			creep.memory.spawnTime = Game.time;
			//creep.memory.job = null;
			//creep.memory.jobTarget = null;
			//creep.memory.energySource =  null;
			console.log(`Spawn Status ++ ${roomLink(this.room.name)} Creating creep: ${name} energy: ${energy} energyBudget: ${energyBudget}`);
			return true;
		}
		else
		{
			return false;
		}
	} else {

		//console.log('not enough energy to spawn, only '+parts.length+' parts');
		return false;

	}
};

Spawn.prototype.shuffle = function (body) {
	if (body===undefined)
		return undefined;
	return _(body)
		.sortBy(function (part) {
			if (part === TOUGH)
				return 0;
			else if (part === HEAL)
				return BODYPARTS_ALL.length;
			else
				return _.random(1, BODYPARTS_ALL.length - 1);
		})
		.value();
};

Spawn.prototype.processVisuals = function () {
	if (this.room.visual === undefined) {
		return;
	}

	if (this.spawning !== null) {
		let options = {
			color: '#00FF00',
			size: 0.425,
			align: 'center',
			opacity: 1,
		};
		this.room.visual.text(
			this.spawning.name,
			this.pos.x,
			this.pos.y + 1.2,
			options
		).text(
			( Game.creeps[this.spawning.name] === undefined ) ? '' : '[' + Game.creeps[this.spawning.name].bodyStringCompressed + ']',
			this.pos.x,
			this.pos.y + 1.7,
			options
		).text(
			'ETA: ' + ( this.spawning.remainingTime - 1 ) + 't',
			this.pos.x,
			this.pos.y + 2.2,
			options
		)
	}
	if (this.room.energyAvailable < this.room.energyCapacityAvailable) {
		this.room.visual.text(
			this.room.energyAvailable + '/' + this.room.energyCapacityAvailable,
			this.pos.x,
			this.pos.y - 1.5,
			{
				color: '#00FF00',
				size: 0.425,
				align: 'center',
				opacity: 1,
			}
		);
	}
};

module.exports = function () {
};