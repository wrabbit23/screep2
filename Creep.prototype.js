"use strict";

/*
 * NOTES: sentences are broken down using | to separate pieces
 *        public will default to true
 *
 * Creep.prototype.sing(sentence, public)
 *   creep will sing a different part of sentence per tick
 */
Creep.prototype.sing = function (sentence , pub)
{
	timer.start("Creep.prototype.sing()");
	if (pub === undefined)
	{
		pub = false;
	}
	let words = sentence.split(" ");
	this.say(words[Game.time % words.length] , pub);
	timer.stop("Creep.prototype.sing()");
};


/***********************************************************************************************************************
 ***********************************************************************************************************************
 * properties
 */
if (Creep.prototype.hasOwnProperty('bodyStringCompressed') === false)
{
	Object.defineProperty(Creep.prototype , "bodyStringCompressed" , {
		get: function ()
		{
			let body = this.body;
			let compressed = {};
			for (let i = 0 , leni = body.length; i < leni; ++i)
			{
				let abbrev = _.capitalize(body[i].type.substring(0 , 1));
				if (body[i].type === CLAIM)
				{
					abbrev = 'CL';
				}
				compressed[abbrev] = ( compressed[abbrev] || 0 ) + 1;
			}
			let str = '';
			for (let abbrev in compressed)
			{
				str += compressed[abbrev] + abbrev;
			}

			Object.defineProperty(this , 'bodyStringCompressed' , {
				value: str ,
				writable: false ,
				configurable: false ,
				enumerable: false ,
			});

			return str;
		} ,
		configurable: true ,
		enumerable: false ,
	});
}

if (Creep.prototype.hasOwnProperty('carrying') === false)
{
	Object.defineProperty(Creep.prototype , "carrying" , {
		get: function ()
		{
			timer.start("Creep.prototype.carrying");
			let result = 0;

			if (this.carryCapacity > 0)
			{
				result = _.sum(this.carry);
			}

			timer.stop("Creep.prototype.carrying");
			return result;
		}
	});
}

if (Creep.prototype.hasOwnProperty('unit') === false)
{
	Object.defineProperty(Creep.prototype , "unit" , {
		get: function ()
		{
			return this.memory.unit;
		}
	});
}

if (Creep.prototype.hasOwnProperty('spawnTime') === false)
{
	Object.defineProperty(Creep.prototype , "spawnTime" , {
		get: function ()
		{
			return this.memory.spawnTime;
		}
	});
}

if (Creep.prototype.hasOwnProperty('timeOnStation') === false)
{
	Object.defineProperty(Creep.prototype , "timeOnStation" , {
		get: function ()
		{
			return this.memory.timeOnStation || 0;
		} ,
		set: function (value)
		{
			if ((this.memory.timeOnStation || 0) === 0)
			{
				this.memory.timeOnStation = value;
			}
		}
	});
}

module.exports = function ()
{
};
