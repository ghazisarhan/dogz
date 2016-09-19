'use strict';

class ZMQ {

	constructor() {
		this.zmq = require('zmq');
		this.address = null;
		this.remoteSocket = null;
		this.messageReceivedCallback = null;
		this.publisher = null;
	}

	setRemoteAddress(address) {
		this.address = address;
	}

	connectRemote(fn) {
		this.remoteSocket = this.zmq.socket('sub');
		this.remoteSocket.connect(this.address);
		this.remoteSocket.subscribe('events');
		this.remoteSocket.on('message', function(msg) {
			var slices = msg.toString().match(/events (.*)/);
			fn(slices[1]);
		});
	}

	createPublisher(port) {
		this.publisher = this.zmq.socket('pub');
		this.publisher.bind('tcp://127.0.0.1:' + port);
	}

	sendEvent(m) {
		this.publisher.send('events ' + m);
	}

}

module.exports.ZMQ = ZMQ;
