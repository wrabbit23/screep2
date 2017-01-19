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

  	this.updateStructureCache(forceRefresh);
  	this.updateSourceCache(forceRefresh);
//  	this.updateDroppedCache(forceRefresh);
//  	this.updateUnitCache();
//  	this.updateFlagCache(forceRefresh);
  };

//
//

Room.prototype.updateStructureCache = function (forceRefresh = false)
{
  console.log('updating structures')
	// insure the memory object exists
	if (lib.isNull(this.memory.cache.structures))
	{
		this.memory.cache.structures = {};
		forceRefresh = true;
	}

	if (Game.time % 10 === 0)
		forceRefresh = true;

	if (forceRefresh)
	{
		let structures = this.memory.cache.structures;
		let roomLevel = this.getControllerLevel();
		let room = this;

		_.forEach(STRUCTURES , function (s)
		{
			//console.log(`Type: ${s} Level: ${roomLevel}`);
			if (!lib.isNull(CONTROLLER_STRUCTURES[s]) && CONTROLLER_STRUCTURES[s][roomLevel] >= 0)
			{
				//console.log(`Checking ${s}...`);
				let foundStructures = room.find(FIND_STRUCTURES , { filter: function (st)
				{
					return st.structureType === s;
				}});
				//console.log(`Found ${foundStructures}...`);


				// map structure ids to the memory object
				structures[s] = _.map(foundStructures, function (st) {
					return st.id;
				});
			}
		});

		structures[STRUCTURE_ALL_NOWALL] = _.map(
			room.find(FIND_STRUCTURES, {
				filter: (s) => {
					return s.structureType != STRUCTURE_WALL
						&& s.structureType != STRUCTURE_RAMPART
				}
			}), (o) => { return o.id });
		structures[STRUCTURE_ALL_WALL] = _.map(
			room.find(FIND_STRUCTURES, {
				filter: (s) => {
					return s.structureType === STRUCTURE_WALL
						|| s.structureType === STRUCTURE_RAMPART
				}
			}), (o) => { return o.id });
	}
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

  //==-----
  //
  //
  Room.prototype.getCreeps = function ()
  {
    roomName = this.name;
    let result = _.filter(Game.creeps , function (creep)
    {
      return creep.room.name === roomName;
    });
    return result;
  }


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


};
