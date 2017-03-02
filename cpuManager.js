"use strict";

module.exports =
	{
		/**
		 * Initializes cpu memory.
		 */
		initMem: function ()
		{
			timer.start("cpuManger.initMem()");
			// insure memory structure exist
			if (Memory.cpu === undefined)
			{
				Memory.cpu = {};
			}
			timer.start("cpuManger.initMem()");
		} ,

		log: function (message)
		{
			lib.log(`${message}\t CPU Used Total: ${Game.cpu.getUsed().toFixed(1)}`, config.cpuGlobalResetDebug);
		} ,

		tickTrack: function ()
		{
			let result = {};
			let tenTick , hunTick , thouTick, bucketChange;

			this.initMem();
			// insure memory structure exist
			if (lib.isNull(Memory.cpu.tickTrack))
			{
				Memory.cpu.tickTrack = [];
			}

			result.tick = Game.time;
			result.used = Game.cpu.getUsed();
			result.limit = Game.cpu.limit;
			result.bucketChange = (result.used - result.limit) * -1;
			result.bucket = Game.cpu.bucket;
			result.panic = !Memory.cpu.active;

			Memory.cpu.tickTrack.unshift(result);

			if (Memory.cpu.tickTrack.length > config.cpuHistorySize)
			{
				Memory.cpu.tickTrack.pop();
			}

			if (config.cpuTickTrackDebug)
			{
				let ticks = _.take(Memory.cpu.tickTrack , 10);
				let panics = _.sum(Memory.cpu.tickTrack, 'panic');
				tenTick = (_.sum(ticks , t => t.used) / 10).toFixed(1);
				ticks = _.take(Memory.cpu.tickTrack , 100);
				hunTick = (_.sum(ticks , t => t.used) / 100).toFixed(1);
				thouTick = (_.sum(Memory.cpu.tickTrack , t => t.used) / Memory.cpu.tickTrack.length).toFixed(1);
				bucketChange = result.bucketChange.toFixed(1);
				lib.log(`Tick: ${result.tick}\tAve 10/100/1000: ${tenTick}/${hunTick}/${thouTick}\tPanics: ${panics}\tUsed CPU: ${result.used.toFixed(1)}\t<progress value="${result.used}" max="${result.limit}"></progress>\tC(${_.size(Game.creeps)})/R(${_.size(Game.rooms)}): ${(result.used/_.size(Game.creeps)).toFixed(1)}/${(result.used/_.size(Game.rooms)).toFixed(1)}\tBucket: ${bucketChange > 0 ? result.bucket + "(+" + bucketChange + ")" : result.bucket + "(" + bucketChange + ")"}` , config.cpuTickTrackDebug);
			}
		} ,

		/**
		 * Returns the current throttle mode.
		 * @returns {number}
		 */
		getThrottleMode: function ()
		{
			timer.start("cpuManger.getThrottleMode()");
			let bucket = Game.cpu.bucket;
			let result;
			if (bucket < config.cpuThresholdQuarter)
			{
				result = C.CPU_THROTTLE_QUARTER;
			}
			else if (bucket < config.cpuThresholdHalf)
			{
				result = C.CPU_THROTTLE_HALF;
			}
			else if (bucket < config.cpuThresholdThird)
			{
				result = C.CPU_THROTTLE_THIRD;
			}
			else
			{
				result = C.CPU_THROTTLE_NORMAL;
			}
			timer.stop("cpuManger.getThrottleMode()");
			return result;
		} ,

		/**
		 * Returns true if the CPU should be active for the given mode.
		 * @param mode
		 * @returns {boolean}
		 */
		getCPUActive: function (mode)
		{
			timer.start("cpuManger.getCPUActive()");
			let pingPong;
			let color = "#AAAA00";

			this.initMem();

			switch (mode)
			{
				case C.CPU_THROTTLE_NORMAL:
					pingPong = 0;
					break;
				case C.CPU_THROTTLE_THIRD:
					pingPong = Game.time % 3;
					if (pingPong != 0)
					{
						pingPong = 0;
					}
					else
					{
						pingPong = 1;
					}
					break;
				case C.CPU_THROTTLE_HALF:
					pingPong = Game.time % 2;
					break;
				case C.CPU_THROTTLE_QUARTER:
					pingPong = Game.time % 4;
					break;
			}

			if (pingPong === 0)
			{
				Memory.cpu.active = true;
				timer.stop("cpuManger.getCPUActive()");
				return true;
			}
			else
			{
				console.log(`<span style=color:${color}>!!!!!!!!!! CPU PANIC !!!!!!!!!!</span>`);
				Memory.cpu.active = false;
				timer.stop("cpuManger.getCPUActive()");
				return false;
			}
		}

	};
