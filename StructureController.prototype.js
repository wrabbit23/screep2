"use strict";

StructureController.prototype.processVisuals = function() {
	if ( ( this.room === undefined ) || ( this.room.visual === undefined ) )  {  return;  }

	let options = {
		color: '#00FF00',
		size: 0.425,
		align: 'center',
		opacity: 1,
	};

	if (this.room.isMine)
	{
		this.room.visual.text(
			( `${this.progress}/${this.progressTotal}`).toLocaleString() ,
			this.pos.x ,
			this.pos.y + 1.4 ,
			options
		)
		.text(
			( `${this.ticksToDowngrade || 0}t`).toLocaleString() ,
			this.pos.x ,
			this.pos.y + 1.9 ,
			options
		);
	}
};
