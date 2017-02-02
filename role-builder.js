var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

      //build if you can, harvest if you must
      if(creep.memory.building) {

        if(creep.carry.energy > 0) {
          if(creep.memory.building) {
            creep.say('im building')
            behaviorBuild.build(creep);
          }
        } else {
          creep.memory.building = false;
        }

      } else {
        if (creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        } else {
          behaviorEnergy.harvest(creep);
        }
      }
	}

}

module.exports = roleBuilder;
