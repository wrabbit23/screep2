"use strict";

module.exports = {

	/** @param {Creep} creep **/

	//screep should deliver energy to any structure that requires it
	deliver: function (creep) {
		let target;
		let spawns = Room.getSpawns(creep.room.name);
		let extensions = Room.getStructuresType(creep.room.name, STRUCTURE_EXTENSION);
		let secondaries = Room.getStructuresType(creep.room.name, STRUCTURE_TOWER);
		if(creep.room.storage instanceof StructureStorage)
			secondaries = [...secondaries, creep.room.storage];

		let primaryDeliveryTargets = _.filter([...spawns, ...extensions ], structure => structure.energy < structure.energyCapacity);
		let secondaryDeliveryTargets = _.filter(secondaries, structure => structure.energy < structure.energyCapacity);

		if (primaryDeliveryTargets.length > 0) {
			target = creep.pos.findClosestByPath(primaryDeliveryTargets);
		} else if (secondaryDeliveryTargets.length > 0) {
			target = creep.pos.findClosestByPath(secondaryDeliveryTargets);
		} else {
			return false;
		}

		if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}

	},

	//screep should seek out and harvest energy
	harvest: function (creep) {
		let sources = _.filter(Room.getSources(creep.room.name), s => s.energy > 0);
		if (sources) {
			let harvestLocation = creep.pos.findClosestByPath(sources);
			if (creep.harvest(harvestLocation) == ERR_NOT_IN_RANGE) {
				creep.moveTo(harvestLocation);
			}
		} else
			creep.sing("No energy!");
	},

	containerHarvest: function (creep) {
		//
	},

	//screep should aqcuire energy from storage
	buy: function (creep) {
		console.log('creep buying - ' + creep.name);

		let energyNeed = creep.carryCapacity - creep.carry.energy;
		let closestContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (structure) => {

				if (structure.structureType == 'container') {
					if (structure.energy >= energyNeed)
						return true;
				}
				return false;
			}
		});

		if (closestContainer) {
			if (creep.withdraw(closestContainer, RESOURCE_ENERGY, energyNeed) == ERR_NOT_IN_RANGE) {
				creep.moveTo(closestContainer);
			}
		} else {

			let source = Game.spawns['Spawn1'];
			if ((source.energy > 280) && (source.energy >= energyNeed)) {
				if (creep.withdraw(source, RESOURCE_ENERGY, energyNeed) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source);
				}
			} else {
				this.harvest(creep);
			}
		}
	}
}
