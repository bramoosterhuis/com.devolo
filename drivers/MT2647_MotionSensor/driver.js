'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		alarm_motion: [
			{
				getOnWakeUp: true,
				command_class: 'COMMAND_CLASS_SENSOR_BINARY',
				command_report: 'SENSOR_BINARY_REPORT',
				command_get_parser: () => ({
					'Sensor Type': 'Motion',
				}),
				command_report_parser: report => {
					if (!report || report['Sensor Type'] !== 'Motion') return null;
					return report['Sensor Value'] === 'detected an event';
				},
			},
			{
				command_class: 'COMMAND_CLASS_BASIC',
				command_report: 'BASIC_SET',
				command_report_parser: report => {
					if (!report || !report.hasOwnProperty('Value')) return null;
					return report.Value !== 0;
				},
			},
		],
		alarm_tamper: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_SENSOR_BINARY',
			command_get: 'SENSOR_BINARY_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Tamper',
			}),
			command_report: 'SENSOR_BINARY_REPORT',
			command_report_parser: report => {
				if (!report || report['Sensor Type'] !== 'Tamper') return null;
				return report['Sensor Value'] === 'detected an event';
			},
		},
		measure_luminance: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)')) {
					if (report['Sensor Type'] === 'Luminance (version 1)') return report['Sensor Value (Parsed)'];
				}
				return null;
			},
		},
		measure_temperature: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)') &&
					report.hasOwnProperty('Level') && report.Level.hasOwnProperty('Scale')) {
					if (report['Sensor Type'] === 'Temperature (version 1)') {
						if (report.Level.Scale === 1) {
							return (report['Sensor Value (Parsed)'] - 32) / 1.8;
						} else if (report.Level.Scale === 0) {
							return report['Sensor Value (Parsed)'];
						}
					}
				}
				return null;
			},

		},
		measure_battery: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: (report, node) => {
				if (report['Battery Level'] === 'battery low warning') {
					if (node && (!node.state.hasOwnProperty('alarm_battery') || node.state.alarm_battery !== true)) {
						node.state.alarm_battery = true;
						module.exports.realtime(node.device_data, 'alarm_battery', true);
					}
					return 1;
				}
				if (report.hasOwnProperty('Battery Level (Raw)')) {
					if (node && (!node.state.hasOwnProperty('alarm_battery') || node.state.alarm_battery !== false)) {
						node.state.alarm_battery = false;
						module.exports.realtime(node.device_data, 'alarm_battery', false);
					}
					return report['Battery Level (Raw)'][0];
				}
				return null;
			},
		},
		alarm_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
		},
	},
	settings: {
		basic_set_level: {
			index: 2,
			size: 1,
			signed: false,
			parser: input => new Buffer([(input >= 100 && input < 255) ? 255 : input]),
		},
		pir_sensitivity: {
			index: 3,
			size: 1,
		},
		turn_off_light_time: {
			index: 9,
			size: 1,
		},
		light_sensitivity: {
			index: 4,
			size: 1,
		},
		test_mode: {
			index: 5,
			size: 1,
			parser: (input, settings) => {
				// Operation mode bit 0 (0000000x)
				let param5 = Number(settings.operation_mode);

				// Operation mode bit 1 (000000x0)
				if (input) { param5 += 2; }

				// Operation mode bit 2 (00000x00)
				if (settings['door/window_mode']) { param5 += 4; }

				return new Buffer([param5 + 8]);
			},
		},
		operation_mode: {
			index: 5,
			size: 1,
			parser: (input, settings) => {
				// Operation mode bit 0 (0000000x)
				let param5 = Number(input);

				// Operation mode bit 1 (000000x0)
				if (settings.test_mode) { param5 += 2; }

				// Operation mode bit 2 (00000x00)
				if (settings['door/window_mode']) { param5 += 4; }

				return new Buffer([param5 + 8]);
			},
		},
		'door/window_mode': {
			index: 5,
			size: 1,
			parser: (input, settings) => {
				// Operation mode bit 0 (0000000x)
				let param5 = Number(settings.operation_mode);

				// Operation mode bit 1 (000000x0)
				if (settings.test_mode) { param5 += 2; }

				// Operation mode bit 2 (00000x00)
				if (input) { param5 += 4; }

				return new Buffer([param5 + 8]);
			},
		},
		temperature_monitoring: {
			index: 6,
			size: 1,
			parser: input => {
				// Multi-Sensor Function Switch bit 6 (0x000000)
				let param6 = 4;	// Default value: Disable magetic integrate PIR

				if (input) { param6 += 64; }

				return new Buffer([param6]);
			},
		},
		pir_redetect_interval_time: {
			index: 8,
			size: 1,
		},
		battery_report_time: {
			index: 10,
			size: 1,
		},
		illumination_report_time: {
			index: 12,
			size: 1,
		},
		temperature_report_time: {
			index: 13,
			size: 1,
		},
	},
});
