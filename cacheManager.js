/**
 * Cache Manager
 *  Manages both global and memory caching
 */
"use strict";

module.exports = {

	/**
	 * init
	 */
	init: function ()
	{
		timer.start("cacheManager.init()");
		// init global cache
		if (global.cache === undefined)
		{
			global.cache = {};
		}

		if (global.cache.rooms === undefined)
		{
			global.cache.rooms = {};
		}

		timer.stop("cacheManager.init()");
	}
};