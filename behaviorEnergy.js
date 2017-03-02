"use strict";

module.exports = {

	/** @param {Creep} creep **/

	//screep should deliver energy to any structure that requires it
	deliver: function (creep) {
		timer.start("behaviorEnergy.deliver()");
		let target;
		let spawns = Room.getSpawns(creep.room.name);
		let extensions = Room.getStructuresType(creep.room.name, STRUCTURE_EXTENSION);
		let secondaries = Room.getStructuresType(creep.room.name, STRUCTURE_TOWER);
		if (creep.room.storage instanceof StructureStorage)
			secondaries = [...secondaries, creep.room.storage];

		let primaryDeliveryTargets = _.filter([...spawns, ...extensions], structure => structure.energy < structure.energyCapacity);
		let secondaryDeliveryTargets = _.filter(secondaries, structure => structure.energy < structure.energyCapacity);

		if (primaryDeliveryTargets.length > 0) {
			target = creep.pos.findClosestByRange(primaryDeliveryTargets);
		} else if (secondaryDeliveryTargets.length > 0) {
			target = creep.pos.findClosestByRange(secondaryDeliveryTargets);
		} else {
			timer.stop("behaviorEnergy.deliver()");
			return false;
		}

		if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
		timer.stop("behaviorEnergy.deliver()");
		return true;

	},

	//screep should seek out and harvest energy
	harvest: function (creep) {
		timer.start("behaviorEnergy.harvest()");
		let sources = _.filter(Room.getSources(creep.room.name), s => s.energy > 0);
		if (sources) {
			let harvestLocation = creep.pos.findClosestByPath(sources);
			if (creep.harvest(harvestLocation)===ERR_NOT_IN_RANGE) {
				creep.moveTo(harvestLocation);
			}
		} else
			creep.sing("No energy!");
		timer.stop("behaviorEnergy.harvest()");
	},

	containerHarvest: function (creep) {
		//
	},

	//screep should aqcuire energy from storage
	buy: function (creep) {

		timer.start("behaviorEnergy.buy()");

		let storage = creep.room.storage;
		let containers = Room.getStructuresType(creep.room.name, STRUCTURE_CONTAINER);
		let energyNeed = creep.carryCapacity - creep.carrying;

		let closestContainer = creep.pos.findClosestByRange(containers, {
			filter: (structure) => {

					if (structure.energy >= energyNeed) {
						return true;
					}
				return false;
			}
		});

		if (closestContainer) {

			if (creep.withdraw(closestContainer, RESOURCE_ENERGY, energyNeed)===ERR_NOT_IN_RANGE) {
				creep.moveTo(closestContainer);
			}

		} else if (storage.energy>=energyNeed) {

			if (creep.withdraw(storage, RESOURCE_ENERGY, energyNeed)===ERR_NOT_IN_RANGE) {
				creep.moveTo(storage);
			}

		} else {

			this.harvest(creep);

		}

		timer.stop("behaviorEnergy.buy()");
		return true;
	}
};
