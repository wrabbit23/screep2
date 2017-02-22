var creepController = {

	/** @param {Creep} creep **/
	run: function (creep) {


		//check for a role
		if (!creep.memory.role) this.assignRole(creep);
		else if (creep.memory.role == 'harvester') roleHarvester.run(creep);
		else if (creep.memory.role == 'upgrader') roleUpgrader.run(creep);
		else if (creep.memory.role == 'builder') roleBuilder.run(creep);

	},
	assignRole: function (creep) {
		console.log('assigning a role')
		console.log(creep.room.getCreepNeed());

		var roomCreeps = creep.room.memory.cache.creeps.roles;
		var roomCreepNeed = creep.room.getCreepNeed();

		//assign harvester
		assignHarvester = false;

		if (!roomCreeps.harvester) {
			assignHarvester = true;
		} else if (roomCreeps.harvester.length < roomCreepNeed.harvester) {
			assignHarvester = true;
		}

		if (assignHarvester) {
			creep.memory.role = 'harvester';
			return creep.memory.role;
		}

		//assign upgrader
		assignUpgrader = false;

		if (!roomCreeps.upgrader) {
			assignUpgrader = true;
		} else if (roomCreeps.upgrader.length < roomCreepNeed.upgrader) {
			assignUpgrader = true;
		}

		if (assignUpgrader) {
			creep.memory.role = 'upgrader';
			return creep.memory.role;
		}

		//assign upgrader
		assignBuilder = false;

		if (!roomCreeps.builder) {
			assignBuilder = true;
		} else if (roomCreeps.builder.length < roomCreepNeed.builder) {
			assignBuilder = true;
		}

		if (assignBuilder) {
			creep.memory.role = 'builder';
			return creep.memory.role;
		}


	}
}
module.exports = creepController;
