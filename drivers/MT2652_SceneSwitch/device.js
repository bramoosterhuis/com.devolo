'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

// http://products.z-wavealliance.org/products/1143

class DevoloSceneSwitch extends ZwaveDevice {
	onMeshInit() {
		// enable debugging
		this.enableDebug();

		// TODO: remove this.... :-)
		this.log('Device init');
		this.log('Name:', this.getName());
		this.log('Class:', this.getClass());
		this.log('Capabilities: ', this.getCapabilities());

		if (this.hasCommandClass('BATTERY')) {
			this.log('Registering command class BATTERY');
			this.registerCapability('measure_battery', 'BATTERY');
			this.registerCapability('alarm_battery', 'BATTERY');
		}

		if (this.hasCommandClass('SWITCH_MULTILEVEL')) {
			this.log('Registering command class SWITCH_MULTILEVEL');

			this.registerCapability('dim', 'SWITCH_MULTILEVEL', {
				// required since report contains 'Value (RAW)'
				report: 'SWITCH_MULTILEVEL_SET',
				reportParserV1: report => {
					if (report) {
						this.log('\SWITCH_MULTILEVEL_SET:\n', report);
					}
					return null;
				},
				getOpts: {
					getOnStart: false, // get the initial value on app start
					getOnOnline: true
				}
			});

			this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_REPORT', (report) => {
				this.log('\nSWITCH_MULTILEVEL_REPORT:\n', report);
			});

			this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_SET', (report) => {
				this.log('\SWITCH_MULTILEVEL_SET:\n', report);
			});
		}
		
		if (this.hasCommandClass('BASIC')) {
			this.log('Registering command class BASIC');

			this.registerCapability('onoff', 'BASIC', {
				getOpts: {
					getOnStart: false, // get the initial value on app start
					getOnOnline: true
				}
			});

			this.registerReportListener('BASIC', 'BASIC_REPORT', (report) => {
				this.log('\nBASIC_REPORT:\n', report);
			});
		} 

		if (this.hasCommandClass('CENTRAL_SCENE')) {
			this.log('Registering command class CENTRAL_SCENE');

			this.sceneFlowTrigger = new Homey.FlowCardTriggerDevice('mt2652_scene').register();

			this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', (report) => {
				this.log('\nCENTRAL_SCENE_NOTIFICATION:\n', report);
			});
		}
	}
}

module.exports = DevoloSceneSwitch;
