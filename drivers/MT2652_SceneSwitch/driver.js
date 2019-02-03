'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://products.z-wavealliance.org/products/1143

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: true,
	capabilities: {
		measure_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report['Battery Level'] === 'battery low warning') return 1;
				if (report.hasOwnProperty('Battery Level (Raw)')) return report['Battery Level (Raw)'][0];
				return null;
			}
		},
	},
	settings: {
		1: {
			size: 1,
			index: 1,
		},
		2: {
			size: 1,
			index: 2,
		},
		11: {
			size: 1,
			index: 11,
		},
		12: {
			size: 1,
			index: 12,
		},
		13: {
			size: 1,
			index: 13,
		},
		14: {
			size: 1,
			index: 14,
		},
		21: {
			size: 1,
			index: 21,
		},
		22: {
			size: 1,
			index: 22,
		},
		25: {
			size: 1,
			index: 25,
		},
		30: {
			size: 1,
			index: 30,
		},
	},
});

module.exports.on('initNode', (token) => {
	const node = module.exports.nodes[token];
	if (node) {
		node.instance.CommandClass.COMMAND_CLASS_CENTRAL_SCENE.on('report', (command, report) => {
			if (command.name === 'CENTRAL_SCENE_NOTIFICATION') {

				const triggerMap = {
					1: '1_single',
					2: '2_single',
					5: '3_single',
					6: '4_single',
				};

				const triggerId = triggerMap[report['Scene Number']];
				if (triggerId) {
					Homey.manager('flow').triggerDevice(`MT2652_SceneSwitch_btn${triggerId}`, null, null, node.device_data);
				}
			}
		});
	}
});
