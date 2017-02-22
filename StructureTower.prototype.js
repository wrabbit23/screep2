//-------------------------------------------------------------------------
// StructureTower.prototype
//-------------------------------------------------------------------------
"use strict";

StructureTower.prototype.autoAttack = function ()
{
	timer.start("StructureTower.prototype.autoAttack()");
	let target;

	if (this.room.threat.level >= C.THREAT_NPC)
	{
		if (this.room.threat.threats[C.RELATION_HOSTILE].length > 0)
		{
			target = Game.getObjectById(this.room.threat.threats[C.RELATION_HOSTILE][_.random(0 , this.room.threat.threats.length - 1)].id);
		}

		if (target !== null)
		{
			this.attack(target);
		}
	}
	timer.stop("StructureTower.prototype.autoAttack()");
};

StructureTower.prototype.autoCreepHeal = function ()
{
	timer.start("StructureTower.prototype.autoCreepHeal()");
	let woundedCreep = _.min(Room.getCreeps(this.room.name) , o => o.hitsMax - o.hits);
	let wounds = woundedCreep.hitsMax - woundedCreep.hits;

	//console.log(":::::::::::::::::::::" + JSON.stringify(woundedCreep));

	if (woundedCreep !== -Infinity && wounds > 0 && this.energy > (this.energyCapacity * config.towerPowerFactor))
	{
		this.heal(woundedCreep);
	}
	timer.stop("StructureTower.prototype.autoCreepHeal()");
};

// don't use this yet, it will go crazy on the walls
StructureTower.prototype.autoRepair = function ()
{
	timer.start("StructureTower.prototype.autoRepair()");
	let wallHP = config.wallHP[this.room.controller.level];
	// non walls/ramparts
	let structures = Room.getStructuresType(this.room.name, STRUCTURE_ALL_NOWALL);
	let damagedBuildings = _.filter(structures , object => object.hits < (object.hitsMax * config.towerRepairFactor));

	//console.log(JSON.stringify(damagedBuildings));

	if (damagedBuildings[0].length > 0 && this.energy > (this.energyCapacity * config.towerPowerFactor))
	{
		let target = _.max(damagedBuildings , (c) => c.hitsMax - c.hits);
		this.repair(target);
		timer.stop("StructureTower.prototype.autoRepair()");
		return true;
	}
	else
	{
		// walls and ramparts
		structures = Room.getStructuresType(this.room.name, STRUCTURE_ALL_WALL);
		damagedBuildings = _.filter(structures , object => object.hits < (wallHP * config.towerRepairFactor));

		//console.log(JSON.stringify((wallHP * config.towerRepairFactor)));
		//console.log(JSON.stringify(damagedBuildings));

		let target = _.min(damagedBuildings , 'hits');

		//console.log(target);

		if (target instanceof RoomObject && this.energy > (this.energyCapacity * config.towerPowerFactor))
		{
			this.repair(target);
			timer.stop("StructureTower.prototype.autoRepair()");
			return true;
		}
		else
		{
			timer.stop("StructureTower.prototype.autoRepair()");
			return false;
		}
	}
};

module.exports = function ()
{
};
