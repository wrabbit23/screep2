"use strict";

module.exports =
	{
		alertTime: 200,
		claimTicks: 2000,
		cpuTickTrackDebug: false,
		cpuGlobalResetDebug: true,
		cpuHistorySize: 1000,
		cpuThresholdThird: 1000,
		cpuThresholdHalf: 500,
		cpuThresholdQuarter: 200,
		energy: {
			desiredStorage: 500000,
			step: 100000,
			panicStorage: 100000,
			terminalAmount: 10000,
		},

		wallHP: [0, 0, 5000, 20000, 150000, 500000, 1000000, 1500000, 2000000],
		repairFactor: 0.8,
		towerPowerFactor: 0.8,
		towerFillFactor: 0.9,
		towerRepairFactor: 1,
	};

