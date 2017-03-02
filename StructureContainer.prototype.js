if (StructureContainer.prototype.hasOwnProperty('carrying') === false)
{
	Object.defineProperty(StructureContainer.prototype , "carrying" , {
		get: function ()
		{
			return _.sum(this.store);
		}
	});
}

if (StructureContainer.prototype.hasOwnProperty('energy') === false)
{
	Object.defineProperty(StructureContainer.prototype , "energy" , {
		get: function ()
		{
			return this.store[RESOURCE_ENERGY] || 0;
		}
	});
}