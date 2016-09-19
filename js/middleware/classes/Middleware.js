'use strict';

var PushManager = require(__dirname + '/PushManager').PushManager
var CurrentStatuses = require(__dirname + '/CurrentStatuses').CurrentStatuses
var ZMQ = require(__dirname + '/ZMQ').ZMQ;
var ConnectionsManager = require(__dirname + '/ConnectionsManager').ConnectionsManager;
var Message = require(__dirname + '/Message').Message;

class Middleware {

	constructor() {
		this.gcmKey = "AIzaSyDDQXDkAl9r0pA57cwQaeLwcbeHkQ8R7io";
		this.zmq = null;
		this.brokerAddress = null;
		this.connectionsManager = null;
		this.currentStatuses = new CurrentStatuses();
		this.pushManager = new PushManager(this.gcmKey);
	}

	setBrokerAddress(addr) {
		this.brokerAddress = addr;
	}

	connectBroker() {
		var me = this;
		this.zmq = new ZMQ();
		this.zmq.setRemoteAddress(this.brokerAddress);
		this.zmq.connectRemote(function(msg) {
			me.processMessage(msg);
		});
	}

	processMessage(msg) {
		if (this.connectionsManager == null) {
			return;
		}

		var obj = JSON.parse(msg);
		var changed = this.currentStatuses.updateStatus(obj);
		if (changed) {
			this.doPush(obj);
		}

		this.connectionsManager.spreadMessage(
			this.createMessage(obj)
		);
	}

	doPush(obj) {

		if (this.isMessageSuitedForPush(obj) == false) {
			return;
		}

		this.pushManager.sendAlert(obj);
	}

	isMessageSuitedForPush(obj) {
		if (obj.state == 0) {
			return false;
		}

		if (obj.scheduled_downtime_depth != 0) {
			return false;
		}

		if (obj.problem_has_been_acknowledged != 0) {
			return false;
		}

		if (obj.state_type != 1) {
			return false;
		}

		return true;
	}


	createMessage(obj) {
		var m = new Message();
		m.setType('event');
		m.setContent(obj);
		return m;
	}

	startWebSocketServer() {

		var me = this;
		this.connectionsManager = new ConnectionsManager();
		this.connectionsManager.setVerbose(true);
		this.connectionsManager.setCurrentStatuses(this.currentStatuses)
		this.connectionsManager.startListening();		
		this.connectionsManager.setNewConnectionCallBack(function(conn) {
			me.pushManager.addDevice(
				conn.deviceUUID,
				conn.pushRegistrationId
			);
		})
	}

	run() {
		this.startWebSocketServer();
		this.connectBroker();
	}
}

module.exports.Middleware = Middleware;
