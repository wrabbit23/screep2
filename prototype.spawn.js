module.exports = function()
{

    // game costs for spawning parts
    Spawn.prototype.costs = {};
    Spawn.prototype.costs[MOVE] = 50;
    Spawn.prototype.costs[WORK] = 100;
    Spawn.prototype.costs[CARRY] = 50;
    Spawn.prototype.costs[ATTACK] = 80;
    Spawn.prototype.costs[RANGED_ATTACK] = 150;
    Spawn.prototype.costs[HEAL] = 250;
    Spawn.prototype.costs[TOUGH] = 10;
    Spawn.prototype.costs[CLAIM] = 600;

    Spawn.prototype.spawnUnitByEnergy = function (unitName, energy)
    {
    	let debug = false;
    	let parts = [];
    	let name;
    	let result;
    	let energyLeft = energy;

      if (units[unitName].mode == 1)
      {

        		units[unitName].parts.forEach(function (part)
        		{

        			let partEnergy = energy * part.weight;
        			let numberParts = Math.floor(partEnergy / this.costs[part.part]);

        			if (numberParts < part.minimum)
        				numberParts = part.minimum;
        			for (x = 0; x < numberParts; x++)
        			{
        			    if (energyLeft >= this.costs[part.part])
        			    {
        				    parts.push(part.part);
        				    energyLeft -= this.costs[part.part];
        			    }
        			}
        		} , this);
        	} else if (units[unitName].mode == 2)
        	{
        		parts = units[unitName].parts;
        	}

          parts = this.shuffle(parts);

        if(parts.length>2) {

          //spawn a creep
          newName = this.createCreep(parts , undefined , units[unitName].memory);

        } else {

          console.log('not enough energy to spawn, only '+parts.length+' parts')
          return false;

        }
    }

    Spawn.prototype.shuffle = function(body) {
    	if(body == undefined)
    		return undefined;
    	return _(body)
    		.sortBy(function(part) {
    			if(part === TOUGH)
    				return 0;
    			else if(part === HEAL)
    				return BODYPARTS_ALL.length;
    			else
    				return _.random(1,BODYPARTS_ALL.length-1);
    		})
    		.value();
    };

};
