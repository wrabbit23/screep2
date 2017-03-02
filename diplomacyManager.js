"use strict";

module.exports = {

	/**
	 * Set a relation to a player.
	 * @param name
	 * @param state
	 */
	set: function (name , state = C.RELATION_HOSTILE)
	{
		timer.start("diplomacyManager.set()");
		if (!Memory.players)
		{
			Memory.players = {};
		}
		Memory.players[name] = state;
		Game.notify("Player " + name + " status set to " + state);
		timer.stop("diplomacyManager.set()");
	} ,

	/**
	 * Get relation for a player.
	 * @param name
	 * @returns {*}
	 */
	status: function (name)
	{
		timer.start("diplomacyManager.status()");
		if (name === C.ME)
		{
			return C.RELATION_ME;
		}
		if (!Memory.players || !Memory.players[name])
		{
			return C.RELATION_HOSTILE;
		}
		timer.stop("diplomacyManager.status()");
		return Memory.players[name];
	} ,

	/**
	 * Reset player relation. This deletes the memory key.
	 */
	reset: function ()
	{
		delete Memory.players;
	}

};
