"use strict";

/**
 * Timer by Vaejor
 * @type {{cancel: module.exports.cancel, clear: module.exports.clear, display: module.exports.display, first: module.exports.first, get: module.exports.get, init: module.exports.init, inlineTest: module.exports.inlineTest, last: module.exports.last, poll: module.exports.poll, runInline: module.exports.runInline, start: module.exports.start, stop: module.exports.stop, setVerbose: module.exports.setVerbose}}
 */
module.exports =
	{
		cancel: function (name)
		{
			if (name in Memory.timer.startUsed)
			{
				Memory.timer.startUsed[name] = null;
			}
		} ,

		clear: function (name)
		{
			if (name !== undefined)
			{
				if (Memory.timer.log[name] !== undefined)
				{
					delete Memory.timer.log[name];
				}
			}
			else
			{
				this.init(true);
			}
		} ,

		display: function (name)
		{
			if (name === undefined)
			{
				let outputs = _.map(Memory.timer.log , (v , k) => k + ': ' + this.display(k));
				return logging.normalizeOutputAt(
					logging.normalizeOutputAt(
						logging.normalizeOutputAt(
							logging.normalizeOutputAt(
								_.sortBy(outputs).join('\n') ,
								': ') ,
							'. ' , 1) ,
						'% ') ,
					'. ' , Infinity , '% '
				);
			}

			let t = this.get(name);
			if (t === undefined)
			{
				return undefined;
			}
			let totalSum = this.get('total').sum;

			let totalTicks = Game.time - t.startTick + 1;
			let output =
					t.sum.toFixed(4) + ' used.'
					+ '  '
					+ ( name === 'total' ? '--' : ( 100 * t.sum / totalSum ).toFixed(2) ) + '%'
					+ '  '
					+ ( t.sum / t.count ).toFixed(3) + '/use over ' + t.count + ' uses.'
					+ '  '
					+ ( t.sum / t.tickCount ).toFixed(3) + '/t over ' + t.tickCount + ' ticks'
					+ ' (' + ( ( 100 * t.tickCount ) / ( Game.time - Memory.timer.startTick + 1 ) ).toFixed(2) + '%)'
					+ '.  '
					+ ( t.count / t.tickCount ).toFixed(3) + ' uses/t.'
				;

			return output;
		} ,

		first: function (global = false)
		{
			this.init();

			let name = 'CPU' + ( global === true ? ' global' : '' );
			if (( Memory.timer.startUsed[name] === null ) || ( Memory.timer.startUsed[name] === undefined ))
			{
				this.start(name);
			}
		} ,

		get: function (name)
		{
			return Memory.timer.log[name];
		} ,

		init: function (force = false)
		{
			if (( force === true ) || ( Memory.timer === undefined ))
			{
				Memory.timer = {
					startTick: Game.time ,
					startUsed: {} ,
					log: {} ,
				};
			}
		} ,

		inlineTest: function (f)
		{
			let c = Game.cpu.getUsed();
			f();
			return ( Game.cpu.getUsed() - c );
		} ,

		last: function ()
		{
			let poll = null;
			if (( Memory.timer.startUsed['CPU global'] !== null ) && ( Memory.timer.startUsed['CPU global'] !== undefined ))
			{
				poll = this.stop('CPU global');
			}
			else if (( Memory.timer.startUsed['CPU'] !== null ) && ( Memory.timer.startUsed['CPU'] !== undefined ))
			{
				poll = this.stop('CPU');
			}

			if (Memory.timer.log.unknown === undefined)
			{
				Memory.timer.log.unknown = {
					startTick: Game.time ,
					sum: 0 ,
					count: 0 ,
					tickCount: 0 ,
					lastTick: null ,
				};
			}
			Memory.timer.log.unknown.sum += Game.cpu.getUsed() - poll;
			Memory.timer.log.unknown.count += 1;

			if (Memory.timer.log.unknown.lastTick !== Game.time)
			{
				Memory.timer.log.unknown.lastTick = Game.time;
				Memory.timer.log.unknown.tickCount += 1;
			}

			if (Memory.timer.log.total === undefined)
			{
				Memory.timer.log.total = {
					startTick: Game.time ,
					sum: 0 ,
					count: 0 ,
					tickCount: 0 ,
					lastTick: null ,
				};
			}
			Memory.timer.log.total.sum += Game.cpu.getUsed();
			Memory.timer.log.total.count += 1;

			if (Memory.timer.log.total.lastTick !== Game.time)
			{
				Memory.timer.log.total.lastTick = Game.time;
				Memory.timer.log.total.tickCount += 1;
			}
		} ,

		poll: function (name)
		{
			return ( name && ( Memory.timer.startUsed[name] ) ) ? ( Game.cpu.getUsed() - Memory.timer.startUsed[name] ) : Game.cpu.getUsed();
		} ,

		runInline: function (name , value)
		{
			this.start(name);
			if (_.isFunction(value))
			{
				value = value();
			}
			this.stop(name);
			return value;
		} ,

		start: function (name)
		{
			if (Memory.timer.verbose === true)
			{
				console.log('[' + Game.time + ']: timer verbose: start: ' + name);
			}

			Memory.timer.startUsed[name] = Game.cpu.getUsed();
		} ,

		stop: function (name , showWarningIfTimeOver , extraWarningData)
		{
			if (( ( name in Memory.timer.startUsed ) === false ) || ( Memory.timer.startUsed[name] === null ))
			{
				return -1;
			}

			let stopUsed = Game.cpu.getUsed();
			let poll = stopUsed - ( Memory.timer.startUsed[name] || stopUsed );
			Memory.timer.startUsed[name] = null;

			if (Memory.timer.verbose === true)
			{
				console.log('[' + Game.time + ']: timer verbose: stop: ' + name + ': ' + poll.toFixed(4));
			}
//		else
//		if ( ( stopUsed > Game.cpu.limit ) && ( poll >= 1 ) )  {  console.log( '[' + Game.time + ']: timer.stop(): cpu is over limit: ' + stopUsed.toFixed( 4 ) + '/' + Game.cpu.limit + '; ' + name + ' (total: ' + poll.toFixed( 4 ) + ')' );  }
//		else
//		if ( ( stopUsed > ( Game.cpu.limit * 0.75 ) ) && ( poll >= 1 ) )  {  console.log( '[' + Game.time + ']: timer.stop(): cpu is near limit: ' + stopUsed.toFixed( 4 ) + '/' + Game.cpu.limit + '; ' + name + ' (total: ' + poll.toFixed( 4 ) + ')' );  }
//		else
//		if ( poll >= 1 ) {  console.log( '[' + Game.time + ']: timer.stop(): cpu is under limit: ' + stopUsed.toFixed( 4 ) + '/' + Game.cpu.limit + '; ' + name + ' (total: ' + poll.toFixed( 4 ) + ')' );  }

			if (showWarningIfTimeOver !== undefined)
			{
				if (poll > showWarningIfTimeOver)
				{
					console.log('[' + Game.time + ']: timer warning: ' + name + ' took ' + poll.toFixed(4) + ' CPU; notification: ' + showWarningIfTimeOver + ( extraWarningData === undefined ? '' : '; extra data: ' + extraWarningData ));
				}
			}

			let log = Memory.timer.log[name]

			if (log === undefined)
			{
				log = {
					startTick: Game.time ,
					sum: 0 ,
					count: 0 ,
					tickCount: 0 ,
					lastTick: null ,
				};
			}

			log.sum += poll;
			log.count += 1;

			if (log.lastTick !== Game.time)
			{
				log.lastTick = Game.time;
				log.tickCount += 1;
			}

			Memory.timer.log[name] = log;

			return poll;
		} ,

		setVerbose: function (doVerbose = true)
		{
			Memory.timer.verbose = !!doVerbose;
		} ,

	};
