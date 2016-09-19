'use strict';
var Message = require(__dirname + '/Message').Message;
var Logger = require(__dirname + '/Logger').Logger;

class Connection {

	constructor() {
		this.messageReceivedCallback = null;
		this.pushRegistrationId = null;
		this.socket = null;
		this.verbose = false;
		this.readyCallBack = null;
		this.logger = new Logger();
		this.deviceUUID = null;
		this.pushRegistrationId = null;
		this.disconnectionCallBack = null;
	}

	setSocket(socket) {
		this.logger.print(this, 'new socket, id: ' + socket.id);
		socket.connectionRef = this;
		this.socket = socket;
		this.bindSocketEvents();
	}

	bindSocketEvents() {
		var me = this;

		this.socket.on('disconnect', function() {
			me.disconnected();
		});

		this.socket.on('deviceuuid', function(id) {
			me.setDeviceUUID(id);
		});

		this.socket.on('pushid', function(id) {
			me.setPushUUID(id);
		});
	}

	disconnected() {
		this.logger.print(this, this.socket.id + ' has disconnected');
		if (this.disconnectionCallBack == null) {
			return;
		}
		this.disconnectionCallBack(this);
	}

	setPushUUID(id) {
		this.logger.print(this, 'push registration id: ' + id);
		this.pushRegistrationId = id;
	}

	setDeviceUUID(id) {
		this.deviceUUID = id;
		this.logger.print(this, this.socket.id + ' device uuid: ' + id);
		if (this.readyCallBack == null) {
			return;
		}
		this.readyCallBack(this);
	}

	setDisconnectionCallBack(cb) {
		this.disconnectionCallBack = cb;
	}

	setConnectionReadyCallBack(cb) {
		this.readyCallBack = cb;
	}

	connect(rep) {
		var io = require('socket.io-client');
		var client = io.connect(rep);
		this.setSocket(client);
	}

	send(msg) {
		if (this.socket == null)
			return;
		this.socket.emit('message', msg.convertToJson());
	}

	disconnect() {
		this.socket.disconnect();
	}

	setVerbose(v) {
		this.verbose = v;
	}

}

module.exports.Connection = Connection;
