'use strict';

var Logger = require(__dirname + '/Logger').Logger;


class PushManager {

	constructor(key) {
		this.gcm = require('node-gcm');
		this.fs = require('fs');
		this.sender = new this.gcm.Sender(key);
		this.logger = new Logger();
		this.verbose = true;
		this.devices = {};
		this.devicesPersistenceFile = "/tmp/middleware-devices.json";
		this.statusAsString = ["OK", "WARNING", "CRITICAL", "UNKNOWN"];
		this.recoverDevices();
	}

	setVerbose(v) {
		this.verbose = v;
	}

	sendAlert(obj) {
		var ids = new Array();
		for(var i in this.devices) {
			ids.push(this.devices[i]);
		}
		this.notify(obj, ids);
	}

	getStatusAsString(retcode) {
		if (retcode < 0 || retcode > 3) {
			retcode = 3;
		}
		return this.statusAsString[retcode];
	}

	genMessageString(obj) {
		var sv = obj.service_description;
		var hn = obj.host_name;
		var st = this.getStatusAsString(obj.state);

		return sv + " on " + hn + " is " + st;
	}

	notify(obj, ids) {
		var message = new this.gcm.Message({
			data: {
				title: "Sgt Stubby sniffed something",
				message: this.genMessageString(obj),
				host_name: obj.host_name,
				service_description: obj.service_description
			}
		});

		this.sender.send(message, {
			registrationTokens: ids
		}, function(err, response) {});
	}

	addDevice(uuid, pushid) {
		if (uuid == null || pushid == null) {
			return;
		}

		this.logger.print(this, 'device ' + uuid + ' added to push queue');
		this.devices[uuid] = pushid;
		this.persistDevices();
	}

	persistDevices() {
		this.fs.writeFile(
			this.devicesPersistenceFile,
			JSON.stringify(this.devices),
			"utf8"
		);
	}

	recoverDevices() {
		var me = this;
		if (this.fs.existsSync(this.devicesPersistenceFile) == false) {
			return;
		}

		this.devices = require(this.devicesPersistenceFile);
	}


}

module.exports.PushManager = PushManager;
