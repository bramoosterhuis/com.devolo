'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class DevoloRadiatorThermostat extends ZwaveDevice {

	onMeshInit() {
		this.registerCapability('measure_battery', 'BATTERY');
		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		this.registerCapability('target_temperature', 'THERMOSTAT_SETPOINT');
	}

}


module.exports = DevoloRadiatorThermostat;
