'use strict';
var Utils = require(__dirname + '/Utils').Utils;

class CurrentStatuses {

	constructor() {
		this.statuses = {};
		this.maxHistoricData = 20;
		this.utils = new Utils();
	}

	getAll() {
		var statuses = new Array();
		for(var hn in this.statuses) {
			for(var svc in this.statuses[hn]) {
				statuses.push(this.statuses[hn][svc]);
			}
		}
		return statuses;
	}

	getStatus(hn, svc) {
		if (this.statuses[hn] == undefined) {
			return null;
		}

		if (this.statuses[hn][svc] == undefined) {
			return null;
		}

		return this.statuses[hn][svc];
	}

	updateStatus(origObj) {

		var obj = this.utils.cloneObject(origObj);
		if (this.statuses[obj.host_name] == undefined) {
			this.statuses[obj.host_name] = {};
		}

		var changed = this.hasChanged(obj);
		this.addHistoric(obj);
		this.statuses[obj.host_name][obj.service_description] = obj;

		return changed;
	}

	addHistoric(obj) {

		if (this.statuses[obj.host_name][obj.service_description] == undefined) {
			obj.historicData = []
			return;
		}
			
		this.statuses[obj.host_name][obj.service_description].historicData.push(
			this.utils.cloneObject(obj)
		);
		obj.historicData = this.statuses[obj.host_name][obj.service_description].historicData

		if (obj.historicData.length > this.maxHistoricData)
			obj.historicData.shift();

	}

	hasChanged(obj) {
		var current = this.getStatus(obj.host_name, obj.service_description);
		if (current == null) {
			return false;
		}

		if (
		    obj.state == current.state &&
		    obj.state_type == current.state_type
		) {
			return false;
		}

		return true;
	}


}

module.exports.CurrentStatuses = CurrentStatuses;
