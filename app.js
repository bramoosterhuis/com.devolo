'use strict';

const Homey = require('homey');

class DevoloApp extends Homey.App {
  
  onInit()
  {
		this.log('initiated');
  }
}

module.exports = DevoloApp;