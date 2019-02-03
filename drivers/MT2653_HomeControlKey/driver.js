'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

const triggerMap = {
    1: 'btn1_single',
    2: 'btn2_single',
    6: 'btn2_double',
    5: 'btn3_single',
    4: 'btn4_single',
    8: 'btn4_double',
};
// http://www.cd-jackson.com/index.php/zwave/zwave-device-database/zwave-device-list/devicesummary/341

class DevoloKeyFobDevice extends ZwaveDevice {

	onMeshInit() {
		this.btn1_single = new Homey.FlowCardTriggerDevice('mt2653_btn1_single');
        this.btn2_single = new Homey.FlowCardTriggerDevice('mt2653_btn2_single');
        this.btn2_double = new Homey.FlowCardTriggerDevice('mt2653_btn2_double');
        this.btn3_single = new Homey.FlowCardTriggerDevice('mt2653_btn3_single');
        this.btn4_single = new Homey.FlowCardTriggerDevice('mt2653_btn4_single');
        this.btn4_double = new Homey.FlowCardTriggerDevice('mt2653_btn4_double');

        this.registerCapability('measure_battery', 'BATTERY');

		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', (report) => {
            const flowID = triggerMap[report['Scene Number']];
            this[flowID].trigger(this, null, null);
		});
	}

}

module.exports = DevoloKeyFobDevice;
