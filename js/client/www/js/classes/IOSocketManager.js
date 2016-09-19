function IOSocketManager()
{
	if (! this instanceof IOSocketManager)
		return new IOSocketManager();

	this.deviceuuid = null;
	this.address = null;
	this.socket = null;
	this.newMessageCallBack = null;
	this.setDeviceUUID();
};

IOSocketManager.prototype.setNewMessageCallBack = function(cb)
{
	this.newMessageCallBack = cb;
};

IOSocketManager.prototype.connect = function(addr)
{
	var me = this;
	if (this.socket != null) {
		this.disconnect();
	}

	this.address = addr;
	this.socket = io.connect(addr);

	this.socket.on('connect', function() {
		me.sendDeviceUUID();
	});

	this.socket.on('message', function(msg) {
		if (me.newMessageCallBack == null) {
			return;
		}

		me.newMessageCallBack(msg);
	});

};

IOSocketManager.prototype.sendDeviceUUID = function()
{
	this.socket.emit('deviceuuid', this.deviceuuid);
};

IOSocketManager.prototype.sendPushRegistrationId = function(regid)
{
	this.socket.emit('pushid', regid);
	//this.socket.emit('pushregistrationid', regid);
};

IOSocketManager.prototype.setDeviceUUID = function()
{
	var uuid = device.uuid;
	if (uuid == null) {
		// browser ?
		uuid = Math.floor((1 + Math.random()) * 0x10000).toString();
	}
	this.deviceuuid = uuid;
};

IOSocketManager.prototype.disconnect = function()
{
	if (this.socket == null) {
		return;
	}

	this.socket.emit('bye');
	delete this.socket;
	this.socket = null;
};
