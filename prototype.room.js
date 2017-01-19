module.exports = function()
{

  //
  //memory cache
  Room.prototype.initMemCache = function (forceRefresh = false)
  {
  	// insure the memory object exists
  	if (lib.isNull(this.memory.cache) || forceRefresh)
  	{
  		this.memory.cache = {};
  		forceRefresh = true;
  	}

//  	this.updateStructureCache(forceRefresh);
  	this.updateSourceCache(forceRefresh);
//  	this.updateDroppedCache(forceRefresh);
  	this.updateUnitCache();
//  	this.updateFlagCache(forceRefresh);
  };

  //
  //
  Room.prototype.updateSourceCache = function (forceRefresh = false)
  {
  // insure the memory object exists
  if (lib.isNull(this.memory.cache.sources))
  {
  	this.memory.cache.sources = {};
  	forceRefresh = true;
  }

  if (Game.time % 100 === 0)
  	forceRefresh = true;

  if (forceRefresh)
  {
  	let foundSources = this.find(FIND_SOURCES);
  	console.log(`Found: ${foundSources}`);

  	// map structure ids to the memory object
  	this.memory.cache.sources = _.map(foundSources, function (s) {
  		return s.id;
  	});
  	//console.log(`Result ${this.memory.cache.sources}`);
  }
  };

  //
  //
  Room.prototype.getControllerLevel = function ()
  {
  	let result = 0;
  	if (!lib.isNull(this.controller))
  	{
  		result = this.controller.level;
  	}
  	return result;
  };

  //
  //
  Room.prototype.isMine = function ()
  {
  	let result = false;
  	if (!lib.isNull(this.controller) && this.controller.my)
  	{
  		result = true;
  	}
  	return result;
  };

  //
  //
  Room.prototype.getSpawnEnergy = function() {
      var result = {};
      result.energy = 0;
      result.energyCapacity = 0;

      // Enumerate over spawns
      for (var spawnName in Game.spawns) {
          var spawn = Game.spawns[spawnName];
          if (spawn.room.name == this.name) {
              result.energy += spawn.energy;
              result.energyCapacity += spawn.energyCapacity;
          }
      }

      var extenders = this.find(FIND_MY_STRUCTURES, {
          filter: {
              structureType: STRUCTURE_EXTENSION
          }
      });
      extenders.forEach(function(ex) {
          result.energy += ex.energy;
          result.energyCapacity += ex.energyCapacity;
      }, this);

      return result;
  };
};
