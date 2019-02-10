'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class DevoloMotionSensor extends ZwaveDevice {

	onMeshInit() {
		this.registerCapability('alarm_motion', 'SENSOR_BINARY');
        this.registerCapability('alarm_tamper', 'SENSOR_BINARY');
        this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
        this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
        this.registerCapability('measure_battery', 'BATTERY');
        this.registerCapability('alarm_battery', 'BATTERY');

        this.registerSetting('basic_set_level', input => new Buffer([(input >= 100 && input < 255) ? 255 : input]));
        this.registerSetting('temperature_monitoring', input => {
            // Multi-Sensor Function Switch bit 6 (0x000000)
            let param6 = 4;	// Default value: Disable magentic integrate PIR

            if (input) { param6 += 64; }

            return new Buffer([param6]);
        });
    }

    async onSettings(oldSettings, newSettings, changedKeys, callback) {
		if (changedKeys.includes('test_mode') || changedKeys.includes('operation_mode') || changedKeys.includes('door/window_mode')) {
			let parameterFive = Number(newSettings.operation_mode) + 8;
			if (typeof newSettings.test_mode === 'boolean' && newSettings.test_mode) parameterFive += 2;
            if (typeof newSettings['door/window_mode'] === 'boolean' && newSettings['door/window_mode']) parameterFive += 4;

            try {
                await this.configurationSet({
                    index: 5,
                    size: 1,
                }, parameterFive);

                callback(null, true);
            } catch (e) {
                callback(e, null);
            }
        }

        callback(null, true);
    }
}

module.exports = DevoloMotionSensor;
