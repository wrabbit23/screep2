"use strict";

StructureStorage.prototype.processVisuals = function() {
	if ( ( this.room === undefined ) || ( this.room.visual === undefined ) )  {  return;  }

	let options = {
		color: '#00FF00',
		size: 0.425,
		align: 'center',
		opacity: 1,
	};

	this.room.visual.text(
		( this.store[ RESOURCE_ENERGY ] || 0 ).toLocaleString(),
		this.pos.x,
		this.pos.y - 0.25,
		options
	).text(
		( this.store[ this.room.mineral.mineralType ] || 0 ).toLocaleString(),
		this.pos.x,
		this.pos.y + 0.15,
		options
	);
};

if (StructureStorage.prototype.hasOwnProperty('energy') === false)
{
	Object.defineProperty(StructureStorage.prototype , "energy" , {
		get: function ()
		{
			return this.store[RESOURCE_ENERGY] || 0;
		}
	});
}
