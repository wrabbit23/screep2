module.exports =
	{
		"worker": {
			"mode": 1,
			"parts": [
				{
					"part": WORK,
					"weight": 0.4,
					"minimum": 1
				},
				{
					"part": CARRY,
					"weight": 0.3,
					"minimum": 1
				},
				{
					"part": MOVE,
					"weight": 0.3,
					"minimum": 1
				}
			],
			"memory": {
				"unit": "worker"
			}
		},
		"hauler": {
			"mode": 2,
			"parts": [
				{
					"part": CARRY,
					"weight": 0.5,
					"minimum": 1
				},
				{
					"part": MOVE,
					"weight": 0.5,
					"minimum": 1
				}
			],
			"memory": {
				"unit": "hauler"
			}
		}
	};
