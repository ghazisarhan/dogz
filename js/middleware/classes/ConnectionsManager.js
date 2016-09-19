"use strict";
var Message = require(__dirname + '/Message').Message;
var Connection = require(__dirname + '/Connection').Connection;
var Logger = require(__dirname + '/Logger').Logger;

class ConnectionsManager {

	constructor() {
		this.io = require('socket.io')();
		this.io.connectionsManagerRef = this;
		this.io.on('connection', this.newConnection);
		this.connections = {};
		this.pendingConnections = {};
		this.verbose = false;
		this.logger = new Logger();
		this.newConnectionCallBack = null;
		this.currentStatuses = null;
	}

	setVerbose(v) {
		this.verbose = v;
	}

	setCurrentStatuses(cs) {
		this.currentStatuses = cs;
	}

	setNewConnectionCallBack(cb) {
		this.newConnectionCallBack = cb;
	}

	newConnection(socket) {

		var me = this.server.connectionsManagerRef;
		me.logger.print(me, 'new connection arrived');

		var conn = new Connection();
		conn.setVerbose(me.verbose);
		conn.setSocket(socket);

		conn.setConnectionReadyCallBack(function(c) {
			me.setConnectionAsReady(c);
		});
		conn.setDisconnectionCallBack(function(c) {
			me.processDisconnection(c);
		});

		me.pendingConnections[conn.socket.id] = conn;
		me.sendCurrentStatusToConnection(conn);
	}

	sendCurrentStatusToConnection(conn) {
		var statuses = this.currentStatuses.getAll();
		for(var i in statuses) {
			var m = new Message();
			m.setType('event');
			m.setContent(statuses[i]);
			conn.send(m);
		}
	}

	processDisconnection(conn) {
		delete this.connections[conn.socket.id];
		delete this.pendingConnections[conn.socket.id];
	}

	setConnectionAsReady(conn) {
		this.logger.print(this, 'connetion ' + conn.socket.id + ' is ready');
		this.connections[conn.socket.id] = conn;
		delete this.pendingConnections[conn.socket.id];
		if (this.newConnectionCallBack == null) {
			return;
		}

		this.newConnectionCallBack(conn);
	}

	startListening(port) {
		if (port == undefined)
			port = 80;
		this.io.listen(port);
	}

	stopListening() {
		for(var i in this.connections) {
			this.connections[i].disconnect();
		}
		for(var i in this.pendingConnections) {
			this.pendingConnections[i].disconnect();
		}
		this.io.close();
	}

	getPushRegistrationIds() {
		var ids = new Array();
		for(var i in this.connections) {
			if (this.connections[i].pushRegistrationId == null) {
				continue;
			}

			ids.push(this.connections[i].pushRegistrationId);
		}
		return ids;
	}

	spreadMessage(msg) {
		for(var i in this.connections) {
			this.connections[i].send(msg);
		}
	}

}

module.exports.ConnectionsManager = ConnectionsManager;
